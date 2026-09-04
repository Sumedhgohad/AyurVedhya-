import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { studyDatabaseConfig, clinicalDatabaseConfig, auditDatabaseConfig } from './config/database.config';
import { StudyModule } from './modules/study/study.module';
import { ClinicalModule } from './modules/clinical/clinical.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    // Database 1: study_governance_db
    TypeOrmModule.forRoot(studyDatabaseConfig),
    // Database 2: clinical_safety_db
    TypeOrmModule.forRoot(clinicalDatabaseConfig),
    // Database 3: audit_integrity_db
    TypeOrmModule.forRoot(auditDatabaseConfig),
    StudyModule,
    ClinicalModule,
    AuditModule,
  ],
})
export class AppModule {}
