import { Controller, Post, Get, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { StudyService } from './study.service';
import {
  CreateStudyDto,
  SubmitIecDto,
  DecideIecDto,
  LinkCtriDto,
  CreateIpBatchDto,
  CreateStudyArmDto,
  CreateVisitDefinitionDto,
  TerminateStudyDto,
} from './dto/study.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('study')
@UseGuards(JwtAuthGuard)
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Post('create')
  @Roles('ROLE_INVESTIGATOR', 'ROLE_LEADERSHIP')
  createStudy(@Body() dto: CreateStudyDto) {
    return this.studyService.createStudy(dto);
  }

  @Get('list')
  getAllStudies() {
    return this.studyService.getAllStudies();
  }

  @Get(':id')
  getStudyById(@Param('id') id: string) {
    return this.studyService.getStudyById(id);
  }

  @Post(':id/arms')
  @Roles('ROLE_INVESTIGATOR', 'ROLE_LEADERSHIP')
  createStudyArm(@Param('id') id: string, @Body() dto: CreateStudyArmDto) {
    return this.studyService.createStudyArm(id, dto);
  }

  @Post('arms/:armId/visits')
  @Roles('ROLE_INVESTIGATOR', 'ROLE_LEADERSHIP')
  createVisitDefinition(@Param('armId') armId: string, @Body() dto: CreateVisitDefinitionDto) {
    return this.studyService.createVisitDefinition(armId, dto);
  }

  @Post(':id/protocol-structure')
  @Roles('ROLE_INVESTIGATOR', 'ROLE_LEADERSHIP')
  saveProtocolStructure(@Param('id') id: string, @Body() dto: { arms: any[]; visitSchedule: any[] }) {
    return this.studyService.saveProtocolStructure(id, dto);
  }

  @Post(':id/iec-submit')
  @Roles('ROLE_INVESTIGATOR')
  submitToIec(@Param('id') id: string, @Body() dto: SubmitIecDto) {
    return this.studyService.submitToIec(id, dto);
  }

  @Patch(':id/iec-decide')
  @Roles('ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP')
  recordIecDecision(@Param('id') id: string, @Body() dto: DecideIecDto) {
    return this.studyService.recordIecDecision(id, dto);
  }

  @Patch(':id/ctri-link')
  @Roles('ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP')
  linkCtri(@Param('id') id: string, @Body() dto: LinkCtriDto) {
    return this.studyService.linkCtri(id, dto);
  }

  @Post(':id/ip-batch')
  @Roles('ROLE_INVESTIGATOR', 'ROLE_LEADERSHIP')
  addIpBatch(@Param('id') id: string, @Body() dto: CreateIpBatchDto) {
    return this.studyService.addIpBatch(id, dto);
  }

  // ─── Lifecycle: Data Lock ─────────────────────────────────────────────────
  // Guard: ENROLLING | ONGOING → DATA_LOCK
  // Roles: Compliance Officer and Leadership (PI initiates, compliance confirms)
  @Patch(':id/data-lock')
  @Roles('ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP')
  dataLockStudy(@Param('id') id: string) {
    return this.studyService.dataLockStudy(id);
  }

  // ─── Lifecycle: Complete Study ────────────────────────────────────────────
  // Guard: DATA_LOCK → CLOSED; starts 30-day CTRI closeout notification clock
  @Patch(':id/complete')
  @Roles('ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP')
  completeStudy(@Param('id') id: string) {
    return this.studyService.completeStudy(id);
  }

  // ─── Lifecycle: Premature Termination ────────────────────────────────────
  // Requires mandatory GCP reason; raises emergency alert to IEC & Leadership
  @Patch(':id/terminate')
  @Roles('ROLE_COMPLIANCE_OFFICER', 'ROLE_LEADERSHIP', 'ROLE_INVESTIGATOR')
  terminateStudy(@Param('id') id: string, @Body() dto: TerminateStudyDto) {
    return this.studyService.terminateStudy(id, dto);
  }
}
