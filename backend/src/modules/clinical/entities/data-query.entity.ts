import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Visit } from './visit.entity';

export enum QueryStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}

@Entity('data_queries')
export class DataQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Visit, (v) => v.queries, { onDelete: 'CASCADE' })
  visit: Visit;

  @Column({ type: 'text' })
  query_text: string; // e.g. "Pulse rate 140 bpm seems out of normal range, please verify."

  @Column({ length: 100 })
  raised_by: string;

  @Column({
    type: 'enum',
    enum: QueryStatus,
    default: QueryStatus.OPEN,
  })
  status: QueryStatus;

  @Column({ type: 'text', nullable: true })
  response_text: string; // Doctor's response

  @Column({ type: 'text', nullable: true })
  resolution_reason: string; // GCP audit reason

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
