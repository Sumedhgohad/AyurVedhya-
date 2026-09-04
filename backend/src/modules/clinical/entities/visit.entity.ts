import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Participant } from './participant.entity';
import { DataQuery } from './data-query.entity';

export enum VisitType {
  SCREENING = 'SCREENING',
  BASELINE = 'BASELINE',
  FOLLOW_UP = 'FOLLOW_UP',
  CLOSEOUT = 'CLOSEOUT',
}

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Participant, (p) => p.visits, { onDelete: 'CASCADE' })
  participant: Participant;

  @Column({ type: 'int' })
  visit_number: number; // e.g. Visit 1, Visit 2

  @Column({
    type: 'enum',
    enum: VisitType,
    default: VisitType.BASELINE,
  })
  visit_type: VisitType;

  @Column({ type: 'date' })
  visit_date: string;

  // 1. AYURVEDA SPECIFIC PARAMETERS
  @Column({ length: 100 })
  prakriti_assessment: string; // e.g. Vata-Pitta, Kapha-Vata

  @Column({ type: 'text' })
  nidan_panchaka_findings: string; // Traditional case-taking notes

  @Column({ type: 'int', default: 100 })
  pathya_apathya_diet_score: number; // 0 to 100% adherence to Ayurvedic diet/lifestyle

  @Column({ length: 100, nullable: true })
  namaste_terminology_code: string; // NAMASTE Portal / ICD-11 TM-2 code

  // 2. MEDICINE (IP) BATCH DISPENSED
  @Column({ length: 50, nullable: true })
  dispensed_batch_no: string;

  @Column({ type: 'int', default: 0 })
  quantity_dispensed: number;

  // 3. MODERN BIOMEDICAL LAB ENDPOINTS
  @Column({ type: 'jsonb', nullable: true })
  modern_vitals_and_labs: {
    blood_pressure?: string;
    pulse_rate?: number;
    hemoglobin?: number;
    serum_creatinine?: number;
    hamilton_anxiety_score?: number;
  };

  @OneToMany(() => DataQuery, (query) => query.visit)
  queries: DataQuery[];

  @CreateDateColumn()
  created_at: Date;
}
