import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { AuditAction } from '../entities/audit-event.entity';

export class RecordAuditDto {
  @IsString()
  @IsNotEmpty()
  user_email: string;

  @IsString()
  @IsNotEmpty()
  user_role: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsString()
  @IsNotEmpty()
  entity_type: string;

  @IsString()
  @IsNotEmpty()
  entity_id: string;

  @IsOptional()
  @IsObject()
  old_values?: Record<string, any>;

  @IsOptional()
  @IsObject()
  new_values?: Record<string, any>;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  ip_address?: string;
}
