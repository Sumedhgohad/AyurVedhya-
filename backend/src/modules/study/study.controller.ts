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
} from './dto/study.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../guards/roles.decorator';

@Controller('study')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Post('create')
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
  createStudyArm(@Param('id') id: string, @Body() dto: CreateStudyArmDto) {
    return this.studyService.createStudyArm(id, dto);
  }

  @Post('arms/:armId/visits')
  createVisitDefinition(@Param('armId') armId: string, @Body() dto: CreateVisitDefinitionDto) {
    return this.studyService.createVisitDefinition(armId, dto);
  }

  @Post(':id/iec-submit')
  submitToIec(@Param('id') id: string, @Body() dto: SubmitIecDto) {
    return this.studyService.submitToIec(id, dto);
  }

  @Patch(':id/iec-decide')
  @Roles('ROLE_COMPLIANCE_OFFICER')
  recordIecDecision(@Param('id') id: string, @Body() dto: DecideIecDto) {
    return this.studyService.recordIecDecision(id, dto);
  }

  @Patch(':id/ctri-link')
  @Roles('ROLE_COMPLIANCE_OFFICER')
  linkCtri(@Param('id') id: string, @Body() dto: LinkCtriDto) {
    return this.studyService.linkCtri(id, dto);
  }

  @Post(':id/ip-batch')
  addIpBatch(@Param('id') id: string, @Body() dto: CreateIpBatchDto) {
    return this.studyService.addIpBatch(id, dto);
  }
}