export interface SoilData {
  ph: number;
  organic_matter_pct: number;
  nitrogen_ppm: number;
  phosphorus_ppm: number;
  potassium_ppm: number;
}

export interface ClimateData {
  annual_temp_c: number;
  annual_precip_mm: number;
  drought_risk_rating: string;
}

export interface WaterData {
  irrigation_type: string;
  annual_consumption_m3: number;
  source: string;
}

export interface CropData {
  observed_abiotic_stresses: string[];
  observed_pathogens: string[];
}

export interface CarbonInputs {
  tillage_frequency_yr: number;
  diesel_liters_used_yr: number;
  synthetic_nitrogen_kg_yr: number;
  acreage: number;
}

export interface BiodiversityData {
  has_wildlife_corridors: boolean;
  native_vegetation_pct: number;
}

export interface FarmData {
  farm_name: string;
  location: string;
  crop_name: string;
  soil_data: SoilData;
  climate_data: ClimateData;
  water_data: WaterData;
  crop_data: CropData;
  carbon_inputs: CarbonInputs;
  biodiversity_data: BiodiversityData;
}

export interface AgentPlan {
  plan_summary: string;
  priority_focus: string[];
  agent_assignments: Record<string, string>;
  coordination_instructions: string;
}

export interface SoilReport {
  soil_health_score: number;
  primary_deficiencies: string[];
  degradation_risk: string;
  microbial_activity_status: string;
  detailed_findings: string;
  recommendations: Array<{ practice: string; scientific_rationale: string; expected_kpi_impact: string }>;
  confidence_score: number;
}

export interface ClimateReport {
  climate_risk_score: number;
  drought_susceptibility: string;
  vulnerability_factors: string[];
  climate_trend_analysis: string;
  adaptation_pathways: Array<{ adaptation: string; mechanism: string; implementation_urgency: string }>;
  confidence_score: number;
}

export interface WaterReport {
  water_sustainability_score: number;
  irrigation_efficiency_pct: number;
  water_stress_index: string;
  aquifer_impact_state: string;
  findings: string;
  conservation_actions: Array<{ strategy: string; estimated_savings_m3: number; return_on_investment: string }>;
  confidence_score: number;
}

export interface CropReport {
  crop_health_index: number;
  observed_abiotic_stresses: string[];
  pathogen_risks: Array<{ threat: string; severity: string; management: string }>;
  ipm_practices: string[];
  companion_cropping_suggestions: string[];
  confidence_score: number;
}

export interface CarbonReport {
  carbon_net_rating: string;
  estimated_annual_tco2e_losses: number;
  potential_annual_tco2e_drawdown: number;
  carbon_credit_eligibility: string;
  footprint_breakdown: Record<string, string>;
  mitigation_pathways: Array<{ mitigation_project: string; estimated_drawdown_percent: number; offset_crediting_potential: string }>;
  confidence_score: number;
}

export interface BiodiversityReport {
  biodiversity_score: number;
  threats_to_beneficial_species: string[];
  woodland_corridors_pct: number;
  pollinator_rating: string;
  findings: string;
  rewilding_actions: Array<{ project: string; beneficials_supported: string[]; threat_mitigation_rating: string }>;
  confidence_score: number;
}

export interface ResearchReport {
  academic_citations: Array<{ title: string; authors: string; journal_and_year: string; key_finding: string; relevance_to_farm: string }>;
  fao_guidelines_matched: string[];
  additional_queries_to_mcp_library: string[];
}

export interface CriticReport {
  is_approved_for_final_decision: boolean;
  overall_scientific_confidence_pct: number;
  contradiction_flags: Array<{ conflict_detected: string; severity: string; suggested_compromise: string }>;
  data_vulnerabilities_spotted: string[];
  correctness_grading_per_agent: Record<string, string>;
}

export interface DecisionReport {
  executive_summary: string;
  unifying_agricultural_paradigm: string;
  priority_actionable_milestones: Array<{ milestone: string; timeframe: string; target_kpi_impact: string; difficulty: string; estimated_capex: string }>;
  medium_term_investments: Array<{ project: string; timeframe: string; target_kpi_impact: string; difficulty: string; estimated_capex: string }>;
  projected_ecological_gains_3yr: {
    soil_organic_carbon_increase_pct: number;
    water_resource_draw_reduction_pct: number;
    carbon_footprint_mitigation_tco2e: number;
    biodiversity_species_recovery_index_gain_pct: number;
  };
  projected_yield_impact?: {
    baseline_yield_rating: string;
    year_1_change_pct: number;
    year_2_change_pct: number;
    year_3_change_pct: number;
    limiting_factor_resolved: string;
    explanation: string;
  };
}

export interface EvaluationReport {
  accuracy_score: number;
  accuracy_details: string;
  scientific_correctness_score: number;
  scientific_correctness_details: string;
  collaboration_score: number;
  collaboration_details: string;
  tool_selection_score: number;
  tool_selection_details: string;
  final_recommendation_score: number;
  final_recommendation_details: string;
  metrics: {
    latency_ms: number;
    total_runs_tracked: number;
    input_token_count: number;
    output_token_count: number;
    estimated_token_cost_usd: number;
    errors_flagged: number;
  };
}

export interface McpLog {
  server: string;
  tool: string;
  args: any;
  result: any;
}

export interface SimulationResult {
  run_id: string;
  timestamp: string;
  user_request: string;
  farm_data: FarmData;
  supervisor: AgentPlan;
  soil: SoilReport;
  climate: ClimateReport;
  water: WaterReport;
  crop: CropReport;
  carbon: CarbonReport;
  biodiversity: BiodiversityReport;
  research: ResearchReport;
  critic: CriticReport;
  decision: DecisionReport;
  evaluation: EvaluationReport;
  mcp_logs: McpLog[];
}
