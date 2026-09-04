import { Controller, Get, Param } from '@nestjs/common';
import { InteropService } from './interop.service';

@Controller('interop')
export class InteropController {
  constructor(private readonly interopService: InteropService) {}

  @Get('fhir/bundle/:studyId')
  getFhirBundle(@Param('studyId') studyId: string) {
    return this.interopService.generateFhirBundle(studyId);
  }

  @Get('cdisc/sdtm/:studyId')
  getCdiscSdtm(@Param('studyId') studyId: string) {
    return this.interopService.generateCdiscSdtm(studyId);
  }
}
