import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsObject, Min, Max } from 'class-validator';
import { ConsentType } from '../entities/participant-consent.entity';
import { VisitType } from '../entities/visit.entity';
import { DeviationSeverity } from '../entities/protocol-deviation.entity';

export class EnrollParticipantDto {
  @IsString()
  @IsNotEmpty()
  study_id: string;

  @IsString()
  @IsNotEmpty()
  participant_code: string;

  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  enrollment_date: string;

  // e-Consent fields
  @IsString()
  @IsOptional()
  language_code?: string;

  @IsEnum(ConsentType)
  consent_type: ConsentType;

  @IsString()
  @IsOptional()
  witness_name?: string;
}

export class RecordVisitDto {
  @IsString()
  @IsNotEmpty()
  participant_id: string;

  @IsNumber()
  visit_number: number;

  @IsEnum(VisitType)
  visit_type: VisitType;

  @IsString()
  @IsNotEmpty()
  visit_date: string;

  @IsString()
  @IsNotEmpty()
  prakriti_assessment: string;

  @IsString()
  @IsNotEmpty()
  nidan_panchaka_findings: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  pathya_apathya_diet_score: number; // 0 to 100%

  @IsString()
  @IsOptional()
  namaste_terminology_code?: string;

  @IsString()
  @IsOptional()
  dispensed_batch_no?: string;

  @IsNumber()
  @IsOptional()
  quantity_dispensed?: number;

  @IsObject()
  @IsOptional()
  modern_vitals_and_labs?: Record<string, any>;
}

export class RaiseQueryDto {
  @IsString()
  @IsNotEmpty()
  visit_id: string;

  @IsString()
  @IsNotEmpty()
  query_text: string;

  @IsString()
  @IsNotEmpty()
  raised_by: string;
}

export class ResolveQueryDto {
  @IsString()
  @IsNotEmpty()
  response_text: string;

  @IsString()
  @IsNotEmpty()
  resolution_reason: string;
}

export class LogDeviationDto {
  @IsString()
  @IsNotEmpty()
  study_id: string;

  @IsString()
  @IsNotEmpty()
  participant_id: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(DeviationSeverity)
  severity: DeviationSeverity;

  @IsString()
  @IsNotEmpty()
  deviation_date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  corrective_action?: string;
}
