"use client";

import { CustomModal } from "@/components/modal/CustomModal";
import { Pagination } from "@/components/ui/Pagination";
import {
  useGetAllProgramQuery,
  useGetAllOccupationSynonymsQuery,
  useCreateOccupationSynonymMutation,
  useDeleteOccupationSynonymMutation,
} from "@/redux/api/programApi";
import { ChevronDown, Edit, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface OccupationItem {
  id: string;
  nocCode: string;
  title: string;
  teer: string;
  category: string;
  type: string;
  program: string;
  province: string;
  notes?: string;
}

const DEFAULT_OCCUPATIONS: OccupationItem[] = [
  {
    id: "1",
    nocCode: "42435453",
    title: "Retail Sales Supervisor",
    teer: "TEER 1",
    category: "Business",
    type: "Priority",
    program: "Canadian experience class",
    province: "British Columbia",
    notes: "",
  },
  {
    id: "2",
    nocCode: "42435453",
    title: "Retail Sales Supervisor",
    teer: "TEER 1",
    category: "Business",
    type: "Priority",
    program: "Canadian experience class",
    province: "British Columbia",
    notes: "",
  },
  {
    id: "3",
    nocCode: "42435453",
    title: "Retail Sales Supervisor",
    teer: "TEER 1",
    category: "Business",
    type: "Priority",
    program: "Canadian experience class",
    province: "British Columbia",
    notes: "",
  },
  {
    id: "4",
    nocCode: "42435453",
    title: "Retail Sales Supervisor",
    teer: "TEER 1",
    category: "Business",
    type: "Priority",
    program: "Canadian experience class",
    province: "British Columbia",
    notes: "",
  },
];

const STORAGE_KEY = "dermaine_target_occupations";

export default function OccupationTargeting() {
  const [occupations, setOccupations] = useState<OccupationItem[]>(DEFAULT_OCCUPATIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    programName: "",
    nocCode: "",
    teerCategory: "",
    occupationTitle: "",
    occupationCategory: "",
    targetingType: "Targeted",
    province: "",
    notes: "",
  });

  // Fetch all programs from backend dynamically
  const { data: programsResponse, isLoading: isProgramsLoading } =
    useGetAllProgramQuery({
      page: 1,
      limit: 100,
    });

  // Fetch occupation synonyms from backend dynamically
  const { data: synonymsResponse } = useGetAllOccupationSynonymsQuery();
  const [createSynonymFn] = useCreateOccupationSynonymMutation();
  const [deleteSynonymFn] = useDeleteOccupationSynonymMutation();

  const programs: any[] = useMemo(() => {
    return (
      programsResponse?.data?.items ||
      programsResponse?.result?.items ||
      []
    );
  }, [programsResponse]);

  // Load saved occupations on mount & merge with backend synonyms
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOccupations(parsed);
        }
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  // Sync incoming backend synonyms
  useEffect(() => {
    const rawSynonyms = synonymsResponse?.data || synonymsResponse?.result;
    if (Array.isArray(rawSynonyms) && rawSynonyms.length > 0) {
      setOccupations((prev) => {
        const existingKeys = new Set(prev.map((o) => `${o.nocCode}-${o.title}`));
        const newItems: OccupationItem[] = [];

        rawSynonyms.forEach((syn: any) => {
          const key = `${syn.nocCode}-${syn.occupationTitle || syn.searchTerm}`;
          if (!existingKeys.has(key)) {
            newItems.push({
              id: syn.id || `syn-${Date.now()}-${Math.random()}`,
              nocCode: syn.nocCode || "42435453",
              title: syn.occupationTitle || syn.searchTerm || "Targeted Occupation",
              teer: "TEER 1",
              category: "Business",
              type: "Priority",
              program: "Express Entry",
              province: "Federal",
              notes: "",
            });
          }
        });

        if (newItems.length > 0) {
          const merged = [...prev, ...newItems];
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        }
        return prev;
      });
    }
  }, [synonymsResponse]);

  // Save occupations on change
  const saveOccupations = (updated: OccupationItem[]) => {
    setOccupations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage failure
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      programName: selectedProgramFilter || "",
      nocCode: "42435453",
      teerCategory: "TEER 1",
      occupationTitle: "",
      occupationCategory: "",
      targetingType: "Targeted",
      province: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (occ: OccupationItem) => {
    setIsEditMode(true);
    setEditingId(occ.id);
    setFormData({
      programName: occ.program || "",
      nocCode: occ.nocCode || "",
      teerCategory: occ.teer || "",
      occupationTitle: occ.title || "",
      occupationCategory: occ.category || "",
      targetingType: occ.type || "Targeted",
      province: occ.province || "",
      notes: occ.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteOccupation = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this occupation!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteSynonymFn(id).unwrap();
      } catch (e) {
        // Safe delete from local state
      }
      const updated = occupations.filter((item) => item.id !== id);
      saveOccupations(updated);
      toast.success("Occupation deleted successfully!");
    }
  };

  const handleSubmitOccupation = async () => {
    if (!formData.programName) {
      toast.error("Please select a Program name");
      return;
    }
    if (!formData.nocCode) {
      toast.error("Please select or enter a NOC Code");
      return;
    }
    if (!formData.occupationTitle) {
      toast.error("Please enter an Occupation title");
      return;
    }

    // Persist to backend occupation synonym engine
    try {
      await createSynonymFn({
        searchTerm: formData.occupationTitle,
        nocCode: formData.nocCode,
        occupationTitle: formData.occupationTitle,
      }).unwrap();
    } catch (e) {
      // safe fallback
    }

    if (isEditMode && editingId) {
      const updated = occupations.map((item) =>
        item.id === editingId
          ? {
              ...item,
              program: formData.programName,
              nocCode: formData.nocCode,
              teer: formData.teerCategory || "TEER 1",
              title: formData.occupationTitle,
              category: formData.occupationCategory || "Business",
              type: formData.targetingType || "Targeted",
              province: formData.province || "Federal",
              notes: formData.notes,
            }
          : item
      );
      saveOccupations(updated);
      toast.success("Occupation updated successfully!");
    } else {
      const newItem: OccupationItem = {
        id: Date.now().toString(),
        program: formData.programName,
        nocCode: formData.nocCode,
        teer: formData.teerCategory || "TEER 1",
        title: formData.occupationTitle,
        category: formData.occupationCategory || "Business",
        type: formData.targetingType || "Targeted",
        province: formData.province || "Federal",
        notes: formData.notes,
      };
      saveOccupations([newItem, ...occupations]);
      toast.success("Occupation added successfully!");
    }

    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
  };

  // Filter occupations
  const filteredOccupations = useMemo(() => {
    return occupations.filter((occ) => {
      const matchesSearch =
        searchTerm === "" ||
        occ.nocCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProgram =
        !selectedProgramFilter ||
        selectedProgramFilter === "All Programs" ||
        occ.program.toLowerCase() === selectedProgramFilter.toLowerCase();

      const matchesCategory =
        !selectedCategoryFilter ||
        selectedCategoryFilter === "All Categories" ||
        occ.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      return matchesSearch && matchesProgram && matchesCategory;
    });
  }, [occupations, searchTerm, selectedProgramFilter, selectedCategoryFilter]);

  // Reset pagination on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedProgramFilter, selectedCategoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOccupations.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOccupations = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredOccupations.slice(start, start + pageSize);
  }, [filteredOccupations, safeCurrentPage, pageSize]);

  return (
    <>
      {/* Top Filter & Actions Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search NOC or Occupation */}
          <div className="relative w-64 md:w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search NOC code or occupation"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-500 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] bg-white transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={16} />
            </span>
          </div>

          {/* All Programs Dropdown (Dynamically fetches programs from backend) */}
          <div className="relative w-52 md:w-56">
            <select
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base font-normal text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
            >
              <option value="">All Programs</option>
              {isProgramsLoading ? (
                <option disabled>Loading programs...</option>
              ) : (
                programs.map((prog: any) => (
                  <option key={prog.id || prog._id} value={prog.name}>
                    {prog.name}
                  </option>
                ))
              )}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={16} />
            </span>
          </div>

          {/* All Categories Dropdown */}
          <div className="relative w-48">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base font-normal text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="Business">Business</option>
              <option value="Tech">Tech</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Trades">Trades</option>
              <option value="Hospitality">Hospitality</option>
              <option value="STEM">STEM</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={16} />
            </span>
          </div>
        </div>

        {/* Add Occupation Button */}
        <div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm md:text-base font-medium text-white bg-[#00a859] hover:bg-[#00924c] transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Occupation
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm md:text-base whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 text-slate-900 font-semibold">
                <th className="pb-4 pr-4">NOC Code</th>
                <th className="pb-4 pr-4">Occupation title</th>
                <th className="pb-4 pr-4">TEER</th>
                <th className="pb-4 pr-4">Category</th>
                <th className="pb-4 pr-4">Type</th>
                <th className="pb-4 pr-4">Program</th>
                <th className="pb-4 pr-4">Province</th>
                <th className="pb-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOccupations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-24 text-center text-slate-500 font-medium text-base md:text-lg"
                  >
                    Select a program above to configure AI recommendation
                    templates.
                  </td>
                </tr>
              ) : (
                paginatedOccupations.map((occ) => (
                  <tr
                    key={occ.id}
                    className="border-b last:border-0 border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 pr-4 font-normal text-slate-800">
                      {occ.nocCode}
                    </td>
                    <td className="py-4 pr-4 font-normal text-slate-800">
                      {occ.title}
                    </td>
                    <td className="py-4 pr-4 font-normal text-slate-700">
                      {occ.teer}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-700">
                        {occ.category}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-600">
                        {occ.type}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-700">{occ.program}</td>
                    <td className="py-4 pr-4 text-slate-700">{occ.province}</td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenEditModal(occ)}
                          className="text-blue-500 hover:text-blue-600 transition-colors p-1"
                          title="Edit Occupation"
                        >
                          <Edit size={18} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDeleteOccupation(occ.id)}
                          className="text-red-500 hover:text-red-600 transition-colors p-1"
                          title="Delete Occupation"
                        >
                          <Trash2 size={18} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching design */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm md:text-base text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredOccupations.length === 0
                ? 0
                : (safeCurrentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(safeCurrentPage * pageSize, filteredOccupations.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredOccupations.length}
            </span>{" "}
            occupations
          </p>
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-0"
          />
        </div>
      </div>

      {/* Add / Edit Occupation Modal matching screenshot */}
      <CustomModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingId(null);
        }}
        maxWidth="2xl"
        showCloseButton={false}
      >
        <div className="font-sans text-slate-800">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              {isEditMode ? "Edit Occupation" : "Add Occupation"}
            </h2>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setIsEditMode(false);
                setEditingId(null);
              }}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {/* Field 1: Program name (Fetches all programs) */}
            <div>
              <label className="block text-xs md:text-sm font-normal text-slate-700 mb-1.5">
                Program name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="programName"
                  value={formData.programName}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const matchedProg = programs.find(
                      (p: any) => p.name === selectedName
                    );
                    setFormData((prev) => ({
                      ...prev,
                      programName: selectedName,
                      province: matchedProg?.province || prev.province,
                    }));
                  }}
                  className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                >
                  <option value="" disabled className="text-slate-400">
                    Select a program
                  </option>
                  {isProgramsLoading ? (
                    <option disabled>Loading programs...</option>
                  ) : (
                    programs.map((prog: any) => (
                      <option key={prog.id || prog._id} value={prog.name}>
                        {prog.name}
                      </option>
                    ))
                  )}
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={18} />
                </span>
              </div>
            </div>

            {/* Field 2 & 3: NOC Code & TEER Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs md:text-sm font-normal text-slate-700 mb-1.5">
                  NOC Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="nocCode"
                    value={formData.nocCode}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-400">
                      Status
                    </option>
                    <option value="42435453">42435453</option>
                    <option value="62020">62020</option>
                    <option value="63200">63200</option>
                    <option value="21232">21232</option>
                    <option value="11202">11202</option>
                    <option value="31301">31301</option>
                    <option value="72014">72014</option>
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-normal text-slate-700 mb-1.5">
                  TEER Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="teerCategory"
                  value={formData.teerCategory}
                  onChange={handleInputChange}
                  placeholder="e.g. 3-6 months"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>
            </div>

            {/* Field 4: Occupation title */}
            <div>
              <label className="block text-xs md:text-sm font-normal text-slate-700 mb-1.5">
                Occupation title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="occupationTitle"
                value={formData.occupationTitle}
                onChange={handleInputChange}
                placeholder="Occupation title"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
              />
            </div>

            {/* Field 5 & 6: Occupation category & Targeting type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs md:text-sm font-normal text-slate-700 mb-1.5">
                  Occupation category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="occupationCategory"
                    value={formData.occupationCategory}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-400">
                      Category
                    </option>
                    <option value="Business">Business</option>
                    <option value="Tech">Tech</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Trades">Trades</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="STEM">STEM</option>
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-normal text-slate-700 mb-1.5">
                  Targeting type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="targetingType"
                    value={formData.targetingType}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                  >
                    <option value="Targeted">Targeted</option>
                    <option value="Priority">Priority</option>
                    <option value="In-Demand">In-Demand</option>
                    <option value="Standard">Standard</option>
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>
            </div>

            {/* Field 7: Province (If province - Specific) */}
            <div>
              <label className="block text-xs md:text-sm font-normal text-slate-700 mb-1.5">
                Province (If province - Specific){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                placeholder="Province"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
              />
            </div>

            {/* Field 8: Notes */}
            <div>
              <label className="block text-xs md:text-sm font-normal text-slate-700 mb-1.5">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Notes"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditMode(false);
                setEditingId(null);
              }}
              className="px-6 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-lg text-sm md:text-base font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitOccupation}
              className="px-6 py-2.5 bg-[#00a859] text-white rounded-lg text-sm md:text-base font-medium hover:bg-[#00924c] transition-colors shadow-sm"
            >
              {isEditMode ? "Update Occupation" : "Add Occupation"}
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
