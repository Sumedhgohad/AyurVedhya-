import { Controller, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health-score/:studyId')
  getHealthScore(@Param('studyId') studyId: string) {
    return this.aiService.calculateTrialHealthScore(studyId);
  }

  @Get('delays-and-risks/:studyId')
  getDelaysAndRisks(@Param('studyId') studyId: string) {
    return this.aiService.calculateStudyDelaysAndRisks(studyId);
  }
}
