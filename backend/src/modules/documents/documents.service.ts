import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Minio from 'minio';
import * as crypto from 'crypto';
import { DocumentReceipt } from './entities/document-receipt.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-event.entity';

@Injectable()
export class DocumentsService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly bucketName = process.env.MINIO_BUCKET_NAME || 'aiia-trial-documents';

  constructor(
    @InjectRepository(DocumentReceipt, 'auditConnection')
    private receiptRepo: Repository<DocumentReceipt>,
    private readonly auditService: AuditService,
  ) {}

  onModuleInit() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'miniopassword',
    });
    console.log('✅ MinIO S3 Document Vault connected.');
  }

  // Upload file, compute SHA-256 hash, and record in immutable ledger
  async uploadAndHashDocument(
    studyId: string,
    documentType: string,
    uploadedBy: string,
    file: Express.Multer.File,
  ): Promise<DocumentReceipt> {
    // 1. Calculate SHA-256 Cryptographic Hash
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // 2. Ensure bucket exists, then upload to MinIO S3
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'ap-south-1');
    }

    const objectPath = `studies/${studyId}/${Date.now()}_${file.originalname}`;
    await this.minioClient.putObject(this.bucketName, objectPath, file.buffer, file.size, {
      'Content-Type': file.mimetype,
      'x-amz-meta-sha256': hash,
    });

    // 3. Save receipt in audit_integrity_db
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

    // 4. Log to Audit Trail
    await this.auditService.logEvent({
      user_email: uploadedBy,
      user_role: 'ROLE_INVESTIGATOR',
      action: AuditAction.DOCUMENT_HASHED,
      entity_type: 'DOCUMENT',
      entity_id: savedReceipt.id,
      new_values: { file_name: file.originalname, sha256_hash: hash },
      reason: `Document uploaded and anchored with SHA-256 hash proof: ${hash}`,
    });

    return savedReceipt;
  }

  // Tamper-Proof Verification: Re-downloads file from MinIO, re-hashes, and compares
  async verifyDocumentIntegrity(receiptId: string): Promise<any> {
    const receipt = await this.receiptRepo.findOne({ where: { id: receiptId } });
    if (!receipt) throw new NotFoundException('Document receipt not found.');

    const dataStream = await this.minioClient.getObject(this.bucketName, receipt.minio_object_path);
    const chunks: Buffer[] = [];

    for await (const chunk of dataStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const fileBuffer = Buffer.concat(chunks);
    const currentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const isTamperFree = currentHash === receipt.sha256_hash;

    return {
      receipt_id: receipt.id,
      file_name: receipt.file_name,
      ledger_sha256_hash: receipt.sha256_hash,
      computed_current_hash: currentHash,
      is_tamper_free: isTamperFree,
      status: isTamperFree ? 'VERIFIED_AUTHENTIC (ZERO TAMPERING)' : '⚠️ INTEGRITY_BREACH_DETECTED',
      uploaded_at: receipt.uploaded_at,
    };
  }
}
