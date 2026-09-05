import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Study } from './study.entity';
import { VisitDefinition } from './visit-definition.entity';

export enum ArmType {
  INTERVENTION = 'INTERVENTION',
  COMPARATOR = 'COMPARATOR',
  PLACEBO = 'PLACEBO',
  OPEN_LABEL = 'OPEN_LABEL',
}

@Entity('study_arms')
export class StudyArm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Study, (study) => study.study_arms, { onDelete: 'CASCADE' })
  study: Study;

  @Column({ length: 50 })
  arm_code: string; // e.g. ARM-A, ARM-B

  @Column({ length: 150 })
  label: string; // e.g. Intervention - Ashwagandha 500mg

  @Column({
    type: 'enum',
    enum: ArmType,
    default: ArmType.INTERVENTION,
  })
  arm_type: ArmType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => VisitDefinition, (vd) => vd.arm, { cascade: true })
  visit_definitions: VisitDefinition[];

  @CreateDateColumn()
  created_at: Date;
}
