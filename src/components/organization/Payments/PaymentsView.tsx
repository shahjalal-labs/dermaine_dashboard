"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { useGetOrganizationPaymentsQuery } from "@/redux/api/organizationApi";
import { Pagination } from "@/components/ui/Pagination";

export interface PaymentTransaction {
  id: string;
  invoice: string;
  userId: string;
  product: string;
  amount: number;
  currency: string;
  status: "Completed" | "Pending" | "Refunded" | "Failed" | string;
  date: string;
}

const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: "1",
    invoice: "INV124578",
    userId: "6a2054ca-82f1-46ab-9a4d",
    product: "Consultation 30",
    amount: 89,
    currency: "CAD",
    status: "Completed",
    date: "28/06/2026",
  },
  {
    id: "2",
    invoice: "INV124579",
    userId: "6a2054ca-91b3-40fa-80e2",
    product: "Consultation 30",
    amount: 89,
    currency: "CAD",
    status: "Completed",
    date: "28/06/2026",
  },
  {
    id: "3",
    invoice: "INV124580",
    userId: "6a2054ca-43bc-4389-98dd",
    product: "Consultation 30",
    amount: 89,
    currency: "CAD",
    status: "Completed",
    date: "28/06/2026",
  },
  {
    id: "4",
    invoice: "INV124581",
    userId: "8b3172ef-71cd-41ef-bf10",
    product: "Assessment Full Report",
    amount: 199,
    currency: "CAD",
    status: "Completed",
    date: "26/06/2026",
  },
  {
    id: "5",
    invoice: "INV124582",
    userId: "9c4283da-62ae-42de-a89c",
    product: "Consultation 60",
    amount: 145,
    currency: "CAD",
    status: "Completed",
    date: "25/06/2026",
  },
  {
    id: "6",
    invoice: "INV124583",
    userId: "7e5194ba-53ae-43ba-98fd",
    product: "Assessment Report Add-on",
    amount: 140,
    currency: "CAD",
    status: "Completed",
    date: "24/06/2026",
  },
];

export default function PaymentsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const statusOptions = ["All Statuses", "Completed", "Pending", "Refunded"];

  const { data: paymentsResponse, isLoading } = useGetOrganizationPaymentsQuery({
    search: searchQuery || undefined,
    status: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
  });

  const serverPayments: PaymentTransaction[] | undefined =
    paymentsResponse?.data?.payments ||
    paymentsResponse?.result?.payments ||
    (Array.isArray(paymentsResponse?.data) ? paymentsResponse?.data : undefined);
  const rawPayments: PaymentTransaction[] =
    serverPayments && serverPayments.length > 0
      ? serverPayments
      : INITIAL_PAYMENTS;

  const filteredPayments = useMemo(() => {
    return rawPayments.filter((payment) => {
      const matchesSearch =
        payment.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.product.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "All Statuses" ||
        payment.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rawPayments, searchQuery, selectedStatus]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPayments = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, safeCurrentPage, pageSize]);

  // Calculate filtered revenue total
  const filteredRevenue = useMemo(() => {
    const total = filteredPayments
      .filter((p) => (p.status || "").toLowerCase() === "completed")
      .reduce((sum, current) => sum + current.amount, 0);
    return total;
  }, [filteredPayments]);

  const renderStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "completed":
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#E8F7EC] text-[#16851f]">
            Completed
          </span>
        );
      case "refunded":
      case "failed":
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FFF1F1] text-[#EF4444]">
            {status}
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FFF9EA] text-[#D97706]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Heading & Filtered Revenue Banner */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-[#111827] caros">
          Payments
        </h2>

        {/* Filtered Revenue Badge */}
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium">Filtered Revenue</p>
          <p className="text-lg md:text-xl font-extrabold text-[#00a63e]">
            ${filteredRevenue} CAD
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user ID or invoice..."
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
                <th className="py-4 pl-2">INVOICE</th>
                <th className="py-4 px-4">USER</th>
                <th className="py-4 px-4">PRODUCT</th>
                <th className="py-4 px-4">AMOUNT</th>
                <th className="py-4 px-4">STATUS</th>
                <th className="py-4 pr-2">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[15px]">
              {paginatedPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* INVOICE */}
                  <td className="py-4 pl-2 font-mono text-sm text-gray-500 font-medium">
                    {payment.invoice}
                  </td>

                  {/* USER (Truncated ID) */}
                  <td
                    className="py-4 px-4 font-mono text-xs text-gray-500 font-medium"
                    title={payment.userId}
                  >
                    {payment.userId.slice(0, 9)}-
                  </td>

                  {/* PRODUCT */}
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {payment.product}
                  </td>

                  {/* AMOUNT */}
                  <td className="py-4 px-4 font-bold text-gray-900 text-sm">
                    ${payment.amount} {payment.currency}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-4">
                    {renderStatusBadge(payment.status)}
                  </td>

                  {/* DATE */}
                  <td className="py-4 pr-2 text-gray-600 text-sm font-medium">
                    {payment.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="py-12 flex justify-center items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a63e]" />
              <span>Loading payments...</span>
            </div>
          )}

          {!isLoading && filteredPayments.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No payment transactions match your search.
            </div>
          )}
        </div>

        {filteredPayments.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing Page <span className="font-semibold text-gray-800">{safeCurrentPage}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalPages}</span> ({filteredPayments.length} total payments)
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
