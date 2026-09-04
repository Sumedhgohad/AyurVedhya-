import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AuditAction {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  QUERY_RAISED = 'QUERY_RAISED',
  QUERY_RESOLVED = 'QUERY_RESOLVED',
  SAE_TRIGGERED = 'SAE_TRIGGERED',
  DOCUMENT_HASHED = 'DOCUMENT_HASHED',
}

@Entity('audit_events')
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  user_email: string; // "Who"

  @Column({ length: 50 })
  user_role: string; // Role of user (PI, Safety Officer, etc.)

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction; // "What" action occurred

  @Column({ length: 100 })
  entity_type: string; // e.g. 'STUDY', 'PARTICIPANT', 'VISIT', 'QUERY'

  @Column({ type: 'text' })
  entity_id: string; // Unique ID of the record changed

  @Column({ type: 'jsonb', nullable: true })
  old_values: Record<string, any>; // Previous state

  @Column({ type: 'jsonb', nullable: true })
  new_values: Record<string, any>; // New state

  @Column({ type: 'text', nullable: true })
  reason: string; // Mandatory GCP reason for update

  @Column({ length: 45, default: '127.0.0.1' })
  ip_address: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date; // "When" (Microsecond-accurate)
}
