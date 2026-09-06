import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { SafetyService } from './safety.service';
import { LogAdverseEventDto } from './dto/safety.dto';

@Controller('safety')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Post('ae/log')
  logAdverseEvent(@Body() dto: LogAdverseEventDto) {
    return this.safetyService.logAdverseEvent(dto);
  }

  @Get('ae/study/:studyId')
  getAesByStudy(@Param('studyId') studyId: string) {
    return this.safetyService.getAesByStudy(studyId);
  }

  @Get('sae/active-clocks')
  getActiveSaeClocks() {
    return this.safetyService.getActiveSaeClocks();
  }

  @Get('export/npvcc/:id')
  generateNpvccReport(@Param('id') id: string) {
    return this.safetyService.generateNpvccReport(id);
  }

  @Patch('sae/:id/mark-reported')
  markSaeAsReported(@Param('id') id: string) {
    return this.safetyService.markSaeAsReported(id);
  }
}
