export interface JobDescription {
  id: string;
  title: string;
  text: string;
  department?: string;
  company?: string;
}

export interface ScoreBreakdown {
  hard_skills: number; // 40% weight
  experience_level: number; // 20% weight
  domain_relevance: number; // 15% weight
  education_certifications: number; // 10% weight
  soft_skills: number; // 10% weight
  achievements_impact: number; // 5% weight
}

export interface CategoryEvaluations {
  hard_skills: string;
  experience_level: string;
  domain_relevance: string;
  education_certifications: string;
  soft_skills: string;
  achievements_impact: string;
}

export interface JobMatchReport {
  job_id: string;
  job_title: string;
  match_score: number; // Overall weighted score
  match_category: 'Exceptional' | 'Strong' | 'Good' | 'Moderate' | 'Poor';
  score_breakdown: ScoreBreakdown;
  key_strengths: string[];
  critical_gaps: string[];
  missing_keywords: string[];
  category_evaluations: CategoryEvaluations;
  recommendation: string;
}

export interface CandidateAnalysisReport {
  candidate_name: string;
  analysis_date: string;
  top_matches: JobMatchReport[];
  overall_summary: string;
  recommended_job_ids: string[];
}

export interface SampleProfile {
  name: string;
  headline: string;
  resumeText: string;
}

export interface Candidate {
  id: string;
  name: string;
  resumeText: string;
  analysisReport?: CandidateAnalysisReport | null;
  status: 'idle' | 'analyzing' | 'success' | 'error';
  errorMessage?: string;
}

