"use client";

import { Pagination } from "@/components/ui/Pagination";
import {
  useDeleteProgramMutation,
  useGetAllProgramQuery,
  useUpdateProgramMutation,
} from "@/redux/api/programApi";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  ChevronDown,
  Loader2,
  RefreshCw,
  Search,
  Square,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

const CATEGORY_OPTIONS = [
  "Economic",
  "PNP",
  "Work",
  "Study",
  "Family",
  "Humanitarian",
  "PR",
];

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "ARCHIVED"];

const VISIBILITY_OPTIONS = ["Visible to Users", "Admin Only", "Hidden"];

const PRIORITY_OPTIONS = ["High", "Normal", "Low"];

// Helper to extract clean description and structured metadata
const parseProgramMetadata = (rawDesc: string | undefined | null) => {
  if (!rawDesc) {
    return { cleanDescription: "", metadata: {} as Record<string, any> };
  }
  if (rawDesc.includes("<!--DERMAINE_METADATA-->")) {
    const [clean, meta] = rawDesc.split("<!--DERMAINE_METADATA-->");
    try {
      const parsed = JSON.parse(meta || "{}");
      return { cleanDescription: (clean || "").trim(), metadata: parsed };
    } catch {
      return { cleanDescription: (clean || "").trim(), metadata: {} };
    }
  }
  return { cleanDescription: rawDesc.trim(), metadata: {} };
};

export default function BulkActions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionType, setActionType] = useState<
    "category" | "status" | "visibility" | "priority"
  >("category");
  const [targetValue, setTargetValue] = useState<string>("Humanitarian");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Live program query
  const {
    data: programResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllProgramQuery({ limit: 100 });

  const [updateProgram] = useUpdateProgramMutation();
  const [deleteProgram] = useDeleteProgramMutation();

  const programs: any[] = useMemo(() => {
    return (
      programResponse?.data?.items ||
      programResponse?.result?.items ||
      programResponse?.items ||
      []
    );
  }, [programResponse]);

  // Sync default targetValue when actionType changes
  useEffect(() => {
    switch (actionType) {
      case "category":
        setTargetValue("Humanitarian");
        break;
      case "status":
        setTargetValue("ACTIVE");
        break;
      case "visibility":
        setTargetValue("Visible to Users");
        break;
      case "priority":
        setTargetValue("Normal");
        break;
    }
  }, [actionType]);

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    if (!searchTerm.trim()) return programs;
    const q = searchTerm.toLowerCase();
    return programs.filter((p: any) => {
      const name = (p.name || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const prov = (p.province || "").toLowerCase();
      return name.includes(q) || cat.includes(q) || prov.includes(q);
    });
  }, [programs, searchTerm]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPrograms = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredPrograms.slice(start, start + pageSize);
  }, [filteredPrograms, safeCurrentPage, pageSize]);

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all visible / filtered
  const selectAll = () => {
    const allFilteredIds = filteredPrograms.map((p: any) => String(p.id || p._id));
    setSelectedIds(allFilteredIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk Apply Action
  const handleBulkApply = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one program.");
      return;
    }

    const actionLabels: Record<string, string> = {
      category: `Category to "${targetValue}"`,
      status: `Status to "${targetValue}"`,
      visibility: `Visibility to "${targetValue}"`,
      priority: `Priority to "${targetValue}"`,
    };

    const confirmResult = await Swal.fire({
      title: "Apply Bulk Update?",
      html: `You are about to update <b>${selectedIds.length}</b> program${
        selectedIds.length > 1 ? "s" : ""
      } to <b>${actionLabels[actionType]}</b>.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#00a859",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Apply Updates",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    setIsProcessing(true);
    setProcessingAction("apply");
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      const prog = programs.find((p: any) => String(p.id || p._id) === id);
      if (!prog) continue;

      try {
        let payload: any = {};

        if (actionType === "category") {
          payload = { category: targetValue };
        } else if (actionType === "status") {
          payload = { status: targetValue };
        } else if (actionType === "visibility" || actionType === "priority") {
          const { cleanDescription, metadata } = parseProgramMetadata(
            prog.description
          );
          const updatedMetadata = {
            ...metadata,
            [actionType]: targetValue,
          };
          const finalDescription = cleanDescription
            ? `${cleanDescription}\n<!--DERMAINE_METADATA-->${JSON.stringify(
                updatedMetadata
              )}`
            : `<!--DERMAINE_METADATA-->${JSON.stringify(updatedMetadata)}`;
          payload = { description: finalDescription };
        }

        await updateProgram({ id, data: payload }).unwrap();
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    setIsProcessing(false);
    setProcessingAction(null);

    if (successCount > 0) {
      toast.success(
        `Successfully updated ${successCount} program${
          successCount > 1 ? "s" : ""
        }!`
      );
      refetch();
    }
    if (failCount > 0) {
      toast.error(`Failed to update ${failCount} program(s).`);
    }
  };

  // Bulk Delete Action
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one program.");
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Delete Selected Programs?",
      html: `Are you sure you want to permanently delete <b>${selectedIds.length}</b> selected program${
        selectedIds.length > 1 ? "s" : ""
      }?<br/><span class="text-sm text-red-500">This action cannot be undone!</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff5a5f",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete Them",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    setIsProcessing(true);
    setProcessingAction("delete");
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        await deleteProgram({ id }).unwrap();
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsProcessing(false);
    setProcessingAction(null);

    if (successCount > 0) {
      toast.success(
        `Deleted ${successCount} program${successCount > 1 ? "s" : ""}!`
      );
      setSelectedIds((prev) => prev.filter((id) => !selectedIds.includes(id)));
      refetch();
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} program(s).`);
    }
  };

  return (
    <div className="font-sans text-title space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#00a859] bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={selectAll}
            className="flex items-center justify-between gap-3 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors w-32 font-medium text-sm md:text-base bg-white"
            title="Select all matching programs"
          >
            <span>All({filteredPrograms.length})</span>
            <CheckSquare className="w-5 h-5 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={clearSelection}
            disabled={selectedIds.length === 0}
            className="flex items-center justify-between gap-3 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors w-32 font-medium text-sm md:text-base bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear current selection"
          >
            <span>Clear</span>
            <Square className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      <div
        className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl transition-all ${
          selectedIds.length > 0
            ? "bg-[#e8f7ed] border border-[#a3e0b9] shadow-xs"
            : "bg-slate-50 border border-slate-200"
        }`}
      >
        <span
          className={`font-semibold text-sm md:text-base whitespace-nowrap min-w-[90px] ${
            selectedIds.length > 0 ? "text-[#00a859]" : "text-slate-500"
          }`}
        >
          {selectedIds.length} Selected
        </span>

        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
          {/* Action Selector */}
          <div className="relative w-full sm:w-56">
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as any)}
              disabled={selectedIds.length === 0 || isProcessing}
              className="w-full appearance-none px-4 py-2 pr-9 border border-[#a3e0b9] rounded-lg bg-white text-slate-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#00a859] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="category">Set Category</option>
              <option value="status">Set Status</option>
              <option value="visibility">Set Visibility</option>
              <option value="priority">Set Priority</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Value Selector */}
          <div className="relative w-full sm:w-56">
            <select
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              disabled={selectedIds.length === 0 || isProcessing}
              className="w-full appearance-none px-4 py-2 pr-9 border border-[#a3e0b9] rounded-lg bg-white text-slate-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#00a859] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {actionType === "category" &&
                CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              {actionType === "status" &&
                STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              {actionType === "visibility" &&
                VISIBILITY_OPTIONS.map((vis) => (
                  <option key={vis} value={vis}>
                    {vis}
                  </option>
                ))}
              {actionType === "priority" &&
                PRIORITY_OPTIONS.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleBulkApply}
            disabled={selectedIds.length === 0 || isProcessing}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#00a859] text-white rounded-lg font-semibold hover:bg-[#00924c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {isProcessing && processingAction === "apply" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <span>Apply</span>
            )}
          </button>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0 || isProcessing}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#ff5a5f] text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {isProcessing && processingAction === "delete" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Selected</span>
            )}
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-[#00a859]" />
            <span className="text-sm font-medium">Loading programs from database...</span>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <p className="font-semibold text-base md:text-lg text-slate-700">No programs found</p>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search query or create a program first in Program Library.
            </p>
          </div>
        ) : (
          paginatedPrograms.map((prog: any) => {
            const id = String(prog.id || prog._id);
            const isSelected = selectedIds.includes(id);
            const status = (prog.status || "ACTIVE").toUpperCase();
            const isActive = status === "ACTIVE";
            const { metadata } = parseProgramMetadata(prog.description);
            const priority = metadata.priority || prog.priority || "Normal";
            const visibility = metadata.visibility || "Visible to Users";
            const category = prog.category || "General";

            return (
              <div
                key={id}
                onClick={() => toggleSelection(id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#00a859] bg-[#f8fdf9] ring-1 ring-[#00a859]/30"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="pt-1 shrink-0">
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-[#00a859]" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base md:text-lg truncate">
                      {prog.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        isActive
                          ? "bg-[#dcfce7] text-[#166534]"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {isActive ? "Active" : prog.status || "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-slate-400">
                    <span className="capitalize">{category}</span> &middot; Priority{" "}
                    {priority} &middot; {visibility}
                    {prog.province ? ` &middot; ${prog.province}` : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {filteredPrograms.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
            <p className="text-sm md:text-base text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(safeCurrentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(safeCurrentPage * pageSize, filteredPrograms.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {filteredPrograms.length}
              </span>{" "}
              programs
            </p>
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
