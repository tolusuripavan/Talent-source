import React, { useState } from "react";
import * as XLSX from "xlsx";
import { JobDescription } from "../types";
import { 
  Briefcase, 
  Sliders, 
  Edit3, 
  Trash2, 
  Plus, 
  RotateCcw, 
  AlertCircle, 
  FileSpreadsheet, 
  UploadCloud, 
  X, 
  Check, 
  HelpCircle, 
  Info 
} from "lucide-react";

interface JDManagerProps {
  jobs: JobDescription[];
  selectedJobIds: string[];
  onToggleJob: (id: string) => void;
  onUpdateJob: (updatedJob: JobDescription) => void;
  onAddJob: (newJob: JobDescription) => void;
  onDeleteJob: (id: string) => void;
  onResetJobs: () => void;
}

export default function JDManager({
  jobs,
  selectedJobIds,
  onToggleJob,
  onUpdateJob,
  onAddJob,
  onDeleteJob,
  onResetJobs
}: JDManagerProps) {
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Form states for creating/editing
  const [formTitle, setFormTitle] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formText, setFormText] = useState("");

  // Excel/CSV Importer States
  const [importedRows, setImportedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Column Mappings
  const [mapTitle, setMapTitle] = useState("");
  const [mapText, setMapText] = useState("");
  const [mapId, setMapId] = useState("");
  const [mapCompany, setMapCompany] = useState("");
  const [mapDept, setMapDept] = useState("");

  const [rowsToImport, setRowsToImport] = useState<Record<number, boolean>>({});

  const startEdit = (job: JobDescription) => {
    setEditingJobId(job.id);
    setFormTitle(job.title);
    setFormCompany(job.company || "");
    setFormDept(job.department || "");
    setFormText(job.text);
    setIsAdding(false);
    setIsImporting(false);
  };

  const handleSaveEdit = (id: string) => {
    if (!formTitle.trim() || !formText.trim()) return;
    onUpdateJob({
      id,
      title: formTitle,
      company: formCompany,
      department: formDept,
      text: formText
    });
    setEditingJobId(null);
  };

  const startAdd = () => {
    setEditingJobId(null);
    setFormTitle("");
    setFormCompany("");
    setFormDept("");
    setFormText("");
    setIsAdding(true);
    setIsImporting(false);
  };

  const handleSaveAdd = () => {
    if (!formTitle.trim() || !formText.trim()) return;
    const newId = `JD-${Math.floor(100 + Math.random() * 900)}`;
    onAddJob({
      id: newId,
      title: formTitle,
      company: formCompany,
      department: formDept,
      text: formText
    });
    setIsAdding(false);
  };

  // Drag and Drop files functions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setImportError(null);
    setImportFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Output worksheet with default empty strings to avoid missing fields
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        if (json.length === 0) {
          setImportError("The uploaded spreadsheet contains no readable records.");
          return;
        }
        
        // Unlocks custom Mapping views
        setImportedRows(json);
        
        // Read unique headers
        const uniqueKeys = Array.from(
          new Set(json.flatMap((row) => Object.keys(row)))
        );
        setHeaders(uniqueKeys);
        
        // Dynamic search matcher for core properties
        const getBestMatch = (keywords: RegExp[]) => {
          for (const regex of keywords) {
            const found = uniqueKeys.find((key) => regex.test(key));
            if (found) return found;
          }
          return "";
        };

        const foundTitle = getBestMatch([/title/i, /role/i, /designation/i, /name/i, /position/i]);
        const foundText = getBestMatch([/description/i, /requirements/i, /jd/i, /text/i, /body/i, /details/i, /spec/i]);
        const foundId = getBestMatch([/job.*id/i, /request.*id/i, /id/i, /ref/i, /number/i, /code/i]);
        const foundCompany = getBestMatch([/company/i, /employer/i, /owner/i, /org/i, /firm/i]);
        const foundDept = getBestMatch([/dept/i, /department/i, /team/i, /group/i, /division/i]);

        setMapTitle(foundTitle || uniqueKeys[0] || "");
        setMapText(foundText || uniqueKeys[1] || uniqueKeys[0] || "");
        setMapId(foundId || "");
        setMapCompany(foundCompany || "");
        setMapDept(foundDept || "");

        // Checked by default
        const initSelection: Record<number, boolean> = {};
        json.forEach((_, idx) => {
          initSelection[idx] = true;
        });
        setRowsToImport(initSelection);

      } catch (err: any) {
        setImportError(`Failed to parse Spreadsheet file: ${err.message || err}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const toggleRowSelect = (index: number) => {
    setRowsToImport((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleAllRows = () => {
    const allSelected = importedRows.every((_, idx) => rowsToImport[idx]);
    const nextSelection: Record<number, boolean> = {};
    importedRows.forEach((_, idx) => {
      nextSelection[idx] = !allSelected;
    });
    setRowsToImport(nextSelection);
  };

  const handleExecuteImport = () => {
    if (!mapTitle) {
      setImportError("Please define which column represents the 'Job / Role Title'.");
      return;
    }
    if (!mapText) {
      setImportError("Please define which column represents the 'Job Description Text'.");
      return;
    }

    let successCount = 0;
    importedRows.forEach((row, idx) => {
      if (!rowsToImport[idx]) return; // Row not checked

      const title = String(row[mapTitle] || "").trim();
      const text = String(row[mapText] || "").trim();
      const company = mapCompany ? String(row[mapCompany] || "").trim() : "";
      const department = mapDept ? String(row[mapDept] || "").trim() : "";
      const customId = mapId ? String(row[mapId] || "").trim() : "";

      // Must have title and details
      if (!title || !text) return;

      const finalId = customId || `JD-${Math.floor(100 + Math.random() * 900)}`;

      onAddJob({
        id: finalId,
        title,
        text,
        company: company || undefined,
        department: department || undefined
      });
      successCount++;
    });

    if (successCount === 0) {
      setImportError("No rows were imported. Make sure to choose valid columns and check at least one row.");
      return;
    }

    // Done resetting imports!
    setIsImporting(false);
    setImportedRows([]);
    setHeaders([]);
    setImportFileName("");
    setImportError(null);
  };

  return (
    <div className="bg-[#16161a] rounded-2xl border border-gray-800 p-5 shadow-xl space-y-4" id="jd-manager-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white font-sans tracking-tight">
            Target Job Criteria ({jobs.length})
          </h2>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <button
            onClick={onResetJobs}
            title="Reset to Default Roles"
            className="p-1 px-2.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-[#1d1d22] border border-gray-700 hover:bg-[#25252b] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          
          <button
            onClick={() => {
              setIsImporting(!isImporting);
              setIsAdding(false);
              setEditingJobId(null);
            }}
            className={`p-1 px-2.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
              isImporting 
                ? "bg-blue-950/20 text-blue-400 border-blue-800" 
                : "text-gray-300 hover:text-white bg-[#1d1d22] border-gray-700 hover:bg-[#25252b]"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Import Excel/CSV
          </button>

          <button
            onClick={startAdd}
            className="p-1 px-2.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Job
          </button>
        </div>
      </div>

      {/* CSV / EXCEL BULK LOADER WORKSPACE */}
      {isImporting && (
        <div className="p-4 rounded-xl bg-[#1d1d22] border border-gray-700 space-y-4 animate-fadeIn" id="excel-import-workspace">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-widest font-mono">
                Bulk Import Job Descriptions
              </h3>
            </div>
            <button
              onClick={() => {
                setIsImporting(false);
                setImportedRows([]);
                setHeaders([]);
                setImportFileName("");
                setImportError(null);
              }}
              className="text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Guidelines on columns info */}
          <div className="text-[10px] text-gray-400 bg-[#16161a] p-2.5 rounded-lg border border-gray-800 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-gray-300 font-sans">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Recommended Spreadsheet Fields</span>
            </div>
            <p className="font-sans leading-relaxed">
              We accept Excel (<code>.xlsx</code>, <code>.xls</code>, <code>.xlsm</code>) and CSV files. Custom column headers are fully supported! We automatically detect names like <strong>Job ID</strong>, <strong>Role Title</strong>, and <strong>Job Description</strong>.
            </p>
          </div>

          {/* DUAL MODE UPLOAD WORKAREA: CLICK AND DRAG AND DROP */}
          {importedRows.length === 0 ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer select-none transition-all duration-200 ${
                dragActive
                  ? "border-blue-500 bg-blue-950/15"
                  : "border-gray-700 hover:border-gray-600 bg-[#16161a]"
              }`}
            >
              <input
                type="file"
                id="jd-import-file-selector"
                accept=".xlsx,.xls,.xlsm,.csv,.tsv"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="jd-import-file-selector" className="cursor-pointer space-y-2 block">
                <div className="w-10 h-10 bg-[#1d1d22] border border-gray-700 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <UploadCloud className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-xs font-semibold text-slate-100 font-sans">
                  Drag & Drop spreadsheet here, or <span className="text-blue-400 font-bold hover:underline">browse files</span>
                </div>
                <p className="text-[9px] text-gray-500 font-mono">
                  Supports .xlsx, .xls, .csv up to 10MB
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs bg-[#16161a] p-2 rounded-lg border border-gray-800">
                <span className="text-emerald-400 font-mono flex items-center gap-1.5 truncate">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  {importFileName} ({importedRows.length} rows parsed)
                </span>
                <button
                  onClick={() => {
                    setImportedRows([]);
                    setHeaders([]);
                    setImportFileName("");
                  }}
                  className="text-[10px] text-red-400 hover:underline cursor-pointer"
                >
                  Clear file
                </button>
              </div>

              {/* STAGE 2: COLUMN SPECIFICATION MAPPING PANEL */}
              <div className="bg-[#16161a] p-3 rounded-xl border border-gray-800 space-y-3">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider font-sans block">
                  Map Spreadsheet Columns to Job Parameters
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                      Job / Role Title *
                    </label>
                    <select
                      value={mapTitle}
                      onChange={(e) => setMapTitle(e.target.value)}
                      className="w-full text-xs p-1.5 rounded bg-[#1d1d22] border border-gray-700 text-white font-sans focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Choose Column --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                      Requirements Description *
                    </label>
                    <select
                      value={mapText}
                      onChange={(e) => setMapText(e.target.value)}
                      className="w-full text-xs p-1.5 rounded bg-[#1d1d22] border border-gray-700 text-white font-sans focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Choose Column --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                      Request / Job ID (Optional)
                    </label>
                    <select
                      value={mapId}
                      onChange={(e) => setMapId(e.target.value)}
                      className="w-full text-xs p-1.5 rounded bg-[#1d1d22] border border-gray-700 text-white font-sans focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Generate IDs --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                      Company Name (Optional)
                    </label>
                    <select
                      value={mapCompany}
                      onChange={(e) => setMapCompany(e.target.value)}
                      className="w-full text-xs p-1.5 rounded bg-[#1d1d22] border border-gray-700 text-white font-sans focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- None --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                      Department / Group (Optional)
                    </label>
                    <select
                      value={mapDept}
                      onChange={(e) => setMapDept(e.target.value)}
                      className="w-full text-xs p-1.5 rounded bg-[#1d1d22] border border-gray-700 text-white font-sans focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- None --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* STAGE 3: SELECTIVE ROWS CHECKLIST */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-sans">
                  <span className="text-gray-300 font-bold">Select Active Positions to Ingest:</span>
                  <button
                    onClick={toggleAllRows}
                    className="text-blue-400 hover:underline hover:text-blue-300 cursor-pointer text-[10px]"
                  >
                    {importedRows.every((_, idx) => rowsToImport[idx]) ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="max-h-[140px] overflow-y-auto border border-gray-800 bg-[#16161a] rounded-lg p-2.5 space-y-1.5 scrollbar-thin">
                  {importedRows.map((row, idx) => {
                    const title = row[mapTitle] || "---";
                    const subtitle = `${mapCompany ? row[mapCompany] || "" : ""} ${mapDept && row[mapDept] ? `· ${row[mapDept]}` : ""}`.trim();
                    const isChecked = !!rowsToImport[idx];
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleRowSelect(idx)}
                        className={`flex items-start gap-2 p-1.5 rounded border transition-colors cursor-pointer text-[11px] ${
                          isChecked
                            ? "bg-blue-950/15 border-blue-900 text-slate-100"
                            : "border-gray-800/40 hover:bg-[#1d1d22] text-gray-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Controlled via row click
                          className="mt-0.5 w-3 h-3 text-blue-600 rounded bg-[#0d0d0f] border-gray-700 pointer-events-none"
                        />
                        <div className="truncate flex-1">
                          <span className="font-semibold block truncate leading-tight">{title}</span>
                          {subtitle && <span className="text-[9px] text-gray-500 block truncate mt-0.5">{subtitle}</span>}
                        </div>
                        {mapId && row[mapId] && (
                          <span className="font-mono text-[9px] bg-gray-800 text-gray-300 px-1 py-0.5 rounded flex-shrink-0">
                            {row[mapId]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SAVE / IMPORT ACTION BAR */}
              <button
                type="button"
                onClick={handleExecuteImport}
                className="w-full text-xs p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-750 text-white font-bold tracking-wide uppercase shadow transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>
                  Load {Object.values(rowsToImport).filter(Boolean).length} Jobs Into Criteria
                </span>
              </button>
            </div>
          )}

          {importError && (
            <div className="p-3 rounded-lg bg-red-950/35 border border-red-900/60 text-red-200 text-[11px] flex gap-2 items-start leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{importError}</span>
            </div>
          )}
        </div>
      )}

      {isAdding && (
        <div className="p-4 rounded-xl bg-[#1d1d22] border border-gray-700 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#3b82f6] uppercase tracking-widest font-mono">
              Create Custom Job Profile
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider font-mono mb-1">Role Title *</label>
              <input
                type="text"
                placeholder="Staff Backend Engineer"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-700 bg-[#16161a] text-white placeholder-gray-550 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider font-mono mb-1">Company</label>
              <input
                type="text"
                placeholder="Google, Inc."
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-700 bg-[#16161a] text-white placeholder-gray-550 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider font-mono mb-1">Department</label>
            <input
              type="text"
              placeholder="Infrastructure Scaling"
              value={formDept}
              onChange={(e) => setFormDept(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-gray-700 bg-[#16161a] text-white placeholder-gray-550 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider font-mono">
                Requirements & Details *
              </label>
              <span className="text-[9px] text-gray-500">Be explicit about hard skills and experience years</span>
            </div>
            <textarea
              rows={4}
              placeholder="Provide job context, tech requirements (e.g., Python, Go, GCP, Kubernetes), and years of experience (e.g., 5+ years of industry experience...)"
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-gray-700 bg-[#16161a] text-white placeholder-gray-550 focus:outline-none focus:border-blue-500 font-sans resize-y"
            />
          </div>
          <button
            onClick={handleSaveAdd}
            disabled={!formTitle.trim() || !formText.trim()}
            className="w-full text-xs p-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Create Job Criteria
          </button>
        </div>
      )}

      {editingJobId && (
        <div className="p-4 rounded-xl bg-[#1d1d22] border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#3b82f6] uppercase tracking-widest font-mono">
              Editing Job Criteria ({editingJobId})
            </h3>
            <button
              onClick={() => setEditingJobId(null)}
              className="text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider font-mono mb-1">Role Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-700 bg-[#16161a] text-white focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider font-mono mb-1">Company</label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-700 bg-[#16161a] text-white focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider font-mono mb-1">Department</label>
            <input
              type="text"
              value={formDept}
              onChange={(e) => setFormDept(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-gray-700 bg-[#16161a] text-white focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-450 uppercase tracking-wider font-mono mb-1">Requirements & Details</label>
            <textarea
              rows={4}
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-gray-700 bg-[#16161a] text-white focus:outline-none focus:border-blue-500 font-sans resize-y"
            />
          </div>
          <button
            onClick={() => handleSaveEdit(editingJobId)}
            className="w-full text-xs p-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Update Criteria
          </button>
        </div>
      )}

      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
        {jobs.map((job) => {
          const isSelected = selectedJobIds.includes(job.id);
          return (
            <div
              key={job.id}
              className={`group rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-blue-600 bg-[#1d1d22] ring-1 ring-blue-650/40"
                  : "border-gray-800 hover:border-gray-750 bg-[#16161a]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={`check-${job.id}`}
                    checked={isSelected}
                    onChange={() => onToggleJob(job.id)}
                    className="mt-1 w-3.5 h-3.5 text-blue-600 bg-[#0d0d0f] border-gray-700 rounded focus:ring-blue-500 focus:outline-none cursor-pointer"
                  />
                  <div>
                    <label
                      htmlFor={`check-${job.id}`}
                      className="font-medium text-white text-xs font-sans tracking-tight cursor-pointer hover:text-blue-400 flex items-center gap-1.5"
                    >
                      {job.title}
                    </label>
                    <div className="text-[10px] text-gray-400 mt-0.5 font-sans">
                      {job.company} {job.department ? `· ${job.department}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <button
                    onClick={() => startEdit(job)}
                    className="p-1 bg-[#1d1d22] hover:bg-[#25252b] border border-gray-700 rounded text-gray-300 hover:text-white cursor-pointer"
                    title="Edit Criteria"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteJob(job.id)}
                    disabled={jobs.length <= 1}
                    className="p-1 bg-[#1d1d22] hover:bg-rose-950/20 border border-gray-700 rounded text-gray-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                    title="Delete Role"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="mt-2 pl-5">
                <div className="text-[10px] text-gray-400 line-clamp-2 font-sans bg-[#0d0d0f] p-1.5 rounded border border-gray-800 font-mono">
                  {job.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedJobIds.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-950/20 border border-amber-900/50 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
          <span>No jobs selected for comparative review. Select at least one job above to run match.</span>
        </div>
      )}
    </div>
  );
}

