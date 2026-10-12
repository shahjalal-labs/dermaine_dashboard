"use client";

import { CustomModal } from "@/components/modal/CustomModal";
import { Pagination } from "@/components/ui/Pagination";
import { useAllAssessmentsQuery } from "@/redux/api/adminApi";
import {
  useCreateProgramMutation,
  useDeleteProgramMutation,
  useGetAllProgramQuery,
  useGetSingleProgramQuery,
  useUpdateProgramMutation,
} from "@/redux/api/programApi";
import {
  Calendar,
  ChevronDown,
  Download,
  Edit,
  Eye,
  FileText,
  Layers,
  Loader,
  Plus,
  Radio,
  Search,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import AiProgramCenter from "./AiProgramCenter";
import BulkActions from "./BulkActions";
import ImportExport from "./ImportExport";
import OccupationTargeting from "./OccupationTargeting";
import Streams from "./Streams";

const getCategoryColor = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "economic":
      return "bg-blue-100 text-blue-600";
    case "pnp":
      return "bg-green-100 text-green-600";
    case "work":
      return "bg-orange-100 text-orange-500";
    case "family":
      return "bg-pink-100 text-pink-600";
    case "pr":
      return "bg-red-100 text-red-500";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function ProgramLibrary() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  const [activePageTab, setActivePageTab] = useState("Program Library");

  useEffect(() => {
    const savedTab = sessionStorage.getItem("adminActiveTab");
    if (savedTab) {
      setActivePageTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActivePageTab(tab);
    sessionStorage.setItem("adminActiveTab", tab);
  };
  const [isEditMode, setIsEditMode] = useState(false);

  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();
  const [updateProgram, { isLoading: isUpdating }] = useUpdateProgramMutation();
  const [deleteProgram] = useDeleteProgramMutation();

  const { data: assessmentsData, isLoading: assessmentsLoading } =
    useAllAssessmentsQuery({});
  const assessments = useMemo(
    () => assessmentsData?.result || [],
    [assessmentsData?.result]
  );

  // Quick lookup so we can render the assessment title anywhere we
  // only have the id (table rows, details modal, etc.)
  const assessmentTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    assessments.forEach((a: any) => {
      map[a.id || a._id] = a.title;
    });
    return map;
  }, [assessments]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  // NOTE: "visibility" filter removed — Program model has no
  // `visibility` field (only Stream does), and the backend
  // controller's pick() whitelist doesn't accept it either.
  const [selectedProgramFilter, setSelectedProgramFilter] =
    useState("All Programs");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading: isProgramsLoading } = useGetAllProgramQuery({
    search: debouncedSearch || undefined,
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
  });
  const isLoading = isCreating || isUpdating;

  const programs = useMemo(() => data?.result?.items || [], [data?.result?.items]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program: any) => {
      let match = true;

      if (selectedProgramFilter !== "All Programs") {
        if ((program.id || program._id) !== selectedProgramFilter)
          match = false;
      }

      // Fallback local filters just in case API doesn't handle them
      if (selectedStatus) {
        if (
          (program.status || "ACTIVE").toUpperCase() !==
          selectedStatus.toUpperCase()
        )
          match = false;
      }
      if (selectedCategory) {
        if (
          (program.category || "").toUpperCase() !==
          selectedCategory.toUpperCase()
        )
          match = false;
      }
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        if (
          !program.name?.toLowerCase().includes(searchLower) &&
          !program.description?.toLowerCase().includes(searchLower)
        ) {
          match = false;
        }
      }

      return match;
    });
  }, [
    programs,
    selectedProgramFilter,
    selectedStatus,
    selectedCategory,
    debouncedSearch,
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, selectedStatus, selectedProgramFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPrograms = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredPrograms.slice(start, start + pageSize);
  }, [filteredPrograms, safeCurrentPage, pageSize]);

  const { data: singleProgramResponse, isFetching: isFetchingSingle } =
    useGetSingleProgramQuery(selectedProgramId, {
      skip: !selectedProgramId,
    });
  const singleProgramData = singleProgramResponse?.result;

  const ASSESSMENT_MAPPINGS = [
    { id: "pr", label: "Apply for Permanent Residence", keyword: "permanent" },
    { id: "work", label: "Work in Canada", keyword: "work" },
    { id: "study", label: "Study in Canada", keyword: "study" },
    { id: "family", label: "Join Family in Canada", keyword: "family" },
  ];

  const [modalTab, setModalTab] = useState<
    "Basic info" | "Setting" | "Requirements" | "Dates & Version"
  >("Basic info");
  const [selectedMapping, setSelectedMapping] = useState<string>("");

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
      } catch (e) {
        return { cleanDescription: (clean || "").trim(), metadata: {} };
      }
    }
    return { cleanDescription: rawDesc.trim(), metadata: {} };
  };

  const [formData, setFormData] = useState({
    // Basic info
    name: "",
    streamName: "",
    province: "",
    category: "",
    status: "ACTIVE",
    priority: "Normal",
    description: "",
    publicSummary: "",
    internalNotes: "",
    processingTime: "",
    assesmentId: "",
    // Setting
    visibility: "Visible to Users",
    priorityRanking: "1",
    // Requirements
    languageRequirement: "",
    educationRequirement: "",
    workExperienceRequirement: "",
    jobOfferRequirement: "",
    settlementFunds: "",
    provinceConnection: "",
    familyRelationship: "",
    crsRequirement: "",
    // Dates & Version
    effectiveStartDate: "",
    effectiveEndDate: "",
    lastReviewedDate: "",
    versionNumber: "1",
  });

  const resetFormData = () => {
    setFormData({
      name: "",
      streamName: "",
      province: "",
      category: "",
      status: "ACTIVE",
      priority: "Normal",
      description: "",
      publicSummary: "",
      internalNotes: "",
      processingTime: "",
      assesmentId: "",
      visibility: "Visible to Users",
      priorityRanking: "1",
      languageRequirement: "",
      educationRequirement: "",
      workExperienceRequirement: "",
      jobOfferRequirement: "",
      settlementFunds: "",
      provinceConnection: "",
      familyRelationship: "",
      crsRequirement: "",
      effectiveStartDate: "",
      effectiveEndDate: "",
      lastReviewedDate: "",
      versionNumber: "1",
    });
    setSelectedMapping("");
    setModalTab("Basic info");
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMapping = (mapping: (typeof ASSESSMENT_MAPPINGS)[0]) => {
    setSelectedMapping(mapping.label);
    const matchedAssessment = assessments.find((a: any) =>
      (a.title || "").toLowerCase().includes(mapping.keyword)
    );
    setFormData((prev) => ({
      ...prev,
      assesmentId: matchedAssessment
        ? matchedAssessment.id || matchedAssessment._id
        : assessments[0]?.id || mapping.id,
    }));
  };

  const isMappingSelected = (mapping: (typeof ASSESSMENT_MAPPINGS)[0]) => {
    if (selectedMapping === mapping.label) return true;
    if (!formData.assesmentId) return false;
    if (formData.assesmentId === mapping.id) return true;
    const match = assessments.find(
      (a: any) => (a.id || a._id) === formData.assesmentId
    );
    if (match) {
      return (match.title || "").toLowerCase().includes(mapping.keyword);
    }
    return false;
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        toast.error("Please enter a Program name");
        return;
      }
      if (!formData.province) {
        toast.error("Please enter or select a Province");
        return;
      }
      if (!formData.category) {
        toast.error("Please select a Category");
        return;
      }

      // Default to first real assessment if needed
      let realAssesmentId = formData.assesmentId;
      const isRealId = assessments.some(
        (a: any) => (a.id || a._id) === realAssesmentId
      );
      if (!isRealId && assessments.length > 0) {
        realAssesmentId = assessments[0].id || assessments[0]._id;
      }

      // Package all extra metadata across tabs into clean structured metadata
      const metadata = {
        streamName: formData.streamName,
        priority: formData.priority,
        publicSummary: formData.publicSummary,
        internalNotes: formData.internalNotes,
        processingTime: formData.processingTime,
        visibility: formData.visibility,
        priorityRanking: formData.priorityRanking,
        languageRequirement: formData.languageRequirement,
        educationRequirement: formData.educationRequirement,
        workExperienceRequirement: formData.workExperienceRequirement,
        jobOfferRequirement: formData.jobOfferRequirement,
        settlementFunds: formData.settlementFunds,
        provinceConnection: formData.provinceConnection,
        familyRelationship: formData.familyRelationship,
        crsRequirement: formData.crsRequirement,
        effectiveStartDate: formData.effectiveStartDate,
        effectiveEndDate: formData.effectiveEndDate,
        lastReviewedDate: formData.lastReviewedDate,
        versionNumber: formData.versionNumber,
      };

      const finalDescription = formData.description
        ? `${formData.description.trim()}\n<!--DERMAINE_METADATA-->${JSON.stringify(metadata)}`
        : `<!--DERMAINE_METADATA-->${JSON.stringify(metadata)}`;

      // Valid fields accepted by Prisma
      const payload: any = {
        name: formData.name,
        country: "Canada",
        province: formData.province,
        category: formData.category,
        status: formData.status || "ACTIVE",
        assesmentId: realAssesmentId || undefined,
        description: finalDescription,
      };

      if (isEditMode && selectedProgramId) {
        await updateProgram({ id: selectedProgramId, data: payload }).unwrap();
        toast.success("Program updated successfully!");
      } else {
        await createProgram(payload).unwrap();
        toast.success("Program created successfully!");
      }

      setIsModalOpen(false);
      resetFormData();
      setIsEditMode(false);
      setSelectedProgramId(null);
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
        `Failed to ${isEditMode ? "update" : "create"} program`
      );
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteProgram({ id }).unwrap();
        Swal.fire("Deleted!", "The program has been deleted.", "success");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete program");
      }
    }
  };

  return (
    <div className=" mx-auto w-full  text-title">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-title caros mb-2">
          {activePageTab}
        </h1>
        <p className="text-base md:text-lg text-description">
          Master database of all immigration programs, streams, and occupation
          targeting. Eligibility logic lives in Rule / Scoring Management.
        </p>
      </div>

      {/* Tabs section */}
      <div className="flex items-center gap-x-6 gap-y-2 border-b border-slate-200 mb-6 text-base md:text-lg flex-wrap  font-medium">
        <button
          onClick={() => handleTabChange("Program Library")}
          className={`flex items-center gap-2 pb-3 -mb-[2px] transition-colors ${activePageTab === "Program Library"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-description  hover:text-slate-600"
            }`}
        >
          <FileText size={16} />
          Program Library
        </button>
        <button
          onClick={() => handleTabChange("Streams")}
          className={`flex items-center gap-2 pb-3 -mb-[2px] transition-colors ${activePageTab === "Streams"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-description  hover:text-slate-600"
            }`}
        >
          <Radio size={16} />
          Streams
        </button>
        <button
          onClick={() => handleTabChange("Occupation Targeting")}
          className={`flex items-center gap-2 pb-3 -mb-[2px] transition-colors ${activePageTab === "Occupation Targeting"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-description  hover:text-slate-600"
            }`}
        >
          <Target size={16} />
          Occupation Targeting
        </button>
        <button
          onClick={() => handleTabChange("AI Program Center")}
          className={`flex items-center gap-2 pb-3 -mb-[2px] transition-colors ${activePageTab === "AI Program Center"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-description  hover:text-slate-600"
            }`}
        >
          <Sparkles size={16} />
          AI Program Center
        </button>
        <button
          onClick={() => handleTabChange("Bulk Actions")}
          className={`flex items-center gap-2 pb-3 -mb-[2px] transition-colors ${activePageTab === "Bulk Actions"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-description  hover:text-slate-600"
            }`}
        >
          <Layers size={16} />
          Bulk Actions
        </button>
        <button
          onClick={() => handleTabChange("Import / Export")}
          className={`flex items-center gap-2 pb-3 -mb-[2px] transition-colors ${activePageTab === "Import / Export"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-description  hover:text-slate-600"
            }`}
        >
          <Download size={16} />
          Import / Export
        </button>
      </div>

      {activePageTab === "Program Library" && (
        <>
          {/* Filters section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-description ">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-md text-base md:text-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary bg-white cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Economic">Economic</option>
                <option value="PNP">PNP</option>
                <option value="Work">Work</option>
                <option value="Family">Family</option>
                <option value="PR">PR</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-description pointer-events-none">
                <ChevronDown size={16} />
              </span>
            </div>
            <div className="relative w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-md text-base md:text-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary bg-white cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="PAUSED">Paused</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-description pointer-events-none">
                <ChevronDown size={16} />
              </span>
            </div>
            {/* Visibility filter removed — Program has no visibility field */}
          </div>

          {/* Actions section */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-48">
              <select
                value={selectedProgramFilter}
                onChange={(e) => setSelectedProgramFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-md text-base md:text-lg font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="All Programs">All Programs</option>
                {programs.map((prog: any) => (
                  <option key={prog.id || prog._id} value={prog.id || prog._id}>
                    {prog.name}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-description pointer-events-none">
                <ChevronDown size={16} />
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-md text-base md:text-lg   font-medium text-white bg-[#00a859] hover:bg-green-600 transition-colors"
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedProgramId(null);
                  resetFormData();
                  setIsModalOpen(true);
                }}
              >
                <Plus size={16} />
                Add Program
              </button>
            </div>
          </div>

          {/* Table section */}
          <div className="overflow-x-auto bg-background p-6">
            <table className="w-full text-left text-base md:text-lg   whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 font-semibold text-slate-700 w-1/4">
                    Program Name
                  </th>
                  <th className="py-4 font-semibold text-slate-700 px-4 text-center">
                    Category
                  </th>
                  <th className="py-4 font-semibold text-slate-700 px-4">
                    Assessment
                  </th>
                  <th className="py-4 font-semibold text-slate-700 px-4">
                    Province
                  </th>
                  <th className="py-4 font-semibold text-slate-700 px-4 text-center">
                    Status
                  </th>
                  {/* Priority column removed — Program model has no priority field */}
                  <th className="py-4 font-semibold text-slate-700 px-4">
                    Last Updated
                  </th>
                  <th className="py-4 font-semibold text-slate-700 px-4 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              {isProgramsLoading ? (
                <tbody>
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Loader
                          size={40}
                          className="animate-spin text-[#00a859] mb-4"
                        />
                        <span className="text-lg font-medium">
                          Loading programs...
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {paginatedPrograms.map((program: any) => (
                    <tr
                      key={program.id || program._id}
                      className="border-b border-slate-100 hover:bg-slate-50/50"
                    >
                      <td className="py-4 text-slate-700 whitespace-normal pr-4">
                        {program.name || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 text-base font-semibold rounded-md ${getCategoryColor(program.category)}`}
                        >
                          {program.category || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {assessmentTitleById[program.assesmentId] ||
                          program.assesmentId ||
                          "N/A"}
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {program.province || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 text-base font-semibold rounded-md ${(program.status || "ACTIVE").toUpperCase() ===
                              "ACTIVE"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-500"
                            }`}
                        >
                          {program.status || "ACTIVE"}
                        </span>
                      </td>
                      {/* Priority cell removed — no such field on Program */}
                      <td className="py-4 px-4 text-slate-600">
                        {program.updatedAt
                          ? new Date(program.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedProgramId(program.id || program._id);
                              setIsDetailsModalOpen(true);
                            }}
                            className="text-yellow-500 hover:text-yellow-600 transition-colors"
                          >
                            <Eye size={18} strokeWidth={2} />
                          </button>
                          <button
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                            onClick={() => {
                              setIsEditMode(true);
                              setSelectedProgramId(program.id || program._id);
                              const { cleanDescription, metadata } =
                                parseProgramMetadata(program.description);
                              setFormData({
                                name: program.name || "",
                                streamName:
                                  metadata.streamName ||
                                  (program as any).streamName ||
                                  "",
                                province: program.province || "",
                                category: program.category || "",
                                status: program.status || "ACTIVE",
                                priority:
                                  metadata.priority ||
                                  (program as any).priority ||
                                  "Normal",
                                description: cleanDescription,
                                publicSummary: metadata.publicSummary || "",
                                internalNotes: metadata.internalNotes || "",
                                processingTime: metadata.processingTime || "",
                                assesmentId: program.assesmentId || "",
                                visibility:
                                  metadata.visibility || "Visible to Users",
                                priorityRanking:
                                  metadata.priorityRanking || "1",
                                languageRequirement:
                                  metadata.languageRequirement || "",
                                educationRequirement:
                                  metadata.educationRequirement || "",
                                workExperienceRequirement:
                                  metadata.workExperienceRequirement || "",
                                jobOfferRequirement:
                                  metadata.jobOfferRequirement || "",
                                settlementFunds:
                                  metadata.settlementFunds || "",
                                provinceConnection:
                                  metadata.provinceConnection || "",
                                familyRelationship:
                                  metadata.familyRelationship || "",
                                crsRequirement:
                                  metadata.crsRequirement || "",
                                effectiveStartDate:
                                  metadata.effectiveStartDate || "",
                                effectiveEndDate:
                                  metadata.effectiveEndDate || "",
                                lastReviewedDate:
                                  metadata.lastReviewedDate || "",
                                versionNumber: metadata.versionNumber || "1",
                              });
                              setModalTab("Basic info");
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit size={18} strokeWidth={2} />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-600 transition-colors"
                            onClick={() =>
                              handleDelete(program.id || program._id)
                            }
                          >
                            <Trash2 size={18} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPrograms.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-slate-500 text-lg"
                      >
                        No programs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
            <p className="text-sm md:text-base text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredPrograms.length === 0
                  ? 0
                  : (safeCurrentPage - 1) * pageSize + 1}
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
        </>
      )}

      {activePageTab === "Streams" && <Streams />}

      {activePageTab === "Occupation Targeting" && <OccupationTargeting />}

      {activePageTab === "AI Program Center" && (
        <AiProgramCenter onNavigateToLibrary={() => setActivePageTab("Program Library")} />
      )}

      {activePageTab === "Import / Export" && <ImportExport />}

      {activePageTab === "Bulk Actions" && <BulkActions />}

      <CustomModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedProgramId(null);
        }}
        maxWidth="2xl"
        showCloseButton={false}
      >
        <div className="font-sans text-slate-800">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-5">
            Add/Edit Program
          </h2>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {(
              [
                "Basic info",
                "Setting",
                "Requirements",
                "Dates & Version",
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setModalTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm md:text-base font-medium transition-all ${modalTab === tab
                    ? "bg-[#00a859] text-white shadow-sm"
                    : "bg-[#f8fafc] border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Basic info */}
          {modalTab === "Basic info" && (
            <div>
              {/* Row 1: Program name & Stream Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Program name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Program name"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Stream Name
                  </label>
                  <input
                    type="text"
                    name="streamName"
                    value={formData.streamName}
                    onChange={handleInputChange}
                    placeholder="Antigue"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Province & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Province
                  </label>
                  <input
                    type="text"
                    name="province"
                    list="province-options"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Province/Region"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                  />
                  <datalist id="province-options">
                    <option value="Federal" />
                    <option value="Alberta" />
                    <option value="British Columbia" />
                    <option value="Manitoba" />
                    <option value="New Brunswick" />
                    <option value="Newfoundland and Labrador" />
                    <option value="Northwest Territories" />
                    <option value="Nova Scotia" />
                    <option value="Nunavut" />
                    <option value="Ontario" />
                    <option value="Prince Edward Island" />
                    <option value="Quebec" />
                    <option value="Saskatchewan" />
                    <option value="Yukon" />
                    <option value="Atlantic" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                    >
                      <option value="" disabled className="text-slate-400">
                        Category
                      </option>
                      <option value="Economic">Economic</option>
                      <option value="PNP">PNP</option>
                      <option value="Work">Work</option>
                      <option value="Family">Family</option>
                      <option value="PR">PR</option>
                      <option value="Study">Study</option>
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Status & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                    >
                      <option value="" disabled className="text-slate-400">
                        Status
                      </option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PAUSED">PAUSED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                    >
                      <option value="" disabled className="text-slate-400">
                        Status
                      </option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Assessment Type Mapping */}
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Assessment Type Mapping
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {ASSESSMENT_MAPPINGS.map((mapping) => {
                    const selected = isMappingSelected(mapping);
                    return (
                      <label
                        key={mapping.id}
                        className="flex items-center gap-3 cursor-pointer text-sm md:text-base text-slate-700 select-none hover:text-slate-900 transition-colors"
                        onClick={() => handleSelectMapping(mapping)}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selected
                              ? "border-[#00a859] bg-white"
                              : "border-slate-400 bg-white"
                            }`}
                        >
                          {selected && (
                            <span className="w-2 h-2 rounded-full bg-[#00a859]" />
                          )}
                        </span>
                        <span>{mapping.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>

              {/* Public Summary */}
              <div className="mb-4">
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  Public Summary
                </label>
                <textarea
                  name="publicSummary"
                  rows={3}
                  value={formData.publicSummary}
                  onChange={handleInputChange}
                  placeholder="Public Summary"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>

              {/* Internal Notes */}
              <div className="mb-4">
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  Internal Notes
                </label>
                <textarea
                  name="internalNotes"
                  rows={3}
                  value={formData.internalNotes}
                  onChange={handleInputChange}
                  placeholder="Internal Notes"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>

              {/* Processing Time */}
              <div className="mb-6">
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  Processing Time
                </label>
                <input
                  type="text"
                  name="processingTime"
                  value={formData.processingTime}
                  onChange={handleInputChange}
                  placeholder="e.g. 6-12 months"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Setting */}
          {modalTab === "Setting" && (
            <div>
              {/* Row 1: Status & Visibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                    >
                      <option value="" disabled className="text-slate-400">
                        Status
                      </option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PAUSED">PAUSED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Visibility
                  </label>
                  <div className="relative">
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleInputChange}
                      className="w-full appearance-none px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base text-slate-700 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                    >
                      <option value="Visible to Users">Visible to Users</option>
                      <option value="Internal Only">Internal Only</option>
                      <option value="Hidden / Archived">Hidden / Archived</option>
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Priority Ranking */}
              <div className="mb-6">
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  Priority Ranking
                </label>
                <input
                  type="text"
                  name="priorityRanking"
                  value={formData.priorityRanking}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Requirements */}
          {modalTab === "Requirements" && (
            <div className="space-y-4 mb-6">
              {/* Row 1: Language Requirement Summary */}
              <div>
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  Language Requirement Summary
                </label>
                <input
                  type="text"
                  name="languageRequirement"
                  value={formData.languageRequirement}
                  onChange={handleInputChange}
                  placeholder="e.g. CLB 7 minimum"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>

              {/* Row 2: Education Requirement Summary */}
              <div>
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  Education Requirement Summary
                </label>
                <input
                  type="text"
                  name="educationRequirement"
                  value={formData.educationRequirement}
                  onChange={handleInputChange}
                  placeholder="e.g. Canadian diploma or equivalent ECA"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>

              {/* Row 3: Work Experience Requirement Summary */}
              <div>
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  Work Experience Requirement Summary
                </label>
                <input
                  type="text"
                  name="workExperienceRequirement"
                  value={formData.workExperienceRequirement}
                  onChange={handleInputChange}
                  placeholder="Work Experience Requirement Summary"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>

              {/* Row 4: Job Offer Requirement Summary & Settlement Funds Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Job Offer Requirement Summary
                  </label>
                  <input
                    type="text"
                    name="jobOfferRequirement"
                    value={formData.jobOfferRequirement}
                    onChange={handleInputChange}
                    placeholder="Job Offer Requirement Summary"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Settlement Funds Summary
                  </label>
                  <input
                    type="text"
                    name="settlementFunds"
                    value={formData.settlementFunds}
                    onChange={handleInputChange}
                    placeholder="Settlement Funds Summary"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                  />
                </div>
              </div>

              {/* Row 5: Province Connection Summary & Family Relationship Requirement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Province Connection Summary
                  </label>
                  <input
                    type="text"
                    name="provinceConnection"
                    value={formData.provinceConnection}
                    onChange={handleInputChange}
                    placeholder="Province Connection Summary"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Family Relationship Requirement
                  </label>
                  <input
                    type="text"
                    name="familyRelationship"
                    value={formData.familyRelationship}
                    onChange={handleInputChange}
                    placeholder="Family Relationship Requirement"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                  />
                </div>
              </div>

              {/* Row 6: CRS Requirement Summary */}
              <div>
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  CRS Requirement Summary
                </label>
                <input
                  type="text"
                  name="crsRequirement"
                  value={formData.crsRequirement}
                  onChange={handleInputChange}
                  placeholder="CRS Requirement Summary"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Dates & Version */}
          {modalTab === "Dates & Version" && (
            <div className="space-y-4 mb-6">
              {/* Row 1: Effective Start Date & Effective End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Effective Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="effectiveStartDate"
                      value={formData.effectiveStartDate}
                      onChange={handleInputChange}
                      placeholder="mm/dd/yyyy"
                      className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Calendar size={18} />
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                    Effective End Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="effectiveEndDate"
                      value={formData.effectiveEndDate}
                      onChange={handleInputChange}
                      placeholder="mm/dd/yyyy"
                      className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Calendar size={18} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Last Reviewed Date */}
              <div>
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  Last Reviewed Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastReviewedDate"
                    value={formData.lastReviewedDate}
                    onChange={handleInputChange}
                    placeholder="mm/dd/yyyy"
                    className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Calendar size={18} />
                  </span>
                </div>
              </div>

              {/* Row 3: Version Number */}
              <div>
                <label className="block text-xs md:text-sm font-normal text-slate-600 mb-1.5">
                  Version Number
                </label>
                <input
                  type="text"
                  name="versionNumber"
                  value={formData.versionNumber}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditMode(false);
                setSelectedProgramId(null);
              }}
              className="px-7 py-2.5 border border-[#00a859] text-[#00a859] bg-white rounded-lg text-sm md:text-base font-medium hover:bg-green-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-7 py-2.5 bg-[#00a859] text-white rounded-lg text-sm md:text-base font-medium hover:bg-[#00924c] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProgramId(null);
        }}
        maxWidth="3xl"
        showCloseButton={false}
      >
        <div className=" text-slate-800  overflow-y-auto px-1">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-6">
            Program Details
          </h2>

          {isFetchingSingle ? (
            <div className="py-12 flex justify-center items-center">
              <span className="text-lg text-slate-500 animate-pulse">
                <Loader size={30} className="text-primary" />
              </span>
            </div>
          ) : singleProgramData ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-base md:text-lg text-title mb-1 font-semibold">
                      Name
                    </p>
                    <p className="font-medium text-lg">
                      {singleProgramData.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-base md:text-lg text-title font-semibold mb-1">
                      Category
                    </p>
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 text-base md:text-lg font-semibold rounded-md ${getCategoryColor(singleProgramData.category)}`}
                    >
                      {singleProgramData.category || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-base md:text-lg text-title font-semibold mb-1">
                      Province / Country
                    </p>
                    <p className="font-medium text-lg">
                      {singleProgramData.province ||
                        singleProgramData.country ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-base md:text-lg text-title font-semibold mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 text-base  font-semibold rounded-md ${(singleProgramData.status || "ACTIVE").toUpperCase() ===
                          "ACTIVE"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-500"
                        }`}
                    >
                      {singleProgramData.status || "ACTIVE"}
                    </span>
                  </div>
                </div>

                {singleProgramData.assesmentId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-base md:text-lg text-title font-semibold mb-1">
                        Assessment
                      </p>
                      <p className="font-medium">
                        {assessmentTitleById[singleProgramData.assesmentId] ||
                          singleProgramData.assesmentId}
                      </p>
                    </div>
                  </div>
                )}
                {singleProgramData.description &&
                  (() => {
                    const { cleanDescription, metadata } =
                      parseProgramMetadata(singleProgramData.description);
                    return (
                      <>
                        {cleanDescription && (
                          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 pb-4">
                            <div>
                              <p className="text-base md:text-lg text-title mb-1 font-semibold">
                                Description
                              </p>
                              <p className="text-base whitespace-pre-wrap">
                                {cleanDescription}
                              </p>
                            </div>
                          </div>
                        )}
                        {Object.keys(metadata).length > 0 && (
                          <div className="space-y-4 border-b border-slate-200 pb-4">
                            <p className="text-base md:text-lg text-title font-semibold">
                              Program Specifications & Requirements
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {metadata.streamName && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Stream Name:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.streamName}
                                  </span>
                                </div>
                              )}
                              {metadata.visibility && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Visibility:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.visibility}
                                  </span>
                                </div>
                              )}
                              {metadata.priorityRanking && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Priority Ranking:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.priorityRanking}
                                  </span>
                                </div>
                              )}
                              {metadata.processingTime && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Processing Time:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.processingTime}
                                  </span>
                                </div>
                              )}
                              {metadata.languageRequirement && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Language Requirement:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.languageRequirement}
                                  </span>
                                </div>
                              )}
                              {metadata.educationRequirement && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Education Requirement:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.educationRequirement}
                                  </span>
                                </div>
                              )}
                              {metadata.workExperienceRequirement && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Work Experience:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.workExperienceRequirement}
                                  </span>
                                </div>
                              )}
                              {metadata.jobOfferRequirement && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Job Offer Requirement:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.jobOfferRequirement}
                                  </span>
                                </div>
                              )}
                              {metadata.settlementFunds && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Settlement Funds:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.settlementFunds}
                                  </span>
                                </div>
                              )}
                              {metadata.provinceConnection && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Province Connection:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.provinceConnection}
                                  </span>
                                </div>
                              )}
                              {metadata.familyRelationship && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Family Relationship:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.familyRelationship}
                                  </span>
                                </div>
                              )}
                              {metadata.crsRequirement && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    CRS Requirement:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.crsRequirement}
                                  </span>
                                </div>
                              )}
                              {metadata.effectiveStartDate && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Effective Start Date:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.effectiveStartDate}
                                  </span>
                                </div>
                              )}
                              {metadata.effectiveEndDate && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Effective End Date:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.effectiveEndDate}
                                  </span>
                                </div>
                              )}
                              {metadata.lastReviewedDate && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Last Reviewed Date:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.lastReviewedDate}
                                  </span>
                                </div>
                              )}
                              {metadata.versionNumber && (
                                <div>
                                  <span className="text-slate-500 font-medium">
                                    Version:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {metadata.versionNumber}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
              </div>

              {singleProgramData.streams &&
                singleProgramData.streams.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
                      Streams ({singleProgramData.streams.length})
                    </h3>
                    <div className="space-y-4">
                      {singleProgramData.streams.map((stream: any) => (
                        <div
                          key={stream.id}
                          className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-2">
                            {/* Stream field renamed name -> streamName in schema */}
                            <h4 className="font-semibold text-lg text-[#00a859]">
                              {stream.streamName}
                            </h4>
                            <span
                              className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md ${(stream.status || "ACTIVE").toUpperCase() ===
                                  "ACTIVE"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-slate-100 text-slate-600"
                                }`}
                            >
                              {stream.status || "ACTIVE"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                            <p>
                              <span className="font-medium text-slate-800">
                                Category:
                              </span>{" "}
                              {stream.category || "N/A"}
                            </p>
                            <p>
                              {/* Stream field renamed province -> provinceRegion in schema */}
                              <span className="font-medium text-slate-800">
                                Province:
                              </span>{" "}
                              {stream.provinceRegion || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium text-slate-800">
                                Processing Time:
                              </span>{" "}
                              {stream.processingTime || "N/A"}
                            </p>
                            <p>
                              {/* Stream field is `visibility` (enum), not streamVisibility */}
                              <span className="font-medium text-slate-800">
                                Visibility:
                              </span>{" "}
                              {stream.visibility || "N/A"}
                            </p>
                          </div>
                          {stream.description && (
                            <p className="mt-3 text-base md:text-lg text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded">
                              {stream.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex justify-end gap-3 mt-4 pt-4 ">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedProgramId(null);
                  }}
                  className="px-8 py-3 bg-primary  rounded-md text-base font-medium hover:bg-primary/80 text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 flex justify-center items-center flex-col gap-4">
              <span className="text-lg md:text-xl font-medium text-title">
                Program details not found.
              </span>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedProgramId(null);
                }}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-md text-base font-medium hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </CustomModal>
    </div>
  );
}
