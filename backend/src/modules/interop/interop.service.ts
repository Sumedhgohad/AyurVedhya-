import { Injectable, NotFoundException } from '@nestjs/common';
import { StudyService } from '../study/study.service';
import { ClinicalService } from '../clinical/clinical.service';

@Injectable()
export class InteropService {
  constructor(
    private readonly studyService: StudyService,
    private readonly clinicalService: ClinicalService,
  ) {}

  // 1. HL7 FHIR v4.0 JSON Bundle (Ayushman Bharat / ABDM Compliant)
  async generateFhirBundle(studyId: string): Promise<any> {
    const study = await this.studyService.getStudyById(studyId);
    if (!study) throw new NotFoundException('Study not found.');

    const participants = await this.clinicalService.getParticipantsByStudy(studyId);

    return {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      meta: { profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'] },
      entry: [
        // FHIR Resource: ResearchStudy
        {
          fullUrl: `urn:uuid:${study.id}`,
          resource: {
            resourceType: 'ResearchStudy',
            id: study.id,
            identifier: [{ system: 'https://ctri.nic.in', value: study.ctri_registration?.ctri_id || 'PENDING' }],
            title: study.title,
            status: study.status.toLowerCase(),
            phase: { text: study.phase },
            category: [{ text: 'Ayurveda Clinical Research' }],
          },
        },
        // FHIR Resources: ResearchSubject (one per participant)
        ...participants.map((p) => ({
          fullUrl: `urn:uuid:${p.id}`,
          resource: {
            resourceType: 'ResearchSubject',
            id: p.id,
            identifier: [{ system: 'https://aiia.gov.in/subjects', value: p.participant_code }],
            status: p.status.toLowerCase(),
            study: { reference: `ResearchStudy/${study.id}` },
            consent: {
              resourceType: 'Consent',
              status: 'active',
              dateTime: p.consent?.consent_timestamp,
              provision: { type: p.consent?.consent_type },
            },
          },
        })),
      ],
    };
  }

  // 2. CDISC SDTM Research Tables (for medical journals & global submission)
  async generateCdiscSdtm(studyId: string): Promise<any> {
    const study = await this.studyService.getStudyById(studyId);
    const participants = await this.clinicalService.getParticipantsByStudy(studyId);

    // SDTM Domain: DM (Demographics & Prakriti)
    const sdtm_DM = participants.map((p) => ({
      STUDYID: study.short_code,
      DOMAIN: 'DM',
      USUBJID: p.participant_code,
      AGE: p.age,
      SEX: p.gender === 'Female' ? 'F' : 'M',
      ARM: 'Ashwagandha Group',
      RFSTDTC: p.enrollment_date,
      // Ayurvedic Extension Fields
      PRAKRITI: p.visits?.[0]?.prakriti_assessment || 'N/A',
      PATHYA_DIET_SCORE: `${p.visits?.[0]?.pathya_apathya_diet_score || 0}%`,
    }));

    // SDTM Domain: EX (Exposure & Batch Accountability)
    const sdtm_EX = (study.ip_batches || []).map((b) => ({
      STUDYID: study.short_code,
      DOMAIN: 'EX',
      EXTRT: b.formulation_name,
      EXLOT: b.batch_no,
      EXSTD: b.afi_api_standard_ref,
      EXDOSE: 500,
      EXDOSU: 'mg',
    }));

    return {
      cdisc_version: 'SDTM v3.3 / CDASH v2.1',
      study_metadata: { study_id: study.short_code, title: study.title },
      domains: {
        DM_Demographics: sdtm_DM,
        EX_Exposure_Medicine_Batches: sdtm_EX,
      },
    };
  }
}
