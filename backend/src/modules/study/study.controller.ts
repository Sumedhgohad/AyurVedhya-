import { Controller, Post, Get, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { StudyService } from './study.service';
import { CreateStudyDto, SubmitIecDto, DecideIecDto, LinkCtriDto, CreateIpBatchDto } from './dto/study.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('study')
@UseGuards(JwtAuthGuard)
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

  @Post(':id/iec-submit')
  submitToIec(@Param('id') id: string, @Body() dto: SubmitIecDto) {
    return this.studyService.submitToIec(id, dto);
  }

  @Patch(':id/iec-decide')
  recordIecDecision(@Param('id') id: string, @Body() dto: DecideIecDto) {
    return this.studyService.recordIecDecision(id, dto);
  }

  @Patch(':id/ctri-link')
  linkCtri(@Param('id') id: string, @Body() dto: LinkCtriDto) {
    return this.studyService.linkCtri(id, dto);
  }

  @Post(':id/ip-batch')
  addIpBatch(@Param('id') id: string, @Body() dto: CreateIpBatchDto) {
    return this.studyService.addIpBatch(id, dto);
  }
}