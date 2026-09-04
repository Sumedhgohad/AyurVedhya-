import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdverseEvent } from './entities/adverse-event.entity';
import { SafetyService } from './safety.service';
import { SafetyController } from './safety.controller';
import { SafetyGateway } from './safety.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([AdverseEvent], 'clinicalConnection')],
  controllers: [SafetyController],
  providers: [SafetyService, SafetyGateway],
  exports: [SafetyService],
})
export class SafetyModule {}
