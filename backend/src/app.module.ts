import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { studyDatabaseConfig } from './config/database.config';
import { StudyModule } from './modules/study/study.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    TypeOrmModule.forRoot(studyDatabaseConfig),
    StudyModule,
  ],
})
export class AppModule {}
