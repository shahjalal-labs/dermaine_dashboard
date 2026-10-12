"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { useGetOrganizationApplicantsQuery } from "@/redux/api/organizationApi";
import { Pagination } from "@/components/ui/Pagination";

export interface ApplicantApplication {
  id: string;
  applicantId: string;
  assessmentsCount: number;
  assessmentTypes: string[];
  latestActivity: string;
  status: "Completed" | "In Progress" | "Pending" | string;
}

const INITIAL_APPLICANTS: ApplicantApplication[] = [
  {
    id: "1",
    applicantId: "6a2054ca-82f1-46ab-9a4d",
    assessmentsCount: 5,
    assessmentTypes: ["Permanent Residence", "Study permit"],
    latestActivity: "28/06/2026",
    status: "Completed",
  },
  {
    id: "2",
    applicantId: "6a2054ca-91b3-40fa-80e2",
    assessmentsCount: 5,
    assessmentTypes: ["Permanent Residence", "Study permit"],
    latestActivity: "28/06/2026",
    status: "Completed",
  },
  {
    id: "3",
    applicantId: "6a2054ca-43bc-4389-98dd",
    assessmentsCount: 5,
    assessmentTypes: ["Permanent Residence", "Study permit"],
    latestActivity: "28/06/2026",
    status: "Completed",
  },
  {
    id: "4",
    applicantId: "8b3172ef-71cd-41ef-bf10",
    assessmentsCount: 3,
    assessmentTypes: ["Work Permit", "Express Entry"],
    latestActivity: "25/06/2026",
    status: "Completed",
  },
  {
    id: "5",
    applicantId: "9c4283da-62ae-42de-a89c",
    assessmentsCount: 2,
    assessmentTypes: ["Visitor Visa"],
    latestActivity: "22/06/2026",
    status: "In Progress",
  },
];

export default function ApplicantsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const statusOptions = ["All Statuses", "Completed", "In Progress", "Pending"];

  const { data: applicantsResponse, isLoading } = useGetOrganizationApplicantsQuery({
    search: searchQuery || undefined,
    status: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
  });

  const serverApplicants: ApplicantApplication[] | undefined =
    applicantsResponse?.data?.applicants ||
    applicantsResponse?.result?.applicants ||
    (Array.isArray(applicantsResponse?.data) ? applicantsResponse?.data : undefined);
  const rawApplicants: ApplicantApplication[] =
    serverApplicants && serverApplicants.length > 0 ? serverApplicants : INITIAL_APPLICANTS;

  // Filter applicants based on search term and status
  const filteredApplicants = useMemo(() => {
    return rawApplicants.filter((applicant) => {
      const matchesSearch =
        applicant.applicantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.assessmentTypes.some((type) =>
          type.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus =
        selectedStatus === "All Statuses" ||
        applicant.status.toLowerCase().replace("_", " ") ===
          selectedStatus.toLowerCase().replace("_", " ");

      return matchesSearch && matchesStatus;
    });
  }, [rawApplicants, searchQuery, selectedStatus]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedApplicants = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredApplicants.slice(start, start + pageSize);
  }, [filteredApplicants, safeCurrentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#111827] caros">
          Applicants
        </h2>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a63e]/20 focus:border-[#00a63e] shadow-sm"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="relative min-w-[180px]">
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

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#ECECF2] p-6 md:p-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 pl-2">APPLICANT ID</th>
                <th className="py-4 px-4">ASSESSMENTS</th>
                <th className="py-4 px-4">ASSESSMENTS TYPE</th>
                <th className="py-4 px-4">LATEST ACTIVITY</th>
                <th className="py-4 pr-2">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[15px]">
              {paginatedApplicants.map((applicant) => (
                <tr
                  key={applicant.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* Truncated Applicant ID with tooltip */}
                  <td
                    className="py-4 pl-2 font-mono text-xs text-gray-500 font-medium"
                    title={applicant.applicantId}
                  >
                    {applicant.applicantId.slice(0, 8)}...
                  </td>

                  {/* Assessments Count */}
                  <td className="py-4 px-4 text-gray-700 font-medium">
                    {applicant.assessmentsCount}
                  </td>

                  {/* Assessment Type Pills */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-2">
                      {applicant.assessmentTypes.map((type, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-700 bg-white shadow-2xs"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Latest Activity Date */}
                  <td className="py-4 px-4 text-gray-600 text-sm font-medium">
                    {applicant.latestActivity}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 pr-2">
                    {(() => {
                      const s = (applicant.status || "").toLowerCase().replace("_", " ");
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
                          {applicant.status || "Pending"}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="py-12 flex justify-center items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a63e]" />
              <span>Loading applicants...</span>
            </div>
          )}

          {!isLoading && filteredApplicants.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No applicants match your current search or status filter.
            </div>
          )}
        </div>

        {filteredApplicants.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing Page <span className="font-semibold text-gray-800">{safeCurrentPage}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalPages}</span> ({filteredApplicants.length} total applicants)
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
