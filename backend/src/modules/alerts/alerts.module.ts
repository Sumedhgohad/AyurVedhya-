import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAlert } from './entities/system-alert.entity';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { StudyModule } from '../study/study.module';
import { SafetyModule } from '../safety/safety.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemAlert], 'auditConnection'),
    StudyModule,
    SafetyModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
