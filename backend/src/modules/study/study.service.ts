import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Study, StudyStatus } from './entities/study.entity';
import { StudyIpBatch } from './entities/study-ip-batch.entity';
import { IecSubmission, IecDecisionStatus } from './entities/iec-submission.entity';
import { CtriRegistration } from './entities/ctri-registration.entity';
import { StudyArm, ArmType } from './entities/study-arm.entity';
import { VisitDefinition, VisitDefinitionType } from './entities/visit-definition.entity';
import {
  CreateStudyDto,
  SubmitIecDto,
  DecideIecDto,
  LinkCtriDto,
  CreateIpBatchDto,
  CreateStudyArmDto,
  CreateVisitDefinitionDto,
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
  ) {}

  async createStudy(dto: CreateStudyDto): Promise<Study> {
    const study = this.studyRepo.create(dto);
    return await this.studyRepo.save(study);
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
}