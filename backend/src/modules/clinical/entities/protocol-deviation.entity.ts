import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Participant } from './participant.entity';

export enum DeviationSeverity {
  MINOR = 'MINOR',
  MAJOR = 'MAJOR',
}

@Entity('protocol_deviations')
export class ProtocolDeviation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  study_id: string;

  @ManyToOne(() => Participant, (p) => p.deviations, { onDelete: 'CASCADE' })
  participant: Participant;

  @Column({ length: 100 })
  category: string; // e.g. Visit Window Violation, Dose Compliance

  @Column({
    type: 'enum',
    enum: DeviationSeverity,
    default: DeviationSeverity.MINOR,
  })
  severity: DeviationSeverity;

  @Column({ type: 'date' })
  deviation_date: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  corrective_action: string;

  @CreateDateColumn()
  created_at: Date;
}
