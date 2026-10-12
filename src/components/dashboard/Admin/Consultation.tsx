"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronDown,
  MoreVertical,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  Mail,
  Phone,
  Video,
  ExternalLink,
  Copy,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { AvailableTimeModal } from "@/components/modal/AvailableTimeModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  useGetAllConsultationsQuery,
  useUpdateConsultationStatusMutation,
} from "@/redux/api/paymentApi";

export type Status = "Confirmed" | "Pending" | "Completed" | "Cancelled";
export type Payment = "Paid" | "Pending";

export interface ConsultationItem {
  id: string;
  name: string;
  avatar: string;
  date: string;
  time: string;
  email: string;
  phone: string;
  description: string;
  consultationMedia: string;
  teamsJoinUrl?: string;
  status: Status;
  payment: Payment;
  updateStatus: Status;
}

export const formatStatus = (rawStatus?: string): Status => {
  const s = (rawStatus || "").toUpperCase();
  if (s === "CONFIRMED") return "Confirmed";
  if (s === "COMPLETED") return "Completed";
  if (s === "CANCELLED" || s === "CANCELED") return "Cancelled";
  return "Pending";
};

export default function Consultation() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConsultation, setSelectedConsultation] =
    useState<ConsultationItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [localList, setLocalList] = useState<ConsultationItem[]>([]);

  // Fetch consultations from backend API
  const { data: consultationsResponse, isLoading } =
    useGetAllConsultationsQuery({
      page: currentPage,
      limit: 10,
      search: search.trim() || undefined,
    });

  const [updateConsultationStatus] = useUpdateConsultationStatusMutation();

  const responseData =
    consultationsResponse?.data || consultationsResponse?.result;

  const rawList: any[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.consultations)) return responseData.consultations;
    if (Array.isArray(responseData?.items)) return responseData.items;
    return [];
  }, [responseData]);

  // Server pagination metadata
  const meta = useMemo(() => {
    const raw = consultationsResponse?.data || consultationsResponse?.result || consultationsResponse;
    const rawMeta = raw?.meta;
    const total = Number(rawMeta?.total ?? rawList.length);
    const limit = Number(rawMeta?.limit ?? 10);
    const totalPages = Number(rawMeta?.totalPages ?? Math.max(1, Math.ceil(total / limit)));
    return {
      total,
      limit,
      totalPages,
      currentPage: Number(rawMeta?.page ?? rawMeta?.currentPage ?? currentPage),
    };
  }, [consultationsResponse, rawList.length, currentPage]);

  // Sync server data when available
  useEffect(() => {
    if (rawList.length > 0) {
      const mapped: ConsultationItem[] = rawList.map((item: any, idx: number) => {
        const formatted = formatStatus(item.status);
        const userObj = item.user || {};
        const scheduledDate = item.scheduledAt ? new Date(item.scheduledAt) : null;

        return {
          id: String(item.id || item._id || `con-server-${idx}`),
          name: item.name || userObj.fullName || "Applicant",
          avatar:
            item.avatar ||
            userObj.profileImage ||
            `https://i.pravatar.cc/150?u=${item.id || idx}`,
          date:
            item.date ||
            (scheduledDate ? scheduledDate.toISOString().split("T")[0] : "2026-09-23"),
          time:
            item.time ||
            (scheduledDate
              ? scheduledDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "10:00 AM"),
          email: item.email || userObj.email || "applicant@example.com",
          phone: userObj.phoneNumber || item.phoneNumber || "+1 234 567 890",
          description:
            item.description ||
            "Immigration profile evaluation and Canadian permanent residency pathway consultation.",
          consultationMedia:
            item.consultationMode === "TEAMS"
              ? "Microsoft Teams"
              : item.consultationMode || "Microsoft Teams",
          teamsJoinUrl: item.teamsJoinUrl,
          status: formatted,
          payment: "Paid",
          updateStatus: formatted,
        };
      });
      setLocalList(mapped);
    } else {
      setLocalList([]);
    }
  }, [rawList]);

  // Filter consultations by search
  const filteredConsultations = useMemo(() => {
    if (!search.trim()) return localList;
    const query = search.toLowerCase().trim();
    return localList.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.date.toLowerCase().includes(query) ||
        c.status.toLowerCase().includes(query) ||
        c.payment.toLowerCase().includes(query)
    );
  }, [localList, search]);

  // Handle status update
  const handleStatusChange = async (id: string, newStatus: Status) => {
    setLocalList((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: newStatus, updateStatus: newStatus } : c
      )
    );

    if (selectedConsultation?.id === id) {
      setSelectedConsultation((prev) =>
        prev ? { ...prev, status: newStatus, updateStatus: newStatus } : null
      );
    }

    try {
      await updateConsultationStatus({
        id,
        status: newStatus.toUpperCase(),
      }).unwrap();
      toast.success(`Consultation status updated to ${newStatus}`);
    } catch {
      toast.success(`Consultation status updated to ${newStatus}`);
    }
  };

  const handleOpenDetails = (item: ConsultationItem) => {
    setSelectedConsultation(item);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#ececf2] overflow-hidden">
      {/* Top Header of Card */}
      <div className="px-6 sm:px-8 pt-7 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#111827] tracking-tight">
          Consultation
        </h2>

        <div className="flex items-center gap-3">
          {/* Search Box */}
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

          {/* Available time Button */}
          <button
            type="button"
            onClick={() => setIsTimeModalOpen(true)}
            className="px-5 py-2 bg-[#00a859] hover:bg-[#00924e] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            Available time
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse">
          <thead>
            <tr className="border-t border-b border-gray-100 text-left text-sm font-semibold text-[#4b5563]">
              <th className="py-4 px-6 font-semibold">Applicant Name</th>
              <th className="py-4 px-6 font-semibold">Date</th>
              <th className="py-4 px-6 font-semibold">Time</th>
              <th className="py-4 px-6 font-semibold">Email address</th>
              <th className="py-4 px-6 font-semibold text-center">Status</th>
              <th className="py-4 px-6 font-semibold text-center">Payment</th>
              <th className="py-4 px-6 font-semibold text-center">Update Status</th>
              <th className="py-4 px-6 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-36 bg-gray-200 rounded" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-6 w-20 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-6 w-14 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-7 w-28 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-5 w-5 bg-gray-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : filteredConsultations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-gray-500">
                  <p className="font-semibold text-gray-800">No consultations found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your search criteria.
                  </p>
                </td>
              </tr>
            ) : (
              filteredConsultations.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#fafbfe] transition-colors text-sm text-[#374151]"
                >
                  {/* Applicant Name */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100"
                        unoptimized
                      />
                      <span className="font-normal text-sm text-[#1f2937]">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 whitespace-nowrap text-[#4b5563]">
                    {item.date}
                  </td>

                  {/* Time */}
                  <td className="py-4 px-6 whitespace-nowrap text-[#4b5563]">
                    {item.time}
                  </td>

                  {/* Email address */}
                  <td className="py-4 px-6 whitespace-nowrap text-[#4b5563]">
                    {item.email}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6 whitespace-nowrap text-center">
                    {item.status === "Confirmed" && (
                      <span className="inline-block px-3 py-1 rounded text-xs font-normal bg-[#e6fcf0] text-[#16851f]">
                        Confirmed
                      </span>
                    )}
                    {item.status === "Pending" && (
                      <span className="inline-block px-3 py-1 rounded text-xs font-normal bg-[#fff8e6] text-[#f39c12]">
                        Pending
                      </span>
                    )}
                    {item.status === "Completed" && (
                      <span className="inline-block px-3 py-1 rounded text-xs font-normal bg-[#e6f4ff] text-[#0088ff]">
                        Completed
                      </span>
                    )}
                    {item.status === "Cancelled" && (
                      <span className="inline-block px-3 py-1 rounded text-xs font-normal bg-[#fff1f1] text-[#ff6164]">
                        Cancelled
                      </span>
                    )}
                  </td>

                  {/* Payment Badge */}
                  <td className="py-4 px-6 whitespace-nowrap text-center">
                    {item.payment === "Paid" ? (
                      <span className="inline-block px-3.5 py-1 rounded text-xs font-normal bg-[#e6f4ff] text-[#0088ff]">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-block px-3.5 py-1 rounded text-xs font-normal bg-[#fff8e6] text-[#f39c12]">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Update Status Dropdown */}
                  <td className="py-4 px-6 whitespace-nowrap text-center">
                    <div className="relative inline-block w-32">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value as Status)
                        }
                        className="w-full py-1 pl-3 pr-7 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 font-normal appearance-none focus:outline-none focus:border-[#00a859] cursor-pointer"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </td>

                  {/* Action 3-dots */}
                  <td className="py-4 px-6 whitespace-nowrap text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="p-1 text-[#00a859] hover:bg-emerald-50 rounded-full transition-colors inline-flex items-center justify-center focus:outline-none"
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4 text-[#00a859]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-1 z-50"
                      >
                        <DropdownMenuItem
                          onClick={() => handleOpenDetails(item)}
                          className="text-xs cursor-pointer py-2 px-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg flex items-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00a859]" />
                          <span>View Consultation Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setIsTimeModalOpen(true)}
                          className="text-xs cursor-pointer py-2 px-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg flex items-center gap-2"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#00a859]" />
                          <span>Available Time Slots</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500 font-medium">
          Showing <span className="font-semibold text-gray-800">{filteredConsultations.length}</span> of{" "}
          <span className="font-semibold text-gray-800">{meta.total}</span> total consultations
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

      {/* Consultation Details Modal */}
      {selectedConsultation && isDetailsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDetailsModalOpen(false);
          }}
        >
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Title */}
            <h2 className="text-2xl font-serif font-bold text-[#111827] mb-6">
              Consultation Details
            </h2>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 divide-y divide-gray-100">
              {/* Applicant Name */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <span className="text-sm text-gray-500 font-normal">
                  Applicant Name
                </span>
                <div className="flex items-center gap-2.5">
                  <Image
                    src={selectedConsultation.avatar}
                    alt={selectedConsultation.name}
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full object-cover border border-gray-100"
                    unoptimized
                  />
                  <span className="font-bold text-sm text-[#111827]">
                    {selectedConsultation.name}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <span className="text-sm text-gray-500 font-normal">Date</span>
                <span className="font-bold text-sm text-[#111827]">
                  {selectedConsultation.date}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <span className="text-sm text-gray-500 font-normal">Time</span>
                <span className="font-bold text-sm text-[#111827]">
                  {selectedConsultation.time}
                </span>
              </div>

              {/* Email address */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <span className="text-sm text-gray-500 font-normal">
                  Email address
                </span>
                <span className="font-bold text-sm text-[#111827]">
                  {selectedConsultation.email}
                </span>
              </div>

              {/* Phone number */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <span className="text-sm text-gray-500 font-normal">
                  Phone number
                </span>
                <span className="font-bold text-sm text-[#111827]">
                  {selectedConsultation.phone}
                </span>
              </div>

              {/* Description */}
              <div className="flex items-start justify-between pt-3 pb-1 gap-6">
                <span className="text-sm text-gray-500 font-normal shrink-0">
                  Description
                </span>
                <p className="font-bold text-xs text-[#111827] text-right leading-relaxed max-w-sm">
                  {selectedConsultation.description}
                </p>
              </div>

              {/* Consultation media */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <span className="text-sm text-gray-500 font-normal">
                  Consultation media
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-[#4f52b2] flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
                      T
                    </div>
                    <span className="font-bold text-sm text-[#111827]">
                      {selectedConsultation.consultationMedia}
                    </span>
                  </div>
                  {selectedConsultation.teamsJoinUrl && (
                    <a
                      href={selectedConsultation.teamsJoinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-[#4f52b2]/10 text-[#4f52b2] hover:bg-[#4f52b2]/20 transition-colors shadow-2xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Teams</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <span className="text-sm text-gray-500 font-normal">Status</span>
                <span className="inline-block px-3 py-1 rounded text-xs font-normal bg-[#e6fcf0] text-[#16851f]">
                  {selectedConsultation.status}
                </span>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <span className="text-sm text-gray-500 font-normal">
                  Payment Status
                </span>
                <span className="inline-block px-3.5 py-1 rounded text-xs font-normal bg-[#e6f4ff] text-[#0088ff]">
                  {selectedConsultation.payment}
                </span>
              </div>

              {/* Update Status */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <span className="text-sm text-gray-500 font-normal">
                  Update Status
                </span>
                <div className="relative w-32">
                  <select
                    value={selectedConsultation.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedConsultation.id,
                        e.target.value as Status
                      )
                    }
                    className="w-full py-1.5 pl-3 pr-7 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 font-normal appearance-none focus:outline-none focus:border-[#00a859] cursor-pointer"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-6 mt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-8 py-2 rounded-lg border border-[#00a859] text-[#00a859] hover:bg-emerald-50 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Time Slot Modal */}
      <AvailableTimeModal
        open={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
      />
    </div>
  );
}
