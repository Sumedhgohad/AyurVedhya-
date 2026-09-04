import { Controller, Post, Get, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { EnrollParticipantDto, RecordVisitDto, RaiseQueryDto, ResolveQueryDto, LogDeviationDto } from './dto/clinical.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('clinical')
@UseGuards(JwtAuthGuard)
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Post('participants/enroll')
  enrollParticipant(@Body() dto: EnrollParticipantDto) {
    return this.clinicalService.enrollParticipant(dto);
  }

  @Get('participants/study/:studyId')
  getParticipantsByStudy(@Param('studyId') studyId: string) {
    return this.clinicalService.getParticipantsByStudy(studyId);
  }

  @Get('participants/:id')
  getParticipantById(@Param('id') id: string) {
    return this.clinicalService.getParticipantById(id);
  }

  @Post('visits/record')
  recordVisit(@Body() dto: RecordVisitDto) {
    return this.clinicalService.recordVisit(dto);
  }

  @Post('queries/raise')
  raiseQuery(@Body() dto: RaiseQueryDto) {
    return this.clinicalService.raiseQuery(dto);
  }

  @Patch('queries/:id/resolve')
  resolveQuery(@Param('id') id: string, @Body() dto: ResolveQueryDto) {
    return this.clinicalService.resolveQuery(id, dto);
  }

  @Post('deviations/log')
  logDeviation(@Body() dto: LogDeviationDto) {
    return this.clinicalService.logDeviation(dto);
  }
}
