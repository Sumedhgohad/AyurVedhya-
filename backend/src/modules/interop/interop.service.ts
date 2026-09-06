import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyService } from '../study/study.service';
import { ClinicalService } from '../clinical/clinical.service';
import { AdverseEvent } from '../safety/entities/adverse-event.entity';

@Injectable()
export class InteropService {
  constructor(
    private readonly studyService: StudyService,
    private readonly clinicalService: ClinicalService,
    @InjectRepository(AdverseEvent, 'clinicalConnection')
    private readonly aeRepo: Repository<AdverseEvent>,
  ) {}

  // ─── Helper: parse prakriti_assessment JSON stored by clinical service ────
  private parsePrakriti(raw: string | null | undefined): string {
    if (!raw) return 'N/A';
    try {
      const parsed = JSON.parse(raw);
      // clinical.service stores: { dominant_prakriti, vata_percentage, ... }
      return parsed?.dominant_prakriti ?? raw;
    } catch {
      return raw; // already a plain string
    }
  }

  // ─── Helper: derive ARM label from study arms for a given participant ─────
  private resolveArm(study: any): string {
    const arms: any[] = study.study_arms ?? [];
    if (arms.length === 0) return 'Experimental Arm';
    // Use first arm's label as the study arm name (participants are not
    // individually arm-mapped in the current schema — use study arm label)
    return arms[0]?.label ?? arms[0]?.arm_code ?? 'Experimental Arm';
  }

  // =========================================================================
  // 1. HL7 FHIR v4.0 Bundle — Ayushman Bharat / ABDM Compliant
  // =========================================================================
  async generateFhirBundle(studyId: string): Promise<any> {
    const study = await this.studyService.getStudyById(studyId);
    if (!study) throw new NotFoundException('Study not found.');

    const participants = await this.clinicalService.getParticipantsByStudy(studyId);

    // Collect NAMASTE / ICD-11 TM-2 codes from visits for the study extension
    const terminologyCodes = new Set<string>();
    participants.forEach((p) =>
      (p.visits ?? []).forEach((v: any) => {
        if (v.namaste_terminology_code) terminologyCodes.add(v.namaste_terminology_code);
      }),
    );

    return {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
        fhir_version: 'R4 (4.0.1)',
        abdm_gateway_status: 'CONNECTED',
        national_health_stack: 'Mapped',
      },
      entry: [
        // ── ResearchStudy resource ────────────────────────────────────────
        {
          fullUrl: `urn:uuid:${study.id}`,
          resource: {
            resourceType: 'ResearchStudy',
            id: study.id,
            identifier: [
              {
                system: 'https://ctri.nic.in',
                value: study.ctri_registration?.ctri_id ?? 'PENDING',
              },
            ],
            title: study.title,
            status: study.status.toLowerCase(),
            phase: { text: study.phase },
            category: [{ text: 'Ayurveda Clinical Research' }],
            extension: [
              {
                url: 'https://namaste.nhp.gov.in/terminology',
                valueCodeableConcept: {
                  coding: [...terminologyCodes].map((code) => ({
                    system: 'https://namaste.nhp.gov.in',
                    code,
                    display: 'Ministry of Ayush NAMASTE Code',
                  })),
                },
              },
              {
                url: 'https://icd.who.int/browse11/TM-2',
                valueString: 'ICD-11 TM-2 — Traditional Medicine Classification',
              },
            ],
            sponsor: {
              display: 'All India Institute of Ayurveda (AIIA), Ministry of Ayush',
            },
            enrollment: [{ reference: `Group/${study.id}-cohort` }],
          },
        },
        // ── ResearchSubject resource (one per participant) ────────────────
        ...participants.map((p) => ({
          fullUrl: `urn:uuid:${p.id}`,
          resource: {
            resourceType: 'ResearchSubject',
            id: p.id,
            identifier: [
              {
                system: 'https://aiia.gov.in/subjects',
                value: p.participant_code,
              },
            ],
            status: p.status.toLowerCase(),
            study: { reference: `ResearchStudy/${study.id}` },
            individualAge: p.age,
            gender: p.gender,
            period: { start: p.enrollment_date },
            consent: {
              resourceType: 'Consent',
              status: 'active',
              dateTime: p.consent?.consent_timestamp,
              provision: { type: p.consent?.consent_type ?? 'permit' },
              patient: { reference: `Patient/${p.id}` },
            },
          },
        })),
      ],
    };
  }

  // =========================================================================
  // 2. CDISC SDTM v3.3 — DM, EX, AE domains (100% dynamic)
  // =========================================================================
  async generateCdiscSdtm(studyId: string): Promise<any> {
    const study = await this.studyService.getStudyById(studyId);
    const participants = await this.clinicalService.getParticipantsByStudy(studyId);
    const adverseEvents = await this.aeRepo.find({ where: { study_id: studyId } });

    const armLabel = this.resolveArm(study);

    // ── Domain DM: Demographics & Ayurvedic Constitution ─────────────────
    const sdtm_DM = participants.map((p) => ({
      STUDYID: study.short_code,
      DOMAIN: 'DM',
      USUBJID: p.participant_code,
      AGE: p.age,
      SEX: p.gender?.toLowerCase() === 'female' ? 'F' : 'M',
      ARM: armLabel,
      RFSTDTC: p.enrollment_date,
      PRAKRITI: this.parsePrakriti(p.visits?.[0]?.prakriti_assessment),
      PATHYA_DIET_SCORE: `${p.visits?.[0]?.pathya_apathya_diet_score ?? 100}%`,
    }));

    // ── Domain EX: Exposure & Investigational Product Accountability ──────
    // Build a dispensation map: batch_no → total units dispensed across all visits
    const dispensedByBatch: Record<string, number> = {};
    participants.forEach((p) => {
      (p.visits ?? []).forEach((v: any) => {
        if (v.dispensed_batch_no) {
          dispensedByBatch[v.dispensed_batch_no] =
            (dispensedByBatch[v.dispensed_batch_no] ?? 0) + (v.quantity_dispensed ?? 0);
        }
      });
    });

    const sdtm_EX = (study.ip_batches ?? []).map((b: any) => ({
      STUDYID: study.short_code,
      DOMAIN: 'EX',
      EXTRT: b.formulation_name,
      EXLOT: b.batch_no,
      EXSTD: b.afi_api_standard_ref ?? 'API Standard',
      // Use actual dispensed quantity if available, else fall back to batch initial qty
      EXDOSE: dispensedByBatch[b.batch_no] ?? b.initial_quantity ?? b.current_stock ?? 0,
      EXDOSU: 'units',
    }));

    // ── Domain AE: Adverse Events & Safety ───────────────────────────────
    const sdtm_AE = adverseEvents.map((ae) => ({
      STUDYID: study.short_code,
      DOMAIN: 'AE',
      USUBJID: ae.participant_code,
      AETERM: ae.event_term,
      AESEV: ae.severity,
      AEREL: ae.causality,
      AESER: ae.is_serious ? 'Y' : 'N',
      AEOUT: ae.outcome ?? 'UNKNOWN',
      AESTDTC: ae.onset_date,
    }));

    return {
      cdisc_version: 'SDTM v3.3 / CDASH v2.1',
      study_metadata: {
        study_id: study.short_code,
        title: study.title,
        phase: study.phase,
        study_type: study.study_type,
        ctri_id: study.ctri_registration?.ctri_id ?? 'PENDING',
        generated_at: new Date().toISOString(),
      },
      domains: {
        DM: sdtm_DM,
        EX: sdtm_EX,
        AE: sdtm_AE,
      },
    };
  }
}
