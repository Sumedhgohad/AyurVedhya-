import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { SafetyService } from './safety.service';
import { LogAdverseEventDto } from './dto/safety.dto';

@Controller('safety')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Post('ae/log')
  logAdverseEvent(@Body() dto: LogAdverseEventDto) {
    return this.safetyService.logAdverseEvent(dto);
  }

  @Get('sae/active-clocks')
  getActiveSaeClocks() {
    return this.safetyService.getActiveSaeClocks();
  }

  @Get('export/npvcc/:id')
  generateNpvccReport(@Param('id') id: string) {
    return this.safetyService.generateNpvccReport(id);
  }
}
