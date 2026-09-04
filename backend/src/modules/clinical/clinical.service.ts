import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyService } from '../study/study.service';
import { StudyStatus } from '../study/entities';
import { Participant } from './entities/participant.entity';
import { ParticipantConsent } from './entities/participant-consent.entity';
import { Visit } from './entities/visit.entity';
import { DataQuery, QueryStatus } from './entities/data-query.entity';
import { ProtocolDeviation } from './entities/protocol-deviation.entity';
import { EnrollParticipantDto, RecordVisitDto, RaiseQueryDto, ResolveQueryDto, LogDeviationDto } from './dto/clinical.dto';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(Participant, 'clinicalConnection') private participantRepo: Repository<Participant>,
    @InjectRepository(ParticipantConsent, 'clinicalConnection') private consentRepo: Repository<ParticipantConsent>,
    @InjectRepository(Visit, 'clinicalConnection') private visitRepo: Repository<Visit>,
    @InjectRepository(DataQuery, 'clinicalConnection') private queryRepo: Repository<DataQuery>,
    @InjectRepository(ProtocolDeviation, 'clinicalConnection') private deviationRepo: Repository<ProtocolDeviation>,
    private readonly studyService: StudyService, // Cross-domain check via service (loose coupling)
  ) {}

  async enrollParticipant(dto: EnrollParticipantDto): Promise<Participant> {
    // 1. Guarded State Machine Check
    const study = await this.studyService.getStudyById(dto.study_id);
    if (study.status !== StudyStatus.ENROLLING && study.status !== StudyStatus.ONGOING) {
      throw new BadRequestException(
        `LEGAL GUARD: Cannot enroll participants! Study '${study.short_code}' is in '${study.status}' state. It must be approved by IEC and linked to CTRI first.`,
      );
    }

    // 2. Create Participant with Masked Identifier
    const participant = this.participantRepo.create({
      study_id: dto.study_id,
      participant_code: dto.participant_code,
      age: dto.age,
      gender: dto.gender,
      enrollment_date: dto.enrollment_date,
    });

    const savedParticipant = await this.participantRepo.save(participant);

    // 3. Create Vernacular e-Consent Record
    const consent = this.consentRepo.create({
      participant: savedParticipant,
      language_code: dto.language_code || 'hi',
      consent_type: dto.consent_type,
      consent_timestamp: new Date(),
      witness_name: dto.witness_name,
    });
    await this.consentRepo.save(consent);

    return await this.getParticipantById(savedParticipant.id);
  }

  async getParticipantsByStudy(studyId: string): Promise<Participant[]> {
    return await this.participantRepo.find({
      where: { study_id: studyId },
      relations: ['consent', 'visits', 'deviations'],
      order: { created_at: 'DESC' },
    });
  }

  async getParticipantById(id: string): Promise<Participant> {
    const p = await this.participantRepo.findOne({
      where: { id },
      relations: ['consent', 'visits', 'visits.queries', 'deviations'],
    });
    if (!p) throw new NotFoundException(`Participant with ID ${id} not found.`);
    return p;
  }

  async recordVisit(dto: RecordVisitDto): Promise<Visit> {
    const participant = await this.getParticipantById(dto.participant_id);

    const visit = this.visitRepo.create({
      participant,
      visit_number: dto.visit_number,
      visit_type: dto.visit_type,
      visit_date: dto.visit_date,
      prakriti_assessment: dto.prakriti_assessment,
      nidan_panchaka_findings: dto.nidan_panchaka_findings,
      pathya_apathya_diet_score: dto.pathya_apathya_diet_score,
      namaste_terminology_code: dto.namaste_terminology_code,
      dispensed_batch_no: dto.dispensed_batch_no,
      quantity_dispensed: dto.quantity_dispensed || 0,
      modern_vitals_and_labs: dto.modern_vitals_and_labs || {},
    });

    return await this.visitRepo.save(visit);
  }

  async raiseQuery(dto: RaiseQueryDto): Promise<DataQuery> {
    const visit = await this.visitRepo.findOne({ where: { id: dto.visit_id } });
    if (!visit) throw new NotFoundException(`Visit not found.`);

    const query = this.queryRepo.create({
      visit,
      query_text: dto.query_text,
      raised_by: dto.raised_by,
      status: QueryStatus.OPEN,
    });

    return await this.queryRepo.save(query);
  }

  async resolveQuery(queryId: string, dto: ResolveQueryDto): Promise<DataQuery> {
    const query = await this.queryRepo.findOne({ where: { id: queryId } });
    if (!query) throw new NotFoundException(`Query with ID ${queryId} not found.`);

    query.status = QueryStatus.RESOLVED;
    query.response_text = dto.response_text;
    query.resolution_reason = dto.resolution_reason;

    return await this.queryRepo.save(query);
  }

  async logDeviation(dto: LogDeviationDto): Promise<ProtocolDeviation> {
    const participant = await this.getParticipantById(dto.participant_id);

    const deviation = this.deviationRepo.create({
      study_id: dto.study_id,
      participant,
      category: dto.category,
      severity: dto.severity,
      deviation_date: dto.deviation_date,
      description: dto.description,
      corrective_action: dto.corrective_action,
    });

    return await this.deviationRepo.save(deviation);
  }
}
