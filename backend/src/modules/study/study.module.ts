import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Study, StudyIpBatch, IecSubmission, CtriRegistration, StudyArm, VisitDefinition } from './entities';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Study, StudyIpBatch, IecSubmission, CtriRegistration, StudyArm, VisitDefinition],
      'studyConnection',
    ),
  ],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
