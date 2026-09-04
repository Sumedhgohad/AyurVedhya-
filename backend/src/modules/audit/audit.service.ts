import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from './entities/audit-event.entity';
import { RecordAuditDto } from './dto/audit.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEvent, 'auditConnection')
    private auditRepo: Repository<AuditEvent>,
  ) {}

  // Append-only: Writes an immutable audit record
  async logEvent(dto: RecordAuditDto): Promise<AuditEvent> {
    const event = this.auditRepo.create(dto);
    return await this.auditRepo.save(event);
  }

  // Retrieve full chronological audit trail for a specific study/patient/query
  async getAuditTrailForEntity(entityType: string, entityId: string): Promise<AuditEvent[]> {
    return await this.auditRepo.find({
      where: {
        entity_type: entityType.toUpperCase(),
        entity_id: entityId,
      },
      order: { timestamp: 'DESC' },
    });
  }

  // Retrieve full system audit log (for Ministry / Inspector view)
  async getAllAuditLogs(): Promise<AuditEvent[]> {
    return await this.auditRepo.find({
      order: { timestamp: 'DESC' },
      take: 100, // Top 100 latest events
    });
  }

  // Guard: Prohibit any update or deletion
  async preventModification(): Promise<never> {
    throw new ForbiddenException(
      'GCP / ALCOA+ VIOLATION: Audit logs are append-only and can never be modified or deleted.',
    );
  }
}
