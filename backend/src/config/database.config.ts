import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const studyDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.STUDY_DB_URL || 'postgresql://postgres:postgres_secure_pass@localhost:5432/study_governance_db',
  autoLoadEntities: true,
  synchronize: true, // Auto-creates/syncs schema tables in dev
  logging: false,
};
