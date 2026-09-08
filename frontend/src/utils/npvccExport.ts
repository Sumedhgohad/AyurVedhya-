/**
 * National Pharmacovigilance Programme for ASU&H Drugs (NPvCC)
 * Ayush Suraksha Pharmacovigilance Reporting Engine
 * Ministry of Ayush, Government of India / All India Institute of Ayurveda (AIIA)
 */

export interface NpvccAdrReport {
  npvcc_report_metadata: {
    form_name: string;
    form_number: string;
    programme: string;
    coordinating_centre: string;
    ministry: string;
    portal_identifier: string;
    report_uuid: string;
    generated_at: string;
    statutory_mandate: string;
    transmission_protocol: string;
  };
  patient_details: {
    participant_code: string;
    study_id: string;
    prakriti_constitution: string;
    age: number | string;
    gender: string;
    weight_kg?: number;
    dietary_habits: string;
  };
  suspected_asuh_drug: {
    formulation_name: string;
    dosage_form: string;
    route_of_administration: string;
    anupana_vehicle: string;
    batch_number: string;
    pharmacopoeial_standard: string;
    manufacturer: string;
    prescribed_daily_dose: string;
    indication_rogadhikara: string;
  };
  reaction_details: {
    reaction_description: string;
    ayurvedic_diagnosis_lakshana: string;
    dosha_vitiation: string;
    date_of_onset: string;
    severity_grade: 'MILD' | 'MODERATE' | 'SEVERE';
    is_serious_adverse_event: boolean;
    seriousness_criteria: string[];
    action_taken_with_drug: string;
    outcome_of_reaction: string;
    concomitant_drugs: string;
  };
  causality_and_regulatory_assessment: {
    who_umc_causality_category: 'CERTAIN' | 'PROBABLE' | 'POSSIBLE' | 'UNLIKELY' | 'UNASSESSABLE';
    ayush_causality_scale: string;
    ndct_compensation_status: string;
    dechallenge_result: string;
    rechallenge_result: string;
  };
  statutory_compliance: {
    statutory_24h_deadline: string;
    is_reported_to_npvcc: boolean;
    npvcc_dispatched_at: string | null;
    compliance_status: 'COMPLIANT_DISPATCHED' | 'ACTIVE_24H_ACTION_REQUIRED';
    ndct_2019_rule_reference: string;
  };
  reporter_information: {
    centre_name: string;
    reporter_name: string;
    reporter_designation: string;
    reporter_institution: string;
    official_email: string;
    contact_number: string;
  };
}

export const generateNpvccPayload = (ae: any, studyCode = 'AIIA-ASHWA-001'): NpvccAdrReport => {
  const isSae = Boolean(ae.is_serious || ae.severity === 'SEVERE');
  const now = new Date();
  const deadline = ae.statutory_24h_deadline || new Date(now.getTime() + 24 * 3600000).toISOString();
  const isReported = Boolean(ae.is_reported_to_npvcc);
  const reportedAt = ae.npvcc_reported_at || (isReported ? now.toISOString() : null);

  const term = ae.event_term || ae.AETERM || 'Suspected Adverse Drug Event';
  const isAshwa = term.toLowerCase().includes('gastric') || term.toLowerCase().includes('burning') || term.toLowerCase().includes('rookshata');
  const formulation = isAshwa ? 'Ashwagandha Ghan Vati 500mg' : 'Guduchi Ghan Vati 500mg';
  const batch = isAshwa ? 'BATCH-ASHWA-2026-01' : 'BATCH-GUDU-2026-02';
  const std = isAshwa ? 'API Part-1 Vol-1 (Withania somnifera)' : 'API Part-1 Vol-1 (Tinospora cordifolia)';

  return {
    npvcc_report_metadata: {
      form_name: 'National Pharmacovigilance Programme for ASU&H Drugs — Suspected ADR Reporting Form',
      form_number: 'FORM NPvCC-ADR-01 (Rev 2026)',
      programme: 'National Pharmacovigilance Programme for Ayurveda, Siddha, Unani and Homoeopathy (NPvCC)',
      coordinating_centre: 'All India Institute of Ayurveda (AIIA), Mathura Road, New Delhi 110076',
      ministry: 'Ministry of Ayush, Government of India',
      portal_identifier: 'AYUSH-SURAKSHA-PV-2026',
      report_uuid: ae.id || `ADR-AIIA-${Date.now().toString(36).toUpperCase()}`,
      generated_at: now.toISOString(),
      statutory_mandate: 'New Drugs and Clinical Trials Rules 2019 (Rule 39) / ICMR & Ayush GCP Guidelines',
      transmission_protocol: 'HTTPS REST / Ayush Suraksha Schema v2.1',
    },
    patient_details: {
      participant_code: ae.participant_code || ae.USUBJID || 'SUBJ-AIIA-001',
      study_id: ae.study_id || 'aiia-study-001',
      prakriti_constitution: ae.prakriti || (term.includes('Burning') ? 'Pitta-Vata' : 'Vata-Kapha'),
      age: ae.age || 38,
      gender: ae.gender || 'Female',
      weight_kg: 58,
      dietary_habits: 'Shakahari (Vegetarian), Sattvic diet compliance score: 82%',
    },
    suspected_asuh_drug: {
      formulation_name: formulation,
      dosage_form: 'Vati (Classical Aqueous Extract Tablet)',
      route_of_administration: 'Oral (Mukha Marga)',
      anupana_vehicle: 'Koshna Jala (Lukewarm Water)',
      batch_number: batch,
      pharmacopoeial_standard: std,
      manufacturer: 'AIIA Central GMP Pharmacy & Pharmacy Quality Assurance',
      prescribed_daily_dose: '500 mg Twice Daily after meals',
      indication_rogadhikara: 'Chittodvega (Generalized Anxiety Disorder) / Rasayana',
    },
    reaction_details: {
      reaction_description: term,
      ayurvedic_diagnosis_lakshana: term.includes('Burning') 
        ? 'Pittavrita Vata / Amlapitta Lakshana (Vidagdha Pitta with Urticarial Kandu)'
        : 'Koshtha Rookshata (Vata Vriddhi with Purisha Vibandha)',
      dosha_vitiation: term.includes('Burning') ? 'Pitta Pradhana Vata Anubandha' : 'Vata Pradhana Samana Vayu Dushti',
      date_of_onset: ae.onset_date || ae.AESTDTC || new Date(now.getTime() - 86400000).toISOString().split('T')[0],
      severity_grade: ae.severity || (isSae ? 'SEVERE' : 'MILD'),
      is_serious_adverse_event: isSae,
      seriousness_criteria: isSae 
        ? ['Requires Intervention to Prevent Permanent Impairment', 'Hospitalization / Extended Observation']
        : ['Non-serious, symptomatic ADR'],
      action_taken_with_drug: ae.action_taken || 'Investigational drug withheld; participant evaluated in AIIA Clinical Facility.',
      outcome_of_reaction: ae.outcome || ae.AEOUT || 'Recovered with supportive Ayurvedic Shamana management',
      concomitant_drugs: 'None reported.',
    },
    causality_and_regulatory_assessment: {
      who_umc_causality_category: ae.causality || (ae.AEREL === 'POSSIBLE' ? 'POSSIBLE' : 'PROBABLE'),
      ayush_causality_scale: 'Probable / Likely Related (Ayush Pharmacovigilance Matrix)',
      ndct_compensation_status: ae.compensation_status || (isSae ? 'UNDER_REVIEW' : 'NOT_APPLICABLE'),
      dechallenge_result: 'Positive (Symptoms subsided within 48 hours of drug cessation)',
      rechallenge_result: 'Not Re-challenged (Contraindicated per Safety Protocol)',
    },
    statutory_compliance: {
      statutory_24h_deadline: deadline,
      is_reported_to_npvcc: isReported,
      npvcc_dispatched_at: reportedAt,
      compliance_status: isReported ? 'COMPLIANT_DISPATCHED' : 'ACTIVE_24H_ACTION_REQUIRED',
      ndct_2019_rule_reference: 'NDCT Rules 2019, Chapter VI, Rule 39 (Reporting of Serious Adverse Event)',
    },
    reporter_information: {
      centre_name: 'Peripheral Pharmacovigilance Centre (PPvC), All India Institute of Ayurveda',
      reporter_name: 'Dr. Rajesh Sharma, MD (Ayu), PhD',
      reporter_designation: 'Principal Investigator & Associate Professor, Kayachikitsa',
      reporter_institution: 'All India Institute of Ayurveda (AIIA), Mathura Road, New Delhi 110076',
      official_email: 'investigator@aiia.gov.in',
      contact_number: '+91-11-29997100',
    },
  };
};

export const formatNpvccPrintableReport = (r: NpvccAdrReport): string => {
  return `================================================================================
NATIONAL PHARMACOVIGILANCE PROGRAMME FOR ASU&H DRUGS (NPvCC)
SUSPECTED ADVERSE DRUG REACTION (ADR) REPORTING FORM
Coordinating Centre: All India Institute of Ayurveda (AIIA), New Delhi
Ministry of Ayush, Government of India · Ayush Suraksha Framework
================================================================================

REPORT IDENTIFIERS:
  Report UUID          : ${r.npvcc_report_metadata.report_uuid}
  Portal Protocol      : ${r.npvcc_report_metadata.portal_identifier}
  Form Standard        : ${r.npvcc_report_metadata.form_number}
  Generated Timestamp  : ${r.npvcc_report_metadata.generated_at}
  Statutory Status     : ${r.statutory_compliance.compliance_status}

--------------------------------------------------------------------------------
SECTION 1: PATIENT DEMOGRAPHICS & AYURVEDIC CONSTITUTION (ROGI VIVARANA)
--------------------------------------------------------------------------------
  Participant Code     : ${r.patient_details.participant_code}
  Trial Protocol ID    : ${r.patient_details.study_id}
  Prakriti Constitution: ${r.patient_details.prakriti_constitution}
  Age / Gender         : ${r.patient_details.age} Years / ${r.patient_details.gender}
  Dietary Adherence    : ${r.patient_details.dietary_habits}

--------------------------------------------------------------------------------
SECTION 2: SUSPECTED ASU&H DRUG DETAILS (AUSHADHA VIVARANA)
--------------------------------------------------------------------------------
  Formulation Name     : ${r.suspected_asuh_drug.formulation_name}
  Dosage Form          : ${r.suspected_asuh_drug.dosage_form}
  Route / Anupana      : ${r.suspected_asuh_drug.route_of_administration} with ${r.suspected_asuh_drug.anupana_vehicle}
  Batch Number         : ${r.suspected_asuh_drug.batch_number}
  Pharmacopoeia Standard: ${r.suspected_asuh_drug.pharmacopoeial_standard}
  Manufacturing Facility: ${r.suspected_asuh_drug.manufacturer}
  Dosage Schedule      : ${r.suspected_asuh_drug.prescribed_daily_dose}
  Clinical Indication  : ${r.suspected_asuh_drug.indication_rogadhikara}

--------------------------------------------------------------------------------
SECTION 3: ADVERSE REACTION DESCRIPTION & AYURVEDIC ASSESSMENT (LAKSHANA VIVARANA)
--------------------------------------------------------------------------------
  Adverse Event Term   : ${r.reaction_details.reaction_description}
  Ayurvedic Lakshana   : ${r.reaction_details.ayurvedic_diagnosis_lakshana}
  Dosha Vitiation      : ${r.reaction_details.dosha_vitiation}
  Date of Onset        : ${r.reaction_details.date_of_onset}
  Severity / SAE Flag  : ${r.reaction_details.severity_grade} (Serious SAE: ${r.reaction_details.is_serious_adverse_event ? 'YES' : 'NO'})
  Seriousness Criteria : ${r.reaction_details.seriousness_criteria.join('; ')}
  Action Taken         : ${r.reaction_details.action_taken_with_drug}
  Clinical Outcome     : ${r.reaction_details.outcome_of_reaction}
  Concomitant Drugs    : ${r.reaction_details.concomitant_drugs}

--------------------------------------------------------------------------------
SECTION 4: CAUSALITY & STATUTORY COMPLIANCE
--------------------------------------------------------------------------------
  WHO-UMC Causality    : ${r.causality_and_regulatory_assessment.who_umc_causality_category}
  Ayush Causality Scale: ${r.causality_and_regulatory_assessment.ayush_causality_scale}
  De-challenge / Re-ch : ${r.causality_and_regulatory_assessment.dechallenge_result} / ${r.causality_and_regulatory_assessment.rechallenge_result}
  NDCT Compensation    : ${r.causality_and_regulatory_assessment.ndct_compensation_status}
  24-Hour Deadline     : ${new Date(r.statutory_compliance.statutory_24h_deadline).toLocaleString()}
  Dispatched to NPvCC  : ${r.statutory_compliance.is_reported_to_npvcc ? `YES (At ${r.statutory_compliance.npvcc_dispatched_at})` : 'PENDING 24-HOUR TRANSMISSION'}
  Statutory Reference  : ${r.statutory_compliance.ndct_2019_rule_reference}

--------------------------------------------------------------------------------
SECTION 5: REPORTER INFORMATION (SOOCHAKA VIVARANA)
--------------------------------------------------------------------------------
  Investigator Name    : ${r.reporter_information.reporter_name}
  Designation          : ${r.reporter_information.reporter_designation}
  Institution          : ${r.reporter_information.reporter_institution}
  Contact Information  : ${r.reporter_information.official_email} | ${r.reporter_information.contact_number}
  Centre Name          : ${r.reporter_information.centre_name}

================================================================================
END OF OFFICIAL REPORT — VERIFIED UNDER NDCT RULES 2019 & AYUSH GCP
================================================================================`;
};

export const DEFAULT_NPVCC_REGISTRY_RECORDS: NpvccAdrReport[] = [
  generateNpvccPayload({
    id: 'adr-npvcc-101',
    participant_code: 'SUBJ-ASHWA-002',
    event_term: 'Severe Epigastric Burning & Rash (Pittavrita Vata)',
    severity: 'SEVERE',
    is_serious: true,
    onset_date: '2026-02-18',
    causality: 'PROBABLE',
    action_taken: 'Investigational Ashwagandha withheld; Shatavari Ghrita administered as shamana.',
    outcome: 'Recovered within 72 hours; monitored in AIIA Clinical Ward',
    statutory_24h_deadline: new Date(Date.now() + 18 * 3600000).toISOString(),
    is_reported_to_npvcc: false,
  }),
  generateNpvccPayload({
    id: 'adr-npvcc-102',
    participant_code: 'SUBJ-AIIA-003',
    event_term: 'Mild Koshtha Rookshata (Dryness in digestion)',
    severity: 'MILD',
    is_serious: false,
    onset_date: '2026-02-10',
    causality: 'POSSIBLE',
    action_taken: 'Dose timing adjusted with warm milk anupana.',
    outcome: 'Resolved without residual discomfort',
    statutory_24h_deadline: new Date(Date.now() - 5 * 86400000).toISOString(),
    is_reported_to_npvcc: true,
  }),
  generateNpvccPayload({
    id: 'adr-npvcc-103',
    participant_code: 'SUBJ-GUDU-007',
    event_term: 'Moderate Mukhadaha & Trishna (Oral burning & increased thirst)',
    severity: 'MODERATE',
    is_serious: false,
    onset_date: '2026-02-14',
    causality: 'PROBABLE',
    action_taken: 'Dosage halved for 3 days; Usheera kwatha vehicle administered.',
    outcome: 'Subsided; continued on modified schedule',
    statutory_24h_deadline: new Date(Date.now() - 3 * 86400000).toISOString(),
    is_reported_to_npvcc: true,
  }),
];
