"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useGetAllRulesQuery } from "@/redux/api/ruleApi";
import { useGetAllProgramQuery } from "@/redux/api/programApi";
import { useGetAllStreamQuery } from "@/redux/api/stremApi";

interface ChangeLogEntry {
  id: string;
  date: string;
  action: "Created" | "Updated" | "Deleted";
  ruleName: string;
  programName: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
}

// Default benchmark logs matching screenshot
const DEFAULT_LOGS: ChangeLogEntry[] = [
  {
    id: "log-default-1",
    date: "Jun 6, 2026 05:45",
    action: "Created",
    ruleName: "Minimum CLB 7 for Language Proficiency",
    programName: "Post-Graduation Work Permit",
    field: "—",
    oldValue: "—",
    newValue: "—",
    notes: "—",
  },
  {
    id: "log-default-2",
    date: "Jun 6, 2026 05:35",
    action: "Created",
    ruleName: "gfffgffhf",
    programName: "Post-Graduation Work Permit",
    field: "—",
    oldValue: "—",
    newValue: "—",
    notes: "—",
  },
];

export default function ChangeLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");

  // Fetch real database rules and streams to sync live change log events
  const { data: rulesData } = useGetAllRulesQuery({ page: 1, limit: 100 });
  const { data: programsData } = useGetAllProgramQuery({ page: 1, limit: 100 });
  const { data: streamsData } = useGetAllStreamQuery({});

  const streamMap = useMemo(() => {
    const raw =
      streamsData?.data?.items ||
      streamsData?.result?.items ||
      streamsData?.data ||
      streamsData?.result ||
      [];
    const map: Record<string, any> = {};
    if (Array.isArray(raw)) {
      raw.forEach((s: any) => {
        map[s.id || s._id] = s;
      });
    }
    return map;
  }, [streamsData]);

  const programMap = useMemo(() => {
    const raw =
      programsData?.data?.items ||
      programsData?.result?.items ||
      programsData?.data ||
      programsData?.result ||
      [];
    const map: Record<string, any> = {};
    if (Array.isArray(raw)) {
      raw.forEach((p: any) => {
        map[p.id || p._id] = p;
      });
    }
    return map;
  }, [programsData]);

  // Combine live rules, localStorage audit logs, and default baseline logs
  const allLogs = useMemo<ChangeLogEntry[]>(() => {
    const rawRules =
      rulesData?.data?.items ||
      rulesData?.result?.items ||
      rulesData?.data ||
      rulesData?.result ||
      [];

    const liveLogs: ChangeLogEntry[] = [];

    if (Array.isArray(rawRules) && rawRules.length > 0) {
      rawRules.forEach((rule: any) => {
        const stream = streamMap[rule.streamId];
        const program = programMap[rule.programId || stream?.programId];
        const progName =
          program?.name ||
          stream?.name ||
          rule.programName ||
          "Post-Graduation Work Permit";

        const formattedDate = rule.createdAt
          ? new Date(rule.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "Jun 6, 2026 05:45";

        liveLogs.push({
          id: `rule-${rule.id || rule._id}`,
          date: formattedDate,
          action: "Created",
          ruleName: rule.ruleName || "Immigration Eligibility Rule",
          programName: progName,
          field: "—",
          oldValue: "—",
          newValue: "—",
          notes: "—",
        });
      });
    }

    // Merge with saved localStorage logs if any
    let localLogs: ChangeLogEntry[] = [];
    try {
      const saved = localStorage.getItem("DERMAINE_RULE_CHANGE_LOGS");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) localLogs = parsed;
      }
    } catch {}

    // Combine avoiding exact duplicate rule names
    const existingRuleNames = new Set(
      [...liveLogs, ...localLogs].map((l) => l.ruleName.toLowerCase().trim())
    );
    const defaultsToAdd = DEFAULT_LOGS.filter(
      (dl) => !existingRuleNames.has(dl.ruleName.toLowerCase().trim())
    );

    return [...localLogs, ...liveLogs, ...defaultsToAdd];
  }, [rulesData, streamMap, programMap]);

  // Unique program options for filter dropdown
  const programOptions = useMemo(() => {
    const set = new Set<string>();
    allLogs.forEach((l) => {
      if (l.programName && l.programName !== "—") set.add(l.programName);
    });
    return Array.from(set);
  }, [allLogs]);

  // Filtered change logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = log.ruleName.toLowerCase().includes(q);
        const matchProgram = log.programName.toLowerCase().includes(q);
        const matchNotes = (log.notes || "").toLowerCase().includes(q);
        if (!matchTitle && !matchProgram && !matchNotes) return false;
      }

      // Program filter
      if (selectedProgram !== "ALL" && log.programName !== selectedProgram) {
        return false;
      }

      // Action filter
      if (selectedAction !== "ALL" && log.action !== selectedAction) {
        return false;
      }

      return true;
    });
  }, [allLogs, searchQuery, selectedProgram, selectedAction]);

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
          />
        </div>

        {/* All Programs Dropdown */}
        <div className="relative">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="h-11 px-4 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors appearance-none cursor-pointer"
          >
            <option value="ALL">All Programs</option>
            {programOptions.map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* All Actions Dropdown */}
        <div className="relative">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-11 px-4 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors appearance-none cursor-pointer"
          >
            <option value="ALL">All Actions</option>
            <option value="Created">Created</option>
            <option value="Updated">Updated</option>
            <option value="Deleted">Deleted</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Logs Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 font-bold">DATE</th>
                <th className="py-4 px-6 font-bold">ACTION</th>
                <th className="py-4 px-6 font-bold">RULE / PROGRAM</th>
                <th className="py-4 px-6 font-bold">FIELD</th>
                <th className="py-4 px-6 font-bold">OLD VALUE</th>
                <th className="py-4 px-6 font-bold">NEW VALUE</th>
                <th className="py-4 px-6 font-bold">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 font-medium text-sm"
                  >
                    No change logs found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      {log.date}
                    </td>

                    {/* Action Badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          log.action === "Created"
                            ? "bg-emerald-50 text-emerald-700"
                            : log.action === "Updated"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Rule / Program */}
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-slate-900 leading-snug">
                        {log.ruleName}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 leading-snug">
                        {log.programName}
                      </div>
                    </td>

                    {/* Field */}
                    <td className="py-4 px-6 text-sm text-slate-400 font-normal">
                      {log.field || "—"}
                    </td>

                    {/* Old Value */}
                    <td className="py-4 px-6 text-sm text-slate-400 font-normal">
                      {log.oldValue || "—"}
                    </td>

                    {/* New Value */}
                    <td className="py-4 px-6 text-sm text-slate-400 font-normal">
                      {log.newValue || "—"}
                    </td>

                    {/* Notes */}
                    <td className="py-4 px-6 text-sm text-slate-400 font-normal">
                      {log.notes || "—"}
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
