"use client";

import { CustomModal } from "@/components/modal/CustomModal";
import InputField from "@/components/ui/InputField";
import CRSFactorEditor from "./CRSFactorEditor";
import CRSScoreTables from "./CRSScoreTables";
import CRSCalculator from "./CRSCalculator";
import CRSModelCompare from "./CRSModelCompare";
import {
  Archive,
  Calculator,
  CalendarDays,
  Copy,
  GitCompare,
  Play,
  Plus,
  Table,
  CheckCircle2,
  Trash2,
  Edit,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { FaUserLock } from "react-icons/fa";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface CRSModel {
  id: string;
  name: string;
  effectiveDate: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  notes?: string;
}

const DEFAULT_MODELS: CRSModel[] = [
  {
    id: "model-work-permit",
    name: "Work Permit model",
    effectiveDate: "24/05/26",
    status: "INACTIVE",
    notes: "Customized scoring framework tailored for work permit transition pathways.",
  },
  {
    id: "model-standard-2024",
    name: "Standard CRS 2024",
    effectiveDate: "01/01/24",
    status: "ACTIVE",
    notes: "Official active baseline model used by all candidate assessments and reports.",
  },
];

export default function CRSEngine() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const subTabParam = searchParams.get("subtab");
  const activeSubTab = subTabParam || "CRS Model";

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("subtab", tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const [models, setModels] = useState<CRSModel[]>(DEFAULT_MODELS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [newModelDate, setNewModelDate] = useState("24/05/26");
  const [newModelNotes, setNewModelNotes] = useState("");

  // Load models from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("DERMAINE_CRS_MODELS");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setModels(parsed);
        }
      }
    } catch {}
  }, []);

  const saveModelsToStorage = (updated: CRSModel[]) => {
    setModels(updated);
    try {
      localStorage.setItem("DERMAINE_CRS_MODELS", JSON.stringify(updated));
    } catch {}
  };

  const activeModel = useMemo(() => {
    return models.find((m) => m.status === "ACTIVE") || models[0] || DEFAULT_MODELS[1];
  }, [models]);

  const handleActivateModel = (id: string) => {
    const updated = models.map((m) => {
      if (m.id === id) {
        return { ...m, status: "ACTIVE" as const };
      }
      return m.status === "ACTIVE" ? { ...m, status: "INACTIVE" as const } : m;
    });
    saveModelsToStorage(updated);
    const activated = updated.find((m) => m.id === id);
    toast.success(`"${activated?.name}" is now the Live Model used by all assessments!`);
  };

  const handleCloneModel = (id: string) => {
    const source = models.find((m) => m.id === id);
    if (!source) return;
    const clone: CRSModel = {
      id: "model-" + Date.now(),
      name: `${source.name} (Copy)`,
      effectiveDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }),
      status: "INACTIVE",
      notes: `Cloned from ${source.name}. ${source.notes || ""}`,
    };
    const updated = [clone, ...models];
    saveModelsToStorage(updated);
    toast.success(`Cloned model created: "${clone.name}"`);
  };

  const handleArchiveModel = async (id: string) => {
    const model = models.find((m) => m.id === id);
    if (!model) return;
    if (model.status === "ACTIVE") {
      toast.error("Cannot archive the currently active live model. Activate another model first.");
      return;
    }

    const result = await Swal.fire({
      title: `Archive "${model.name}"?`,
      text: "This model will be deactivated and moved to archive status.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00a859",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, Archive",
    });

    if (result.isConfirmed) {
      const updated = models.map((m) => (m.id === id ? { ...m, status: "ARCHIVED" as const } : m));
      saveModelsToStorage(updated);
      toast.success(`Model "${model.name}" archived.`);
    }
  };

  const handleCreateModel = () => {
    if (!newModelName.trim()) {
      toast.error("Please enter a model name.");
      return;
    }

    const newModel: CRSModel = {
      id: "model-" + Date.now(),
      name: newModelName.trim(),
      effectiveDate: newModelDate.trim() || new Date().toLocaleDateString("en-GB"),
      status: "INACTIVE",
      notes: newModelNotes.trim() || "Custom CRS scoring model.",
    };

    const updated = [newModel, ...models];
    saveModelsToStorage(updated);
    toast.success(`New model "${newModel.name}" created successfully!`);
    setIsModalOpen(false);
    setNewModelName("");
    setNewModelNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Active Model Banner */}
      <div className="bg-[#Edfaf3] border border-[#A7E2C3] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-base md:text-lg text-title">
          <span className="font-medium">Live Model:</span>{" "}
          <span className="font-bold text-slate-900">{activeModel.name}</span>
        </div>
        <div className="bg-[#B9E9CF] text-[#2D7A5D] px-4 py-1.5 rounded-md text-sm md:text-base font-semibold">
          Used by all assessments & reports.
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {[
          { id: "CRS Model", icon: CalendarDays },
          { id: "Factor Editor", icon: FaUserLock },
          { id: "Score Tables", icon: Table },
          { id: "CRS calculator", icon: Calculator },
          { id: "Compare models", icon: GitCompare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 transition-all rounded-full ${
                isActive
                  ? "bg-white shadow-sm text-title font-bold border border-slate-200"
                  : "text-slate-500 hover:text-slate-700 font-medium hover:bg-slate-50"
              }`}
            >
              <Icon size={18} className={isActive ? "text-emerald-600" : ""} />
              <span className="text-sm md:text-base">{tab.id}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      {activeSubTab === "CRS Model" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-title mb-1">
                Manage CRS Models
              </h2>
              <p className="text-xs sm:text-sm text-description">
                Create, clone, activate, and archive CRS scoring models. Only one model can be active at a time.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#00a859] hover:bg-[#00904c] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus size={16} />
              New Model
            </button>
          </div>

          <div className="space-y-4">
            {models
              .filter((m) => m.status !== "ARCHIVED")
              .map((model) => {
                const isActive = model.status === "ACTIVE";
                return (
                  <div
                    key={model.id}
                    className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                      isActive ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="text-base font-bold text-slate-900">
                          {model.name}
                        </h3>
                        {isActive && (
                          <span className="bg-[#Edfaf3] text-[#2D7A5D] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Effective: {model.effectiveDate}
                        {model.notes ? ` • ${model.notes}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                      {isActive ? (
                        <button
                          disabled
                          className="flex items-center gap-1.5 px-3.5 py-1.5 border border-emerald-500 text-emerald-700 bg-emerald-50 rounded-lg text-xs font-semibold cursor-default"
                        >
                          <Play size={14} className="fill-emerald-600 text-emerald-600" />
                          Live
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateModel(model.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Play size={14} />
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => handleCloneModel(model.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                      >
                        <Copy size={14} />
                        Clone
                      </button>

                      {!isActive && (
                        <button
                          onClick={() => handleArchiveModel(model.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                        >
                          <Archive size={14} />
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {activeSubTab === "Factor Editor" && <CRSFactorEditor />}
      {activeSubTab === "Score Tables" && <CRSScoreTables />}
      {activeSubTab === "CRS calculator" && <CRSCalculator />}
      {activeSubTab === "Compare models" && <CRSModelCompare />}

      {/* Create Model Modal */}
      <CustomModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xl"
        title="Create New CRS Model"
        actions={[
          {
            label: "Cancel",
            onClick: () => setIsModalOpen(false),
            variant: "secondary",
          },
          {
            label: "Create Model",
            onClick: handleCreateModel,
            variant: "primary",
          },
        ]}
      >
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Model Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Express Entry 2026 Revision"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00a859] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Effective Start Date
            </label>
            <input
              type="text"
              placeholder="e.g. 24/05/26"
              value={newModelDate}
              onChange={(e) => setNewModelDate(e.target.value)}
              className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00a859] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Purpose & Notes
            </label>
            <textarea
              placeholder="Describe the purpose, target streams, and revision changes of this model..."
              value={newModelNotes}
              onChange={(e) => setNewModelNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a859] min-h-[90px] resize-y"
            />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
