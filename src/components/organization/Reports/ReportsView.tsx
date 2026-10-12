"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { useGetOrganizationReportsQuery } from "@/redux/api/organizationApi";
import { Pagination } from "@/components/ui/Pagination";

export interface ReportRecord {
  id: string;
  userId: string;
  type: string;
  status: "Completed" | "In Progress" | "Pending" | string;
  overallScore: number | string;
  programsMatched: string;
  date: string;
}

const INITIAL_REPORTS: ReportRecord[] = [
  {
    id: "1",
    userId: "6a2054ca-82f1-46ab-9a4d",
    type: "Permanent Residence",
    status: "Completed",
    overallScore: 85,
    programsMatched: "3 Programs",
    date: "28/06/2026",
  },
  {
    id: "2",
    userId: "6a2054ca-91b3-40fa-80e2",
    type: "Study Permit",
    status: "Completed",
    overallScore: 85,
    programsMatched: "3 Programs",
    date: "28/06/2026",
  },
  {
    id: "3",
    userId: "6a2054ca-43bc-4389-98dd",
    type: "Permanent Residence",
    status: "Completed",
    overallScore: 85,
    programsMatched: "3 Programs",
    date: "28/06/2026",
  },
  {
    id: "4",
    userId: "8b3172ef-71cd-41ef-bf10",
    type: "Work Permit",
    status: "Completed",
    overallScore: 92,
    programsMatched: "5 Programs",
    date: "26/06/2026",
  },
  {
    id: "5",
    userId: "9c4283da-62ae-42de-a89c",
    type: "Express Entry",
    status: "In Progress",
    overallScore: "--",
    programsMatched: "1 Program",
    date: "24/06/2026",
  },
];

export default function ReportsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const statusOptions = ["All Statuses", "Completed", "In Progress", "Pending"];

  const { data: reportsResponse, isLoading } = useGetOrganizationReportsQuery({
    search: searchQuery || undefined,
    status: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
  });

  const serverReports: ReportRecord[] | undefined =
    reportsResponse?.data?.reports ||
    reportsResponse?.result?.reports ||
    (Array.isArray(reportsResponse?.data) ? reportsResponse?.data : undefined);
  const rawReports: ReportRecord[] =
    serverReports && serverReports.length > 0 ? serverReports : INITIAL_REPORTS;

  const filteredReports = useMemo(() => {
    return rawReports.filter((report) => {
      const matchesSearch =
        report.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.programsMatched.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "All Statuses" ||
        report.status.toLowerCase().replace("_", " ") ===
          selectedStatus.toLowerCase().replace("_", " ");

      return matchesSearch && matchesStatus;
    });
  }, [rawReports, searchQuery, selectedStatus]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedReports = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, safeCurrentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#111827] caros">
          Reports
        </h2>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports.."
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
                <th className="py-4 pl-2">USER</th>
                <th className="py-4 px-4">TYPE</th>
                <th className="py-4 px-4">STATUS</th>
                <th className="py-4 px-4">OVERALL SCORE</th>
                <th className="py-4 px-4">PROGRAMS MATCHED</th>
                <th className="py-4 pr-2">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[15px]">
              {paginatedReports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* USER (Truncated ID) */}
                  <td
                    className="py-4 pl-2 font-mono text-xs text-gray-500 font-medium"
                    title={report.userId}
                  >
                    {report.userId.slice(0, 8)}...
                  </td>

                  {/* TYPE (Pill Badge) */}
                  <td className="py-4 px-4">
                    <span className="px-3.5 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-700 bg-white shadow-2xs inline-block">
                      {report.type}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-4">
                    {(() => {
                      const s = (report.status || "").toLowerCase().replace("_", " ");
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
                          {report.status || "Pending"}
                        </span>
                      );
                    })()}
                  </td>

                  {/* OVERALL SCORE */}
                  <td className="py-4 px-4 text-gray-700 font-medium">
                    {report.overallScore}
                  </td>

                  {/* PROGRAMS MATCHED */}
                  <td className="py-4 px-4 text-gray-600 text-sm font-medium">
                    {report.programsMatched}
                  </td>

                  {/* DATE */}
                  <td className="py-4 pr-2 text-gray-600 text-sm font-medium">
                    {report.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="py-12 flex justify-center items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a63e]" />
              <span>Loading reports...</span>
            </div>
          )}

          {!isLoading && filteredReports.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No reports match your current filter criteria.
            </div>
          )}
        </div>

        {filteredReports.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing Page <span className="font-semibold text-gray-800">{safeCurrentPage}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalPages}</span> ({filteredReports.length} total reports)
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
