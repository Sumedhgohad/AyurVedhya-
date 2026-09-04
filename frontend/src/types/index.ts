export type UserRole = 'ROLE_INVESTIGATOR' | 'ROLE_COMPLIANCE_OFFICER' | 'ROLE_LEADERSHIP';

export interface Study {
  id: string;
  short_code: string;
  title: string;
  phase: string;
  study_type: string;
  status: string;
  target_sample_size: number;
  ip_batches?: Array<{
    id: string;
    formulation_name: string;
    batch_no: string;
    afi_api_standard_ref: string;
    current_stock: number;
  }>;
  ctri_registration?: {
    ctri_id: string;
    next_mandatory_update_due: string;
  };
  iec_submissions?: Array<{
    id: string;
    decision: string;
    valid_until: string;
  }>;
}

export interface SaeClock {
  id: string;
  participant_code: string;
  event_term: string;
  severity: string;
  hours_remaining: number;
  minutes_remaining: number;
  status_label: string;
  is_overdue: boolean;
  statutory_24h_deadline: string;
}

export interface HealthScore {
  overall_trial_health_score: number;
  health_status: string;
  study_code: string;
  pillars_breakdown: {
    recruitment: { score: number; enrolled: number; target: number };
    regulatory_compliance: { score: number };
    data_quality: { score: number; resolved_queries: number; total_queries: number };
    safety: { score: number };
    monitoring: { score: number };
  };
  ai_predictive_recommendations: string[];
}
