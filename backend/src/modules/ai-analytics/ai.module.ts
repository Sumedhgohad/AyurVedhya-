import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { StudyModule } from '../study/study.module';
import { ClinicalModule } from '../clinical/clinical.module';
import { AdverseEvent } from '../safety/entities/adverse-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdverseEvent], 'clinicalConnection'),
    StudyModule,
    ClinicalModule,
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiAnalyticsModule {}
