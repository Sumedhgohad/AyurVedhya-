import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { ParticipantConsent } from './participant-consent.entity';
import { Visit } from './visit.entity';
import { ProtocolDeviation } from './protocol-deviation.entity';

export enum ParticipantStatus {
  ENROLLED = 'ENROLLED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
}

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  study_id: string; // Foreign reference to study (loosely coupled across databases)

  @Column({ unique: true, length: 50 })
  participant_code: string; // e.g. SUBJ-AIIA-001

  @Column({ type: 'int' })
  age: number;

  @Column({ length: 20 })
  gender: string;

  @Column({ type: 'date' })
  enrollment_date: string;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.ENROLLED,
  })
  status: ParticipantStatus;

  @OneToOne(() => ParticipantConsent, (consent) => consent.participant, { cascade: true })
  consent: ParticipantConsent;

  @OneToMany(() => Visit, (visit) => visit.participant)
  visits: Visit[];

  @OneToMany(() => ProtocolDeviation, (dev) => dev.participant)
  deviations: ProtocolDeviation[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
