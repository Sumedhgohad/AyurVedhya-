import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RecordAuditDto } from './dto/audit.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('log')
  logEvent(@Body() dto: RecordAuditDto) {
    return this.auditService.logEvent(dto);
  }

  @Get('all')
  getAllAuditLogs() {
    return this.auditService.getAllAuditLogs();
  }

  @Get('entity/:type/:id')
  getAuditTrailForEntity(@Param('type') type: string, @Param('id') id: string) {
    return this.auditService.getAuditTrailForEntity(type, id);
  }
}
