import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Study } from './study.entity';

@Entity('ctri_registrations')
export class CtriRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Study, (study) => study.ctri_registration, { onDelete: 'CASCADE' })
  @JoinColumn()
  study: Study;

  @Column({ unique: true, length: 50 })
  ctri_id: string; // e.g. CTRI/2026/09/012345

  @Column({ type: 'date' })
  registration_date: string;

  @Column({ type: 'date', nullable: true })
  last_updated_date: string;

  @Column({ type: 'date', nullable: true })
  next_mandatory_update_due: string; // 6-month statutory update clock

  @CreateDateColumn()
  created_at: Date;
}
