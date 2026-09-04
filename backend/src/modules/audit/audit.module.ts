import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditEvent } from './entities/audit-event.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Global() // Makes AuditService available globally across all other microservices
@Module({
  imports: [TypeOrmModule.forFeature([AuditEvent], 'auditConnection')],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
