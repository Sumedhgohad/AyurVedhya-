import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('document_integrity_receipts')
export class DocumentReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  study_id: string;

  @Column({ length: 100 })
  document_type: string; // 'PROTOCOL', 'CONSENT_RECORDING', 'LAB_REPORT', 'IEC_APPROVAL'

  @Column({ length: 255 })
  file_name: string;

  @Column({ length: 255 })
  minio_object_path: string;

  @Column({ length: 64 })
  sha256_hash: string; // Cryptographic digital fingerprint

  @Column({ type: 'int' })
  file_size_bytes: number;

  @Column({ length: 100 })
  uploaded_by: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  uploaded_at: Date;
}
