import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Get('verify/:id')
  verifyDocument(@Param('id') id: string) {
    return this.docService.verifyDocumentIntegrity(id);
  }
}
