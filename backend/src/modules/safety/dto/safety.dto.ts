import { IsString, IsNotEmpty, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Aeseverity, CausalityAssessment, CompensationStatus } from '../entities/adverse-event.entity';

export class LogAdverseEventDto {
  @IsString()
  @IsNotEmpty()
  study_id: string;

  @IsString()
  @IsNotEmpty()
  participant_id: string;

  @IsString()
  @IsNotEmpty()
  participant_code: string;

  @IsString()
  @IsNotEmpty()
  event_term: string;

  @IsEnum(Aeseverity)
  severity: Aeseverity;

  @IsBoolean()
  is_serious: boolean;

  @IsString()
  @IsNotEmpty()
  onset_date: string;

  @IsEnum(CausalityAssessment)
  causality: CausalityAssessment;

  @IsEnum(CompensationStatus)
  @IsOptional()
  compensation_status?: CompensationStatus;

  @IsString()
  @IsOptional()
  action_taken?: string;

  @IsString()
  @IsOptional()
  outcome?: string;
}
