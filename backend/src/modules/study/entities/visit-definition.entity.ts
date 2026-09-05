import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { StudyArm } from './study-arm.entity';

export enum VisitDefinitionType {
  SCREENING = 'SCREENING',
  BASELINE = 'BASELINE',
  FOLLOW_UP = 'FOLLOW_UP',
  CLOSEOUT = 'CLOSEOUT',
}

@Entity('visit_definitions')
export class VisitDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudyArm, (arm) => arm.visit_definitions, { onDelete: 'CASCADE' })
  arm: StudyArm;

  @Column({ length: 100 })
  visit_name: string; // e.g. Day 15 Follow-up

  @Column({ type: 'int' })
  visit_day: number; // e.g. 0, 1, 15, 30, 60

  @Column({ type: 'int', default: 0 })
  window_minus: number; // e.g. -2 days tolerance

  @Column({ type: 'int', default: 0 })
  window_plus: number; // e.g. +2 days tolerance

  @Column({
    type: 'enum',
    enum: VisitDefinitionType,
    default: VisitDefinitionType.FOLLOW_UP,
  })
  visit_type: VisitDefinitionType;

  @Column({ type: 'boolean', default: true })
  is_mandatory: boolean;

  @CreateDateColumn()
  created_at: Date;
}
