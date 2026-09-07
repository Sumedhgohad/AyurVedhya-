import { Controller, Post, Get, Param, Res, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly docService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('study_id') studyId: string,
    @Body('document_type') documentType: string,
    @Body('uploaded_by') uploadedBy: string,
  ) {
    console.log('[DOCUMENTS CONTROLLER] Upload called with:', {
      studyId,
      documentType,
      uploadedBy,
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      fileSize: file?.size
    });
    return this.docService.uploadAndHashDocument(studyId, documentType, uploadedBy || 'investigator@aiia.gov.in', file);
  }

  @Get('study/:studyId')
  getDocumentsByStudy(@Param('studyId') studyId: string) {
    return this.docService.getDocumentsByStudy(studyId);
  }

  // Secure inline streaming — serves the file from MinIO with Content-Disposition: inline
  // The @Res() decorator gives raw Express response access so we can pipe the stream directly
  @Get('preview/:id')
  async previewDocument(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.docService.streamDocumentForPreview(id, res);
  }

  @Get('verify/:id')
  verifyDocument(@Param('id') id: string) {
    return this.docService.verifyDocumentIntegrity(id);
  }
}
