"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { useGetOrganizationAssessmentsQuery } from "@/redux/api/organizationApi";
import { Pagination } from "@/components/ui/Pagination";

export interface AssessmentRecord {
  id: string;
  userId: string;
  type: string;
  status: "Completed" | "In Progress" | "Pending" | string;
  score: number | string;
  reportPurchased: "Yes" | "No" | string;
  date: string;
}

const INITIAL_ASSESSMENTS: AssessmentRecord[] = [
  {
    id: "1",
    userId: "6a2054ca-82f1-46ab-9a4d",
    type: "Permanent Residence",
    status: "Completed",
    score: 85,
    reportPurchased: "No",
    date: "28/06/2026",
  },
  {
    id: "2",
    userId: "6a2054ca-91b3-40fa-80e2",
    type: "Study Permit",
    status: "Completed",
    score: 85,
    reportPurchased: "No",
    date: "28/06/2026",
  },
  {
    id: "3",
    userId: "6a2054ca-43bc-4389-98dd",
    type: "Permanent Residence",
    status: "Completed",
    score: 85,
    reportPurchased: "No",
    date: "28/06/2026",
  },
  {
    id: "4",
    userId: "8b3172ef-71cd-41ef-bf10",
    type: "Work Permit",
    status: "Completed",
    score: 92,
    reportPurchased: "Yes",
    date: "26/06/2026",
  },
  {
    id: "5",
    userId: "9c4283da-62ae-42de-a89c",
    type: "Express Entry",
    status: "In Progress",
    score: "--",
    reportPurchased: "No",
    date: "24/06/2026",
  },
];

export default function AssessmentView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const typeOptions = [
    "All Types",
    "Permanent Residence",
    "Study Permit",
    "Work Permit",
    "Express Entry",
  ];

  const statusOptions = ["All Statuses", "Completed", "In Progress", "Pending"];

  const { data: assessmentsResponse, isLoading } = useGetOrganizationAssessmentsQuery({
    search: searchQuery || undefined,
    type: selectedType !== "All Types" ? selectedType : undefined,
    status: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
  });

  const serverAssessments: AssessmentRecord[] | undefined =
    assessmentsResponse?.data?.assessments ||
    assessmentsResponse?.result?.assessments ||
    (Array.isArray(assessmentsResponse?.data) ? assessmentsResponse?.data : undefined);
  const rawAssessments: AssessmentRecord[] =
    serverAssessments && serverAssessments.length > 0
      ? serverAssessments
      : INITIAL_ASSESSMENTS;

  const filteredAssessments = useMemo(() => {
    return rawAssessments.filter((item) => {
      const matchesSearch = item.userId
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesType =
        selectedType === "All Types" ||
        item.type.toLowerCase() === selectedType.toLowerCase();

      const matchesStatus =
        selectedStatus === "All Statuses" ||
        item.status.toLowerCase().replace("_", " ") ===
          selectedStatus.toLowerCase().replace("_", " ");

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rawAssessments, searchQuery, selectedType, selectedStatus]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredAssessments.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAssessments = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredAssessments.slice(start, start + pageSize);
  }, [filteredAssessments, safeCurrentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#111827] caros">
          Assessment
        </h2>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a63e]/20 focus:border-[#00a63e] shadow-sm"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Types Dropdown */}
          <div className="relative min-w-[170px]">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00a63e]/20 focus:border-[#00a63e] shadow-sm cursor-pointer pr-10"
            >
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative min-w-[170px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00a63e]/20 focus:border-[#00a63e] shadow-sm cursor-pointer pr-10"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#ECECF2] p-6 md:p-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 pl-2">USER</th>
                <th className="py-4 px-4">TYPE</th>
                <th className="py-4 px-4">STATUS</th>
                <th className="py-4 px-4">SCORE</th>
                <th className="py-4 px-4">REPORT PURCHASED</th>
                <th className="py-4 pr-2">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[15px]">
              {paginatedAssessments.map((assessment) => (
                <tr
                  key={assessment.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* USER (Truncated ID) */}
                  <td
                    className="py-4 pl-2 font-mono text-xs text-gray-500 font-medium"
                    title={assessment.userId}
                  >
                    {assessment.userId.slice(0, 8)}...
                  </td>

                  {/* TYPE (Pill Badge) */}
                  <td className="py-4 px-4">
                    <span className="px-3.5 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-700 bg-white shadow-2xs inline-block">
                      {assessment.type}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-4">
                    {(() => {
                      const s = (assessment.status || "").toLowerCase().replace("_", " ");
                      if (s === "completed") {
                        return (
                          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#E8F7EC] text-[#16851f]">
                            Completed
                          </span>
                        );
                      }
                      if (s === "in progress") {
                        return (
                          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                            In Progress
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                          {assessment.status || "Pending"}
                        </span>
                      );
                    })()}
                  </td>

                  {/* SCORE */}
                  <td className="py-4 px-4 text-gray-700 font-medium">
                    {assessment.score}
                  </td>

                  {/* REPORT PURCHASED */}
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {assessment.reportPurchased}
                  </td>

                  {/* DATE */}
                  <td className="py-4 pr-2 text-gray-600 text-sm font-medium">
                    {assessment.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="py-12 flex justify-center items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a63e]" />
              <span>Loading assessments...</span>
            </div>
          )}

          {!isLoading && filteredAssessments.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No assessments match your current filter criteria.
            </div>
          )}
        </div>

        {filteredAssessments.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing Page <span className="font-semibold text-gray-800">{safeCurrentPage}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalPages}</span> ({filteredAssessments.length} total assessments)
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
