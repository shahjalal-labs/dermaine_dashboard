"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  useCreateRuleMutation,
  useDeleteRuleMutation,
  useGetAllRulesQuery,
  useUpdateRuleMutation,
} from "@/redux/api/ruleApi";
import { useGetAllProgramQuery } from "@/redux/api/programApi";
import { useGetAllStreamQuery } from "@/redux/api/stremApi";
import {
  ChevronDown,
  Edit,
  Loader,
  Plus,
  Trash2,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import AddRuleModal from "./AddRuleModal";

export default function RuleBuilder() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const [selectedProgramId, setSelectedProgramId] = useState<string>("all");
  const [selectedStreamId, setSelectedStreamId] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggleRule = (id: string) => {
    setExpandedRules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { data: rulesData, isLoading: isFetchingRules } = useGetAllRulesQuery({
    page: 1,
    limit: 100,
  });
  const { data: programsData } = useGetAllProgramQuery({ page: 1, limit: 100 });
  const { data: streamsData } = useGetAllStreamQuery({});

  const programs = useMemo(() => {
    const raw = programsData?.data?.items || programsData?.result?.items || programsData?.data || programsData?.result || [];
    return Array.isArray(raw) ? raw : [];
  }, [programsData]);

  const streams = useMemo(() => {
    const raw = streamsData?.data?.items || streamsData?.result?.items || streamsData?.data || streamsData?.result || [];
    return Array.isArray(raw) ? raw : [];
  }, [streamsData]);

  const streamMap = useMemo(() => {
    const map: Record<string, any> = {};
    streams.forEach((s: any) => {
      map[s.id || s._id] = s;
    });
    return map;
  }, [streams]);

  const programMap = useMemo(() => {
    const map: Record<string, any> = {};
    programs.forEach((p: any) => {
      map[p.id || p._id] = p;
    });
    return map;
  }, [programs]);

  const availableStreams = useMemo(() => {
    if (selectedProgramId === "all") return streams;
    return streams.filter((s: any) => s.programId === selectedProgramId);
  }, [streams, selectedProgramId]);

  const rules = useMemo(() => {
    const raw =
      rulesData?.data?.items ||
      rulesData?.result?.items ||
      rulesData?.data ||
      rulesData?.result ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [rulesData]);

  const filteredRules = useMemo(() => {
    return rules.filter((rule: any) => {
      // Program filter
      if (selectedProgramId !== "all") {
        const matchingStream = streamMap[rule.streamId];
        const ruleProgId = rule.programId || matchingStream?.programId;
        if (ruleProgId !== selectedProgramId) return false;
      }

      // Stream filter
      if (selectedStreamId !== "all" && rule.streamId !== selectedStreamId) {
        return false;
      }

      // Category filter
      if (filterCategory !== "all" && rule.ruleCategory !== filterCategory) {
        return false;
      }

      // Status filter
      if (filterStatus !== "all") {
        const ruleStatus = (rule.status || "").toLowerCase();
        if (ruleStatus !== filterStatus.toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (rule.ruleName || "").toLowerCase().includes(q);
        const catMatch = (rule.ruleCategory || "").toLowerCase().includes(q);
        const msgMatch = (rule.missingRequirementMessage || "").toLowerCase().includes(q);
        const opMatch = (rule.operator || "").toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !msgMatch && !opMatch) return false;
      }

      return true;
    });
  }, [rules, selectedProgramId, selectedStreamId, filterCategory, filterStatus, searchQuery, streamMap]);

  const [createRule, { isLoading: isCreating }] = useCreateRuleMutation();
  const [updateRule, { isLoading: isUpdating }] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();

  const isLoading = isCreating || isUpdating;

  const handleSubmitRule = async (data: any) => {
    if (!data.streamId || !data.ruleCategory || !data.operator || !data.ruleName) {
      toast.error("Please fill in all required fields (Stream ID, Rule Name, Category, Operator).");
      return;
    }

    try {
      if (editingRule) {
        await updateRule({ id: editingRule.id || editingRule._id, data }).unwrap();
        toast.success("Rule updated successfully");
      } else {
        await createRule(data).unwrap();
        toast.success("Rule created successfully");
      }
      setIsModalOpen(false);
      setEditingRule(null);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${editingRule ? "update" : "create"} rule`);
    }
  };

  const handleDeleteRule = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete this Rule?",
      text: "This rule will be permanently removed from the eligibility calculation engine.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteRule(id).unwrap();
        Swal.fire("Deleted!", "The rule has been deleted.", "success");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete rule");
      }
    }
  };

  const openAddModal = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: any) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const currentProgram = selectedProgramId !== "all" ? programMap[selectedProgramId] : null;
  const currentStream = selectedStreamId !== "all" ? streamMap[selectedStreamId] : null;

  return (
    <div className="space-y-6">
      {/* Top Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a859]"
              />
            </div>

            {/* Program Filter */}
            <Select
              value={selectedProgramId}
              onValueChange={(val) => {
                setSelectedProgramId(val);
                setSelectedStreamId("all");
              }}
            >
              <SelectTrigger className="w-full sm:w-56 h-auto px-3.5 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm text-slate-800 font-medium">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Immigration Programs</SelectItem>
                {programs.map((p: any) => (
                  <SelectItem key={p.id || p._id} value={p.id || p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stream Filter */}
            <Select value={selectedStreamId} onValueChange={setSelectedStreamId}>
              <SelectTrigger className="w-full sm:w-56 h-auto px-3.5 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm text-slate-800 font-medium">
                <SelectValue placeholder="All Streams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streams</SelectItem>
                {availableStreams.map((s: any) => (
                  <SelectItem key={s.id || s._id} value={s.id || s._id}>
                    {s.streamName || s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-44 h-auto px-3.5 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm text-slate-800 font-medium">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="language">Language</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="work_experience">Work Experience</SelectItem>
                <SelectItem value="settlement_funds">Settlement Funds</SelectItem>
                <SelectItem value="family_relationship">Family Relationship</SelectItem>
                <SelectItem value="canadian_experience">Canadian Experience</SelectItem>
                <SelectItem value="occupation">Occupation</SelectItem>
                <SelectItem value="points">Points / Scoring</SelectItem>
                <SelectItem value="crs_score">CRS Score</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-36 h-auto px-3.5 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm text-slate-800 font-medium">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-[#00a859] hover:bg-[#00904c] text-white text-sm font-bold rounded-lg shadow-sm transition-colors shrink-0"
          >
            <Plus size={18} />
            Add Rule
          </button>
        </div>
      </div>

      {/* Main Rules Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentStream ? currentStream.streamName : currentProgram ? currentProgram.name : "All Immigration Rules & Factors"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {currentProgram && !currentStream && `Program: ${currentProgram.name} • `}
              Showing {filteredRules.length} rules matching active filters ({rules.length} total in system)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {filteredRules.filter((r: any) => r.status?.toUpperCase() === "ACTIVE").length} Active in Engine
            </span>
            {filteredRules.filter((r: any) => r.status?.toUpperCase() === "DRAFT").length > 0 && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {filteredRules.filter((r: any) => r.status?.toUpperCase() === "DRAFT").length} Draft
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {isFetchingRules ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader size={36} className="animate-spin text-[#00a859] mb-3" />
              <span className="text-sm font-medium text-slate-500">
                Loading rules from engine...
              </span>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <FileText size={40} className="text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No rules found</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                No eligibility rules or scoring factors match your selected filters. Create a new rule or clear filter criteria.
              </p>
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#00a859] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-[#00904c] transition-colors"
              >
                <Plus size={16} />
                Create New Rule
              </button>
            </div>
          ) : (
            filteredRules.map((rule: any) => {
              const stream = streamMap[rule.streamId];
              const prog = programMap[rule.programId] || (stream?.programId ? programMap[stream.programId] : null);
              const isExpanded = expandedRules[rule.id] !== false;

              return (
                <div
                  key={rule.id || rule._id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:border-slate-300 transition-all"
                >
                  <div
                    className={`px-5 py-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50/70 transition-colors ${
                      isExpanded ? "border-b border-slate-100" : ""
                    }`}
                    onClick={() => toggleRule(rule.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {rule.priorityOrder ?? 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {rule.ruleName || "Unnamed Rule"}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              rule.status?.toUpperCase() === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {rule.status || "DRAFT"}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold capitalize">
                            {(rule.ruleCategory || "General").replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                          {stream?.streamName ? `${stream.streamName} • ` : ""}
                          {prog?.name || "Global Scope"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 py-4 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs animate-in slide-in-from-top-1 fade-in duration-150">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-700">Operator:</span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
                            {rule.operator} {rule.comparisonValue ? `"${rule.comparisonValue}"` : ""}
                          </span>
                          {rule.rulePurpose && (
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                              {rule.rulePurpose.replace(/_/g, " ")}
                            </span>
                          )}
                          {rule.weightPercentage !== undefined && rule.weightPercentage !== null && (
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">
                              Weight: {rule.weightPercentage}%
                            </span>
                          )}
                          {rule.maximumFactorScore && (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                              Max Score: {rule.maximumFactorScore} pts
                            </span>
                          )}
                        </div>

                        {rule.missingRequirementMessage && (
                          <div className="text-slate-600">
                            <span className="font-semibold">Missing Requirement:</span> {rule.missingRequirementMessage}
                          </div>
                        )}
                        {rule.improvementRecommendation && (
                          <div className="text-slate-500 italic">
                            <span className="font-semibold not-italic">Recommendation:</span> {rule.improvementRecommendation}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(rule);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRule(rule.id || rule._id);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddRuleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        onSubmit={handleSubmitRule}
        isLoading={isLoading}
        initialData={editingRule}
        defaultProgramId={selectedProgramId !== "all" ? selectedProgramId : undefined}
        defaultStreamId={selectedStreamId !== "all" ? selectedStreamId : undefined}
      />
    </div>
  );
}