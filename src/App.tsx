import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { SAMPLE_JOB_DESCRIPTIONS, SAMPLE_CANDIDATES } from "./sampleData";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "6.0.227"}/build/pdf.worker.min.mjs`;
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || "")
      .join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}
import { JobDescription, CandidateAnalysisReport, Candidate } from "./types";
import JDManager from "./components/JDManager";
import ReportView from "./components/ReportView";
import { 
  Sparkles, 
  User, 
  FileText, 
  ChevronRight, 
  AlertCircle, 
  ShieldAlert,
  Sliders, 
  CheckCircle2, 
  Flame,
  Info,
  UploadCloud,
  Trash2,
  Plus,
  Zap
} from "lucide-react";

export default function App() {
  // Candidates State Portfolio - loaded with default FAANG-grade profiles initially!
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    return SAMPLE_CANDIDATES.map((cand, idx) => ({
      id: `CAN-00${idx + 1}`,
      name: cand.name,
      resumeText: cand.resumeText,
      status: "idle",
    }));
  });

  const [activeCandidateId, setActiveCandidateId] = useState<string>("CAN-001");
  const [jobs, setJobs] = useState<JobDescription[]>(SAMPLE_JOB_DESCRIPTIONS);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([
    "AI-772",
    "FS-112",
    "JD-202"
  ]);

  // Loading/Analysis states for multi-resume batching
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resume drag & drop state handlers
  const [resumeDragActive, setResumeDragActive] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  // Resolve active candidate
  const activeCandidate = candidates.find(c => c.id === activeCandidateId) || candidates[0] || null;

  const handleResumeDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setResumeDragActive(true);
    } else if (e.type === "dragleave") {
      setResumeDragActive(false);
    }
  };

  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResumeDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processResumeFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processResumeFiles(Array.from(e.target.files));
    }
  };

  // Process multiple resumes (both PDF, TXT and MD) sequentially/parallelly in the browser
  const processResumeFiles = async (files: File[]) => {
    setIsProcessingFile(true);
    setErrorMessage(null);
    const newItems: Candidate[] = [];

    for (const file of files) {
      try {
        let text = "";
        if (file.name.toLowerCase().endsWith(".pdf")) {
          text = await extractTextFromPDF(file);
        } else {
          text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (evt) => resolve(String(evt.target?.result || ""));
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
          });
        }

        // Ingest inferred candidate name from text content
        let inferredName = "";
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          let candidateLine = lines[0].replace(/[^a-zA-Z\s\-]/g, "").trim();
          if (candidateLine && candidateLine.split(/\s+/).length <= 4) {
            inferredName = candidateLine;
          }
        }
        if (!inferredName) {
          inferredName = file.name.replace(/\.[^/.]+$/, "").replace(/[_\-]/g, " ").trim();
        }

        const newId = `CAN-${Math.floor(100 + Math.random() * 900)}`;
        newItems.push({
          id: newId,
          name: inferredName,
          resumeText: text,
          status: "idle",
        });
      } catch (error: any) {
        console.error("Error reading file:", file.name, error);
        setErrorMessage(prev => (prev ? prev + "\n" : "") + `Failed to parse ${file.name}: ${error.message || error}`);
      }
    }

    if (newItems.length > 0) {
      setCandidates(prev => [...prev, ...newItems]);
      setActiveCandidateId(newItems[0].id);
    }
    setIsProcessingFile(false);
  };

  const handleUpdateActiveResumeText = (text: string) => {
    setCandidates(prev => prev.map(c => c.id === activeCandidateId ? { ...c, resumeText: text, status: 'idle', analysisReport: undefined } : c));
  };

  const handleUpdateActiveName = (name: string) => {
    setCandidates(prev => prev.map(c => c.id === activeCandidateId ? { ...c, name } : c));
  };

  // Create a blank editor draft manually
  const handleAddNewManualCandidate = () => {
    const newId = `CAN-${Math.floor(100 + Math.random() * 900)}`;
    const newCand: Candidate = {
      id: newId,
      name: `Candidate Candidate Profile ${candidates.length + 1}`,
      resumeText: "Legal Name: Custom Candidate Name\n\nExperience Summary:\n- Design, scale and test distributed microservices using PyTorch and Go...\n\nEducation:\n- BS on Computer Science",
      status: 'idle'
    };
    setCandidates(prev => [...prev, newCand]);
    setActiveCandidateId(newId);
  };

  const handleDeleteCandidate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (candidates.length <= 1) {
      setErrorMessage("At least one candidate must remain in the workspace portfolio.");
      return;
    }
    const filtered = candidates.filter(c => c.id !== id);
    setCandidates(filtered);
    if (activeCandidateId === id) {
      setActiveCandidateId(filtered[0].id);
    }
  };

  // Intricate Recruiter Playful Phrases during state cycles
  const loaderPhrases = [
    "Recruitment Architect scanning all candidate resumes in parallel...",
    "Executing concurrent high-fidelity audits for matching requirements...",
    "Re-balancing core technology stack scoring arrays item-by-item...",
    "Compiling strict weighted averages (Hard Skills 40%, Experience 20%)...",
    "Consolidating gaps, strengths, and actionable recruiter directives...",
    "Readying comparative ranking matrix view..."
  ];

  // Rotate phrases while analyzing
  useEffect(() => {
    let timer: any;
    if (isAnalyzing) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loaderPhrases.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  // Job management handlers
  const handleToggleJob = (id: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUpdateJob = (updatedJob: JobDescription) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  const handleAddJob = (newJob: JobDescription) => {
    setJobs((prev) => [...prev, newJob]);
    setSelectedJobIds((prev) => [...prev, newJob.id]);
  };

  const handleDeleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setSelectedJobIds((prev) => prev.filter((item) => item !== id));
  };

  const handleResetJobs = () => {
    setJobs(SAMPLE_JOB_DESCRIPTIONS);
    setSelectedJobIds(["AI-772", "FS-112", "JD-202"]);
  };

  // Run suitability matching for an individual candidate resume
  const handleRunMatchForCandidate = async (candidateId: string) => {
    const candidateArg = candidates.find(c => c.id === candidateId);
    if (!candidateArg || !candidateArg.resumeText.trim()) return;

    const targetJobs = jobs.filter((j) => selectedJobIds.includes(j.id));
    if (targetJobs.length === 0) return;

    // Set intermediate candidate progress
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: 'analyzing', errorMessage: undefined } : c));

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resumeText: candidateArg.resumeText,
          jobs: targetJobs
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "System timed out compiling metrics.");
      }

      setCandidates(prev => prev.map(c => c.id === candidateId ? {
        ...c,
        status: 'success',
        analysisReport: data,
        name: data.candidate_name || c.name
      } : c));

    } catch (err: any) {
      console.error(err);
      setCandidates(prev => prev.map(c => c.id === candidateId ? {
        ...c,
        status: 'error',
        errorMessage: err.message || "Unknown match error"
      } : c));
    }
  };

  // Run full multi-resume matching comparisons simultaneously
  const handleRunMatchEngine = async () => {
    const targetJobs = jobs.filter((j) => selectedJobIds.includes(j.id));
    if (targetJobs.length === 0) {
      setErrorMessage("At least one Job Description must be active and selected for matched metrics mapping.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // Analyze all active candidates in parallel
      const processes = candidates.map(c => handleRunMatchForCandidate(c.id));
      await Promise.all(processes);

      // Smooth scroll to comparison matrix board
      setTimeout(() => {
        const boardEl = document.getElementById("comparison-board-anchor");
        if (boardEl) {
          boardEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Unknown error occurred executing recruitment evaluations.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Convenient helper to pick active analysis reports to render
  const analysisReport = activeCandidate?.analysisReport || null;

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-gray-300 font-sans antialiased selection:bg-blue-600 selection:text-white" id="talent-app-root">
      
      {/* Sleek Header branding */}
      <header className="border-b border-gray-800 bg-[#0d0d0f] sticky top-0 z-40 shadow-md backdrop-blur-sm" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-xl flex items-center justify-center text-white font-extrabold tracking-tighter shadow-sm flex-shrink-0">
              TM
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-[#1d1d22] text-blue-400 font-mono px-1.5 py-0.5 rounded border border-gray-700">
                  V1.5 BATCH
                </span>
                <h1 className="text-base font-bold text-white tracking-tight font-sans">
                  Talent Match Architect
                </h1>
              </div>
              <p className="text-[11px] text-gray-400 font-sans">
                FAANG-Grade Multi-Resume Batch comparative match suitability score analyzer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#16161a] p-2 rounded-xl border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-[10px] text-gray-400 font-mono">
              Lazy SDK Server Proxy Active
            </span>
            <div className="h-4 w-px bg-gray-800" />
            <span className="text-[10px] text-gray-400 font-sans truncate max-w-[200px]">
              Tuned for Gemini 3.5
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="main-container">
        {/* Top Warning regarding configuration */}
        <div className="bg-[#16161a] hover:bg-[#1c1c22] transition-colors p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row sm:items-center gap-3 justify-between shadow-sm">
          <div className="flex gap-2.5 items-start sm:items-center">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-white">
                FAANG Recruitment Framework Requirements
              </span>
              <p className="text-[11px] text-gray-400">
                Your API key is retrieved securely on the server-side from your private environment credentials.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-blue-400 bg-[#1d1d22] border border-gray-700 px-2 py-0.5 rounded">
            env: GEMINI_API_KEY
          </span>
        </div>

        {/* Operational Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SECTION: Resume workspace (7 Columns) with candidate manager inside */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6">
            <div className="bg-[#16161a] rounded-2xl border border-gray-800 p-5 shadow-xl space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-850 pb-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Candidate Workspace Portfolio
                    </h2>
                    <p className="text-[10px] text-gray-400">
                      Manage multiple resumes, drag & drop PDFs, or create draft profiles.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleAddNewManualCandidate}
                    className="text-[10px] bg-[#0d0d0f] hover:bg-[#1d1d22] text-emerald-400 font-bold border border-emerald-950/40 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer select-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Custom Profile
                  </button>
                  {/* Word count metric for selected resume */}
                  {activeCandidate && (
                    <div className="text-[9px] font-mono text-gray-400 bg-[#0d0d0f] px-2.5 py-1.5 rounded-xl border border-gray-800">
                      Active: {activeCandidate.resumeText.length} chars | {activeCandidate.resumeText.split(/\s+/).filter(Boolean).length} words
                    </div>
                  )}
                </div>
              </div>

              {/* Grid content split: candidate sidebar list & custom editor */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Column side (5 cols): Candidates portfolio queue list */}
                <div className="md:col-span-4 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-blue-500">
                      Candidate Pool ({candidates.length})
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono">
                      Click to edit details
                    </span>
                  </div>

                  <div className="space-y-2">
                    {candidates.map((cand) => {
                      const isSelected = cand.id === activeCandidateId;
                      let statusBadge = "text-gray-400 bg-gray-950/40 border-gray-800/40";
                      let statusText = "Draft";

                      if (cand.status === "analyzing") {
                        statusBadge = "text-amber-400 bg-amber-950/20 border-amber-900/40 animate-pulse";
                        statusText = "Analyzing %...";
                      } else if (cand.status === "error") {
                        statusBadge = "text-red-400 bg-red-950/20 border-red-900/40";
                        statusText = "Error";
                      } else if (cand.status === "success" && cand.analysisReport?.top_matches) {
                        const topScore = cand.analysisReport.top_matches.length 
                          ? Math.max(...cand.analysisReport.top_matches.map(m => m.match_score))
                          : 0;
                        statusBadge = "text-emerald-400 bg-emerald-950/20 border-emerald-900/40";
                        statusText = topScore ? `${topScore}% Suitability` : "Matched";
                      }

                      return (
                        <div
                          key={cand.id}
                          onClick={() => setActiveCandidateId(cand.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between group ${
                            isSelected 
                              ? "bg-[#1d1d22] border-blue-500 shadow-md ring-1 ring-blue-500/20 text-white" 
                              : "bg-[#0d0d0f]/60 hover:bg-[#131317] border-gray-850 text-gray-300"
                          }`}
                        >
                          <div className="space-y-1.5 truncate pr-2 max-w-[85%]">
                            <h4 className="text-xs font-semibold truncate font-sans">
                              {cand.name || "Custom Draft profile"}
                            </h4>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border ${statusBadge}`}>
                                {statusText}
                              </span>
                              <span className="text-[9px] text-gray-500 font-mono">
                                {cand.id}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleDeleteCandidate(cand.id, e)}
                            className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                            title="Remove candidate from pool"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column editor (8 cols): Selected candidate edit area */}
                <div className="md:col-span-8 space-y-4">
                  {activeCandidate ? (
                    <div className="space-y-4 animate-fadeIn">
                      
                      {/* Name editor line */}
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">
                          Display Candidate/Legal Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={activeCandidate.name}
                            onChange={(e) => handleUpdateActiveName(e.target.value)}
                            placeholder="Full Candidate Legal Name"
                            className="w-full text-xs p-2.5 pl-8 rounded-xl border border-gray-700 bg-[#0d0d0f] text-white placeholder-gray-500 hover:border-gray-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans font-semibold"
                          />
                          <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Text editor block containing file selectors */}
                      <div 
                        className={`relative space-y-1.5 rounded-xl p-0.5 transition-all ${
                          resumeDragActive ? "ring-2 ring-blue-500 bg-blue-950/10" : ""
                        }`}
                        onDragEnter={handleResumeDrag}
                        onDragOver={handleResumeDrag}
                        onDragLeave={handleResumeDrag}
                        onDrop={handleResumeDrop}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <label className="block text-[9px] font-medium text-gray-400 uppercase tracking-widest font-mono">
                            Selected Resume Text Editor (Standard Markdown or TXT)
                          </label>
                          
                          {/* File drop and browse indicators */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="file"
                              id="resume-file-picker"
                              accept=".pdf,.txt,.md,.json"
                              multiple
                              className="hidden"
                              onChange={handleResumeFileChange}
                            />
                            <label 
                              htmlFor="resume-file-picker"
                              className="text-[9px] cursor-pointer hover:text-white text-blue-400 bg-[#0d0d0f] font-semibold border border-gray-750 px-2.5 py-1 rounded-lg hover:bg-[#1a1a22] transition-colors flex items-center gap-1 font-mono"
                            >
                              <UploadCloud className="w-3 h-3" />
                              Upload Resumes (PDF / TXT)
                            </label>
                          </div>
                        </div>

                        {resumeDragActive && (
                          <div className="absolute inset-0 z-30 bg-[#0d0d0f]/95 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-blue-500 pointer-events-none animate-fadeIn animate-duration-150">
                            <UploadCloud className="w-8 h-8 text-blue-500 animate-bounce" />
                            <span className="text-xs font-bold text-white mt-2">Drop One or Multiple Resumes Here</span>
                            <span className="text-[10px] text-blue-400 font-mono mt-0.5">Supports PDF, TXT and Markdown formats</span>
                          </div>
                        )}

                        {isProcessingFile && (
                          <div className="absolute inset-0 z-30 bg-[#0d0d0f]/90 rounded-xl flex flex-col items-center justify-center border border-blue-500/40 pointer-events-none animate-fadeIn">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-1.5" />
                            <span className="text-[11px] font-bold text-white font-sans">Leveraging Client-Side PDF Parser...</span>
                          </div>
                        )}
                        
                        <textarea
                          id="resume-textarea-editor"
                          rows={14}
                          value={activeCandidate.resumeText}
                          onChange={(e) => handleUpdateActiveResumeText(e.target.value)}
                          placeholder="Paste or drop candidate's CV information raw text..."
                          className="w-full text-xs p-3.5 font-mono bg-[#0d0d0f] text-gray-200 rounded-xl border border-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-gray-700 leading-relaxed resize-y shadow-inner transition-colors"
                        />
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-12 text-sm text-gray-500 font-sans border border-dashed border-gray-800 rounded-xl">
                      Select a candidate template or click "Create Custom Profile" to begin.
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>

          {/* RIGHT SECTION: JDs manager and Submit actions Selector (4 Columns) */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-6">
            <JDManager
              jobs={jobs}
              selectedJobIds={selectedJobIds}
              onToggleJob={handleToggleJob}
              onUpdateJob={handleUpdateJob}
              onAddJob={handleAddJob}
              onDeleteJob={handleDeleteJob}
              onResetJobs={handleResetJobs}
            />

            {/* Submitting Engine Card */}
            <div className="bg-gradient-to-br from-[#16161a] to-[#1d1d22] text-gray-300 rounded-2xl border border-gray-800 p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400 font-bold" />
                <h3 className="text-sm font-semibold tracking-tight text-white font-sans">
                  Execute Batch Suitability?
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Our twin parallel AI model maps suitability metrics for <strong>all {candidates.length} candidates</strong> across <strong>all {selectedJobIds.length} target job descriptions</strong> simultaneously!
              </p>

              <button
                onClick={handleRunMatchEngine}
                disabled={isAnalyzing || selectedJobIds.length === 0 || candidates.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white p-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-45 disabled:cursor-not-allowed select-none cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Executing Batch Auditing Models...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Match & Suitability Audits</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Global Action and Loader Feedback */}
        {isAnalyzing && (
          <div className="p-8 rounded-2xl bg-[#16161a] border border-gray-800 shadow-xl flex flex-col items-center justify-center space-y-4 text-center animate-pulse animate-duration-1000" id="analyzing-block-parent">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            <div className="space-y-1.5 max-w-lg">
              <span className="text-xs font-semibold text-blue-500 uppercase font-mono tracking-widest block font-bold">
                BATCH PARALLEL MODEL ACTIVE
              </span>
              <p className="text-xs font-medium text-slate-100 font-mono">
                "{loaderPhrases[loadingStep]}"
              </p>
              <p className="text-[11px] text-gray-400">
                Evaluating profiles concurrently. The Gemini model inspects professional telemetry on the server-side.
              </p>
            </div>
          </div>
        )}

        {/* SECURE ERROR DISPLAY BLOCK */}
        {errorMessage && (
          <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/65 text-red-200 space-y-4" id="error-dialog-alert">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
              <h4 className="text-sm font-bold font-sans text-red-300">Matching Engine Processing Error</h4>
            </div>
            <div className="text-xs leading-relaxed max-w-3xl whitespace-pre-line font-sans bg-[#0d0d0f] p-3.5 rounded-xl border border-red-950 text-red-100 shadow-inner">
              {errorMessage}
            </div>
            <div className="text-[11px] text-red-400 font-sans">
              <strong>Recruiter Tip:</strong> If your API key is missing or invalid, go to the <strong>Settings &gt; Secrets</strong> list in the top right, add your <code>GEMINI_API_KEY</code>, and re-try. No server crash occurred.
            </div>
          </div>
        )}

        {/* MULTIPLE RESUME SCOREBOARD COMPARISON MATRIX BOARD */}
        <div id="comparison-board-anchor" className="scroll-mt-24 bg-[#16161a] rounded-2xl border border-gray-800 p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 font-bold" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Comparative Candidate Suitability & Percentage Ranking Matrix
                </h3>
              </div>
              <p className="text-xs text-gray-400">
                Comprehensive match percentages and FIT assessment categories across all selected JD indices.
              </p>
            </div>
            
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] bg-blue-950/30 border border-blue-900/60 text-blue-400 font-mono px-3 py-1 rounded-xl">
                {candidates.filter(c => c.status === "success").length} of {candidates.length} Resumes Analysed
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-850 bg-[#0d0d0f]/60 shadow-inner">
            <table className="w-full text-left text-xs text-gray-300 font-sans border-collapse">
              <thead>
                <tr className="bg-[#111114] border-b border-gray-800 text-[9px] font-mono tracking-wider text-gray-400 uppercase">
                  <th className="p-4 font-semibold min-w-[210px] text-left">Candidate Name / High Suitability Recomendation</th>
                  {jobs.filter(j => selectedJobIds.includes(j.id)).map(jd => (
                    <th key={jd.id} className="p-4 font-semibold text-center min-w-[150px]">
                      <div className="truncate max-w-[140px] text-white font-sans font-bold">{jd.title}</div>
                      <div className="text-[8px] font-normal text-gray-500 font-mono mt-0.5 truncate">{jd.id} • {jd.company}</div>
                    </th>
                  ))}
                  <th className="p-4 text-center font-semibold text-[9px] min-w-[120px]">Profile View Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {candidates.map(cand => {
                  const activeJobs = jobs.filter(j => selectedJobIds.includes(j.id));
                  
                  // Calculate candidate's best fitting role
                  let bestRoleTitle = "N/A";
                  let highestS = 0;
                  if (cand.analysisReport?.top_matches) {
                    cand.analysisReport.top_matches.forEach(m => {
                      if (m.match_score > highestS) {
                        highestS = m.match_score;
                        bestRoleTitle = m.job_title;
                      }
                    });
                  }

                  return (
                    <tr key={cand.id} className={`hover:bg-[#111114]/40 transition-colors ${cand.id === activeCandidateId ? "bg-blue-900/5" : ""}`}>
                      <td className="p-4 space-y-1">
                        <div className="font-semibold text-white font-sans text-xs flex items-center gap-1.5 flex-wrap">
                          <span>{cand.name || "Unnamed"}</span>
                          {cand.id === activeCandidateId && (
                            <span className="text-[8px] bg-blue-600/20 text-blue-400 font-mono px-1.5 py-0.2 rounded border border-blue-900">
                              Viewing Details
                            </span>
                          )}
                        </div>
                        {cand.status === "success" && highestS > 0 ? (
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 font-sans flex-wrap">
                            <span className="text-blue-400 font-semibold font-mono">Recommend:</span>
                            <span className="text-gray-300 font-medium inline-block max-w-[140px] truncate">{bestRoleTitle}</span>
                            <span className="text-emerald-400 font-bold font-mono">({highestS}%)</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-500 font-mono">
                            {cand.status === "analyzing" ? "Analyzing candidacy details..." : "Evaluation pending matcher"}
                          </div>
                        )}
                      </td>

                      {activeJobs.map(jd => {
                        const matchReport = cand.analysisReport?.top_matches?.find(m => m.job_id === jd.id);
                        
                        let renderCell = null;
                        if (cand.status === "analyzing") {
                          renderCell = (
                            <div className="flex items-center justify-center gap-1 text-amber-400 font-mono text-[10px]">
                              <span className="w-2.5 h-2.5 border border-amber-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-[9px]">Analyzing...</span>
                            </div>
                          );
                        } else if (cand.status === "error") {
                          renderCell = (
                            <span className="text-[8px] font-mono text-red-400 bg-red-950/25 px-1.5 py-0.5 rounded border border-red-900/30">
                              Error
                            </span>
                          );
                        } else if (matchReport) {
                          const val = matchReport.match_score;
                          
                          // Suitability badge metrics styling matching core guideline weights
                          let pillC = "bg-red-950/30 border-red-900/50 text-red-400";
                          if (val >= 90) pillC = "bg-emerald-950/30 border-emerald-900/55 text-emerald-400";
                          else if (val >= 80) pillC = "bg-teal-950/30 border-teal-900/55 text-teal-400";
                          else if (val >= 70) pillC = "bg-blue-950/30 border-blue-900/55 text-blue-400";
                          else if (val >= 60) pillC = "bg-amber-950/30 border-amber-900/55 text-amber-400";

                          return (
                            <td key={jd.id} className="p-4 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border shadow-sm ${pillC}`}>
                                  {val}%
                                </span>
                                <span className="text-[8px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                                  {matchReport.match_category} Fit
                                </span>
                              </div>
                            </td>
                          );
                        } else {
                          renderCell = (
                            <span className="text-[9px] font-mono text-gray-500 bg-gray-950 px-2 py-0.5 rounded border border-gray-800">
                              Pending
                            </span>
                          );
                        }

                        return (
                          <td key={jd.id} className="p-4 text-center">
                            {renderCell}
                          </td>
                        );
                      })}

                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setActiveCandidateId(cand.id);
                            setTimeout(() => {
                              const editorEl = document.getElementById("resume-textarea-editor");
                              if (editorEl) {
                                editorEl.scrollIntoView({ behavior: "smooth", block: "center" });
                              }
                            }, 50);
                          }}
                          className="text-[9px] font-bold text-gray-400 hover:text-white bg-[#101013] hover:bg-[#1c1c21] border border-gray-800 px-2 py-1 rounded hover:border-blue-500 transition-all select-none cursor-pointer inline-block"
                        >
                          Select CV
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESULTS REPORT CONTAINER FOR DETAILED SOURCE SEGMENTS */}
        <div id="results-panel-anchor" className="scroll-mt-24">
          {analysisReport ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-blue-950/20 border border-blue-900/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">
                    Detailed Professional Audit Report
                  </span>
                  <h4 className="text-xs font-semibold text-white font-sans">
                    Displaying 20+ years Recruiter Matching analytics for candidate: <span className="text-blue-300 font-bold">{activeCandidate?.name}</span>
                  </h4>
                </div>
                <button
                  onClick={() => {
                    const matrixBlock = document.getElementById("comparison-board-anchor");
                    if (matrixBlock) {
                      matrixBlock.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="text-[9px] font-mono text-blue-400 hover:text-white bg-[#0d0d0f] px-2.5 py-1 rounded border border-blue-900/30 cursor-pointer select-none transition-all"
                >
                  ↑ Return to Grid Matrix
                </button>
              </div>
              <ReportView report={analysisReport} />
            </div>
          ) : (
            !isAnalyzing && !errorMessage && (
              <div className="p-12 text-center rounded-2xl border bg-[#16161a] border-gray-800 text-gray-500 space-y-3 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-[#1d1d22] border border-gray-750 flex items-center justify-center text-gray-400 mx-auto text-lg leading-none shadow-inner">
                  📊
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
                  Comparative Analysis Report
                </h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto font-sans leading-relaxed">
                  Select candidate records and targeted vacancies, click <strong>"Execute Match & Suitability Audits"</strong>, and click any candidate's row to view their FAANG candidate scorecard report below.
                </p>
              </div>
            )
          )}
        </div>

      </main>

      {/* Humble aesthetic footer */}
      <footer className="border-t border-gray-800 bg-[#0d0d0f] py-6 mt-16" id="root-footer">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-gray-500 font-sans">
            © 2026 Talent Match Architect. Objective high-fidelity scorecard mapping.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[9px] bg-[#1d1d22] font-mono text-gray-400 px-2 py-0.5 rounded border border-gray-700">
              Secure Cloud Run Sandbox
            </span>
            <span className="text-[9px] text-gray-500 font-sans">
              Exclusively routed on local port 3000
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
