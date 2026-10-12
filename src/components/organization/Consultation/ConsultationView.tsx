"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Loader2, Calendar } from "lucide-react";
import { useGetOrganizationConsultationsQuery } from "@/redux/api/organizationApi";
import { Pagination } from "@/components/ui/Pagination";
import AvailableTimeModal from "@/components/modal/AvailableTimeModal";

export interface ConsultationRecord {
  id: string;
  userId: string;
  type: string;
  status: "Confirmed" | "cancelled" | "Pending" | "Completed" | string;
  date: string;
  time: string;
  consultant: string;
  payment: "Paid" | "Unpaid" | string;
}

const INITIAL_CONSULTATIONS: ConsultationRecord[] = [
  {
    id: "1",
    userId: "6a2054ca-82f1-46ab-9a4d",
    type: "30 Minutes",
    status: "Confirmed",
    date: "2026-06-23",
    time: "12:00 PM",
    consultant: "--",
    payment: "Paid",
  },
  {
    id: "2",
    userId: "6a2054ca-91b3-40fa-80e2",
    type: "30 Minutes",
    status: "cancelled",
    date: "2026-06-23",
    time: "12:00 PM",
    consultant: "--",
    payment: "Paid",
  },
  {
    id: "3",
    userId: "6a2054ca-43bc-4389-98dd",
    type: "30 Minutes",
    status: "Pending",
    date: "2026-06-23",
    time: "12:00 PM",
    consultant: "--",
    payment: "Paid",
  },
  {
    id: "4",
    userId: "8b3172ef-71cd-41ef-bf10",
    type: "45 Minutes",
    status: "Confirmed",
    date: "2026-06-25",
    time: "02:30 PM",
    consultant: "Sarah Connor",
    payment: "Paid",
  },
  {
    id: "5",
    userId: "9c4283da-62ae-42de-a89c",
    type: "60 Minutes",
    status: "Pending",
    date: "2026-06-28",
    time: "10:00 AM",
    consultant: "--",
    payment: "Paid",
  },
];

export default function ConsultationView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  const statusOptions = [
    "All Statuses",
    "Confirmed",
    "cancelled",
    "Pending",
    "Completed",
  ];

  const { data: consultationsResponse, isLoading } = useGetOrganizationConsultationsQuery({
    search: searchQuery || undefined,
    status: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
  });

  const serverConsultations: ConsultationRecord[] | undefined =
    consultationsResponse?.data?.consultations ||
    consultationsResponse?.result?.consultations ||
    (Array.isArray(consultationsResponse?.data) ? consultationsResponse?.data : undefined);
  const rawConsultations: ConsultationRecord[] =
    serverConsultations && serverConsultations.length > 0
      ? serverConsultations
      : INITIAL_CONSULTATIONS;

  const filteredConsultations = useMemo(() => {
    return rawConsultations.filter((item) => {
      const matchesSearch =
        item.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.consultant.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "All Statuses" ||
        item.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rawConsultations, searchQuery, selectedStatus]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredConsultations.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedConsultations = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredConsultations.slice(start, start + pageSize);
  }, [filteredConsultations, safeCurrentPage, pageSize]);

  const renderStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed" || s === "completed") {
      return (
        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#E8F7EC] text-[#16851f]">
          {status}
        </span>
      );
    }
    if (s === "cancelled" || s === "canceled") {
      return (
        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FFF1F1] text-[#EF4444]">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FFF9EA] text-[#D97706]">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Heading & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#111827] caros">
            Consultation
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage organization consultations and applicant schedules
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTimeModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#00a63e] hover:bg-[#00924e] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>Available time</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search consultations..."
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
                <th className="py-4 px-4">DATE</th>
                <th className="py-4 px-4">TIME</th>
                <th className="py-4 px-4">CONSULTANT</th>
                <th className="py-4 pr-2">PAYMENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[15px]">
              {paginatedConsultations.map((consultation) => (
                <tr
                  key={consultation.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* USER (Truncated ID) */}
                  <td
                    className="py-4 pl-2 font-mono text-xs text-gray-500 font-medium"
                    title={consultation.userId}
                  >
                    {consultation.userId.slice(0, 8)}...
                  </td>

                  {/* TYPE */}
                  <td className="py-4 px-4 font-bold text-gray-900 text-sm">
                    {consultation.type}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-4">
                    {renderStatusBadge(consultation.status)}
                  </td>

                  {/* DATE */}
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {consultation.date}
                  </td>

                  {/* TIME */}
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {consultation.time}
                  </td>

                  {/* CONSULTANT */}
                  <td className="py-4 px-4 text-gray-500 text-sm">
                    {consultation.consultant}
                  </td>

                  {/* PAYMENT */}
                  <td className="py-4 pr-2">
                    <span className="px-3.5 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-700 bg-white shadow-2xs inline-block">
                      {consultation.payment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="py-12 flex justify-center items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a63e]" />
              <span>Loading consultations...</span>
            </div>
          )}

          {!isLoading && filteredConsultations.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No consultations match your filter criteria.
            </div>
          )}
        </div>

        {filteredConsultations.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing Page <span className="font-semibold text-gray-800">{safeCurrentPage}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalPages}</span> ({filteredConsultations.length} total consultations)
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

      {/* Available Time Modal */}
      <AvailableTimeModal
        open={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
      />
    </div>
  );
}
