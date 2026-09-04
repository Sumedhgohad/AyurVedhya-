import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { studyDatabaseConfig, clinicalDatabaseConfig } from './config/database.config';
import { StudyModule } from './modules/study/study.module';
import { ClinicalModule } from './modules/clinical/clinical.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    // Database Connection 1: study_governance_db
    TypeOrmModule.forRoot(studyDatabaseConfig),
    // Database Connection 2: clinical_safety_db
    TypeOrmModule.forRoot(clinicalDatabaseConfig),
    StudyModule,
    ClinicalModule,
  ],
})
export class AppModule {}
