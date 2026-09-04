import { Module } from '@nestjs/common';
import { InteropService } from './interop.service';
import { InteropController } from './interop.controller';
import { StudyModule } from '../study/study.module';
import { ClinicalModule } from '../clinical/clinical.module';

@Module({
  imports: [StudyModule, ClinicalModule],
  controllers: [InteropController],
  providers: [InteropService],
  exports: [InteropService],
})
export class InteropModule {}
