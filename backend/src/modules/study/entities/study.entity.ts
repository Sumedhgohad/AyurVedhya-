import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { StudyIpBatch } from './study-ip-batch.entity';
import { StudyArm } from './study-arm.entity';
import { IecSubmission } from './iec-submission.entity';
import { CtriRegistration } from './ctri-registration.entity';

export enum StudyStatus {
  DRAFT = 'DRAFT',
  IEC_SUBMITTED = 'IEC_SUBMITTED',
  IEC_APPROVED = 'IEC_APPROVED',
  ENROLLING = 'ENROLLING',
  ONGOING = 'ONGOING',
  DATA_LOCK = 'DATA_LOCK',
  CLOSED = 'CLOSED',
  TERMINATED = 'TERMINATED',
}

@Entity('studies')
export class Study {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  short_code: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ length: 50 })
  phase: string; // e.g. Phase 1, Phase 2, Pilot/Exploratory

  @Column({ length: 100 })
  study_type: string; // e.g. Interventional, Observational, RCT

  @Column({
    type: 'enum',
    enum: StudyStatus,
    default: StudyStatus.DRAFT,
  })
  status: StudyStatus;

  @Column({ type: 'int', default: 0 })
  target_sample_size: number;

  @Column({ type: 'date', nullable: true })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  planned_end_date: string;

  /** Set when study transitions to CLOSED — statutory 30-day CTRI notification deadline */
  @Column({ type: 'date', nullable: true })
  ctri_completion_deadline: string;

  /** Mandatory GCP justification recorded when study is TERMINATED */
  @Column({ type: 'text', nullable: true })
  termination_reason: string;

  @OneToMany(() => StudyIpBatch, (batch) => batch.study)
  ip_batches: StudyIpBatch[];

  @OneToMany(() => StudyArm, (arm) => arm.study, { cascade: true })
  study_arms: StudyArm[];

  @OneToMany(() => IecSubmission, (iec) => iec.study)
  iec_submissions: IecSubmission[];

  @OneToOne(() => CtriRegistration, (ctri) => ctri.study)
  ctri_registration: CtriRegistration;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
