import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { IecDecisionStatus } from '../entities/iec-submission.entity';

export class CreateStudyDto {
  @IsString()
  @IsNotEmpty()
  short_code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  phase: string;

  @IsString()
  @IsNotEmpty()
  study_type: string;

  @IsNumber()
  @IsNotEmpty()
  target_sample_size: number;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  planned_end_date?: string;
}

export class SubmitIecDto {
  @IsString()
  @IsNotEmpty()
  submission_date: string;
}

export class DecideIecDto {
  @IsEnum(IecDecisionStatus)
  decision: IecDecisionStatus;

  @IsString()
  @IsNotEmpty()
  decision_date: string;

  @IsString()
  @IsNotEmpty()
  valid_until: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class LinkCtriDto {
  @IsString()
  @IsNotEmpty()
  ctri_id: string;

  @IsString()
  @IsNotEmpty()
  registration_date: string;
}

export class CreateIpBatchDto {
  @IsString()
  @IsNotEmpty()
  formulation_name: string;

  @IsString()
  @IsNotEmpty()
  batch_no: string;

  @IsOptional()
  @IsString()
  afi_api_standard_ref?: string;

  @IsString()
  @IsNotEmpty()
  manufacturing_date: string;

  @IsString()
  @IsNotEmpty()
  expiry_date: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateStudyArmDto {
  @IsString()
  @IsNotEmpty()
  arm_code: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsString()
  arm_type?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateVisitDefinitionDto {
  @IsString()
  @IsNotEmpty()
  visit_name: string;

  @IsNumber()
  @IsNotEmpty()
  visit_day: number;

  @IsOptional()
  @IsNumber()
  window_minus?: number;

  @IsOptional()
  @IsNumber()
  window_plus?: number;

  @IsOptional()
  @IsString()
  visit_type?: string;
}
