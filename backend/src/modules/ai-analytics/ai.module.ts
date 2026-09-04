import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { StudyModule } from '../study/study.module';
import { ClinicalModule } from '../clinical/clinical.module';

@Module({
  imports: [StudyModule, ClinicalModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiAnalyticsModule {}
