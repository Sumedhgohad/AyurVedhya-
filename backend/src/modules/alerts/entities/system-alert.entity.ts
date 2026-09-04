import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum AlertCategory {
  IEC_EXPIRY = 'IEC_EXPIRY',
  CTRI_UPDATE_DUE = 'CTRI_UPDATE_DUE',
  SAE_EMERGENCY = 'SAE_EMERGENCY',
  RECRUITMENT_LAG = 'RECRUITMENT_LAG',
}

@Entity('system_alerts')
export class SystemAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AlertCategory,
  })
  category: AlertCategory;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.WARNING,
  })
  severity: AlertSeverity;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'uuid', nullable: true })
  study_id: string;

  @Column({ length: 50, nullable: true })
  study_code: string;

  @Column({ type: 'boolean', default: false })
  is_acknowledged: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
