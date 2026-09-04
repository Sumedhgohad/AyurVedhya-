import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Study } from './study.entity';

export enum IecDecisionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CONDITIONAL_APPROVAL = 'CONDITIONAL_APPROVAL',
  REJECTED = 'REJECTED',
}

@Entity('iec_submissions')
export class IecSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Study, (study) => study.iec_submissions, { onDelete: 'CASCADE' })
  study: Study;

  @Column({ type: 'date' })
  submission_date: string;

  @Column({
    type: 'enum',
    enum: IecDecisionStatus,
    default: IecDecisionStatus.PENDING,
  })
  decision: IecDecisionStatus;

  @Column({ type: 'date', nullable: true })
  decision_date: string;

  @Column({ type: 'date', nullable: true })
  valid_until: string; // Approval validity countdown date

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  created_at: Date;
}
