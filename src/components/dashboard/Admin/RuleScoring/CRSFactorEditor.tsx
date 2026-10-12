"use client";

import { CustomModal } from "@/components/modal/CustomModal";
import { Plus, Trash2, Edit3, Check, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface CRSFactorItem {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  category: "core" | "spouse" | "additional";
}

const DEFAULT_FACTORS: CRSFactorItem[] = [
  // 1. Core Human Capital
  {
    id: "core-age",
    name: "Age",
    description: "Maximum point for age factor",
    maxPoints: 110,
    category: "core",
  },
  {
    id: "core-education",
    name: "Education",
    description: "Maximum point for education factor",
    maxPoints: 150,
    category: "core",
  },
  {
    id: "core-first-lang",
    name: "First Official Language",
    description: "Maximum point for 1st language factor",
    maxPoints: 136,
    category: "core",
  },
  {
    id: "core-second-lang",
    name: "Second Official Language",
    description: "Maximum point for 2nd language factor",
    maxPoints: 24,
    category: "core",
  },
  {
    id: "core-can-exp",
    name: "Canadian Work Experience",
    description: "Maximum point for experience factor",
    maxPoints: 80,
    category: "core",
  },
  {
    id: "core-skill-transfer",
    name: "Skill Transferability",
    description: "Maximum point for skill factor",
    maxPoints: 100,
    category: "core",
  },

  // 2. Spouse / Common-Law Factors
  {
    id: "spouse-education",
    name: "Spouse Education",
    description: "Max points for spouse education level",
    maxPoints: 10,
    category: "spouse",
  },
  {
    id: "spouse-language",
    name: "Spouse Language",
    description: "Max points for spouse language ability",
    maxPoints: 20,
    category: "spouse",
  },
  {
    id: "spouse-can-exp",
    name: "Spouse Canadian Experience",
    description: "Max points for spouse Canadian work experience",
    maxPoints: 10,
    category: "spouse",
  },

  // 3. Additional / Bonus Points
  {
    id: "add-pnp",
    name: "Provincial Nomination (PNP)",
    description: "Points awarded for a provincial nomination",
    maxPoints: 600,
    category: "additional",
  },
  {
    id: "add-job-noc00",
    name: "Job Offer – NOC 00 (Senior Managers)",
    description: "Points for a NOC 00 valid job offer",
    maxPoints: 200,
    category: "additional",
  },
  {
    id: "add-job-other",
    name: "Job Offer – Other NOC (TEER 1/2/3)",
    description: "Points for a non-NOC 00 valid job offer",
    maxPoints: 50,
    category: "additional",
  },
  {
    id: "add-french",
    name: "French Language Proficiency",
    description: "Bonus points for strong French skills",
    maxPoints: 50,
    category: "additional",
  },
  {
    id: "add-sibling",
    name: "Sibling in Canada",
    description: "Points for having a Canadian sibling",
    maxPoints: 15,
    category: "additional",
  },
  {
    id: "add-can-edu",
    name: "Canadian Post-Secondary Education",
    description: "Bonus for Canadian credential",
    maxPoints: 30,
    category: "additional",
  },
];

export default function CRSFactorEditor() {
  const [factors, setFactors] = useState<CRSFactorItem[]>(DEFAULT_FACTORS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactorId, setEditingFactorId] = useState<string | null>(null);
  const [editingPoints, setEditingPoints] = useState<number>(0);

  // New Factor Form State
  const [newCategory, setNewCategory] = useState<"core" | "spouse" | "additional">("core");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMaxPoints, setNewMaxPoints] = useState<number>(50);

  // Load factors from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("DERMAINE_CRS_FACTORS");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFactors(parsed);
        }
      }
    } catch {}
  }, []);

  const saveFactorsToStorage = (updated: CRSFactorItem[]) => {
    setFactors(updated);
    try {
      localStorage.setItem("DERMAINE_CRS_FACTORS", JSON.stringify(updated));
    } catch {}
  };

  const handleSaveModel = () => {
    saveFactorsToStorage(factors);
    toast.success("CRS factor configuration and model weights saved successfully!");
  };

  const handleResetDefaults = async () => {
    const result = await Swal.fire({
      title: "Reset to Official IRCC Defaults?",
      text: "All custom factor edits will be reverted to standard IRCC Comprehensive Ranking System allocations.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00a859",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, Reset Defaults",
    });

    if (result.isConfirmed) {
      saveFactorsToStorage(DEFAULT_FACTORS);
      toast.success("Restored official IRCC CRS default factor weights.");
    }
  };

  const handleDeleteFactor = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: `Remove "${name}"?`,
      text: "This factor will be excluded from the active CRS scoring model.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, Remove",
    });

    if (result.isConfirmed) {
      const updated = factors.filter((f) => f.id !== id);
      saveFactorsToStorage(updated);
      toast.success(`Removed "${name}" from CRS model.`);
    }
  };

  const startEditPoints = (factor: CRSFactorItem) => {
    setEditingFactorId(factor.id);
    setEditingPoints(factor.maxPoints);
  };

  const saveEditPoints = (id: string) => {
    const updated = factors.map((f) => (f.id === id ? { ...f, maxPoints: Number(editingPoints) || 0 } : f));
    saveFactorsToStorage(updated);
    setEditingFactorId(null);
    toast.success("Factor points updated.");
  };

  const handleAddFactor = () => {
    if (!newName.trim()) {
      toast.error("Please enter a factor name.");
      return;
    }

    const newFactor: CRSFactorItem = {
      id: "factor-" + Date.now(),
      name: newName.trim(),
      description: newDesc.trim() || `Maximum points for ${newName.trim()}`,
      maxPoints: Number(newMaxPoints) || 0,
      category: newCategory,
    };

    const updated = [...factors, newFactor];
    saveFactorsToStorage(updated);
    toast.success(`Factor "${newFactor.name}" added to model.`);
    setIsModalOpen(false);
    setNewName("");
    setNewDesc("");
    setNewMaxPoints(50);
  };

  // Grouped factors
  const coreFactors = useMemo(() => factors.filter((f) => f.category === "core"), [factors]);
  const spouseFactors = useMemo(() => factors.filter((f) => f.category === "spouse"), [factors]);
  const additionalFactors = useMemo(() => factors.filter((f) => f.category === "additional"), [factors]);

  const renderFactorRow = (factor: CRSFactorItem) => {
    const isEditing = editingFactorId === factor.id;

    return (
      <div
        key={factor.id}
        className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white shadow-sm transition-all hover:border-slate-300"
      >
        <div className="min-w-0 pr-4">
          <div className="text-[15px] font-bold text-slate-800 truncate">
            {factor.name}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 truncate">
            {factor.description}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="1200"
                value={editingPoints}
                onChange={(e) => setEditingPoints(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-emerald-500 rounded-md text-sm font-bold text-slate-900 focus:outline-none ring-1 ring-emerald-500"
                autoFocus
              />
              <button
                onClick={() => saveEditPoints(factor.id)}
                className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                title="Save Points"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEditPoints(factor)}
              className="text-right group p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              title="Click to edit max points"
            >
              <div className="text-[18px] font-bold text-[#00a859] leading-none mb-0.5 flex items-center justify-end gap-1.5">
                <span>{factor.maxPoints}</span>
                <Edit3 size={13} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[11px] text-slate-400 font-medium">pts max</div>
            </button>
          )}

          <button
            onClick={() => handleDeleteFactor(factor.id, factor.name)}
            className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
            title="Delete Factor"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-title mb-1">
            CRS Factor Management
          </h2>
          <p className="text-xs sm:text-sm text-description">
            Edit max points for each factor, disable optional factors, or add new factors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-slate-800 hover:text-slate-900 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Factor
          </button>

          <button
            onClick={handleSaveModel}
            className="flex items-center gap-1.5 bg-[#00a859] hover:bg-[#00904c] text-white px-6 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Save size={14} />
            Save Model
          </button>
        </div>
      </div>

      {/* Sections Container */}
      <div className="space-y-6">
        {/* 1. Core Human Capital */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm md:text-base font-bold text-slate-900">
              Core Human Capital
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Max 460 / 500 pts
            </span>
          </div>
          <div className="space-y-3">
            {coreFactors.map(renderFactorRow)}
          </div>
        </div>

        {/* 2. Spouse / Common-Law Factors */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm md:text-base font-bold text-slate-900">
              Spouse / Common-Law Factors
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Max 40 pts
            </span>
          </div>
          <div className="space-y-3">
            {spouseFactors.map(renderFactorRow)}
          </div>
        </div>

        {/* 3. Additional / Bonus Points */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm md:text-base font-bold text-slate-900">
              Additional / Bonus Points
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Max 600 pts
            </span>
          </div>
          <div className="space-y-3">
            {additionalFactors.map(renderFactorRow)}
          </div>
        </div>
      </div>

      {/* Add Factor Modal */}
      <CustomModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xl"
        title="Add New Scoring Factor"
        actions={[
          {
            label: "Cancel",
            onClick: () => setIsModalOpen(false),
            variant: "secondary",
          },
          {
            label: "Add Factor",
            onClick: handleAddFactor,
            variant: "primary",
          },
        ]}
      >
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Factor Pillar / Section *
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00a859]"
            >
              <option value="core">Core Human Capital</option>
              <option value="spouse">Spouse / Common-Law Factors</option>
              <option value="additional">Additional / Bonus Points</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Factor Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Trade Certificate of Qualification"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00a859]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Maximum Factor Points *
            </label>
            <input
              type="number"
              min="1"
              max="1200"
              value={newMaxPoints}
              onChange={(e) => setNewMaxPoints(Number(e.target.value))}
              className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00a859]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Points awarded for valid provincial certificate of trade qualification"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#00a859]"
            />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
