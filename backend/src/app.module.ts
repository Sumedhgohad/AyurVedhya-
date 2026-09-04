import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { studyDatabaseConfig, clinicalDatabaseConfig, auditDatabaseConfig } from './config/database.config';
import { StudyModule } from './modules/study/study.module';
import { ClinicalModule } from './modules/clinical/clinical.module';
import { AuditModule } from './modules/audit/audit.module';
import { RedisModule } from './modules/redis/redis.module';
import { SafetyModule } from './modules/safety/safety.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AiAnalyticsModule } from './modules/ai-analytics/ai.module';
import { InteropModule } from './modules/interop/interop.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(studyDatabaseConfig),
    TypeOrmModule.forRoot(clinicalDatabaseConfig),
    TypeOrmModule.forRoot(auditDatabaseConfig),
    RedisModule,
    StudyModule,
    ClinicalModule,
    AuditModule,
    SafetyModule,
    AlertsModule,
    DocumentsModule,
    AiAnalyticsModule,
    InteropModule,
  ],
})
export class AppModule {}
