import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Study } from './study.entity';

@Entity('study_ip_batches')
export class StudyIpBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Study, (study) => study.ip_batches, { onDelete: 'CASCADE' })
  study: Study;

  @Column({ length: 150 })
  formulation_name: string; // e.g. Ashwagandha Ghanvati

  @Column({ length: 50 })
  batch_no: string;

  @Column({ length: 100, nullable: true })
  afi_api_standard_ref: string; // e.g. AFI Part-1 / API Monograph Ref

  @Column({ type: 'date' })
  manufacturing_date: string;

  @Column({ type: 'date' })
  expiry_date: string;

  @Column({ type: 'int' })
  initial_quantity: number;

  @Column({ type: 'int' })
  current_stock: number;

  @CreateDateColumn()
  created_at: Date;
}
