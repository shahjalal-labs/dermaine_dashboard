import { CustomModal } from "@/components/modal/CustomModal";
import { Pagination } from "@/components/ui/Pagination";
import { useGetAllProgramQuery } from "@/redux/api/programApi";
import {
  useCreateStreamMutation,
  useDeleteStremMutation,
  useGetAllStreamQuery,
  useGetSingleStreamQuery,
  useUpdateStremMutation,
} from "@/redux/api/stremApi";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Loader,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

// Mirrors the `StreamStatus` enum in schema.prisma
const STATUS_OPTIONS = [
  "ACTIVE",
  "INACTIVE",
  "COMING_SOON",
  "OPEN",
  "CLOSED",
  "PAUSED",
  "SUSPENDED",
  "INTAKE_FULL",
  "INVITATION_ONLY",
  "ARCHIVED",
];

// Mirrors the `StreamVisibility` enum in schema.prisma
const VISIBILITY_OPTIONS = [
  "PUBLIC",
  "HIDDEN",
  "INTERNAL_ONLY",
  "PREMIUM_ONLY",
  "FREE_PREVIEW_ONLY",
];

// Statuses that read as "open for business" in the table badge.
const POSITIVE_STATUSES = ["ACTIVE", "OPEN", "COMING_SOON", "INVITATION_ONLY"];

const formatEnumLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const initialFormData = {
  programId: "",
  organizationId: "",
  streamName: "",
  country: "Canada",
  provinceRegion: "",
  category: "",
  status: "",
  priorityRanking: 0,
  assessmentTypes: "",
  description: "",
  publicSummary: "",
  internalNotes: "",
  processingTime: "",
  visibility: "",
  isPremiumOnly: false,
  showInFreeResults: false,
  isArchived: false,
  isDisabled: false,
  languageRequirementSummary: "",
  educationRequirementSummary: "",
  workExperienceRequirementSummary: "",
  jobOfferRequirementSummary: "",
  settlementFundsSummary: "",
  provinceConnectionSummary: "",
  familyRelationshipRequirement: "",
  crsRequirementSummary: "",
  effectiveStartDate: new Date().toISOString().split("T")[0],
  effectiveEndDate: new Date().toISOString().split("T")[0],
  lastReviewedDate: new Date().toISOString().split("T")[0],
  versionNumber: 1,
};

export default function Streams() {
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [streamsAdded, setStreamsAdded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProgram, setSelectedProgram] =
    useState<string>("All Programs");
  const [createStrem] = useCreateStreamMutation();
  const [updateStrem] = useUpdateStremMutation();
  const [deleteStrem] = useDeleteStremMutation();
  const { data: streamData, isLoading: isStreamsLoading } =
    useGetAllStreamQuery({ page: currentPage });

  const streams = useMemo(
    () => streamData?.result?.items || [],
    [streamData?.result?.items]
  );

  const filteredStreams = useMemo(() => {
    if (selectedProgram === "All Programs") return streams;
    return streams.filter(
      (stream: any) =>
        stream.program?.id === selectedProgram ||
        stream.programId === selectedProgram,
    );
  }, [streams, selectedProgram]);

  const groupedStreams = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredStreams.forEach((stream: any) => {
      const types =
        stream.assessmentTypes && stream.assessmentTypes.length > 0
          ? stream.assessmentTypes
          : ["UNASSIGNED"];
      types.forEach((type: string) => {
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(stream);
      });
    });
    return groups;
  }, [filteredStreams]);

  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const formatGroupName = (name: string) => {
    if (name === "UNASSIGNED") return "Unassigned";
    return formatEnumLabel(name);
  };

  const totalPages =
    streamData?.result?.meta?.totalPages ||
    streamData?.result?.meta?.totalPage ||
    streamData?.data?.totalPages ||
    streamData?.result?.totalPages ||
    streamData?.totalPages ||
    Math.ceil(
      (streamData?.result?.total ||
        streamData?.data?.total ||
        streamData?.total ||
        streams.length) / 10
    ) ||
    1;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProgram]);
  const { data: programsData, isLoading: isProgramsLoading } =
    useGetAllProgramQuery({});
  const {
    data: singleStremResponse,
    isLoading: isSingleStreamLoading,
    isFetching: isSingleStreamFetching,
  } = useGetSingleStreamQuery(selectedStreamId, {
    skip: !selectedStreamId,
  });

  const singleStremData = singleStremResponse?.result;

  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingStreamId(null);
  };

  const handleEditClick = (stream: any) => {
    setEditingStreamId(stream.id);
    setFormData({
      programId: stream.programId || stream.program?.id || "",
      organizationId: stream.organizationId || "",
      streamName: stream.streamName || "",
      country: stream.country || "Canada",
      provinceRegion: stream.provinceRegion || "",
      category: stream.category || "",
      status: stream.status || "",
      priorityRanking: stream.priorityRanking || 0,
      assessmentTypes: stream.assessmentTypes?.join(",") || "",
      description: stream.description || "",
      publicSummary: stream.publicSummary || "",
      internalNotes: stream.internalNotes || "",
      processingTime: stream.processingTime || "",
      visibility: stream.visibility || "",
      isPremiumOnly: stream.isPremiumOnly || false,
      showInFreeResults: stream.showInFreeResults || false,
      isArchived: stream.isArchived || false,
      isDisabled: stream.isDisabled || false,
      languageRequirementSummary: stream.languageRequirementSummary || "",
      educationRequirementSummary: stream.educationRequirementSummary || "",
      workExperienceRequirementSummary:
        stream.workExperienceRequirementSummary || "",
      jobOfferRequirementSummary: stream.jobOfferRequirementSummary || "",
      settlementFundsSummary: stream.settlementFundsSummary || "",
      provinceConnectionSummary: stream.provinceConnectionSummary || "",
      familyRelationshipRequirement: stream.familyRelationshipRequirement || "",
      crsRequirementSummary: stream.crsRequirementSummary || "",
      effectiveStartDate: stream.effectiveStartDate
        ? new Date(stream.effectiveStartDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      effectiveEndDate: stream.effectiveEndDate
        ? new Date(stream.effectiveEndDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      lastReviewedDate: stream.lastReviewedDate
        ? new Date(stream.lastReviewedDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      versionNumber: stream.versionNumber || 1,
    });
    setIsStreamModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00a859",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteStrem({ id }).unwrap();
          Swal.fire("Deleted!", "The stream has been deleted.", "success");
        } catch (error: any) {
          Swal.fire(
            "Error!",
            error?.data?.message || "Failed to delete stream.",
            "error",
          );
        }
      }
    });
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.programId ||
        !formData.streamName ||
        !formData.status ||
        !formData.processingTime
      ) {
        toast.error("Please fill in required fields");
        return;
      }

      const payload = {
        ...formData,
        organizationId: formData.organizationId || undefined,
        priorityRanking: Number(formData.priorityRanking) || 0,
        versionNumber: Number(formData.versionNumber) || 1,
        assessmentTypes: formData.assessmentTypes
          ? formData.assessmentTypes.split(",").filter(Boolean)
          : [],
        effectiveStartDate: new Date(formData.effectiveStartDate).toISOString(),
        effectiveEndDate: new Date(formData.effectiveEndDate).toISOString(),
        lastReviewedDate: new Date(formData.lastReviewedDate).toISOString(),
      };

      if (editingStreamId) {
        await updateStrem({ id: editingStreamId, data: payload }).unwrap();
        toast.success("Stream updated successfully!");
      } else {
        await createStrem(payload).unwrap();
        toast.success("Stream created successfully!");
      }

      setIsStreamModalOpen(false);
      setStreamsAdded(true);
      resetForm();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          `Failed to ${editingStreamId ? "update" : "create"} stream`,
      );
    }
  };

  return (
    <>
      {/* Actions section for Streams */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative ">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-md text-base md:text-lg font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
          >
            <option value="All Programs">All Programs</option>
            {programsData?.result?.items?.map((prog: any) => (
              <option key={prog.id || prog._id} value={prog.id || prog._id}>
                {prog.name}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <ChevronDown size={16} />
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-md text-base md:text-lg font-medium text-white bg-[#00a859] hover:bg-green-600 transition-colors"
            onClick={() => {
              resetForm();
              setIsStreamModalOpen(true);
            }}
          >
            <Plus size={16} />
            Add Stream
          </button>
        </div>
      </div>

      {isStreamsLoading ? (
        <div className="border border-slate-200 rounded-xl p-16 flex items-center justify-center bg-white min-h-[200px]">
          <p className="text-slate-500 font-medium text-base md:text-lg">
            <Loader size={40} className="animate-spin text-[#00a859] mb-4" />
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedStreams).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-16 flex items-center justify-center">
              <p className="text-slate-500 font-medium text-base md:text-lg">
                No streams found.
              </p>
            </div>
          ) : (
            Object.entries(groupedStreams).map(([groupName, groupStreams]) => (
              <div
                key={groupName}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                    {formatGroupName(groupName)}
                  </h2>
                  <button
                    onClick={() => toggleGroup(groupName)}
                    className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-slate-500"
                  >
                    {collapsedGroups[groupName] ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronUp size={20} />
                    )}
                  </button>
                </div>

                {!collapsedGroups[groupName] && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-base md:text-lg whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="pb-4 font-semibold text-slate-700">
                              Stream name
                            </th>
                            <th className="pb-4 font-semibold text-slate-700 text-center">
                              Status
                            </th>
                            <th className="pb-4 font-semibold text-slate-700 text-center">
                              Processing time
                            </th>
                            <th className="pb-4 font-semibold text-slate-700">
                              Description
                            </th>
                            <th className="pb-4 font-semibold text-slate-700 text-center">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupStreams.map((stream: any) => (
                            <tr
                              key={stream.id}
                              className="border-b last:border-0 border-slate-100 hover:bg-slate-50/50"
                            >
                              <td className="py-4 text-slate-700 pr-4">
                                {stream.streamName}
                              </td>
                              <td className="py-4 pr-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 text-sm md:text-base font-semibold rounded-md ${
                                    POSITIVE_STATUSES.includes(stream.status)
                                      ? "bg-green-100 text-green-600"
                                      : "bg-red-100 text-red-500"
                                  }`}
                                >
                                  {formatEnumLabel(stream.status || "")}
                                </span>
                              </td>
                              <td className="py-4 text-slate-600 pr-4 text-center">
                                {stream.processingTime}
                              </td>
                              <td className="py-4 text-slate-600 truncate max-w-[300px] pr-4">
                                {stream.description}
                              </td>
                              <td className="py-4 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    className="text-yellow-500 hover:text-yellow-600 transition-colors"
                                    onClick={() => {
                                      setSelectedStreamId(stream.id);
                                      setIsDetailsModalOpen(true);
                                    }}
                                  >
                                    <Eye size={18} strokeWidth={2} />
                                  </button>
                                  <button
                                    className="text-blue-500 hover:text-blue-600 transition-colors"
                                    onClick={() => handleEditClick(stream)}
                                  >
                                    <Edit size={18} strokeWidth={2} />
                                  </button>
                                  <button
                                    className="text-red-500 hover:text-red-600 transition-colors"
                                    onClick={() => handleDeleteClick(stream.id)}
                                  >
                                    <Trash2 size={18} strokeWidth={2} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500">
                Showing Page{" "}
                <span className="font-semibold text-slate-700">{currentPage}</span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">{totalPages}</span>
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-0"
              />
            </div>
          )}
        </div>
      )}

      {/* Add Stream Modal */}
      <CustomModal
        open={isStreamModalOpen}
        onClose={() => {
          setIsStreamModalOpen(false);
          resetForm();
        }}
        maxWidth="3xl"
        showCloseButton={false}
      >
        <div className="">
          <div className="flex justify-between items-center mb-6  pb-4">
            <h2 className="text-xl md:text-3xl font-bold text-title">
              {editingStreamId ? "Edit Stream" : "Add Stream"}
            </h2>
            <button
              onClick={() => {
                setIsStreamModalOpen(false);
                resetForm();
              }}
              className="text-description hover:text-description"
            >
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>

          <div className="pb-4 max-h-[70vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-title mb-3 border-b pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Program name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="programId"
                        value={formData.programId}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00a859] cursor-pointer"
                      >
                        <option value="">Select a program</option>
                        {programsData?.result?.items?.map((prog: any) => (
                          <option
                            key={prog.id || prog._id}
                            value={prog.id || prog._id}
                          >
                            {prog.name}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={16} />
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Stream name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="streamName"
                      value={formData.streamName}
                      onChange={handleInputChange}
                      placeholder="Stream Name"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Canada"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-slate-600 mb-1">
                      Province / Region
                    </label>
                    <div className="relative">
                      <select
                        name="provinceRegion"
                        value={formData.provinceRegion}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-slate-600 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                      >
                        <option value="">Select Province/Region</option>
                        <option value="Federal">Federal</option>
                        <option value="Alberta">Alberta</option>
                        <option value="British Columbia">
                          British Columbia
                        </option>
                        <option value="Manitoba">Manitoba</option>
                        <option value="New Brunswick">New Brunswick</option>
                        <option value="Newfoundland and Labrador">
                          Newfoundland and Labrador
                        </option>
                        <option value="Northwest Territories">
                          Northwest Territories
                        </option>
                        <option value="Nova Scotia">Nova Scotia</option>
                        <option value="Nunavut">Nunavut</option>
                        <option value="Ontario">Ontario</option>
                        <option value="Prince Edward Island">
                          Prince Edward Island
                        </option>
                        <option value="Quebec">Quebec</option>
                        <option value="Saskatchewan">Saskatchewan</option>
                        <option value="Yukon">Yukon</option>
                        <option value="Atlantic">Atlantic</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-description  pointer-events-none">
                        <ChevronDown size={16} />
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Category"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00a859] cursor-pointer"
                      >
                        <option value="">Status</option>
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {formatEnumLabel(status)}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-description pointer-events-none">
                        <ChevronDown size={16} />
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Processing time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="processingTime"
                      value={formData.processingTime}
                      onChange={handleInputChange}
                      placeholder="Processing Time"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Stream Visibility
                    </label>
                    <div className="relative">
                      <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#00a859] cursor-pointer"
                      >
                        <option value="">Select Visibility</option>
                        {VISIBILITY_OPTIONS.map((v) => (
                          <option key={v} value={v}>
                            {formatEnumLabel(v)}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={16} />
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Priority Ranking
                    </label>
                    <input
                      type="number"
                      name="priorityRanking"
                      value={formData.priorityRanking}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Organization ID
                      <span className="ml-1 text-sm font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="organizationId"
                      value={formData.organizationId}
                      onChange={handleInputChange}
                      placeholder="Leave blank if not org-scoped"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                </div>
              </div>

              {/* Summaries & Descriptions */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">
                  Summaries & Descriptions
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Description"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#00a859] min-h-[60px]"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Public Summary
                    </label>
                    <textarea
                      name="publicSummary"
                      value={formData.publicSummary}
                      onChange={handleInputChange}
                      placeholder="Public Summary"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#00a859] min-h-[60px]"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Internal Notes
                    </label>
                    <textarea
                      name="internalNotes"
                      value={formData.internalNotes}
                      onChange={handleInputChange}
                      placeholder="Internal Notes"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#00a859] min-h-[60px]"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-2">
                      Assessment Types
                    </label>
                    <div className="space-y-2">
                      {[
                        "APPLY_FOR_PERMANENT_RESIDENCE",
                        "STUDY_IN_CANADA",
                        "WORK_IN_CANADA",
                        "JOIN_FAMILY_IN_CANADA",
                      ].map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assessmentTypes
                              .split(",")
                              .filter(Boolean)
                              .includes(type)}
                            onChange={(e) => {
                              const current = formData.assessmentTypes
                                ? formData.assessmentTypes
                                    .split(",")
                                    .filter(Boolean)
                                : [];
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  assessmentTypes: [...current, type].join(","),
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  assessmentTypes: current
                                    .filter((t) => t !== type)
                                    .join(","),
                                }));
                              }
                            }}
                            className="w-4 h-4 text-[#00a859] rounded"
                          />
                          <span className="text-base md:text-lg text-title">
                            {formatEnumLabel(type)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">
                  Requirements
                </h3>
                <p className="text-sm text-slate-400 -mt-2 mb-3">
                  These are display-only summaries. Actual eligibility and
                  scoring logic is configured per rule under this stream.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Language
                    </label>
                    <input
                      type="text"
                      name="languageRequirementSummary"
                      value={formData.languageRequirementSummary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Education
                    </label>
                    <input
                      type="text"
                      name="educationRequirementSummary"
                      value={formData.educationRequirementSummary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Work Experience
                    </label>
                    <input
                      type="text"
                      name="workExperienceRequirementSummary"
                      value={formData.workExperienceRequirementSummary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Job Offer
                    </label>
                    <input
                      type="text"
                      name="jobOfferRequirementSummary"
                      value={formData.jobOfferRequirementSummary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Settlement Funds
                    </label>
                    <input
                      type="text"
                      name="settlementFundsSummary"
                      value={formData.settlementFundsSummary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Province Connection
                    </label>
                    <input
                      type="text"
                      name="provinceConnectionSummary"
                      value={formData.provinceConnectionSummary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Family Relationship
                    </label>
                    <input
                      type="text"
                      name="familyRelationshipRequirement"
                      value={formData.familyRelationshipRequirement}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      CRS Requirement
                    </label>
                    <input
                      type="text"
                      name="crsRequirementSummary"
                      value={formData.crsRequirementSummary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                </div>
              </div>

              {/* Status Flags */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">
                  Status Flags
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPremiumOnly"
                      checked={formData.isPremiumOnly}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#00a859] rounded"
                    />
                    <span className="text-base md:text-lg text-title">
                      Premium Only
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="showInFreeResults"
                      checked={formData.showInFreeResults}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#00a859] rounded"
                    />
                    <span className="text-base md:text-lg text-title">
                      Show in Free
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isArchived"
                      checked={formData.isArchived}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#00a859] rounded"
                    />
                    <span className="text-base md:text-lg text-title">
                      Archived
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isDisabled"
                      checked={formData.isDisabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#00a859] rounded"
                    />
                    <span className="text-base md:text-lg text-title">
                      Disabled
                    </span>
                  </label>
                </div>
              </div>

              {/* System info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="effectiveStartDate"
                      value={formData.effectiveStartDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="effectiveEndDate"
                      value={formData.effectiveEndDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                  <div>
                    <label className="block text-base md:text-lg font-medium text-title mb-1">
                      Version Number
                    </label>
                    <input
                      type="number"
                      name="versionNumber"
                      value={formData.versionNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg focus:outline-none focus:ring-1 focus:ring-[#00a859]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setIsStreamModalOpen(false);
                resetForm();
              }}
              className="px-6 py-2 border border-[#00a859] text-[#00a859] rounded-md text-base md:text-lg font-medium hover:bg-green-50 transition-colors"
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 rounded-md text-base md:text-lg font-medium text-white bg-[#00a859] hover:bg-green-600 transition-colors"
              onClick={handleSubmit}
            >
              {editingStreamId ? "Update Stream" : "Create Stream"}
            </button>
          </div>
        </div>
      </CustomModal>

      {/* Details Modal */}
      <CustomModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedStreamId(null);
        }}
        maxWidth="3xl"
        showCloseButton={false}
      >
        <div>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl md:text-2xl font-bold text-title">
              Stream Details
            </h2>
            <button
              onClick={() => {
                setIsDetailsModalOpen(false);
                setSelectedStreamId(null);
              }}
              className="text-description hover:text-slate-600"
            >
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isSingleStreamLoading || isSingleStreamFetching ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-slate-500 text-lg">
                  <Loader size={30} className="text-primary" />
                </p>
              </div>
            ) : singleStremData ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Program
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.program?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Stream Name
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.streamName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Country
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.country || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Province / Region
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.provinceRegion || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Category
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.category || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 text-base  font-semibold rounded-md ${
                          POSITIVE_STATUSES.includes(singleStremData.status)
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {formatEnumLabel(singleStremData.status || "")}
                      </span>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Processing Time
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.processingTime || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Stream Visibility
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.visibility
                          ? formatEnumLabel(singleStremData.visibility)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Priority Ranking
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.priorityRanking ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status & Flags */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Status & Flags
                  </h3>
                  <div className="flex flex-wrap gap-3 bg-slate-50 p-4 rounded-lg">
                    {singleStremData.isPremiumOnly && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-base md:text-lg  font-semibold rounded-full">
                        Premium Only
                      </span>
                    )}
                    {singleStremData.showInFreeResults && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-base md:text-lg  font-semibold rounded-full">
                        Show In Free Results
                      </span>
                    )}
                    {singleStremData.isArchived && (
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 text-base md:text-lg  font-semibold rounded-full">
                        Archived
                      </span>
                    )}
                    {singleStremData.isDisabled && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-base md:text-lg  font-semibold rounded-full">
                        Disabled
                      </span>
                    )}
                    {!singleStremData.isPremiumOnly &&
                      !singleStremData.showInFreeResults &&
                      !singleStremData.isArchived &&
                      !singleStremData.isDisabled && (
                        <p className="text-base md:text-lg  text-slate-500">
                          No flags active.
                        </p>
                      )}
                  </div>
                </div>

                {/* Assessment Types */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Assessment Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {singleStremData.assessmentTypes?.length > 0 ? (
                      singleStremData.assessmentTypes.map((type: string) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-indigo-50 text-indigo-600 text-base md:text-lg  font-medium border border-indigo-100 rounded-md"
                        >
                          {formatEnumLabel(type)}
                        </span>
                      ))
                    ) : (
                      <p className="text-base md:text-lg  text-slate-500">
                        No assessment types selected.
                      </p>
                    )}
                  </div>
                </div>

                {/* Descriptions */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Descriptions
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Description
                      </p>
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-md">
                        {singleStremData.description || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Public Summary
                      </p>
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-md">
                        {singleStremData.publicSummary || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Internal Notes
                      </p>
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-md">
                        {singleStremData.internalNotes || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Requirements
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Language",
                        value: singleStremData.languageRequirementSummary,
                      },
                      {
                        label: "Education",
                        value: singleStremData.educationRequirementSummary,
                      },
                      {
                        label: "Work Experience",
                        value: singleStremData.workExperienceRequirementSummary,
                      },
                      {
                        label: "Job Offer",
                        value: singleStremData.jobOfferRequirementSummary,
                      },
                      {
                        label: "Settlement Funds",
                        value: singleStremData.settlementFundsSummary,
                      },
                      {
                        label: "Province Connection",
                        value: singleStremData.provinceConnectionSummary,
                      },
                      {
                        label: "Family Relationship",
                        value: singleStremData.familyRelationshipRequirement,
                      },
                      {
                        label: "CRS Requirement",
                        value: singleStremData.crsRequirementSummary,
                      },
                    ].map((req, idx) => (
                      <div key={idx}>
                        <p className="text-base md:text-lg  text-slate-500 mb-1">
                          {req.label}
                        </p>
                        <p className="text-slate-700 bg-slate-50 p-3 rounded-md">
                          {req.value || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates & Versioning */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Dates & Versioning
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Effective Start Date
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.effectiveStartDate
                          ? new Date(
                              singleStremData.effectiveStartDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Effective End Date
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.effectiveEndDate
                          ? new Date(
                              singleStremData.effectiveEndDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Last Reviewed
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.lastReviewedDate
                          ? new Date(
                              singleStremData.lastReviewedDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Version Number
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.versionNumber ?? "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Created At
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.createdAt
                          ? new Date(singleStremData.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-base md:text-lg  text-slate-500 mb-1">
                        Updated At
                      </p>
                      <p className="font-medium text-slate-700">
                        {singleStremData.updatedAt
                          ? new Date(singleStremData.updatedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-12">
                <p className="text-slate-500 text-lg">
                  Stream details not found.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setIsDetailsModalOpen(false);
                setSelectedStreamId(null);
              }}
              className="px-6 py-2 rounded-md text-base md:text-lg font-medium text-white bg-[#00a859] hover:bg-green-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
}