import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY environment variable is missing or placeholder. Please configure your API key in the AI Studio Settings > Secrets panel.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // API Route: Resume & Job Analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { resumeText, jobs } = req.body;

      if (!resumeText || !resumeText.trim()) {
        return res.status(400).json({ error: "Candidate resume text is required." });
      }
      if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
        return res.status(400).json({ error: "At least one Job Description must be provided for evaluation." });
      }

      // Check key lazily
      let ai: GoogleGenAI;
      try {
        ai = getGeminiClient();
      } catch (keyError: any) {
        return res.status(400).json({ error: keyError.message });
      }

      const jobsPromptList = jobs.map((jd, idx) => {
        return `
JOB DESIGNATION #${idx + 1}:
ID: ${jd.id}
Title: ${jd.title}
Company: ${jd.company || "N/A"}
Department: ${jd.department || "N/A"}
Requirements/Text:
${jd.text}
`;
      }).join("\n---\n");

      const prompt = `
Context & Persona:
You are an elite Senior Technical Recruiter and Talent Matching Architect with 20+ years of recruitment tenure at top-tier FAANG companies (like Google, Netflix, Stripe). You are extremely objective, analytical, rigorous, and never exaggerate alignment or hallucinate accomplishments.

Your task is to deeply analyze the candidate's resume (provided below) against multiple Job Descriptions listed below, matching them perfectly item-by-item across core elements, and calculating a precise weighted score for each.

Candidate Resume Text:
"""
${resumeText}
"""

List of Job Descriptions for recruitment mapping:
"""
${jobsPromptList}
"""

Rigorous Grading Instructions:
You MUST score each component on a 0-100 scale and then apply the strict weighted weights:
1. Hard Skills & Technical Requirements: 40% weight.
   Check exact keyword alignment, engineering platform compatibility, core languages (Go vs. Python vs. TypeScript), system requirements. Be strict. If a critical tool is missing, penalize heavily.
2. Years of Experience & Seniority Level: 20% weight.
   Verify actual timeline matches and leadership titles (Lead vs Individual Contributor).
3. Domain/Industry Relevance: 15% weight.
   Does the candidate's history match the environment (e.g. distributed backend scalability vs ML research and model scaling vs DevOps pipelines)?
4. Education & Certifications: 10% weight.
   Check degrees (PhD, MS, BS), credential status, and relevance.
5. Soft Skills & Cultural/Behavioral Fit: 10% weight.
   Look for mentorship, cross-functional collaboration, ownership, communication.
6. Achievements & Impact: 5% weight.
   Look for metrics like scale, cost savings (e.g. 32% compute saving), performance increments, and real-world launches.

Scoring Scale Reference:
- 90-100: Exceptional fit (top 5% of candidate pool - rare)
- 80-89: Strong fit (high probability of passing elite loops)
- 70-79: Good fit (solid candidate but clearly has critical gaps or needs slight upskilling)
- 60-69: Moderate fit (needs heavy upskilling or redirection to alternative roles)
- Below 60: Poor fit

Return a full, comprehensive recruitment scorecard for ALL provided jobs matching the schema exactly.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional FAANG Senior Technical Recruiter acting as an objective resume grading machine. You output strictly correct evaluation analyses in valid JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              candidate_name: { 
                type: Type.STRING,
                description: "The parsed legal name of the candidate found in the resume. For example, Sarah Chen." 
              },
              analysis_date: { 
                type: Type.STRING,
                description: "The formatted date of this analysis." 
              },
              overall_summary: { 
                type: Type.STRING, 
                description: "A highly expert, constructive summary report assessing which tracks or job profiles are the absolute best match for this engineer, detailing their core focus with absolute technical precision."
              },
              recommended_job_ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "IDs of Job Descriptions where the candidate scored 70 or higher."
              },
              top_matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    job_id: { type: Type.STRING },
                    job_title: { type: Type.STRING },
                    match_score: { 
                      type: Type.INTEGER, 
                      description: "The rigorous weighted average score (0-100) calculated from components." 
                    },
                    match_category: { 
                      type: Type.STRING, 
                      description: "Must be exactly one of: 'Exceptional', 'Strong', 'Good', 'Moderate', 'Poor' matching the score thresholds."
                    },
                    score_breakdown: {
                      type: Type.OBJECT,
                      properties: {
                        hard_skills: { type: Type.INTEGER, description: "Technical skills match score (0-100)" },
                        experience_level: { type: Type.INTEGER, description: "Seniority and industry tenure score (0-100)" },
                        domain_relevance: { type: Type.INTEGER, description: "Industry match score (0-100)" },
                        education_certifications: { type: Type.INTEGER, description: "Academic and credentials score (0-100)" },
                        soft_skills: { type: Type.INTEGER, description: "Collaboration and communication score (0-100)" },
                        achievements_impact: { type: Type.INTEGER, description: "Quantification and results score (0-100)" }
                      },
                      required: ["hard_skills", "experience_level", "domain_relevance", "education_certifications", "soft_skills", "achievements_impact"]
                    },
                    key_strengths: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "3 to 5 real, objective strengths aligning this candidate perfectly with this position's demands."
                    },
                    critical_gaps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Actual architectural, tech Stack, team leadership, or scale gaps identified. Write 'None identified' only if flawless."
                    },
                    missing_keywords: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Tools, databases, protocols, or frameworks mentioned in the target JD but missing on their CV."
                    },
                    category_evaluations: {
                      type: Type.OBJECT,
                      properties: {
                        hard_skills: { type: Type.STRING, description: "Recruiter remarks on exact language/framework expertise or architecture knowledge." },
                        experience_level: { type: Type.STRING, description: "Recruiter remarks verifying years of experience and level (individual vs team lead)." },
                        domain_relevance: { type: Type.STRING, description: "Remarks detailing environment relevance (e.g., ad-tech vs web interface vs core scale)." },
                        education_certifications: { type: Type.STRING, description: "Remarks validating PhD/MS/BS pedigree or specialized certificates." },
                        soft_skills: { type: Type.STRING, description: "Remarks reviewing mentorship, team collaboration, dynamic ownership." },
                        achievements_impact: { type: Type.STRING, description: "Remarks criticizing the depth and availability of metric-driven success in their resume." }
                      },
                      required: ["hard_skills", "experience_level", "domain_relevance", "education_certifications", "soft_skills", "achievements_impact"]
                    },
                    recommendation: { 
                      type: Type.STRING, 
                      description: "Actionable recruitment recommendation (e.g. Call for screen immediately, route to alternative track, reject, etc.). Be direct." 
                    }
                  },
                  required: ["job_id", "job_title", "match_score", "match_category", "score_breakdown", "key_strengths", "critical_gaps", "missing_keywords", "category_evaluations", "recommendation"]
                }
              }
            },
            required: ["candidate_name", "analysis_date", "overall_summary", "recommended_job_ids", "top_matches"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        return res.status(500).json({ error: "Failed to generate evaluation report: Empty response from AI model." });
      }

      const parsedData = JSON.parse(responseText.trim());
      return res.json(parsedData);

    } catch (error: any) {
      console.error("AI Analysis error:", error);
      return res.status(500).json({ 
        error: `AI Matching Architecture error: ${error.message || error}` 
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Talent Match Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
