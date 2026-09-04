import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Study, StudyStatus, StudyIpBatch, IecSubmission, IecDecisionStatus, CtriRegistration } from './entities';
import { CreateStudyDto, SubmitIecDto, DecideIecDto, LinkCtriDto, CreateIpBatchDto } from './dto/study.dto';

@Injectable()
export class StudyService {
  constructor(
    @InjectRepository(Study) private studyRepo: Repository<Study>,
    @InjectRepository(StudyIpBatch) private ipRepo: Repository<StudyIpBatch>,
    @InjectRepository(IecSubmission) private iecRepo: Repository<IecSubmission>,
    @InjectRepository(CtriRegistration) private ctriRepo: Repository<CtriRegistration>,
  ) {}

  async createStudy(dto: CreateStudyDto): Promise<Study> {
    const study = this.studyRepo.create(dto);
    return await this.studyRepo.save(study);
  }

  async getAllStudies(): Promise<Study[]> {
    return await this.studyRepo.find({
      relations: ['ip_batches', 'iec_submissions', 'ctri_registration'],
      order: { created_at: 'DESC' },
    });
  }

  async getStudyById(id: string): Promise<Study> {
    const study = await this.studyRepo.findOne({
      where: { id },
      relations: ['ip_batches', 'iec_submissions', 'ctri_registration'],
    });
    if (!study) throw new NotFoundException(`Study with ID ${id} not found.`);
    return study;
  }

  async submitToIec(studyId: string, dto: SubmitIecDto): Promise<IecSubmission> {
    const study = await this.getStudyById(studyId);
    if (study.status !== StudyStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT studies can be submitted to IEC.`);
    }

    const submission = this.iecRepo.create({ ...dto, study });
    const saved = await this.iecRepo.save(submission);

    study.status = StudyStatus.IEC_SUBMITTED;
    await this.studyRepo.save(study);

    return saved;
  }

  async recordIecDecision(submissionId: string, dto: DecideIecDto): Promise<IecSubmission> {
    const sub = await this.iecRepo.findOne({ where: { id: submissionId }, relations: ['study'] });
    if (!sub) throw new NotFoundException(`IEC Submission not found.`);

    sub.decision = dto.decision;
    sub.decision_date = dto.decision_date;
    sub.valid_until = dto.valid_until;
    sub.remarks = dto.remarks;

    const saved = await this.iecRepo.save(sub);

    if (dto.decision === IecDecisionStatus.APPROVED) {
      sub.study.status = StudyStatus.IEC_APPROVED;
      await this.studyRepo.save(sub.study);
    }

    return saved;
  }

  async linkCtri(studyId: string, dto: LinkCtriDto): Promise<CtriRegistration> {
    const study = await this.getStudyById(studyId);

    // Guard: Must have approved IEC before CTRI link
    if (study.status !== StudyStatus.IEC_APPROVED && study.status !== StudyStatus.IEC_SUBMITTED) {
      throw new BadRequestException(`Cannot link CTRI without active IEC submission/approval.`);
    }

    // Calculate next 6-month statutory update deadline
    const regDate = new Date(dto.registration_date);
    const sixMonthsLater = new Date(regDate.setMonth(regDate.getMonth() + 6)).toISOString().split('T')[0];

    const ctri = this.ctriRepo.create({
      study,
      ctri_id: dto.ctri_id,
      registration_date: dto.registration_date,
      last_updated_date: dto.registration_date,
      next_mandatory_update_due: sixMonthsLater,
    });

    const savedCtri = await this.ctriRepo.save(ctri);

    // Guarded State Transition: If IEC is approved + CTRI linked -> Unlock ENROLLING
    if (study.status === StudyStatus.IEC_APPROVED) {
      study.status = StudyStatus.ENROLLING;
      await this.studyRepo.save(study);
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
}
