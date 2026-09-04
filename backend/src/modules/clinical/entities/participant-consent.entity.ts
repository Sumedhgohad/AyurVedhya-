import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Participant } from './participant.entity';

export enum ConsentType {
  WRITTEN = 'WRITTEN',
  AUDIO_VISUAL = 'AUDIO_VISUAL',
  LAR_ASSENT = 'LAR_ASSENT',
}

@Entity('participant_consents')
export class ParticipantConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Participant, (p) => p.consent, { onDelete: 'CASCADE' })
  @JoinColumn()
  participant: Participant;

  @Column({ length: 10, default: 'hi' })
  language_code: string; // 'hi' (Hindi), 'en' (English), 'mr', etc.

  @Column({
    type: 'enum',
    enum: ConsentType,
    default: ConsentType.WRITTEN,
  })
  consent_type: ConsentType;

  @Column({ type: 'timestamp' })
  consent_timestamp: Date;

  @Column({ length: 100, nullable: true })
  witness_name: string;

  @Column({ length: 255, nullable: true })
  av_media_storage_path: string; // Stored in MinIO S3

  @Column({ length: 64, nullable: true })
  av_media_sha256: string; // Tamper-proof hash

  @CreateDateColumn()
  created_at: Date;
}
