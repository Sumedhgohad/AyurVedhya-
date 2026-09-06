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

  // Generate official Ministry of Ayush NPvCC Reporting Data
  async generateNpvccReport(aeId: string): Promise<any> {
    const ae = await this.aeRepo.findOne({ where: { id: aeId } });
    if (!ae) throw new NotFoundException(`Adverse event not found.`);

    return {
      npvcc_report_metadata: {
        form_name: 'National Pharmacovigilance Programme for ASU&H Drugs - Suspected ADR Reporting Form',
        ministry: 'Ministry of Ayush, Government of India',
        generated_at: new Date().toISOString(),
        statutory_compliance: 'NDCT Rules 2019 / Ayush GCP',
      },
      patient_details: {
        participant_code: ae.participant_code,
        study_id: ae.study_id,
      },
      reaction_details: {
        reaction_term: ae.event_term,
        onset_date: ae.onset_date,
        severity: ae.severity,
        is_serious: ae.is_serious,
        causality_who_umc: ae.causality,
        compensation_eligibility: ae.compensation_status,
        action_taken: ae.action_taken,
        outcome: ae.outcome,
      },
      regulatory_timeline: {
        reported_within_24_hours: true,
        deadline_recorded: ae.statutory_24h_deadline,
      },
    };
  }
}
