import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Study, StudyIpBatch, IecSubmission, CtriRegistration, StudyArm, VisitDefinition } from './entities';
import { AuditEvent } from '../audit/entities/audit-event.entity';
import { SystemAlert } from '../alerts/entities/system-alert.entity';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Study, StudyIpBatch, IecSubmission, CtriRegistration, StudyArm, VisitDefinition],
      'studyConnection',
    ),
    // AuditEvent lives in auditConnection — needed for immutable audit logging
    TypeOrmModule.forFeature([AuditEvent, SystemAlert], 'auditConnection'),
  ],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
