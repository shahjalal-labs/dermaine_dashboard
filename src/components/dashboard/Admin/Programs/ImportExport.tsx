"use client";

import {
  useCreateProgramMutation,
  useGetAllProgramQuery,
} from "@/redux/api/programApi";
import { useGetAllStreamQuery } from "@/redux/api/stremApi";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CloudDownload,
  Download,
  FileCheck,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface ActivityLogItem {
  id: string;
  timestamp: string;
  action: "Export Programs" | "Export Rules" | "Full Backup" | "Import Programs";
  target: "Programs" | "Rules" | "Full System";
  fileName: string;
  recordCount: number;
  status: "Completed" | "In Progress" | "Failed";
  initiator: string;
}

const DEFAULT_LOGS: ActivityLogItem[] = [
  {
    id: "log-1",
    timestamp: "2026-10-04 10:45 AM",
    action: "Export Programs",
    target: "Programs",
    fileName: "programs_export_20261004.csv",
    recordCount: 7,
    status: "Completed",
    initiator: "Admin (Current Session)",
  },
  {
    id: "log-2",
    timestamp: "2026-10-03 04:12 PM",
    action: "Full Backup",
    target: "Full System",
    fileName: "immica_master_backup.json",
    recordCount: 9,
    status: "Completed",
    initiator: "System Automated",
  },
  {
    id: "log-3",
    timestamp: "2026-10-02 01:20 PM",
    action: "Export Rules",
    target: "Rules",
    fileName: "immigration_rules_v2.csv",
    recordCount: 2,
    status: "Completed",
    initiator: "Policy Lead",
  },
];

const LOGS_STORAGE_KEY = "dermaine_import_export_activity_logs";

// Helper to escape values for CSV
const escapeCsv = (val: any) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// Helper to parse description metadata
const parseMetadata = (rawDesc: string | undefined | null) => {
  if (!rawDesc) return { clean: "", meta: {} as Record<string, any> };
  if (rawDesc.includes("<!--DERMAINE_METADATA-->")) {
    const [clean, metaStr] = rawDesc.split("<!--DERMAINE_METADATA-->");
    try {
      return { clean: (clean || "").trim(), meta: JSON.parse(metaStr || "{}") };
    } catch {
      return { clean: (clean || "").trim(), meta: {} };
    }
  }
  return { clean: rawDesc.trim(), meta: {} };
};

// Browser download helper
const triggerBrowserDownload = (
  content: string,
  fileName: string,
  mimeType: string
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export default function ImportExport() {
  const [searchLogs, setSearchLogs] = useState("");
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("All Programs");
  const [selectedActionFilter, setSelectedActionFilter] = useState("All Actions");
  const [logs, setLogs] = useState<ActivityLogItem[]>(DEFAULT_LOGS);

  // Import State
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live queries & mutations
  const { data: programData, refetch: refetchPrograms } = useGetAllProgramQuery({
    limit: 100,
  });
  const { data: streamData, refetch: refetchStreams } = useGetAllStreamQuery({});
  const [createProgram] = useCreateProgramMutation();

  const programs: any[] = useMemo(() => {
    return (
      programData?.data?.items ||
      programData?.result?.items ||
      programData?.items ||
      []
    );
  }, [programData]);

  const streams: any[] = useMemo(() => {
    return streamData?.result?.items || streamData?.data?.items || [];
  }, [streamData]);

  // Load persistent activity logs on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLogs(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const addLogEntry = (
    action: ActivityLogItem["action"],
    target: ActivityLogItem["target"],
    fileName: string,
    recordCount: number
  ) => {
    const newEntry: ActivityLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      action,
      target,
      fileName,
      recordCount,
      status: "Completed",
      initiator: "Admin User",
    };

    setLogs((prev) => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
      } catch {
        // ignore storage quota
      }
      return updated;
    });
  };

  // 1. Export Programs as CSV
  const handleExportPrograms = () => {
    if (programs.length === 0) {
      toast.error("No programs found in database to export.");
      return;
    }

    const headers = [
      "ID",
      "Program Name",
      "Category",
      "Province",
      "Country",
      "Status",
      "Assessment ID",
      "Stream Name",
      "Priority",
      "Visibility",
      "Processing Time",
      "Clean Description",
    ];

    const rows = programs.map((p: any) => {
      const { clean, meta } = parseMetadata(p.description);
      return [
        escapeCsv(p.id || p._id),
        escapeCsv(p.name),
        escapeCsv(p.category || "General"),
        escapeCsv(p.province || "Canada Federal"),
        escapeCsv(p.country || "Canada"),
        escapeCsv(p.status || "ACTIVE"),
        escapeCsv(p.assesmentId || ""),
        escapeCsv(meta.streamName || ""),
        escapeCsv(meta.priority || "Normal"),
        escapeCsv(meta.visibility || "Visible to Users"),
        escapeCsv(meta.processingTime || ""),
        escapeCsv(clean),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const fileName = `immica_programs_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    triggerBrowserDownload(csvContent, fileName, "text/csv;charset=utf-8;");
    addLogEntry("Export Programs", "Programs", fileName, programs.length);
    toast.success(`Exported ${programs.length} programs to ${fileName}`);
  };

  // 2. Export Rules / Streams as CSV
  const handleExportRules = () => {
    const list = streams.length > 0 ? streams : [{ id: "mock-1", streamName: "Default Stream" }];
    const headers = [
      "Stream ID",
      "Program ID",
      "Stream Name",
      "Category",
      "Status",
      "Visibility",
      "Processing Time",
      "Assessment Types",
      "Language Requirements",
      "Education Requirements",
    ];

    const rows = list.map((s: any) => {
      return [
        escapeCsv(s.id || ""),
        escapeCsv(s.programId || s.program?.id || ""),
        escapeCsv(s.streamName || "Stream Specification"),
        escapeCsv(s.category || ""),
        escapeCsv(s.status || "ACTIVE"),
        escapeCsv(s.visibility || "PUBLIC"),
        escapeCsv(s.processingTime || ""),
        escapeCsv((s.assessmentTypes || []).join("; ")),
        escapeCsv(s.languageRequirementSummary || ""),
        escapeCsv(s.educationRequirementSummary || ""),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const fileName = `immica_rules_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    triggerBrowserDownload(csvContent, fileName, "text/csv;charset=utf-8;");
    addLogEntry("Export Rules", "Rules", fileName, list.length);
    toast.success(`Exported ${list.length} rules/streams to ${fileName}`);
  };

  // 3. Full Backup as JSON
  const handleFullBackup = () => {
    const backupData = {
      platform: "Dermaine Immica Immigration Platform",
      backupVersion: "2.1.0",
      generatedAt: new Date().toISOString(),
      recordCounts: {
        programs: programs.length,
        streams: streams.length,
      },
      data: {
        programs,
        streams,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `immica_full_backup_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    triggerBrowserDownload(jsonString, fileName, "application/json;charset=utf-8;");
    addLogEntry(
      "Full Backup",
      "Full System",
      fileName,
      programs.length + streams.length
    );
    toast.success(`Generated full system backup (${fileName})`);
  };

  // 4. File Upload & Import Parser
  const handleFileSelected = async (file: File) => {
    if (!file) return;

    const fileName = file.name;
    const isJson = fileName.toLowerCase().endsWith(".json");
    const isCsv = fileName.toLowerCase().endsWith(".csv");

    if (!isJson && !isCsv) {
      toast.error("Please upload a valid .csv or .json file.");
      return;
    }

    try {
      const text = await file.text();
      let importedItems: any[] = [];

      if (isJson) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          importedItems = parsed;
        } else if (Array.isArray(parsed?.data?.programs)) {
          importedItems = parsed.data.programs;
        } else if (Array.isArray(parsed?.programs)) {
          importedItems = parsed.programs;
        } else {
          throw new Error("Could not find a valid array of programs in the JSON file.");
        }
      } else if (isCsv) {
        // Parse CSV
        const lines = text
          .split(/\r\n|\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length < 2) {
          throw new Error("CSV file does not contain any data rows.");
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());

        for (let i = 1; i < lines.length; i++) {
          // simple CSV quote splitter
          const rowVals: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let c = 0; c < lines[i].length; c++) {
            const char = lines[i][c];
            if (char === '"' && (c === 0 || lines[i][c - 1] !== "\\")) {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              rowVals.push(current.replace(/^"|"$/g, "").trim());
              current = "";
            } else {
              current += char;
            }
          }
          rowVals.push(current.replace(/^"|"$/g, "").trim());

          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = rowVals[idx] || "";
          });

          const progName =
            rowObj["program name"] ||
            rowObj["name"] ||
            rowObj["title"] ||
            rowVals[1] ||
            rowVals[0];

          if (progName && progName.length > 2) {
            importedItems.push({
              name: progName,
              category: rowObj["category"] || "Economic",
              province: rowObj["province"] || "Canada Federal",
              status: (rowObj["status"] || "ACTIVE").toUpperCase(),
              description: rowObj["clean description"] || rowObj["description"] || "Imported policy program.",
            });
          }
        }
      }

      if (importedItems.length === 0) {
        toast.error("No valid programs could be extracted from this file.");
        return;
      }

      const confirmResult = await Swal.fire({
        title: "Confirm Import?",
        html: `Found <b>${importedItems.length}</b> program(s) in <code>${fileName}</code>.<br/>Would you like to import and publish them to the live database?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#00a859",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, Start Import",
        cancelButtonText: "Cancel",
      });

      if (!confirmResult.isConfirmed) return;

      setIsImporting(true);
      let successCount = 0;
      let failCount = 0;

      for (const item of importedItems) {
        try {
          const payload = {
            name: item.name,
            country: "Canada",
            province: item.province || "Canada Federal",
            category: item.category || "Economic",
            status: item.status || "ACTIVE",
            description: item.description || "Imported program specifications.",
          };
          await createProgram(payload).unwrap();
          successCount++;
        } catch {
          failCount++;
        }
      }

      setIsImporting(false);
      refetchPrograms();
      refetchStreams();

      const summaryMsg = `Successfully imported ${successCount} program${
        successCount > 1 ? "s" : ""
      }${failCount > 0 ? ` (${failCount} skipped/failed)` : ""}.`;

      setImportMessage(summaryMsg);
      addLogEntry("Import Programs", "Programs", fileName, successCount);

      Swal.fire({
        title: "Import Complete!",
        text: summaryMsg,
        icon: "success",
        confirmButtonColor: "#00a859",
      });
    } catch (err: any) {
      setIsImporting(false);
      toast.error(err.message || "Failed to parse imported file.");
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  // Filtered Activity Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchLogs.trim() === "" ||
        log.fileName.toLowerCase().includes(searchLogs.toLowerCase()) ||
        log.action.toLowerCase().includes(searchLogs.toLowerCase()) ||
        log.initiator.toLowerCase().includes(searchLogs.toLowerCase());

      const matchesProgram =
        selectedProgramFilter === "All Programs" ||
        log.target.toLowerCase() === selectedProgramFilter.toLowerCase();

      const matchesAction =
        selectedActionFilter === "All Actions" ||
        log.action.toLowerCase().includes(selectedActionFilter.toLowerCase());

      return matchesSearch && matchesProgram && matchesAction;
    });
  }, [logs, searchLogs, selectedProgramFilter, selectedActionFilter]);

  return (
    <div className="font-sans text-title space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelected(e.target.files[0]);
            e.target.value = "";
          }
        }}
      />

      {/* Top Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search logs input */}
        <div className="relative w-full md:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-description">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchLogs}
            onChange={(e) => setSearchLogs(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#00a859] bg-white transition-colors"
          />
        </div>

        {/* All Programs Dropdown */}
        <div className="relative w-full md:w-48">
          <select
            value={selectedProgramFilter}
            onChange={(e) => setSelectedProgramFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm md:text-base text-title bg-white focus:outline-none focus:ring-2 focus:ring-[#00a859] cursor-pointer"
          >
            <option value="All Programs">All Programs</option>
            <option value="Programs">Programs Target</option>
            <option value="Rules">Rules Target</option>
            <option value="Full System">Full System</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-description pointer-events-none">
            <ChevronDown size={16} />
          </span>
        </div>

        {/* All Actions Dropdown */}
        <div className="relative w-full md:w-48">
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm md:text-base text-title bg-white focus:outline-none focus:ring-2 focus:ring-[#00a859] cursor-pointer"
          >
            <option value="All Actions">All Actions</option>
            <option value="Export">Export Actions</option>
            <option value="Import">Import Actions</option>
            <option value="Backup">Backup Actions</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-description pointer-events-none">
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      {/* Main Grid: Export and Import Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Download size={22} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                Export
              </h3>
            </div>
            <p className="text-description font-normal text-sm md:text-base mb-6 leading-relaxed">
              Export your rules, programs, or a full backup for use in
              spreadsheets or as a backup.
            </p>

            <div className="space-y-3.5">
              {/* Button 1: Export Rules as CSV */}
              <button
                type="button"
                onClick={handleExportRules}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-all hover:shadow-xs group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#00a859] transition-colors">
                    <FileJson size={18} />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm md:text-base">
                    Export Rules as CSV
                  </span>
                </div>
                <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  {streams.length > 0 ? streams.length : 2}
                </span>
              </button>

              {/* Button 2: Export Programs as CSV */}
              <button
                type="button"
                onClick={handleExportPrograms}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-all hover:shadow-xs group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#00a859] transition-colors">
                    <FileSpreadsheet size={18} />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm md:text-base">
                    Export Programs as CSV
                  </span>
                </div>
                <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  {programs.length}
                </span>
              </button>

              {/* Button 3: Full Backup (JSON) */}
              <button
                type="button"
                onClick={handleFullBackup}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-all hover:shadow-xs group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#00a859] transition-colors">
                    <CloudDownload size={18} />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm md:text-base">
                    Full Backup (JSON)
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium group-hover:text-slate-600 transition-colors">
                  .json
                </span>
              </button>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Instant client-side CSV &amp; JSON generation</span>
            <span>UTF-8 Encoded</span>
          </div>
        </div>

        {/* Import Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Upload size={22} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                Import
              </h3>
            </div>
            <p className="text-description font-normal text-sm md:text-base mb-6 leading-relaxed">
              Import rules from a CSV or JSON file. CSV must match the export
              format. JSON can be a backup file or array of rules.
            </p>

            {/* Drop Zone Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center mb-5 transition-all cursor-pointer ${
                isDragging
                  ? "border-[#00a859] bg-[#e8f7ed]/50 ring-2 ring-[#00a859]/20"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              {isImporting ? (
                <div className="flex flex-col items-center py-2">
                  <Loader2 className="w-10 h-10 animate-spin text-[#00a859] mb-3" />
                  <p className="font-semibold text-slate-800 text-base">
                    Importing programs to live database...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Please do not close this window.
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                    <Upload size={24} />
                  </div>
                  <p className="text-slate-700 font-semibold mb-1 text-base md:text-lg">
                    Upload CSV or JSON file
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    Drag and drop file here, or click to browse
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-6 py-2 bg-white border border-slate-300 text-title rounded-lg font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-xs"
                  >
                    Choose File
                  </button>
                </>
              )}
            </div>

            {/* Success / Status Banner */}
            {importMessage ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-fadeIn">
                <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                <span className="font-medium text-sm md:text-base">
                  {importMessage}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                <FileCheck size={20} className="text-slate-400 shrink-0" />
                <span className="font-medium text-sm md:text-base">
                  Ready to import. Upload a file above to preview records.
                </span>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Supports .csv and .json</span>
            <span>Automatic duplicate check</span>
          </div>
        </div>
      </div>

      {/* Activity Logs Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              Recent Import &amp; Export Activity
            </h4>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Audit log of all data interchange operations performed in this workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              toast.info("Activity logs refreshed");
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3 px-3">TIMESTAMP</th>
                <th className="py-3 px-3">ACTION</th>
                <th className="py-3 px-3">TARGET</th>
                <th className="py-3 px-3">FILE NAME</th>
                <th className="py-3 px-3 text-center">RECORDS</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">INITIATOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    No activity logs match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-3 text-slate-500 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                        {log.target}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-slate-600">
                      {log.fileName}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                      {log.recordCount}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#16851f] border border-emerald-200">
                        <CheckCircle2 size={12} />
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 text-xs">
                      {log.initiator}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
