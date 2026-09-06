import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Study, StudyStatus } from './entities/study.entity';
import { StudyIpBatch } from './entities/study-ip-batch.entity';
import { IecSubmission, IecDecisionStatus } from './entities/iec-submission.entity';
import { CtriRegistration } from './entities/ctri-registration.entity';
import { StudyArm, ArmType } from './entities/study-arm.entity';
import { VisitDefinition, VisitDefinitionType } from './entities/visit-definition.entity';
import { AuditEvent, AuditAction } from '../audit/entities/audit-event.entity';
import { SystemAlert, AlertCategory, AlertSeverity } from '../alerts/entities/system-alert.entity';
import {
  CreateStudyDto,
  SubmitIecDto,
  DecideIecDto,
  LinkCtriDto,
  CreateIpBatchDto,
  CreateStudyArmDto,
  CreateVisitDefinitionDto,
  TerminateStudyDto,
} from './dto/study.dto';

@Injectable()
export class StudyService {
  constructor(
    @InjectRepository(Study, 'studyConnection') private studyRepo: Repository<Study>,
    @InjectRepository(StudyIpBatch, 'studyConnection') private ipRepo: Repository<StudyIpBatch>,
    @InjectRepository(IecSubmission, 'studyConnection') private iecRepo: Repository<IecSubmission>,
    @InjectRepository(CtriRegistration, 'studyConnection') private ctriRepo: Repository<CtriRegistration>,
    @InjectRepository(StudyArm, 'studyConnection') private armRepo: Repository<StudyArm>,
    @InjectRepository(VisitDefinition, 'studyConnection') private visitDefRepo: Repository<VisitDefinition>,
    @InjectRepository(AuditEvent, 'auditConnection') private auditRepo: Repository<AuditEvent>,
    @InjectRepository(SystemAlert, 'auditConnection') private alertRepo: Repository<SystemAlert>,
  ) {}

  async createStudy(dto: CreateStudyDto): Promise<Study> {
    const study = this.studyRepo.create(dto);
    const savedStudy = await this.studyRepo.save(study);

    if (dto.arms && Array.isArray(dto.arms) && dto.arms.length > 0) {
      await this.saveProtocolStructure(savedStudy.id, {
        arms: dto.arms,
        visitSchedule: dto.visitSchedule || [],
      });
    }

    return await this.getStudyById(savedStudy.id);
  }

  async saveProtocolStructure(studyId: string, dto: { arms: any[]; visitSchedule: any[] }): Promise<Study> {
    const study = await this.getStudyById(studyId);

    if (dto.arms && Array.isArray(dto.arms) && dto.arms.length > 0) {
      for (const armDto of dto.arms) {
        const armCode = armDto.arm_code || armDto.arm_name?.split(' ')[0] || `ARM-${armDto.id || Math.floor(Math.random() * 100)}`;
        const arm = this.armRepo.create({
          study,
          arm_code: armCode,
          label: armDto.arm_name || armDto.label || 'Study Arm',
          arm_type: armDto.arm_type || 'EXPERIMENTAL',
          description: armDto.description || `Ratio: ${armDto.allocation_ratio || '1:1'}`,
        });
        const savedArm = await this.armRepo.save(arm);

        if (dto.visitSchedule && Array.isArray(dto.visitSchedule) && dto.visitSchedule.length > 0) {
          for (const vDto of dto.visitSchedule) {
            const vd = this.visitDefRepo.create({
              arm: savedArm,
              visit_name: vDto.visit_name,
              visit_day: Number(vDto.target_day ?? vDto.visit_day ?? 0),
              window_minus: Number(vDto.window_tolerance ?? vDto.window_minus ?? 0),
              window_plus: Number(vDto.window_tolerance ?? vDto.window_plus ?? 0),
              visit_type: vDto.visit_type || 'FOLLOW_UP',
            });
            await this.visitDefRepo.save(vd);
          }
        }
      }
    }

    return await this.getStudyById(studyId);
  }

  async getAllStudies(): Promise<Study[]> {
    return await this.studyRepo.find({
      relations: ['ip_batches', 'iec_submissions', 'ctri_registration', 'study_arms', 'study_arms.visit_definitions'],
      order: { created_at: 'DESC' },
    });
  }

  async getStudyById(id: string): Promise<Study> {
    const study = await this.studyRepo.findOne({
      where: { id },
      relations: ['ip_batches', 'iec_submissions', 'ctri_registration', 'study_arms', 'study_arms.visit_definitions'],
    });
    if (!study) throw new NotFoundException(`Study with ID ${id} not found.`);
    return study;
  }

  async createStudyArm(studyId: string, dto: CreateStudyArmDto): Promise<StudyArm> {
    const study = await this.getStudyById(studyId);
    const arm = this.armRepo.create({
      study,
      arm_code: dto.arm_code,
      label: dto.label,
      arm_type: (dto.arm_type as ArmType) || ArmType.INTERVENTION,
      description: dto.description,
    });
    return await this.armRepo.save(arm);
  }

  async createVisitDefinition(armId: string, dto: CreateVisitDefinitionDto): Promise<VisitDefinition> {
    const arm = await this.armRepo.findOne({ where: { id: armId } });
    if (!arm) throw new NotFoundException(`Study Arm with ID ${armId} not found.`);

    const vd = this.visitDefRepo.create({
      arm,
      visit_name: dto.visit_name,
      visit_day: dto.visit_day,
      window_minus: dto.window_minus || 0,
      window_plus: dto.window_plus || 0,
      visit_type: (dto.visit_type as VisitDefinitionType) || VisitDefinitionType.FOLLOW_UP,
    });
    return await this.visitDefRepo.save(vd);
  }

  async submitToIec(studyId: string, dto: SubmitIecDto): Promise<IecSubmission> {
    const study = await this.getStudyById(studyId);
    if (study.status !== StudyStatus.DRAFT && study.status !== StudyStatus.IEC_SUBMITTED) {
      throw new BadRequestException(`Only DRAFT studies can be submitted to IEC.`);
    }

    const submission = this.iecRepo.create({ ...dto, study });
    const saved = await this.iecRepo.save(submission);

    await this.studyRepo.update(studyId, { status: StudyStatus.IEC_SUBMITTED });
    return saved;
  }

  async recordIecDecision(studyId: string, dto: DecideIecDto): Promise<IecSubmission> {
    const study = await this.getStudyById(studyId);
    
    // Find the latest submission for this study
    let sub = await this.iecRepo.findOne({
      where: { study: { id: studyId } },
      order: { created_at: 'DESC' },
    });

    if (!sub) {
      // Auto-create submission if not yet created
      sub = this.iecRepo.create({
        study,
        submission_date: dto.decision_date,
      });
    }

    sub.decision = dto.decision;
    sub.decision_date = dto.decision_date;
    sub.valid_until = dto.valid_until;
    sub.remarks = dto.remarks;

    const saved = await this.iecRepo.save(sub);

    // Update study status
    if (dto.decision === IecDecisionStatus.APPROVED) {
      // If CTRI is already registered, unlock ENROLLING directly!
      const newStatus = study.ctri_registration ? StudyStatus.ENROLLING : StudyStatus.IEC_APPROVED;
      await this.studyRepo.update(studyId, { status: newStatus });
    }

    return saved;
  }

  async linkCtri(studyId: string, dto: LinkCtriDto): Promise<CtriRegistration> {
    const study = await this.getStudyById(studyId);

    // Calculate next 6-month statutory update deadline
    const regDate = new Date(dto.registration_date);
    const sixMonthsLater = new Date(regDate.setMonth(regDate.getMonth() + 6)).toISOString().split('T')[0];

    let ctri = await this.ctriRepo.findOne({ where: { study: { id: studyId } } });
    if (ctri) {
      ctri.ctri_id = dto.ctri_id;
      ctri.registration_date = dto.registration_date;
      ctri.last_updated_date = dto.registration_date;
      ctri.next_mandatory_update_due = sixMonthsLater;
    } else {
      ctri = this.ctriRepo.create({
        study,
        ctri_id: dto.ctri_id,
        registration_date: dto.registration_date,
        last_updated_date: dto.registration_date,
        next_mandatory_update_due: sixMonthsLater,
      });
    }

    const savedCtri = await this.ctriRepo.save(ctri);

    // State Transition: If IEC is approved -> Unlock ENROLLING
    const hasApprovedIec = study.iec_submissions?.some((s) => s.decision === IecDecisionStatus.APPROVED);
    if (hasApprovedIec || study.status === StudyStatus.IEC_APPROVED) {
      await this.studyRepo.update(studyId, { status: StudyStatus.ENROLLING });
    }

    return savedCtri;
  }

  async addIpBatch(studyId: string, dto: CreateIpBatchDto): Promise<StudyIpBatch> {
    const study = await this.getStudyById(studyId);
    const batch = this.ipRepo.create({
      study,
      formulation_name: dto.formulation_name,
      batch_no: dto.batch_no,
      afi_api_standard_ref: dto.afi_api_standard_ref,
      manufacturing_date: dto.manufacturing_date,
      expiry_date: dto.expiry_date,
      initial_quantity: dto.quantity,
      current_stock: dto.quantity,
    });

    return await this.ipRepo.save(batch);
  }

  async decrementBatchStock(batchNo: string, quantityToDeduct: number): Promise<StudyIpBatch> {
    const batch = await this.ipRepo.findOne({ where: { batch_no: batchNo } });
    if (!batch) {
      throw new NotFoundException(`Medicine batch '${batchNo}' not found in pharmacy inventory.`);
    }

    if (batch.current_stock < quantityToDeduct) {
      throw new BadRequestException(
        `GCP INVENTORY ALERT: Insufficient stock for batch '${batchNo}'. Available: ${batch.current_stock}, Requested: ${quantityToDeduct}`,
      );
    }

    batch.current_stock -= quantityToDeduct;
    return await this.ipRepo.save(batch);
  }

  // ─── Lifecycle: Data Lock ───────────────────────────────────────────────────
  // Guard: ENROLLING or ONGOING → DATA_LOCK
  async dataLockStudy(studyId: string): Promise<Study> {
    const study = await this.getStudyById(studyId);

    const allowedStates = [StudyStatus.ENROLLING, StudyStatus.ONGOING];
    if (!allowedStates.includes(study.status)) {
      throw new BadRequestException(
        `Data Lock is only permitted for studies in ENROLLING or ONGOING state. Current state: ${study.status}`,
      );
    }

    await this.studyRepo.update(studyId, { status: StudyStatus.DATA_LOCK });

    // Immutable audit event — append-only in audit_integrity_db
    await this.auditRepo.save(
      this.auditRepo.create({
        user_email: 'system@aiia.gov.in',
        user_role: 'SYSTEM',
        action: AuditAction.STATUS_CHANGE,
        entity_type: 'STUDY',
        entity_id: studyId,
        old_values: { status: study.status },
        new_values: { status: StudyStatus.DATA_LOCK },
        reason: 'Study database locked for statistical analysis. No further CRF edits permitted.',
        ip_address: '127.0.0.1',
      }),
    );

    return this.getStudyById(studyId);
  }

  // ─── Lifecycle: Complete Study ──────────────────────────────────────────────
  // Guard: DATA_LOCK → CLOSED; calculates statutory 30-day CTRI closeout deadline
  async completeStudy(studyId: string): Promise<Study> {
    const study = await this.getStudyById(studyId);

    if (study.status !== StudyStatus.DATA_LOCK) {
      throw new BadRequestException(
        `Study can only be completed from DATA_LOCK state. Current state: ${study.status}`,
      );
    }

    // Statutory 30-day CTRI closeout notification window
    const closeoutDeadline = new Date();
    closeoutDeadline.setDate(closeoutDeadline.getDate() + 30);
    const ctriCompletionDeadline = closeoutDeadline.toISOString().split('T')[0];

    await this.studyRepo.update(studyId, {
      status: StudyStatus.CLOSED,
      ctri_completion_deadline: ctriCompletionDeadline,
    });

    // Immutable audit event
    await this.auditRepo.save(
      this.auditRepo.create({
        user_email: 'system@aiia.gov.in',
        user_role: 'SYSTEM',
        action: AuditAction.STATUS_CHANGE,
        entity_type: 'STUDY',
        entity_id: studyId,
        old_values: { status: StudyStatus.DATA_LOCK },
        new_values: { status: StudyStatus.CLOSED, ctri_completion_deadline: ctriCompletionDeadline },
        reason: `Trial completed successfully. 30-day CTRI notification clock started. Deadline: ${ctriCompletionDeadline}`,
        ip_address: '127.0.0.1',
      }),
    );

    return this.getStudyById(studyId);
  }

  // ─── Lifecycle: Premature Termination ──────────────────────────────────────
  // Requires mandatory GCP justification reason; raises emergency alert to IEC & Leadership
  async terminateStudy(studyId: string, dto: TerminateStudyDto): Promise<Study> {
    const study = await this.getStudyById(studyId);

    const nonTerminableStates = [StudyStatus.CLOSED, StudyStatus.TERMINATED];
    if (nonTerminableStates.includes(study.status)) {
      throw new BadRequestException(
        `Study is already in a terminal state (${study.status}) and cannot be terminated again.`,
      );
    }

    await this.studyRepo.update(studyId, {
      status: StudyStatus.TERMINATED,
      termination_reason: dto.reason,
    });

    // Immutable audit event with mandatory reason
    await this.auditRepo.save(
      this.auditRepo.create({
        user_email: 'system@aiia.gov.in',
        user_role: 'SYSTEM',
        action: AuditAction.STATUS_CHANGE,
        entity_type: 'STUDY',
        entity_id: studyId,
        old_values: { status: study.status },
        new_values: { status: StudyStatus.TERMINATED, termination_reason: dto.reason },
        reason: dto.reason,
        ip_address: '127.0.0.1',
      }),
    );

    // Emergency notification alerts to Ethics Committee and Leadership dashboard
    await this.alertRepo.save(
      this.alertRepo.create({
        category: AlertCategory.SAE_EMERGENCY,
        severity: AlertSeverity.CRITICAL,
        title: `URGENT: Clinical Trial ${study.short_code} Prematurely Terminated`,
        message: `Study '${study.title}' (${study.short_code}) has been prematurely terminated. GCP Justification: ${dto.reason}. Immediate Ethics Committee review required.`,
        study_id: studyId,
        study_code: study.short_code,
      }),
    );

    return this.getStudyById(studyId);
  }
}