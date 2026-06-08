import React, { useState } from "react";
import { CandidateAnalysisReport, JobMatchReport, ScoreBreakdown } from "../types";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  TrendingUp, 
  Award, 
  GraduationCap, 
  Users, 
  Settings, 
  Layers, 
  Calendar, 
  FileText,
  BookmarkCheck,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface ReportViewProps {
  report: CandidateAnalysisReport;
}

export default function ReportView({ report }: ReportViewProps) {
  const [activeJobId, setActiveJobId] = useState<string>(
    report.top_matches.length > 0 ? report.top_matches[0].job_id : ""
  );

  const activeMatch = report.top_matches.find((m) => m.job_id === activeJobId) || report.top_matches[0];

  if (!activeMatch) {
    return (
      <div className="bg-[#16161a] rounded-2xl border border-gray-800 p-8 text-center text-gray-400">
        No matches generated. Choose active positions and click Run.
      </div>
    );
  }

  // Helper to color-code ranges
  const getStyleForScore = (score: number) => {
    if (score >= 90) {
      return {
        bg: "bg-emerald-950/30 border-emerald-900/50 text-emerald-450",
        ring: "ring-emerald-500/40 text-emerald-400 border-emerald-500/50",
        stroke: "stroke-emerald-400",
        pill: "bg-emerald-650 text-white",
        text: "text-emerald-400 font-semibold"
      };
    } else if (score >= 80) {
      return {
        bg: "bg-teal-950/30 border-teal-900/50 text-teal-450",
        ring: "ring-teal-500/40 text-teal-400 border-teal-500/50",
        stroke: "stroke-teal-400",
        pill: "bg-teal-650 text-white",
        text: "text-teal-400 font-semibold"
      };
    } else if (score >= 70) {
      return {
        bg: "bg-blue-950/30 border-blue-900/50 text-blue-450",
        ring: "ring-blue-500/40 text-blue-400 border-blue-500/50",
        stroke: "stroke-blue-400",
        pill: "bg-blue-650 text-white",
        text: "text-blue-400 font-semibold"
      };
    } else if (score >= 60) {
      return {
        bg: "bg-amber-950/30 border-amber-900/50 text-amber-450",
        ring: "ring-amber-500/40 text-amber-400 border-amber-500/50",
        stroke: "stroke-amber-400",
        pill: "bg-amber-650 text-white",
        text: "text-amber-400 font-semibold"
      };
    } else {
      return {
        bg: "bg-red-950/30 border-red-900/50 text-red-450",
        ring: "ring-red-500/40 text-red-400 border-red-500/50",
        stroke: "stroke-red-400",
        pill: "bg-red-650 text-white",
        text: "text-red-400 font-semibold"
      };
    }
  };

  const activeColor = getStyleForScore(activeMatch.match_score);

  // SVG Circle stroke dash calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (activeMatch.match_score / 100) * circumference;

  return (
    <div className="space-y-6" id="report-view-root">
      {/* Executive Report Header Card */}
      <div className="bg-[#16161a] text-gray-300 rounded-2xl p-6 shadow-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <BookmarkCheck className="w-5.5 h-5.5 text-blue-400" />
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Executive Evaluation Report
            </h2>
            <span className="text-[10px] bg-[#1d1d22] font-mono text-blue-400 px-2 py-0.5 rounded border border-gray-750 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {report.analysis_date || "2026-06-04"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#3b82f6] uppercase tracking-widest font-mono font-bold">Candidate Assessed</span>
            <h3 className="text-lg font-semibold font-sans text-white">{report.candidate_name}</h3>
          </div>
          <div className="text-xs text-gray-300 leading-relaxed font-sans max-w-2xl bg-[#0d0d0f] p-3 rounded-lg border border-gray-850">
            <span className="font-semibold text-white">Recruitment Architect Summary:</span> {report.overall_summary}
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1 flex-shrink-0 bg-[#0d0d0f]/60 p-4 rounded-xl border border-gray-800/80">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">FAANG Suitability Pool</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {report.top_matches.map((match) => {
              const color = getStyleForScore(match.match_score);
              return (
                <div 
                  key={match.job_id} 
                  className={`text-[10px] px-2 py-1 rounded font-mono ${color.bg} border`}
                >
                  {match.job_id}: {match.match_score}% ({match.match_category})
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multiple Match Tabs Comparison Nav */}
      <div className="space-y-2">
        <span className="text-[10px] text-[#3b82f6] uppercase tracking-widest font-mono font-bold text-xs header-spec">
          Select Role Metric to Inspect ({report.top_matches.length} Targets Evaluated)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {report.top_matches.map((match) => {
            const isTabActive = match.job_id === activeJobId;
            const style = getStyleForScore(match.match_score);
            return (
              <button
                key={match.job_id}
                onClick={() => setActiveJobId(match.job_id)}
                className={`text-left rounded-xl border p-3.5 transition-all w-full flex flex-col justify-between cursor-pointer ${
                  isTabActive
                    ? "bg-[#1d1d22] border-blue-500 shadow-lg ring-1 ring-blue-500/40 text-white translate-y-[-2px]"
                    : "bg-[#16161a] hover:bg-[#1c1c22] border-gray-800 text-gray-400"
                }`}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-[#0d0d0f] border border-gray-800 text-gray-300">
                      {match.job_id}
                    </span>
                    <span className={`text-[10px] font-medium font-mono px-2 py-0.2 rounded-full ${style.bg} border`}>
                      {match.match_category}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white font-sans tracking-tight line-clamp-1">
                    {match.job_title}
                  </h4>
                </div>
                
                <div className="mt-3 flex items-center justify-between border-t border-gray-800 pt-2 w-full">
                  <span className="text-[10px] text-gray-400 font-sans">Role Suitability</span>
                  <span className={`text-base font-bold font-sans ${style.text}`}>
                    {match.match_score}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Evaluation Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Circle Gauge & Weights Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#16161a] rounded-2xl border border-gray-800 p-6 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Circle Score Gauge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-[#1d1d22] rounded-xl border border-gray-800/60">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">Matching Score</span>
              
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background track */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className="stroke-gray-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Matching fill */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className={`transition-all duration-1000 ease-out ${activeColor.stroke}`}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white font-sans tracking-tighter">
                    {activeMatch.match_score}%
                  </span>
                  <span className="text-[9px] font-mono font-semibold bg-[#0d0d0f] text-gray-400 px-1.5 py-0.2 rounded-full mt-0.5 border border-gray-850">
                    100 Max
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${activeColor.bg} border`}>
                  {activeMatch.match_category} Fit
                </span>
              </div>
            </div>

            {/* Recruiter Multi-Criteria Breakdown Bars */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Core Recruitment Metrics (Weighted)
                </h4>
                <span className="text-[9px] text-gray-500">Sum of factors = 100% Target Match</span>
              </div>

              <div className="space-y-3.5" id="score-breakdown-subbars">
                {/* Score breakdown metrics wrapper */}
                <MetricProgress 
                  label="Hard Skills & Technology Match" 
                  weight="40%" 
                  score={activeMatch.score_breakdown.hard_skills} 
                  color="bg-blue-500" 
                  icon={<Settings className="w-3.5 h-3.5 text-blue-400" />}
                />
                <MetricProgress 
                  label="Years of Experience & Seniority Scope" 
                  weight="20%" 
                  score={activeMatch.score_breakdown.experience_level} 
                  color="bg-indigo-500" 
                  icon={<Calendar className="w-3.5 h-3.5 text-blue-400" />}
                />
                <MetricProgress 
                  label="Domain & Core Sector Relevance" 
                  weight="15%" 
                  score={activeMatch.score_breakdown.domain_relevance} 
                  color="bg-sky-500" 
                  icon={<TrendingUp className="w-3.5 h-3.5 text-blue-400" />}
                />
                <MetricProgress 
                  label="Education Alignment & Credentials" 
                  weight="10%" 
                  score={activeMatch.score_breakdown.education_certifications} 
                  color="bg-violet-500" 
                  icon={<GraduationCap className="w-3.5 h-3.5 text-blue-400" />}
                />
                <MetricProgress 
                  label="Soft Skills & FAANG Culture Match" 
                  weight="10%" 
                  score={activeMatch.score_breakdown.soft_skills} 
                  color="bg-cyan-500" 
                  icon={<Users className="w-3.5 h-3.5 text-blue-400" />}
                />
                <MetricProgress 
                  label="Quantifiable Achievements & Metric Impact" 
                  weight="5%" 
                  score={activeMatch.score_breakdown.achievements_impact} 
                  color="bg-emerald-500" 
                  icon={<Award className="w-3.5 h-3.5 text-blue-400" />}
                />
              </div>
            </div>
          </div>

          {/* Detailed Recruiter Audit Grid */}
          <div className="bg-[#16161a] rounded-2xl border border-gray-800 p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              Recruitment Architect Category Audits
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AuditItemCard 
                title="Hard Skills Review" 
                weight="40%" 
                score={activeMatch.score_breakdown.hard_skills}
                comment={activeMatch.category_evaluations.hard_skills} 
              />
              <AuditItemCard 
                title="SRE/Seniority Scope Review" 
                weight="20%" 
                score={activeMatch.score_breakdown.experience_level}
                comment={activeMatch.category_evaluations.experience_level} 
              />
              <AuditItemCard 
                title="Core Sector Fit" 
                weight="15%" 
                score={activeMatch.score_breakdown.domain_relevance}
                comment={activeMatch.category_evaluations.domain_relevance} 
              />
              <AuditItemCard 
                title="Aesthetics & Academics Pedigree" 
                weight="10%" 
                score={activeMatch.score_breakdown.education_certifications}
                comment={activeMatch.category_evaluations.education_certifications} 
              />
              <AuditItemCard 
                title="Cultural/Mentoring Vector" 
                weight="10%" 
                score={activeMatch.score_breakdown.soft_skills}
                comment={activeMatch.category_evaluations.soft_skills} 
              />
              <AuditItemCard 
                title="Achievements Metric Proof" 
                weight="5%" 
                score={activeMatch.score_breakdown.achievements_impact}
                comment={activeMatch.category_evaluations.achievements_impact} 
              />
            </div>
          </div>
        </div>

        {/* Strengths & Critical Gaps Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Actionable Recruiter Recommendation */}
          <div className="bg-[#1d1d22]/80 rounded-2xl border-2 border-dashed border-gray-700 p-5 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              FAANG Actionable Directive
            </h4>
            <div className="text-xs text-gray-300 leading-relaxed bg-[#16161a] p-4 rounded-xl border border-gray-800 shadow-sm relative">
              <div className="absolute top-0 left-3 transform -translate-y-1/2 bg-blue-600 text-white text-[8px] font-mono px-2 py-0.5 rounded">
                HEAD ARCHITECT INSTRUCTION
              </div>
              <p className="mt-1 font-semibold italic text-white leading-relaxed">
                "{activeMatch.recommendation}"
              </p>
            </div>
          </div>

          {/* Key Strengths (Green) */}
          <div className="bg-[#16161a] rounded-2xl border border-gray-800 p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Key Matching Strengths ({activeMatch.key_strengths.length})
            </h4>
            <ul className="space-y-2.5">
              {activeMatch.key_strengths.map((str, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-300 font-sans leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Critical Gaps (Amber/Rose) */}
          <div className="bg-[#16161a] rounded-2xl border border-gray-800 p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Critical Gaps & Match Risks ({activeMatch.critical_gaps.length})
            </h4>
            <ul className="space-y-2.5">
              {activeMatch.critical_gaps.map((gap, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-300 font-sans leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Keywords (Bullet Tags) */}
          <div className="bg-[#16161a] rounded-2xl border border-gray-800 p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-gray-400" />
              Missing Resume Keywords ({activeMatch.missing_keywords.length})
            </h4>
            {activeMatch.missing_keywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {activeMatch.missing_keywords.map((kw, i) => (
                  <span 
                    key={i} 
                    className="text-[10px] font-mono bg-red-950/20 border border-red-900/30 text-red-400 px-2 py-0.5 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40 font-sans">
                Resume hits all vital JD tool keywords successfully!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Metric progress bar
interface MetricProgressProps {
  label: string;
  weight: string;
  score: number;
  color: string;
  icon: React.ReactNode;
}

function MetricProgress({ label, weight, score, color, icon }: MetricProgressProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs text-gray-300 font-sans">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="font-medium text-white truncate max-w-[210px] sm:max-w-none">{label}</span>
          <span className="text-[9px] bg-[#1d1d22] text-gray-400 font-mono px-1 rounded border border-gray-850">
            w: {weight}
          </span>
        </div>
        <span className="font-bold font-mono text-white">{score}%</span>
      </div>
      <div className="w-full bg-[#0d0d0f] rounded-full h-1.5 overflow-hidden border border-gray-850">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// Subcomponent: Audit critique block
interface AuditItemCardProps {
  title: string;
  weight: string;
  score: number;
  comment: string;
}

function AuditItemCard({ title, weight, score, comment }: AuditItemCardProps) {
  return (
    <div className="p-3 bg-[#1d1d22] border border-gray-800 rounded-xl space-y-1 hover:bg-[#25252b] transition-colors">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-semibold text-white font-sans">
          {title}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[8px] bg-[#16161a] text-gray-400 px-1 py-0.1 rounded font-mono border border-gray-850">
            Wt: {weight}
          </span>
          <span className="text-[10px] font-bold text-white font-mono">
            {score}%
          </span>
        </div>
      </div>
      <p className="text-[10px] text-gray-450 leading-relaxed font-sans">
        {comment}
      </p>
    </div>
  );
}
