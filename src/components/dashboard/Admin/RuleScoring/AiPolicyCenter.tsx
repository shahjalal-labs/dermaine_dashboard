"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Trash2,
  Globe,
  FileText,
  FileEdit,
  Megaphone,
  FileCheck,
  ClipboardPaste,
  BookOpen,
  Check,
  X,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface ProposedChange {
  id: string;
  ruleTitle: string;
  program: string;
  stream: string;
  category: string;
  currentValue: string;
  proposedValue: string;
  reasoning: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface PolicyUpdate {
  id: string;
  title: string;
  sourceType: string;
  sourceTypeLabel: string;
  content: string;
  notes?: string;
  date: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "APPLIED" | "REJECTED";
  proposedChanges: ProposedChange[];
}

const SOURCE_TYPES = [
  { id: "paste_text", label: "Paste Text", icon: ClipboardPaste },
  { id: "website_url", label: "Website URL", icon: Globe },
  { id: "pdf_upload", label: "PDF Upload", icon: FileText },
  { id: "word_doc", label: "Word Document", icon: FileEdit },
  { id: "manual_notes", label: "Manual Notes", icon: BookOpen },
  { id: "program_guide", label: "Program Guide Text", icon: FileText },
  { id: "provincial_announcement", label: "Provincial Announcement", icon: Megaphone },
  { id: "ircc_update", label: "IRCC Policy Update", icon: FileCheck },
];

export default function AiPolicyCenter() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [updates, setUpdates] = useState<PolicyUpdate[]>([]);
  const [selectedUpdateForReview, setSelectedUpdateForReview] = useState<PolicyUpdate | null>(null);

  // Form State
  const [updateTitle, setUpdateTitle] = useState("");
  const [selectedSourceType, setSelectedSourceType] = useState("paste_text");
  const [content, setContent] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load saved updates from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("DERMAINE_POLICY_UPDATES");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setUpdates(parsed);
        }
      }
    } catch {}
  }, []);

  const saveUpdatesToStorage = (newUpdates: PolicyUpdate[]) => {
    setUpdates(newUpdates);
    try {
      localStorage.setItem("DERMAINE_POLICY_UPDATES", JSON.stringify(newUpdates));
    } catch {}
  };

  // AI Policy Analysis & Rule Proposal Generation
  const handleAnalyzePolicy = () => {
    if (!updateTitle.trim()) {
      toast.error("Please enter an update title.");
      return;
    }
    if (!content.trim()) {
      toast.error("Please provide the policy update content.");
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);

      const sourceObj = SOURCE_TYPES.find((s) => s.id === selectedSourceType);
      const titleLower = updateTitle.toLowerCase();
      const contentLower = content.toLowerCase();

      // Synthesize realistic proposed rule modifications based on policy content
      const proposed: ProposedChange[] = [];

      if (titleLower.includes("draw") || titleLower.includes("crs") || contentLower.includes("crs")) {
        proposed.push({
          id: `prop-${Date.now()}-1`,
          ruleTitle: "Express Entry Minimum Cutoff Threshold",
          program: "Express Entry",
          stream: "Federal Skilled Worker",
          category: "CRS Score",
          currentValue: "CRS >= 495",
          proposedValue: "CRS >= 510",
          reasoning: "Draw results demonstrate higher cutoff baseline for general draws.",
          status: "PENDING",
        });
      }

      if (titleLower.includes("stem") || contentLower.includes("tech") || titleLower.includes("tech")) {
        proposed.push({
          id: `prop-${Date.now()}-2`,
          ruleTitle: "Category-Based STEM Occupation Targeted Selection",
          program: "Express Entry",
          stream: "STEM Category Stream",
          category: "Occupation Condition",
          currentValue: "TEER 0/1/2 General",
          proposedValue: "Prioritized 35 In-Demand Tech NOCs",
          reasoning: "IRCC policy directive allocates dedicated rounds of invitations for STEM occupations.",
          status: "PENDING",
        });
      }

      if (titleLower.includes("ontario") || titleLower.includes("oinp") || contentLower.includes("oinp")) {
        proposed.push({
          id: `prop-${Date.now()}-3`,
          ruleTitle: "OINP Human Capital Priorities Language Threshold",
          program: "Ontario Immigrant Nominee Program",
          stream: "Human Capital Priorities",
          category: "Language Score",
          currentValue: "CLB 7 Minimum",
          proposedValue: "CLB 8 Preferred (+5 pts weight)",
          reasoning: "Updated provincial scoring matrix awards elevated bonus points for higher official language proficiency.",
          status: "PENDING",
        });
      }

      // Default fallback rule proposal if generic
      if (proposed.length === 0) {
        proposed.push({
          id: `prop-${Date.now()}-1`,
          ruleTitle: `${updateTitle} - Eligibility Criteria Update`,
          program: "Federal & Provincial Immigration Programs",
          stream: "Target Streams",
          category: "Eligibility & Scoring",
          currentValue: "Existing Rule Baseline",
          proposedValue: "Updated criteria aligned with recent ministerial instructions",
          reasoning: `Extracted directly from policy text: "${updateTitle}". Requires admin verification.`,
          status: "PENDING",
        });
      }

      const newUpdate: PolicyUpdate = {
        id: `update-${Date.now()}`,
        title: updateTitle.trim(),
        sourceType: selectedSourceType,
        sourceTypeLabel: sourceObj?.label || "Paste Text",
        content: content.trim(),
        notes: additionalNotes.trim() || undefined,
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        status: "PENDING_APPROVAL",
        proposedChanges: proposed,
      };

      const updatedList = [newUpdate, ...updates];
      saveUpdatesToStorage(updatedList);

      // Reset form
      setUpdateTitle("");
      setContent("");
      setAdditionalNotes("");
      setIsUploadOpen(false);

      toast.success("Policy update analyzed! Proposed rule changes are ready for your review.");
      setSelectedUpdateForReview(newUpdate);
    }, 750);
  };

  const handleApproveAllChanges = (updateId: string) => {
    const updated = updates.map((u) => {
      if (u.id === updateId) {
        return {
          ...u,
          status: "APPLIED" as const,
          proposedChanges: u.proposedChanges.map((c) => ({
            ...c,
            status: "APPROVED" as const,
          })),
        };
      }
      return u;
    });

    saveUpdatesToStorage(updated);
    if (selectedUpdateForReview?.id === updateId) {
      setSelectedUpdateForReview((prev) =>
        prev
          ? {
              ...prev,
              status: "APPLIED",
              proposedChanges: prev.proposedChanges.map((c) => ({
                ...c,
                status: "APPROVED",
              })),
            }
          : null
      );
    }

    toast.success("Policy changes approved and applied to Rule Engine!");
  };

  const handleRejectUpdate = (updateId: string) => {
    const updated = updates.map((u) => {
      if (u.id === updateId) {
        return {
          ...u,
          status: "REJECTED" as const,
          proposedChanges: u.proposedChanges.map((c) => ({
            ...c,
            status: "REJECTED" as const,
          })),
        };
      }
      return u;
    });

    saveUpdatesToStorage(updated);
    if (selectedUpdateForReview?.id === updateId) {
      setSelectedUpdateForReview((prev) =>
        prev ? { ...prev, status: "REJECTED" } : null
      );
    }
    toast.info("Policy update rejected.");
  };

  const handleDeleteUpdate = (updateId: string) => {
    Swal.fire({
      title: "Delete Policy Update?",
      text: "This update and its proposed rule modifications will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
    }).then((res) => {
      if (res.isConfirmed) {
        const filtered = updates.filter((u) => u.id !== updateId);
        saveUpdatesToStorage(filtered);
        if (selectedUpdateForReview?.id === updateId) {
          setSelectedUpdateForReview(null);
        }
        toast.success("Policy update deleted.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            AI Policy Center
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Upload immigration updates &rarr; AI proposes rule changes &rarr; Admin reviews & approves &rarr; Rules update automatically
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isUploadOpen ? (
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Updates</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="bg-[#00a859] hover:bg-[#00904c] text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Upload New Update</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW A: UPLOAD FORM VIEW (Screenshot 2) */}
      {isUploadOpen ? (
        <div className="space-y-6">
          {/* 1. Update Title */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Update Title
            </label>
            <input
              type="text"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              placeholder="e.g. IRCC Express Entry Draw #300 - New CRS Threshold"
              className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
            />
          </div>

          {/* 2. Source Type Selector (8 Cards in 4-column grid) */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Update Title
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SOURCE_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isSelected = selectedSourceType === type.id;
                return (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setSelectedSourceType(type.id)}
                    className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-center cursor-pointer ${
                      isSelected
                        ? "border-[#00a859] ring-2 ring-[#00a859]/20 bg-[#00a859]/5 text-[#00a859]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-700"
                    }`}
                  >
                    <IconComponent
                      className={`w-6 h-6 ${
                        isSelected ? "text-[#00a859]" : "text-slate-700"
                      }`}
                    />
                    <span className="text-xs font-semibold">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Enter Content */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Enter content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the full text of the immigration policy update here..."
              rows={6}
              className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] resize-none transition-all"
            />
          </div>

          {/* 4. Additional Notes (Optional) */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any context or notes about this update..."
              className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
            />
          </div>

          {/* 5. Analyze Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAnalyzePolicy}
              disabled={isAnalyzing}
              className="w-full h-12 bg-[#00a859] hover:bg-[#00904c] text-white font-medium rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all disabled:opacity-75 cursor-pointer active:scale-[0.99]"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              <span>
                {isAnalyzing
                  ? "Analyzing Policy Update with AI..."
                  : "Analyze Policy Update with AI"}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* VIEW B: MAIN LIST VIEW (Screenshot 1) */
        <div className="space-y-6">
          {/* Safety Rule Notice */}
          <div className="border border-amber-300 bg-amber-50/60 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-sm">
            <span className="font-bold text-slate-900">Safety Rule:</span> AI will never automatically publish immigration rule changes. All proposed changes require admin review and approval before affecting users, reports, or pathway matches.
          </div>

          {/* Empty State vs List */}
          {updates.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
              <p className="text-slate-500 font-medium text-sm md:text-base">
                No policy updates uploaded yet. Use &ldquo;Upload New Update&rdquo; to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700">
                  Uploaded Policy Updates ({updates.length})
                </h3>
                <span className="text-xs text-slate-500">
                  {updates.filter((u) => u.status === "PENDING_APPROVAL").length} pending approval
                </span>
              </div>

              <div className="space-y-3">
                {updates.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                          {item.sourceTypeLabel}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            item.status === "APPLIED" || item.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status === "APPLIED"
                            ? "Applied"
                            : item.status === "APPROVED"
                            ? "Approved"
                            : item.status === "REJECTED"
                            ? "Rejected"
                            : "Pending Approval"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1">
                        {item.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Layers className="w-3.5 h-3.5 text-purple-600" />
                          {item.proposedChanges.length} proposed rule change
                          {item.proposedChanges.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedUpdateForReview(item)}
                        className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      >
                        Review Changes
                      </button>

                      {item.status === "PENDING_APPROVAL" && (
                        <button
                          type="button"
                          onClick={() => handleApproveAllChanges(item.id)}
                          className="px-3.5 py-2 bg-[#00a859] hover:bg-[#00904c] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteUpdate(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete update"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review & Approve Proposed Changes Modal */}
      {selectedUpdateForReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  AI Rule Synthesis Review
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedUpdateForReview.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUpdateForReview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-700 block">Original Policy Source Content:</span>
              <p className="whitespace-pre-wrap line-clamp-3">{selectedUpdateForReview.content}</p>
              {selectedUpdateForReview.notes && (
                <p className="italic text-slate-500 pt-1">Notes: {selectedUpdateForReview.notes}</p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00a859]" />
                Proposed Rule Changes ({selectedUpdateForReview.proposedChanges.length})
              </h4>

              <div className="space-y-3">
                {selectedUpdateForReview.proposedChanges.map((change) => (
                  <div
                    key={change.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {change.ruleTitle}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                        {change.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 block mb-0.5 uppercase">
                          Current Rule
                        </span>
                        <span className="text-slate-700 font-semibold">{change.currentValue}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                        <span className="text-[11px] font-bold text-emerald-600 block mb-0.5 uppercase">
                          AI Proposed Update
                        </span>
                        <span className="text-emerald-900 font-bold">{change.proposedValue}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 pt-1">
                      <span className="font-medium text-slate-700">Policy Rationale: </span>
                      {change.reasoning}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUpdateForReview(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedUpdateForReview.status !== "REJECTED" && (
                <button
                  type="button"
                  onClick={() => handleRejectUpdate(selectedUpdateForReview.id)}
                  className="px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  Reject Update
                </button>
              )}

              {selectedUpdateForReview.status !== "APPLIED" && (
                <button
                  type="button"
                  onClick={() => handleApproveAllChanges(selectedUpdateForReview.id)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#00a859] hover:bg-[#00904c] rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Approve & Apply to Rules
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
