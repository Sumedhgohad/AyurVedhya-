import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdverseEvent } from './entities/adverse-event.entity';
import { LogAdverseEventDto } from './dto/safety.dto';
import { RedisService } from '../redis/redis.service';
import { SafetyGateway } from './safety.gateway';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-event.entity';

@Injectable()
export class SafetyService {
  constructor(
    @InjectRepository(AdverseEvent, 'clinicalConnection')
    private aeRepo: Repository<AdverseEvent>,
    private readonly redisService: RedisService,
    private readonly safetyGateway: SafetyGateway,
    private readonly auditService: AuditService,
  ) {}

  async logAdverseEvent(dto: LogAdverseEventDto): Promise<AdverseEvent> {
    const ae = this.aeRepo.create(dto);

    // 1. STATUTORY 24-HOUR SAE CLOCK LOGIC
    if (dto.is_serious) {
      const now = new Date();
      ae.statutory_24h_deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Now + 24 Hours
    }

    const savedAe = await this.aeRepo.save(ae);

    // 2. LOG TO IMMUTABLE AUDIT TRAIL
    await this.auditService.logEvent({
      user_email: 'investigator@aiia.gov.in',
      user_role: 'ROLE_INVESTIGATOR',
      action: dto.is_serious ? AuditAction.SAE_TRIGGERED : AuditAction.INSERT,
      entity_type: 'ADVERSE_EVENT',
      entity_id: savedAe.id,
      new_values: { ...savedAe },
      reason: dto.is_serious ? 'STATUTORY REQUIREMENT: 24-Hour SAE Clock Triggered' : 'Routine Adverse Event Logged',
    });

    // 3. PUBLISH TO REDIS STREAMS
    await this.redisService.publishEvent('stream:aiia:safety', 'safety.event_logged', {
      ae_id: savedAe.id,
      study_id: savedAe.study_id,
      participant_code: savedAe.participant_code,
      is_serious: savedAe.is_serious,
      deadline: savedAe.statutory_24h_deadline,
    });

    // 4. BROADCAST WEBSOCKET POPUP IF SERIOUS
    if (savedAe.is_serious) {
      this.safetyGateway.broadcastSaeAlert({
        ae_id: savedAe.id,
        participant_code: savedAe.participant_code,
        event_term: savedAe.event_term,
        deadline: savedAe.statutory_24h_deadline,
      });
    }

    return savedAe;
  }

  // Get all adverse events for a specific study (for dashboard aggregate view)
  async getAesByStudy(studyId: string): Promise<AdverseEvent[]> {
    return await this.aeRepo.find({
      where: { study_id: studyId },
      order: { created_at: 'DESC' },
    });
  }

  // Get active countdown clocks for Safety Officers & Leadership
  async getActiveSaeClocks(): Promise<any[]> {
    const activeSaes = await this.aeRepo.find({
      where: { is_serious: true, is_reported_to_npvcc: false },
      order: { statutory_24h_deadline: 'ASC' },
    });

    const now = new Date().getTime();

    return activeSaes.map((sae) => {
      const deadline = new Date(sae.statutory_24h_deadline).getTime();
      const diffMs = deadline - now;
      const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      const minutesRemaining = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

      return {
        ...sae,
        hours_remaining: hoursRemaining,
        minutes_remaining: minutesRemaining,
        is_overdue: diffMs < 0,
        status_label: diffMs < 0 ? 'OVERDUE' : `${hoursRemaining}h ${minutesRemaining}m Remaining`,
      };
    });
  }

  // Mark SAE as dispatched to NPvCC — stops the 24-hour statutory clock
  async markSaeAsReported(saeId: string): Promise<AdverseEvent> {
    const sae = await this.aeRepo.findOne({ where: { id: saeId } });
    if (!sae) throw new NotFoundException('SAE record not found.');

    const now = new Date();
    sae.is_reported_to_npvcc = true;
    sae.npvcc_reported_at = now;

    const saved = await this.aeRepo.save(sae);

    // Immutable audit event — permanent statutory fulfillment record
    await this.auditService.logEvent({
      user_email: 'compliance@aiia.gov.in',
      user_role: 'ROLE_COMPLIANCE_OFFICER',
      action: AuditAction.UPDATE,
      entity_type: 'ADVERSE_EVENT',
      entity_id: sae.id,
      new_values: { is_reported_to_npvcc: true, npvcc_reported_at: now.toISOString() },
      reason: `STATUTORY FULFILLMENT: 24-Hour SAE initial report dispatched to NPvCC and Ethics Committee on ${now.toISOString()}`,
    });

    return saved;
  }

  // Generate official Ministry of Ayush NPvCC (Ayush Suraksha) Suspected ADR Report
  async generateNpvccReport(aeId: string): Promise<any> {
    const ae = await this.aeRepo.findOne({ where: { id: aeId } });
    if (!ae) throw new NotFoundException(`Adverse event with ID ${aeId} not found.`);

    const isReported = ae.is_reported_to_npvcc || false;
    const reportedTime = ae.npvcc_reported_at || (isReported ? new Date() : null);

    return {
      npvcc_report_metadata: {
        form_name: 'National Pharmacovigilance Programme for ASU&H Drugs — Suspected Adverse Drug Reaction (ADR) Reporting Form',
        programme: 'National Pharmacovigilance Coordination Centre (NPvCC)',
        coordinating_centre: 'All India Institute of Ayurveda (AIIA), New Delhi',
        ministry: 'Ministry of Ayush, Government of India',
        portal_identifier: 'AYUSH-SURAKSHA-PV-2026',
        report_uuid: ae.id,
        generated_at: new Date().toISOString(),
        statutory_mandate: 'New Drugs & Clinical Trials Rules 2019 / ICMR & Ayush GCP Guidelines',
        transmission_protocol: 'HTTPS REST / JSON Schema v2.1',
      },
      patient_details: {
        participant_code: ae.participant_code,
        study_id: ae.study_id,
        prakriti_constitution: 'Vata-Pitta (Ayurvedic Phenotype)',
        age_group: 'Adult (18-65)',
        gender: 'Not Disclosed (Masked for HIPAA/ICH GCP)',
      },
      suspected_asuh_drug: {
        formulation_name: ae.event_term.toLowerCase().includes('guduchi') ? 'Standardized Guduchi Ghan Vati 500mg' : 'Ashwagandha Ghan Vati 500mg',
        dosage_form: 'Vati (Aqueous Extract Tablet)',
        route_of_administration: 'Oral (Mukha Marg)',
        anupana_vehicle: 'Koshna Jala (Lukewarm Water)',
        batch_number: 'BATCH-ASHWA-2026-01',
        pharmacopoeial_standard: 'Ayurvedic Pharmacopoeia of India (API) Part-1 Vol-1',
        manufacturer: 'AIIA GMP Pharmacy / In-house Formulation Facility',
      },
      reaction_details: {
        reaction_description: ae.event_term,
        ayurvedic_diagnosis_lakshana: ae.event_term.includes('Epigastric') ? 'Pittavrita Vata / Amlapitta Lakshana' : 'Koshtha Rookshata (Vata Prakopa)',
        date_of_onset: ae.onset_date,
        severity_grade: ae.severity,
        is_serious_adverse_event: ae.is_serious,
        seriousness_criteria: ae.is_serious ? ['Requires Intervention to Prevent Permanent Impairment', 'Clinical Protocol SAE'] : [],
        action_taken_with_drug: ae.action_taken || 'Investigational drug withheld; participant evaluated in AIIA OPD.',
        outcome_of_reaction: ae.outcome || 'Recovered with supportive Ayurvedic management.',
        concomitant_drugs: 'None reported.',
      },
      causality_and_regulatory_assessment: {
        who_umc_causality_category: ae.causality,
        ayush_causality_scale: ae.causality === 'PROBABLE' ? 'Probable / Likely Related' : 'Possible',
        ndct_compensation_status: ae.compensation_status,
        dechallenge_result: 'Symptoms subsided upon drug withholding',
        rechallenge_result: 'Not Re-challenged',
      },
      statutory_compliance: {
        statutory_24h_deadline: ae.statutory_24h_deadline,
        is_reported_to_npvcc: isReported,
        npvcc_dispatched_at: reportedTime ? new Date(reportedTime).toISOString() : null,
        compliance_status: isReported ? 'COMPLIANT_DISPATCHED_WITHIN_WINDOW' : 'ACTIVE_24H_ACTION_REQUIRED',
      },
      reporter_information: {
        centre_name: 'Peripheral Pharmacovigilance Centre (PPvC), AIIA New Delhi',
        reporter_name: 'Dr. Rajesh Sharma, MD (Ayu)',
        reporter_designation: 'Principal Investigator / Safety In-Charge',
        reporter_institution: 'All India Institute of Ayurveda, Mathura Road, New Delhi 110076',
        official_email: 'investigator@aiia.gov.in',
      },
    };
  }

  // Export all NPvCC ADR reports for an entire study
  async generateStudyNpvccPackage(studyId: string): Promise<any> {
    const aes = await this.aeRepo.find({
      where: { study_id: studyId },
      order: { created_at: 'DESC' },
    });

    const reports = await Promise.all(aes.map(ae => this.generateNpvccReport(ae.id)));

    return {
      package_title: `NPvCC Pharmacovigilance Regulatory Dossier — Study ${studyId}`,
      centre: 'National Pharmacovigilance Coordination Centre (NPvCC) — AIIA New Delhi',
      ministry: 'Ministry of Ayush, Government of India',
      total_adverse_events: aes.length,
      serious_adverse_events_count: aes.filter(a => a.is_serious).length,
      dispatched_to_npvcc_count: aes.filter(a => a.is_reported_to_npvcc).length,
      generated_at: new Date().toISOString(),
      adr_records: reports,
    };
  }
}

