import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// 1. Connection for Study Governance Database
export const studyDatabaseConfig: TypeOrmModuleOptions = {
  name: 'studyConnection',
  type: 'postgres',
  url: process.env.STUDY_DB_URL || 'postgresql://postgres:postgres_secure_pass@localhost:5432/study_governance_db',
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
};

// 2. Connection for Clinical & Safety Database
export const clinicalDatabaseConfig: TypeOrmModuleOptions = {
  name: 'clinicalConnection',
  type: 'postgres',
  url: process.env.CLINICAL_DB_URL || 'postgresql://postgres:postgres_secure_pass@localhost:5432/clinical_safety_db',
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
};

// 3. Connection for Audit & Integrity Database
export const auditDatabaseConfig: TypeOrmModuleOptions = {
  name: 'auditConnection',
  type: 'postgres',
  url: process.env.AUDIT_DB_URL || 'postgresql://postgres:postgres_secure_pass@localhost:5432/audit_integrity_db',
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
};
