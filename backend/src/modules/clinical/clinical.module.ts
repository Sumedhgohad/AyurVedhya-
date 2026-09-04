import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyModule } from '../study/study.module';
import { Participant } from './entities/participant.entity';
import { ParticipantConsent } from './entities/participant-consent.entity';
import { Visit } from './entities/visit.entity';
import { DataQuery } from './entities/data-query.entity';
import { ProtocolDeviation } from './entities/protocol-deviation.entity';
import { ClinicalService } from './clinical.service';
import { ClinicalController } from './clinical.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Participant, ParticipantConsent, Visit, DataQuery, ProtocolDeviation],
      'clinicalConnection',
    ),
    StudyModule, // Imports StudyService for cross-domain checks
  ],
  controllers: [ClinicalController],
  providers: [ClinicalService],
  exports: [ClinicalService],
})
export class ClinicalModule {}
