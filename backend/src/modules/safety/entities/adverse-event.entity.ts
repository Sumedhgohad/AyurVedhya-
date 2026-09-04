import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum Aeseverity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
}

export enum CausalityAssessment {
  CERTAIN = 'CERTAIN',
  PROBABLE = 'PROBABLE',
  POSSIBLE = 'POSSIBLE',
  UNLIKELY = 'UNLIKELY',
  UNASSESSABLE = 'UNASSESSABLE',
}

export enum CompensationStatus {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPENSATION_ELIGIBLE = 'COMPENSATION_ELIGIBLE',
}

@Entity('adverse_events')
export class AdverseEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  study_id: string;

  @Column({ type: 'uuid' })
  participant_id: string;

  @Column({ length: 50 })
  participant_code: string;

  @Column({ length: 200 })
  event_term: string; // e.g. "Severe Epigastric Burning & Skin Urticaria"

  @Column({
    type: 'enum',
    enum: Aeseverity,
    default: Aeseverity.MILD,
  })
  severity: Aeseverity;

  @Column({ type: 'boolean', default: false })
  is_serious: boolean; // TRUE = Serious Adverse Event (SAE) -> 24h Clock

  @Column({ type: 'date' })
  onset_date: string;

  // 1. NDCT 2019 & NPvCC CAUSALITY
  @Column({
    type: 'enum',
    enum: CausalityAssessment,
    default: CausalityAssessment.POSSIBLE,
  })
  causality: CausalityAssessment;

  // 2. NDCT 2019 STATUTORY COMPENSATION FLAG
  @Column({
    type: 'enum',
    enum: CompensationStatus,
    default: CompensationStatus.UNDER_REVIEW,
  })
  compensation_status: CompensationStatus;

  // 3. STATUTORY REPORTING DEADLINES
  @Column({ type: 'timestamp with time zone', nullable: true })
  statutory_24h_deadline: Date; // The exact deadline (Logged Time + 24 Hours)

  @Column({ type: 'boolean', default: false })
  is_reported_to_npvcc: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  npvcc_reported_at: Date;

  @Column({ type: 'text', nullable: true })
  action_taken: string; // e.g. "Trial medicine suspended, Antacid administered"

  @Column({ type: 'text', nullable: true })
  outcome: string; // e.g. "Recovered on 2026-10-08"

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
