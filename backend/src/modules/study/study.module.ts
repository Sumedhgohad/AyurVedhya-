import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Study, StudyIpBatch, IecSubmission, CtriRegistration } from './entities';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Study, StudyIpBatch, IecSubmission, CtriRegistration], 'studyConnection')],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
