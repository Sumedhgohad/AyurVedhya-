import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SystemAlert, AlertCategory, AlertSeverity } from './entities/system-alert.entity';
import { StudyService } from '../study/study.service';
import { SafetyService } from '../safety/safety.service';
import { SafetyGateway } from '../safety/safety.gateway';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(SystemAlert, 'auditConnection')
    private alertRepo: Repository<SystemAlert>,
    private readonly studyService: StudyService,
    private readonly safetyService: SafetyService,
    private readonly safetyGateway: SafetyGateway,
  ) {}

  // 1. Background Scanner: Runs automatically every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledComplianceScan() {
    this.logger.log('🔍 Running automated regulatory compliance scan...');
    await this.evaluateAllRules();
  }

  // 2. Evaluates all compliance rules across active studies
  async evaluateAllRules(): Promise<SystemAlert[]> {
    const studies = await this.studyService.getAllStudies();
    const activeSaes = await this.safetyService.getActiveSaeClocks();
    const generatedAlerts: SystemAlert[] = [];

    const now = new Date();

    // RULE A: Check 24-Hour SAE Emergency Clocks (<12 hours remaining)
    for (const sae of activeSaes) {
      if (sae.hours_remaining < 12) {
        const alert = this.alertRepo.create({
          category: AlertCategory.SAE_EMERGENCY,
          severity: AlertSeverity.CRITICAL,
          title: `URGENT: 24-Hour SAE Clock Expiration Risk (${sae.status_label})`,
          message: `Participant ${sae.participant_code} experienced severe reaction: '${sae.event_term}'. Report must be dispatched to NPvCC before deadline.`,
          study_id: sae.study_id,
          study_code: 'AIIA-STUDY',
        });
        generatedAlerts.push(await this.alertRepo.save(alert));
      }
    }

    // RULE B: Check CTRI 6-Month Update Due
    for (const study of studies) {
      if (study.ctri_registration?.next_mandatory_update_due) {
        const ctriDueDate = new Date(study.ctri_registration.next_mandatory_update_due);
        const daysToCtri = Math.ceil((ctriDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysToCtri <= 30) {
          const alert = this.alertRepo.create({
            category: AlertCategory.CTRI_UPDATE_DUE,
            severity: daysToCtri <= 7 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
            title: `CTRI 6-Month Update Due in ${daysToCtri} Days`,
            message: `Study ${study.short_code} (${study.ctri_registration.ctri_id}) requires mandatory 6-monthly progress filing on ctri.nic.in.`,
            study_id: study.id,
            study_code: study.short_code,
          });
          generatedAlerts.push(await this.alertRepo.save(alert));
        }
      }

      // RULE C: Check IEC Expiration
      const approvedIec = study.iec_submissions?.find((s) => s.decision === 'APPROVED');
      if (approvedIec?.valid_until) {
        const iecExpiry = new Date(approvedIec.valid_until);
        const daysToExpiry = Math.ceil((iecExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysToExpiry <= 60) {
          const alert = this.alertRepo.create({
            category: AlertCategory.IEC_EXPIRY,
            severity: daysToExpiry <= 15 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
            title: `Ethics (IEC) Approval Expiring in ${daysToExpiry} Days`,
            message: `Study ${study.short_code} ethics clearance expires on ${approvedIec.valid_until}. Submit continuing review dossier for renewal.`,
            study_id: study.id,
            study_code: study.short_code,
          });
          generatedAlerts.push(await this.alertRepo.save(alert));
        }
      }
    }

    if (generatedAlerts.length > 0) {
      // Push summary alert to WebSocket dashboard
      this.safetyGateway.broadcastSaeAlert({
        type: 'COMPLIANCE_SCAN_COMPLETE',
        alerts_generated: generatedAlerts.length,
        critical_count: generatedAlerts.filter((a) => a.severity === AlertSeverity.CRITICAL).length,
      });
    }

    this.logger.log(`✅ Scan complete. Generated ${generatedAlerts.length} alerts.`);
    return generatedAlerts;
  }

  // Get all active unacknowledged alerts
  async getActiveAlerts(): Promise<SystemAlert[]> {
    return await this.alertRepo.find({
      where: { is_acknowledged: false },
      order: { created_at: 'DESC' },
    });
  }

  // Acknowledge/dismiss alert
  async acknowledgeAlert(id: string): Promise<SystemAlert> {
    const alert = await this.alertRepo.findOne({ where: { id } });
    if (alert) {
      alert.is_acknowledged = true;
      return await this.alertRepo.save(alert);
    }
    return null;
  }
}
