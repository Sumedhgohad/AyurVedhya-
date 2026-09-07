import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as Minio from "minio";
import * as crypto from "crypto";
import { DocumentReceipt } from "./entities/document-receipt.entity";
import { AuditService } from "../audit/audit.service";
import { AuditAction } from "../audit/entities/audit-event.entity";
const { PdfReader } = require("pdfreader");

console.log("[PDFREADER] PDF reader loaded successfully");

@Injectable()
export class DocumentsService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly bucketName =
    process.env.MINIO_BUCKET_NAME || "aiia-trial-documents";

  constructor(
    @InjectRepository(DocumentReceipt, "auditConnection")
    private receiptRepo: Repository<DocumentReceipt>,
    private readonly auditService: AuditService,
  ) {}

  onModuleInit() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || "localhost",
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ROOT_USER || "minioadmin",
      secretKey: process.env.MINIO_ROOT_PASSWORD || "miniopassword",
    });
    console.log("✅ MinIO S3 Document Vault connected.");
  }

  // 1. REGULATORY CONTENT PARSER & VALIDATOR
  private async validatePdfContent(buffer: Buffer, documentType: string) {
    console.log(`[PDF VALIDATION] Starting validation for document type: ${documentType}`);
    console.log(`[PDF VALIDATION] Buffer info:`, {
      isBuffer: Buffer.isBuffer(buffer),
      length: buffer.length,
      first20Bytes: buffer.slice(0, 20).toString('hex')
    });
    
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      console.error('[PDF VALIDATION] Invalid buffer provided');
      throw new BadRequestException('Invalid file buffer provided');
    }
    
    try {
      console.log('[PDF VALIDATION] Parsing PDF with pdfreader...');
      const pdfReader = new PdfReader();
      
      const fullText = await new Promise<string>((resolve, reject) => {
        let text = '';
        
        pdfReader.parseBuffer(buffer, (err: any, item: any) => {
          if (err) {
            console.error('[PDF VALIDATION] PDF parsing error:', err);
            reject(err);
            return;
          }
          
          if (!item) {
            // End of PDF
            if (text.length === 0) {
              reject(new Error('No text content found in PDF'));
            } else {
              resolve(text);
            }
            return;
          }
          
          if (item.text) {
            text += item.text + ' ';
          }
        });
      });
      
      const lowerText = fullText.toLowerCase().trim();
      console.log(`[PDF VALIDATION] Extracted text length: ${lowerText.length} characters`);
      console.log(`[PDF VALIDATION] First 200 chars: "${lowerText.substring(0, 200)}"`);

      if (
        documentType === "SIGNED_INFORMED_CONSENT" ||
        documentType === "VERNACULAR_CONSENT_MEDIA"
      ) {
        const requiredPhrases = [
          "consent",
          "participat",
          "voluntary",
          "study",
          "trial",
          "investigat",
          "सहमति",
        ];
        const matched = requiredPhrases.filter((phrase) =>
          lowerText.includes(phrase),
        );

        console.log(`[PDF VALIDATION] Matched phrases: ${matched.length}/${requiredPhrases.length}`, matched);

        // If less than 2 mandatory clinical trial phrases exist, reject the file
        if (matched.length < 2) {
          console.log(`[PDF VALIDATION] REJECTED: Only ${matched.length} phrases found, need at least 2`);
          throw new BadRequestException(
            `REGULATORY COMPLIANCE REJECTION: The uploaded PDF does not contain mandatory Informed Consent clauses (NDCT Rules 2019 Schedule III). Found only ${matched.length} required phrases. Please upload a valid signed ICF.`,
          );
        }
        
        console.log(`[PDF VALIDATION] APPROVED: Document contains sufficient consent clauses`);
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      
      // Log the actual error for debugging
      console.error(`[PDF VALIDATION] Error during PDF parsing:`, {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // REJECT scanned/image PDFs without text layer - they must be OCR'd first
      throw new BadRequestException(
        `REGULATORY COMPLIANCE REJECTION: Unable to extract text from PDF. The document may be a scanned image without OCR. Please upload a text-based PDF or use OCR software first. Error: ${err.message}`,
      );
    }
  }

  // Upload file, compute SHA-256 hash, and record in immutable ledger
  async uploadAndHashDocument(
    studyId: string,
    documentType: string,
    uploadedBy: string,
    file: Express.Multer.File,
  ): Promise<DocumentReceipt> {
    console.log('[UPLOAD] uploadAndHashDocument called with:', {
      studyId,
      documentType,
      uploadedBy,
      fileExists: !!file,
      fileName: file?.originalname,
      fileMimetype: file?.mimetype,
      fileSize: file?.size,
      bufferExists: !!file?.buffer,
      bufferLength: file?.buffer?.length
    });
    
    if (!file) throw new BadRequestException("No file provided for upload.");

    // Step A: Inspect PDF Content for Statutory Consent Clauses
    if (file.mimetype === "application/pdf") {
      console.log('[UPLOAD] File is PDF, starting validation...');
      await this.validatePdfContent(file.buffer, documentType);
      console.log('[UPLOAD] PDF validation completed successfully');
    } else {
      console.log('[UPLOAD] File is not PDF, skipping validation');
    }

    // Step B: Calculate Cryptographic SHA-256 Hash
    const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");

    // Step C: Ensure bucket exists, then upload to MinIO S3
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, "ap-south-1");
    }

    const objectPath = `studies/${studyId}/${Date.now()}_${file.originalname}`;
    await this.minioClient.putObject(
      this.bucketName,
      objectPath,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype,
        "x-amz-meta-sha256": hash,
      },
    );

    // Step D: Save receipt in audit_integrity_db
    const receipt = this.receiptRepo.create({
      study_id: studyId,
      document_type: documentType,
      file_name: file.originalname,
      minio_object_path: objectPath,
      sha256_hash: hash,
      file_size_bytes: file.size,
      uploaded_by: uploadedBy,
    });

    const savedReceipt = await this.receiptRepo.save(receipt);

    // Step E: Log to Audit Trail
    await this.auditService.logEvent({
      user_email: uploadedBy,
      user_role: "ROLE_INVESTIGATOR",
      action: AuditAction.DOCUMENT_HASHED,
      entity_type: "DOCUMENT",
      entity_id: savedReceipt.id,
      new_values: { file_name: file.originalname, sha256_hash: hash },
      reason: `Document verified for statutory clauses, uploaded to MinIO, and anchored with SHA-256 hash: ${hash}`,
    });

    return savedReceipt;
  }

  // List all document receipts for a study
  async getDocumentsByStudy(studyId: string): Promise<DocumentReceipt[]> {
    return this.receiptRepo.find({
      where: { study_id: studyId },
      order: { uploaded_at: 'DESC' },
    });
  }

  // Secure inline streaming: serves the raw file from MinIO with inline Content-Disposition
  async streamDocumentForPreview(
    receiptId: string,
    res: any, // Express Response
  ): Promise<void> {
    const receipt = await this.receiptRepo.findOne({ where: { id: receiptId } });
    if (!receipt) throw new NotFoundException('Document receipt not found.');

    // Derive MIME type from file extension
    const ext = receipt.file_name.split('.').pop()?.toLowerCase() ?? '';
    const mimeMap: Record<string, string> = {
      pdf:  'application/pdf',
      png:  'image/png',
      jpg:  'image/jpeg',
      jpeg: 'image/jpeg',
      gif:  'image/gif',
      webp: 'image/webp',
    };
    const contentType = mimeMap[ext] ?? 'application/octet-stream';

    // Fetch from MinIO
    const dataStream = await this.minioClient.getObject(
      this.bucketName,
      receipt.minio_object_path,
    );

    // Set response headers for inline browser rendering
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${receipt.file_name}"`,
    );
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-SHA256-Fingerprint', receipt.sha256_hash);

    // Pipe MinIO stream directly into Express response
    dataStream.pipe(res);
  }

  // Tamper-Proof Verification: Re-downloads file from MinIO, re-hashes, and compares
  async verifyDocumentIntegrity(receiptId: string): Promise<any> {
    const receipt = await this.receiptRepo.findOne({
      where: { id: receiptId },
    });
    if (!receipt) throw new NotFoundException("Document receipt not found.");

    const dataStream = await this.minioClient.getObject(
      this.bucketName,
      receipt.minio_object_path,
    );
    const chunks: Buffer[] = [];

    for await (const chunk of dataStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const fileBuffer = Buffer.concat(chunks);
    const currentHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    const isTamperFree = currentHash === receipt.sha256_hash;

    return {
      receipt_id: receipt.id,
      file_name: receipt.file_name,
      ledger_sha256_hash: receipt.sha256_hash,
      computed_current_hash: currentHash,
      is_tamper_free: isTamperFree,
      status: isTamperFree
        ? "VERIFIED_AUTHENTIC (ZERO TAMPERING)"
        : "⚠️ INTEGRITY_BREACH_DETECTED",
      uploaded_at: receipt.uploaded_at,
    };
  }
}
