import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { studyDatabaseConfig, clinicalDatabaseConfig, auditDatabaseConfig } from './config/database.config';
import { StudyModule } from './modules/study/study.module';
import { ClinicalModule } from './modules/clinical/clinical.module';
import { AuditModule } from './modules/audit/audit.module';
import { RedisModule } from './modules/redis/redis.module';
import { SafetyModule } from './modules/safety/safety.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    TypeOrmModule.forRoot(studyDatabaseConfig),
    TypeOrmModule.forRoot(clinicalDatabaseConfig),
    TypeOrmModule.forRoot(auditDatabaseConfig),
    RedisModule,
    StudyModule,
    ClinicalModule,
    AuditModule,
    SafetyModule,
  ],
})
export class AppModule {}
