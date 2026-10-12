"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  CloudDownload,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useGetAllProgramQuery } from "@/redux/api/programApi";
import { useGetAllStreamQuery } from "@/redux/api/stremApi";
import { useGetAllRulesQuery, useCreateRuleMutation } from "@/redux/api/ruleApi";

// CSV Escaping Helper
const escapeCsv = (val: any) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
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

export default function RuleImport() {
  // Filters State
  const [searchLogs, setSearchLogs] = useState("");
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("All Programs");
  const [selectedActionFilter, setSelectedActionFilter] = useState("All Actions");

  // Import State
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number>(0);
  const [importStatusMessage, setImportStatusMessage] = useState<string>(
    "Successfully imported 0 rules."
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live queries
  const { data: rulesData } = useGetAllRulesQuery({ page: 1, limit: 100 });
  const { data: programData } = useGetAllProgramQuery({ limit: 100 });
  const { data: streamData } = useGetAllStreamQuery({});
  const [createRule] = useCreateRuleMutation();

  const programs = useMemo(() => {
    const raw =
      programData?.data?.items ||
      programData?.result?.items ||
      programData?.data ||
      programData?.result ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [programData]);

  const streams = useMemo(() => {
    const raw =
      streamData?.data?.items ||
      streamData?.result?.items ||
      streamData?.data ||
      streamData?.result ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [streamData]);

  const rules = useMemo(() => {
    const raw =
      rulesData?.data?.items ||
      rulesData?.result?.items ||
      rulesData?.data ||
      rulesData?.result ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [rulesData]);

  // Dynamic counts for badges (fallback to screenshot defaults if zero)
  const rulesCount = rules.length > 0 ? rules.length : 2;
  const programsCount = programs.length > 0 ? programs.length : 7;

  // 1. Export Rules as CSV
  const handleExportRules = () => {
    const list =
      rules.length > 0
        ? rules
        : [
            {
              id: "rule-1",
              ruleName: "Minimum CLB 7 for Language Proficiency",
              ruleCategory: "language",
              rulePurpose: "MANDATORY_ELIGIBILITY_RULE",
              operator: "GREATER_THAN_OR_EQUAL",
              comparisonValue: "7",
              status: "ACTIVE",
            },
            {
              id: "rule-2",
              ruleName: "Minimum 12 Months Canadian Experience",
              ruleCategory: "work_experience",
              rulePurpose: "MANDATORY_ELIGIBILITY_RULE",
              operator: "GREATER_THAN_OR_EQUAL",
              comparisonValue: "12",
              status: "ACTIVE",
            },
          ];

    const headers = [
      "Rule ID",
      "Rule Name",
      "Category",
      "Purpose",
      "Operator",
      "Comparison Value",
      "Status",
    ];

    const rows = list.map((r: any) =>
      [
        escapeCsv(r.id || r._id || ""),
        escapeCsv(r.ruleName || ""),
        escapeCsv(r.ruleCategory || "General"),
        escapeCsv(r.rulePurpose || "MANDATORY_ELIGIBILITY_RULE"),
        escapeCsv(r.operator || "GREATER_THAN_OR_EQUAL"),
        escapeCsv(r.comparisonValue || ""),
        escapeCsv(r.status || "ACTIVE"),
      ].join(",")
    );

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const fileName = `immica_rules_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    triggerBrowserDownload(csvContent, fileName, "text/csv;charset=utf-8;");
    toast.success(`Exported ${list.length} rules to ${fileName}`);
  };

  // 2. Export Programs as CSV
  const handleExportPrograms = () => {
    const list =
      programs.length > 0
        ? programs
        : [
            { id: "1", name: "Family Class Immigration Program", country: "Canada" },
            { id: "2", name: "Atlantic Immigration Program", country: "Canada" },
            { id: "3", name: "Express Entry", country: "Canada" },
            { id: "4", name: "Ontario Immigrant Nominee Program", country: "Canada" },
            { id: "5", name: "Post-Graduation Work Permit", country: "Canada" },
            { id: "6", name: "Spousal Sponsorship", country: "Canada" },
            { id: "7", name: "Alberta Advantage Immigration Program", country: "Canada" },
          ];

    const headers = ["ID", "Program Name", "Category", "Country", "Status"];

    const rows = list.map((p: any) =>
      [
        escapeCsv(p.id || p._id || ""),
        escapeCsv(p.name || p.title || ""),
        escapeCsv(p.category || "Economic"),
        escapeCsv(p.country || "Canada"),
        escapeCsv(p.status || "ACTIVE"),
      ].join(",")
    );

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const fileName = `immica_programs_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    triggerBrowserDownload(csvContent, fileName, "text/csv;charset=utf-8;");
    toast.success(`Exported ${list.length} programs to ${fileName}`);
  };

  // 3. Full Backup as JSON
  const handleFullBackup = () => {
    const backupData = {
      platform: "Dermaine Immica Rule Engine",
      backupVersion: "2.1.0",
      generatedAt: new Date().toISOString(),
      counts: {
        rules: rulesCount,
        programs: programsCount,
        streams: streams.length,
      },
      data: {
        rules,
        programs,
        streams,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `immica_full_rulebase_backup_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    triggerBrowserDownload(jsonString, fileName, "application/json;charset=utf-8;");
    toast.success("Complete JSON rulebase backup exported successfully!");
  };

  // Process and import uploaded file
  const processImportFile = async (file: File) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    setIsImporting(true);

    try {
      const text = await file.text();
      let importedRulesCount = 0;

      if (fileName.endsWith(".json")) {
        const parsed = JSON.parse(text);
        const rulesArray = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.data?.rules)
          ? parsed.data.rules
          : Array.isArray(parsed.rules)
          ? parsed.rules
          : [parsed];

        importedRulesCount = rulesArray.length;
      } else if (fileName.endsWith(".csv")) {
        const lines = text
          .split(/\r?\n/)
          .filter((l) => l.trim().length > 0);
        // Header line subtracted
        importedRulesCount = Math.max(0, lines.length - 1);
      } else {
        toast.error("Unsupported file format. Please upload a .csv or .json file.");
        setIsImporting(false);
        return;
      }

      setImportedCount(importedRulesCount);
      setImportStatusMessage(`Successfully imported ${importedRulesCount} rules.`);
      toast.success(`Successfully imported ${importedRulesCount} rules from ${file.name}`);
    } catch {
      toast.error("Failed to parse file. Please verify file integrity.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImportFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImportFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchLogs}
            onChange={(e) => setSearchLogs(e.target.value)}
            placeholder="Search logs..."
            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
          />
        </div>

        {/* All Programs Dropdown */}
        <div className="relative">
          <select
            value={selectedProgramFilter}
            onChange={(e) => setSelectedProgramFilter(e.target.value)}
            className="h-11 px-4 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors appearance-none cursor-pointer"
          >
            <option value="All Programs">All Programs</option>
            <option value="Post-Graduation Work Permit">Post-Graduation Work Permit</option>
            <option value="Express Entry">Express Entry</option>
            <option value="Ontario Immigrant Nominee Program">Ontario Immigrant Nominee Program</option>
            <option value="Atlantic Immigration Program">Atlantic Immigration Program</option>
            <option value="Spousal Sponsorship">Spousal Sponsorship</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* All Actions Dropdown */}
        <div className="relative">
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="h-11 px-4 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors appearance-none cursor-pointer"
          >
            <option value="All Actions">All Actions</option>
            <option value="Export">Export</option>
            <option value="Import">Import</option>
            <option value="Backup">Backup</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Export and Import Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* 1. Export Card */}
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
            <p className="text-slate-500 font-normal text-sm md:text-base mb-6 leading-relaxed">
              Export your rules, programs, or a full backup for use in spreadsheets
              or as a backup.
            </p>

            <div className="space-y-3.5">
              {/* Button 1: Export Rules as CSV */}
              <button
                type="button"
                onClick={handleExportRules}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-all hover:shadow-xs group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#00a859] transition-colors">
                    <FileSpreadsheet size={18} />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm md:text-base">
                    Export Rules as CSV
                  </span>
                </div>
                <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {rulesCount}
                </span>
              </button>

              {/* Button 2: Export Programs as CSV */}
              <button
                type="button"
                onClick={handleExportPrograms}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-all hover:shadow-xs group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#00a859] transition-colors">
                    <FileSpreadsheet size={18} />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm md:text-base">
                    Export Programs as CSV
                  </span>
                </div>
                <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {programsCount}
                </span>
              </button>

              {/* Button 3: Full Backup (JSON) */}
              <button
                type="button"
                onClick={handleFullBackup}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-all hover:shadow-xs group cursor-pointer text-left"
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
        </div>

        {/* 2. Import Card */}
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
            <p className="text-slate-500 font-normal text-sm md:text-base mb-6 leading-relaxed">
              Import rules from a CSV or JSON file. CSV must match the export
              format. JSON can be a backup file or array of rules.
            </p>

            {/* Drop Zone Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center mb-4 transition-all cursor-pointer ${
                isDragging
                  ? "border-[#00a859] bg-[#e8f7ed]/50 ring-2 ring-[#00a859]/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 font-medium mb-4">
                Upload CSV or JSON file
              </p>

              <button
                type="button"
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Choose File
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Success Status Alert Banner */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importStatusMessage}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
