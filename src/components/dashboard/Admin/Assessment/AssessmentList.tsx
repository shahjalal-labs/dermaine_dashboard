"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useGetAssessmentSubmissionsQuery } from "@/redux/api/adminApi";
import QuestionnaireEditor from "./QuestionnaireEditor";

export default function AssessmentList() {
  const [activeTab, setActiveTab] = useState("Submissions");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("assessmentActiveTab");
    if (saved) {
      setActiveTab(saved);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem("assessmentActiveTab", tab);
  };

  // Fetch real submissions from backend API
  const {
    data: responseData,
    isLoading,
  } = useGetAssessmentSubmissionsQuery(
    { page: currentPage, limit: 10, search: search.trim() || undefined },
    { skip: activeTab !== "Submissions" },
  );

  const rawItems = useMemo(() => {
    let raw: any[] = [];
    if (Array.isArray(responseData?.data?.items)) {
      raw = responseData.data.items;
    } else if (Array.isArray(responseData?.result?.items)) {
      raw = responseData.result.items;
    } else if (Array.isArray(responseData?.items)) {
      raw = responseData.items;
    } else if (Array.isArray(responseData?.data)) {
      raw = responseData.data;
    } else if (Array.isArray(responseData?.result)) {
      raw = responseData.result;
    }
    return raw;
  }, [responseData]);

  const submissionsList = useMemo(() => {
    return rawItems
      .filter((item: any) => !deletedIds.includes(String(item.id)))
      .map((item: any) => {
        let formattedDob = "—";
        if (item.dob) {
          try {
            const d = new Date(item.dob);
            if (!isNaN(d.getTime())) {
              formattedDob = `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
            } else {
              formattedDob = String(item.dob);
            }
          } catch {
            formattedDob = String(item.dob);
          }
        }

        return {
          id: String(item.id),
          name: item.name || "Candidate",
          assessment: item.assessment || item.assesment?.title || "Assessment",
          email: item.email || "—",
          score: item.score || "100%",
          dob: formattedDob,
          status: item.status || "Completed",
          submittedAt: item.submittedAt || item.createdAt || "",
        };
      });
  }, [rawItems, deletedIds]);

  const meta = useMemo(() => {
    const raw = responseData?.data || responseData?.result || responseData;
    const rawMeta = raw?.meta || responseData?.meta;
    const total = Number(rawMeta?.total ?? raw?.total ?? submissionsList.length);
    const limit = Number(rawMeta?.limit ?? raw?.limit ?? 10);
    const totalPages = Number(
      rawMeta?.totalPages ??
      rawMeta?.totalPage ??
      raw?.totalPages ??
      raw?.totalPage ??
      Math.max(1, Math.ceil(total / (limit || 10)))
    );
    const page = Number(rawMeta?.page ?? raw?.page ?? currentPage);

    return {
      total,
      limit,
      totalPages: Math.max(1, totalPages),
      currentPage: page,
    };
  }, [responseData, submissionsList.length, currentPage]);

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => [...prev, id]);
    setConfirmDeleteId(null);
    toast.success("Submission removed from view");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#ececf2] p-6 flex flex-col">
      {/* Top Header of Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
        <h2 className="text-xl font-bold text-[#111827] tracking-tight">
          Assessment List
        </h2>

        {activeTab === "Submissions" && (
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a859] focus:border-[#00a859] transition-colors"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 mb-6 border-b border-gray-100">
        <button
          type="button"
          onClick={() => handleTabChange("Submissions")}
          className={`pb-3 text-sm md:text-base font-bold transition-colors relative ${
            activeTab === "Submissions"
              ? "text-[#111827]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Submissions
          {activeTab === "Submissions" && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00a859] rounded-t-md" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("Questionnaire Editor")}
          className={`pb-3 text-sm md:text-base font-bold transition-colors relative ${
            activeTab === "Questionnaire Editor"
              ? "text-[#111827]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Questionnaire Editor
          {activeTab === "Questionnaire Editor" && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00a859] rounded-t-md" />
          )}
        </button>
      </div>

      {activeTab === "Submissions" && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse">
              <thead>
                <tr className="border-t border-b border-gray-100 text-left text-sm font-semibold text-[#4b5563]">
                  <th className="py-4 px-6 font-semibold">User name</th>
                  <th className="py-4 px-6 font-semibold">Assessment Name</th>
                  <th className="py-4 px-6 font-semibold">Email Address</th>
                  <th className="py-4 px-6 font-semibold">Score</th>
                  <th className="py-4 px-6 font-semibold">Date of birth</th>
                  <th className="py-4 px-6 font-semibold text-center">Status</th>
                  <th className="py-4 px-6 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="w-28 h-4 rounded bg-gray-200" /></td>
                      <td className="py-4 px-6"><div className="w-36 h-4 rounded bg-gray-200" /></td>
                      <td className="py-4 px-6"><div className="w-32 h-4 rounded bg-gray-200" /></td>
                      <td className="py-4 px-6"><div className="w-12 h-4 rounded bg-gray-200" /></td>
                      <td className="py-4 px-6"><div className="w-20 h-4 rounded bg-gray-200" /></td>
                      <td className="py-4 px-6 text-center"><div className="w-16 h-6 rounded bg-gray-200 mx-auto" /></td>
                      <td className="py-4 px-6 text-center"><div className="w-12 h-6 rounded bg-gray-200 mx-auto" /></td>
                    </tr>
                  ))
                ) : submissionsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      <p className="font-semibold text-gray-800">No assessment submissions found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try adjusting your search query.
                      </p>
                    </td>
                  </tr>
                ) : (
                  submissionsList.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fafbfe] transition-colors text-sm text-[#374151]">
                      {/* User name */}
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-[#111827]">
                        {item.name}
                      </td>

                      {/* Assessment Name */}
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#4b5563]">
                        {item.assessment}
                      </td>

                      {/* Email Address */}
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#4b5563]">
                        {item.email}
                      </td>

                      {/* Score */}
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-[#111827]">
                        {item.score}
                      </td>

                      {/* Date of birth */}
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#4b5563]">
                        {item.dob}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-normal ${
                            item.status?.toLowerCase() === "completed"
                              ? "bg-[#e6f4ff] text-[#0088ff]"
                              : "bg-[#fff8e6] text-[#f39c12]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            href={`/admin/assessment/${item.id}`}
                            title="View Assessment Details"
                            className="p-1 text-[#f59e0b] hover:opacity-75 transition-opacity inline-flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 text-[#f59e0b]" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            title="Delete Submission"
                            className="p-1 text-[#ef4444] hover:opacity-75 transition-opacity inline-flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4 text-[#ef4444]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer matching design */}
          <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium">
              Showing Page <span className="font-semibold text-gray-800">{meta.currentPage}</span> of{" "}
              <span className="font-semibold text-gray-800">{meta.totalPages}</span> ({meta.total} total submissions)
            </p>

            <div className="flex items-center gap-1.5">
              {/* Previous Page Chevron */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className="w-8 h-8 flex items-center justify-center text-[#f87171] hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-[#00a859] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Page Chevron */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(meta.totalPages, prev + 1))}
                disabled={currentPage >= meta.totalPages}
                className="w-8 h-8 flex items-center justify-center text-[#f87171] hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Questionnaire Editor" && <QuestionnaireEditor />}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Delete Submission?
            </h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to remove this submission record from view?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
