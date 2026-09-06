import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteropService } from './interop.service';
import { InteropController } from './interop.controller';
import { StudyModule } from '../study/study.module';
import { ClinicalModule } from '../clinical/clinical.module';
import { AdverseEvent } from '../safety/entities/adverse-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdverseEvent], 'clinicalConnection'),
    StudyModule,
    ClinicalModule,
  ],
  controllers: [InteropController],
  providers: [InteropService],
  exports: [InteropService],
})
export class InteropModule {}
