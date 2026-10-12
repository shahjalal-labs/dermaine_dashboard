"use client";

import {
  Beaker,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  FileEdit,
  FileText,
  FlaskConical,
  Globe,
  History,
  LayoutDashboard,
  Plus,
  Settings,
  ShieldAlert,
  Sparkles,
  Trash2,
  ArrowRight,
  Layers,
  Check,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  useGetAllRulesQuery,
  useGetAllScoringFactorsQuery,
  useCreateRuleMutation,
} from "@/redux/api/ruleApi";
import { useGetAllProgramQuery } from "@/redux/api/programApi";
import { useGetAllStreamQuery } from "@/redux/api/stremApi";
import { toast } from "sonner";
import CRSEngine from "./CRSEngine";
import RuleBuilder from "./RuleBuilder";
import ScoringAndWeights from "./ScoringAndWeights";
import TestSandbox from "./TestSandbox";
import AiRecommendations from "./AiRecommendations";
import AiPolicyCenter from "./AiPolicyCenter";
import ChangeLogs from "./ChangeLogs";
import RuleImport from "./RuleImport";
import AddRuleModal from "./AddRuleModal";

export default function RuleScoring() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = tabParam || "Dashboard";

  const { data: rulesData } = useGetAllRulesQuery({ page: 1, limit: 100 });
  const { data: scoringFactorsData } = useGetAllScoringFactorsQuery({ page: 1, limit: 100 });
  const { data: programsData } = useGetAllProgramQuery({ page: 1, limit: 100 });
  const { data: streamsData } = useGetAllStreamQuery({});

  const [createRule, { isLoading: isCreatingRule }] = useCreateRuleMutation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDefaultProgramId, setModalDefaultProgramId] = useState<string | undefined>();
  const [modalDefaultStreamId, setModalDefaultStreamId] = useState<string | undefined>();

  const rulesList = useMemo(() => {
    const raw =
      rulesData?.data?.items ||
      rulesData?.result?.items ||
      rulesData?.data ||
      rulesData?.result ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [rulesData]);

  const scoringFactorsList = useMemo(() => {
    const raw =
      scoringFactorsData?.data?.items ||
      scoringFactorsData?.result?.items ||
      scoringFactorsData?.data ||
      scoringFactorsData?.result ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [scoringFactorsData]);

  const programsList = useMemo(() => {
    const raw =
      programsData?.data?.items ||
      programsData?.result?.items ||
      programsData?.data ||
      programsData?.result ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [programsData]);

  const streamsList = useMemo(() => {
    const raw =
      streamsData?.data?.items ||
      streamsData?.result?.items ||
      streamsData?.data ||
      streamsData?.result ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [streamsData]);

  const streamMap = useMemo(() => {
    const map: Record<string, any> = {};
    streamsList.forEach((s: any) => {
      map[s.id || s._id] = s;
    });
    return map;
  }, [streamsList]);

  // Combined rule inventory
  const allRulesCombined = useMemo(() => {
    return [...rulesList];
  }, [rulesList]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalRules = allRulesCombined.length;
    const activeRules = allRulesCombined.filter(
      (r: any) => r.status?.toUpperCase() === "ACTIVE"
    ).length;
    const draftRules = allRulesCombined.filter(
      (r: any) => r.status?.toUpperCase() === "DRAFT" || !r.status
    ).length;
    const archivedRules = allRulesCombined.filter(
      (r: any) => r.status?.toUpperCase() === "ARCHIVED"
    ).length;

    // Distinct programs that have at least one rule (or stream with rule)
    const programsWithRulesSet = new Set<string>();
    allRulesCombined.forEach((r: any) => {
      if (r.programId) {
        programsWithRulesSet.add(r.programId);
      } else if (r.streamId && streamMap[r.streamId]?.programId) {
        programsWithRulesSet.add(streamMap[r.streamId].programId);
      }
    });

    const programsWithRules = programsWithRulesSet.size;
    const testedCount = allRulesCombined.filter(
      (r: any) => r.status?.toUpperCase() === "ACTIVE" || r.status?.toUpperCase() === "TESTING"
    ).length;

    return {
      totalRules,
      activeRules,
      draftRules,
      archivedRules,
      programsWithRules,
      testedCount: Math.min(testedCount, 12),
    };
  }, [allRulesCombined, streamMap]);

  // Calculate per-program coverage
  const programCoverage = useMemo(() => {
    return programsList.map((prog: any) => {
      const pId = prog.id || prog._id;
      const progStreams = streamsList.filter((s: any) => s.programId === pId);
      const progStreamIds = new Set(progStreams.map((s: any) => s.id || s._id));

      const progRules = allRulesCombined.filter((r: any) => {
        return r.programId === pId || (r.streamId && progStreamIds.has(r.streamId));
      });

      const activeRules = progRules.filter(
        (r: any) => r.status?.toUpperCase() === "ACTIVE"
      );

      return {
        id: pId,
        name: prog.name,
        province: prog.province || "Federal",
        category: prog.category || "Economic Class",
        streamsCount: progStreams.length,
        rulesCount: progRules.length,
        activeRulesCount: activeRules.length,
        hasRules: progRules.length > 0,
      };
    });
  }, [programsList, streamsList, allRulesCombined]);

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCreateRuleSubmit = async (data: any) => {
    try {
      await createRule(data).unwrap();
      toast.success("Rule created and deployed to eligibility engine!");
      setIsAddModalOpen(false);
      setModalDefaultProgramId(undefined);
      setModalDefaultStreamId(undefined);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create rule");
    }
  };

  const openAddRuleForProgram = (programId: string) => {
    setModalDefaultProgramId(programId);
    const firstStream = streamsList.find((s: any) => s.programId === programId);
    if (firstStream) {
      setModalDefaultStreamId(firstStream.id || firstStream._id);
    } else {
      setModalDefaultStreamId(undefined);
    }
    setIsAddModalOpen(true);
  };

  // Recent activity log generated from real rule timestamps
  const recentActivities = useMemo(() => {
    const sorted = [...allRulesCombined].sort((a: any, b: any) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return sorted.slice(0, 5).map((rule: any) => {
      const stream = streamMap[rule.streamId];
      const isDraft = rule.status?.toUpperCase() === "DRAFT";
      const dateStr = rule.updatedAt
        ? new Date(rule.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recent";

      return {
        id: rule.id || rule._id,
        ruleName: rule.ruleName || "Eligibility Rule",
        type: isDraft ? "Drafted" : "Active",
        action: rule.updatedAt && rule.updatedAt !== rule.createdAt ? "Updated" : "Created",
        streamName: stream?.streamName || stream?.name || "General Stream",
        category: (rule.ruleCategory || "General").replace(/_/g, " "),
        dateStr,
      };
    });
  }, [allRulesCombined, streamMap]);

  return (
    <div className="mx-auto w-full font-sans text-title">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-title mb-1">
          Rule / Scoring Management
        </h1>
        <p className="text-xs text-description">
          Configure mandatory eligibility criteria, CRS scoring matrices, weight distributions, and simulate applicant evaluations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 text-base md:text-lg font-medium">
        {[
          { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "Rule Builder", label: "Rule Builder", icon: FileEdit },
          { id: "Scoring & Weights", label: "Scoring & Weights", icon: Settings },
          { id: "CRS Engine", label: "CRS Engine", icon: FileText },
          { id: "AI Recommendations", label: "AI Recommendations", icon: Sparkles },
          { id: "AI Policy Center", label: "AI Policy Center", icon: ShieldAlert },
          { id: "Test Sandbox", label: "Test Sandbox", icon: Beaker },
          { id: "Change Logs", label: "Change Logs", icon: History },
          { id: "Import", label: "Import", icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                isActive
                  ? "bg-white text-title border border-slate-200 shadow-sm font-bold"
                  : "text-description hover:text-slate-600 hover:bg-slate-50 font-medium"
              }`}
            >
              <Icon
                size={16}
                className={isActive ? "text-emerald-500" : "text-slate-300"}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "Dashboard" && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
                <Globe size={16} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-tight">
                  {stats.programsWithRules}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Programs with Rules
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px]">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-tight">
                  {stats.activeRules}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Active Rules
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px]">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-400 mb-2">
                <Edit size={16} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-tight">
                  {stats.draftRules}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Draft Rules
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px]">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 mb-2">
                <Trash2 size={16} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-tight">
                  {stats.archivedRules}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Archived Rules
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px]">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                <BookOpen size={16} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-tight">
                  {stats.totalRules}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Total Rules
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px]">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 mb-2">
                <FlaskConical size={16} />
              </div>
              <div>
                <div className="text-[22px] font-bold text-slate-900 leading-tight">
                  {stats.testedCount}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Engine Ready
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Recently Modified Rules */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-title">
                    Recently Modified Rules
                  </h3>
                  <p className="text-xs text-description mt-0.5">
                    Live criteria evaluated during user assessments
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setModalDefaultProgramId(undefined);
                      setModalDefaultStreamId(undefined);
                      setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg transition-colors border border-emerald-200"
                  >
                    <Plus size={14} />
                    New Rule
                  </button>
                  <button
                    onClick={() => handleTabChange("Rule Builder")}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    Manage &rarr;
                  </button>
                </div>
              </div>

              {allRulesCombined.length === 0 ? (
                <div className="text-sm text-description py-12 text-center flex-1 flex flex-col items-center justify-center">
                  <FileText size={32} className="text-slate-300 mb-2" />
                  <p>No rules found in system.</p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
                  >
                    + Create First Rule
                  </button>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {allRulesCombined.slice(0, 6).map((rule: any) => {
                    const stream = streamMap[rule.streamId];
                    return (
                      <div
                        key={rule.id || rule._id}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-title truncate">
                              {rule.ruleName || "Unnamed Rule"}
                            </p>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold capitalize">
                              {(rule.ruleCategory || "general").replace(/_/g, " ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-description truncate">
                            <span className="truncate">
                              {stream?.streamName ? stream.streamName : "General Stream"}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-700">
                              {rule.operator || "CONDITION"} {rule.comparisonValue || ""}
                            </span>
                            {rule.weightPercentage !== undefined && rule.weightPercentage !== null && (
                              <>
                                <span>•</span>
                                <span>{rule.weightPercentage}% weight</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                              rule.status?.toUpperCase() === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {rule.status || "DRAFT"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Programs & Rule Coverage */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col p-6">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-title">
                    Programs & Rule Coverage
                  </h3>
                  <p className="text-xs text-description mt-0.5">
                    Eligibility rule distribution across immigration programs
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  {programsList.length} Active Programs
                </span>
              </div>

              {programCoverage.length === 0 ? (
                <div className="text-sm text-description py-12 text-center flex-1 flex flex-col items-center justify-center">
                  <p>No immigration programs found.</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[380px] space-y-3 pr-1 flex-1">
                  {programCoverage.map((prog: any) => (
                    <div
                      key={prog.id}
                      className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-bold text-title truncate">
                          {prog.name}
                        </p>
                        <p className="text-xs text-description mt-0.5">
                          {prog.rulesCount} rules · {prog.activeRulesCount} active · {prog.streamsCount} streams
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        {prog.hasRules ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                            <Check size={12} />
                            {prog.rulesCount} RULES
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                              NO RULES
                            </span>
                            <button
                              onClick={() => openAddRuleForProgram(prog.id)}
                              className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 transition-colors"
                            >
                              + Add Rule
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                  Recent Engine Activity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological audit of rule formulation, adjustments, and engine synchronization
                </p>
              </div>
              <button
                onClick={() => handleTabChange("Change Logs")}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                View Full Logs &rarr;
              </button>
            </div>

            {recentActivities.length === 0 ? (
              <div className="text-sm text-description py-4">No recent activity detected.</div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act: any) => (
                  <div
                    key={act.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-2.5 border-b border-slate-100 last:border-0 gap-2"
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-slate-400 font-mono text-[11px]">
                        {act.dateStr}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        {act.action}
                      </span>
                      <span className="font-bold text-title">{act.ruleName}</span>
                      <span className="text-description hidden sm:inline">
                        for <span className="text-slate-700 font-medium">{act.streamName}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        {act.type}
                      </span>
                      <button
                        onClick={() => handleTabChange("Test Sandbox")}
                        className="text-slate-500 hover:text-emerald-600 font-semibold text-xs"
                      >
                        Simulate &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      <AddRuleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setModalDefaultProgramId(undefined);
          setModalDefaultStreamId(undefined);
        }}
        onSubmit={handleCreateRuleSubmit}
        isLoading={isCreatingRule}
        defaultProgramId={modalDefaultProgramId}
        defaultStreamId={modalDefaultStreamId}
      />

      {activeTab === "Rule Builder" && <RuleBuilder />}
      {activeTab === "Scoring & Weights" && <ScoringAndWeights />}
      {activeTab === "CRS Engine" && <CRSEngine />}
      {activeTab === "AI Recommendations" && <AiRecommendations />}
      {activeTab === "AI Policy Center" && <AiPolicyCenter />}
      {activeTab === "Test Sandbox" && <TestSandbox />}
      {activeTab === "Change Logs" && <ChangeLogs />}
      {activeTab === "Import" && <RuleImport />}
    </div>
  );
}
