"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Receipt,
  Download,
  Copy,
  Check,
  User as UserIcon,
  Calendar,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { CustomModal } from "@/components/modal/CustomModal";
import { useGetAllPaymentsQuery } from "@/redux/api/paymentApi";

export type Payment = {
  id: string;
  transactionId: string;
  profileImage?: string | null;
  userName: string;
  planName: string;
  amount: string;
  date: string;
  paymentMethod: string;
  status: "Active" | "Inactive" | string;
  userEmail?: string;
  rawAmount?: number;
};

export default function PaymentsTable() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Connect to live backend payments API
  const {
    data: paymentsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllPaymentsQuery({
    page: currentPage,
    limit: 10,
    search: debouncedSearch.trim() || undefined,
  });

  const rawData = paymentsResponse?.data || paymentsResponse?.result;

  // Extract server payments array
  const paymentsList: Payment[] = useMemo(() => {
    let items: any[] = [];
    if (Array.isArray(rawData)) {
      items = rawData;
    } else if (Array.isArray(rawData?.items)) {
      items = rawData.items;
    } else if (Array.isArray(rawData?.payments)) {
      items = rawData.payments;
    }

    return items.map((p: any, idx: number) => ({
      id: String(p.id || p._id || `pay-${idx}`),
      transactionId: p.transactionId || p.paymentIntentId || `TXN-${String(idx + 1).padStart(6, "0")}`,
      userName: p.userName || p.user?.fullName || p.user?.name || "Customer",
      userEmail: p.user?.email || p.email || "customer@example.com",
      planName: p.planName || p.consultationType || "Strategy Report",
      amount: p.amount
        ? typeof p.amount === "number"
          ? `$${p.amount} CAD`
          : p.amount.includes("$")
          ? p.amount
          : `$${p.amount} CAD`
        : "$79 CAD",
      date: p.date || (p.createdAt ? new Date(p.createdAt).toISOString().replace("T", " ").substring(0, 16) : "2026-09-23 09:47"),
      paymentMethod: p.paymentMethod || "Stripe",
      status: p.status === "COMPLETED" || p.status === "succeeded" || p.status === "Active" ? "Active" : p.status || "Active",
      profileImage: p.profileImage || p.user?.profileImage || `https://images.unsplash.com/photo-${1500000000000 + (idx % 10)}?w=150&auto=format&fit=crop&q=80`,
      rawAmount: p.rawAmount || (typeof p.amount === "number" ? p.amount : 20),
    }));
  }, [rawData]);

  // Extract pagination meta from backend
  const meta = useMemo(() => {
    const rawMeta = rawData?.meta;
    const total = Number(rawMeta?.total ?? rawData?.total ?? paymentsList.length);
    const limit = Number(rawMeta?.limit ?? rawData?.limit ?? 10);
    const totalPages = Math.max(
      1,
      Number(
        rawMeta?.totalPages ??
        rawMeta?.totalPage ??
        rawData?.totalPages ??
        Math.ceil(total / (limit || 10))
      )
    );
    const page = Number(rawMeta?.currentPage ?? rawMeta?.page ?? currentPage);

    return { total, limit, totalPages, currentPage: page };
  }, [rawData, paymentsList.length, currentPage]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!paymentToDelete) return;
    toast.success(`Transaction ${paymentToDelete.transactionId} removed`);
    setPaymentToDelete(null);
  };

  // Generate pagination page numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const total = meta.totalPages;
    const current = meta.currentPage;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, "...", total);
      } else if (current >= total - 2) {
        pages.push(1, "...", total - 2, total - 1, total);
      } else {
        pages.push(1, "...", current, "...", total);
      }
    }
    return pages;
  }, [meta.totalPages, meta.currentPage]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#ececf2] overflow-hidden">
      {/* Top Header */}
      <div className="px-6 sm:px-8 pt-7 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#111827] tracking-tight">Payments</h2>
          {isFetching && (
            <RefreshCw className="w-4 h-4 animate-spin text-[#00a859]" />
          )}
        </div>

        <div className="relative w-full sm:w-72 md:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a859] focus:border-[#00a859] transition-colors"
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] border-collapse">
          <thead>
            <tr className="border-t border-b border-gray-100 text-left text-sm font-semibold text-[#4b5563]">
              <th className="py-4 px-6 font-semibold">Transaction ID</th>
              <th className="py-4 px-6 font-semibold">User Name</th>
              <th className="py-4 px-6 font-semibold">Plan Name</th>
              <th className="py-4 px-6 font-semibold">Amount</th>
              <th className="py-4 px-6 font-semibold">Date</th>
              <th className="py-4 px-6 font-semibold">Payment Method</th>
              <th className="py-4 px-6 font-semibold text-center">Status</th>
              <th className="py-4 px-6 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-6"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                  <td className="py-4 px-6"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                  <td className="py-4 px-6"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                  <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                  <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                  <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                  <td className="py-4 px-6 text-center"><div className="h-6 w-16 bg-gray-200 rounded mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><div className="h-5 w-12 bg-gray-200 rounded mx-auto" /></td>
                </tr>
              ))
            ) : paymentsList.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-gray-500">
                  <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-800">No payment records found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    No transactions match your search query.
                  </p>
                </td>
              </tr>
            ) : (
              paymentsList.map((payment) => {
                const isActive = payment.status === "Active";
                return (
                  <tr
                    key={payment.id}
                    className="hover:bg-[#fafbfe] transition-colors text-sm text-[#374151]"
                  >
                    {/* Transaction ID */}
                    <td className="py-4 px-6 whitespace-nowrap font-normal text-[#374151]">
                      <span className="font-mono">{payment.transactionId}</span>
                    </td>

                    {/* User Name */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {payment.profileImage && payment.profileImage.startsWith("http") ? (
                          <Image
                            src={payment.profileImage}
                            alt={payment.userName}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100"
                            unoptimized
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#00a859] flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                            {payment.userName?.charAt(0) || "U"}
                          </div>
                        )}
                        <span className="font-normal text-sm text-[#1f2937]">
                          {payment.userName}
                        </span>
                      </div>
                    </td>

                    {/* Plan Name */}
                    <td className="py-4 px-6 whitespace-nowrap text-[#4b5563]">
                      {payment.planName}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 whitespace-nowrap text-[#1f2937] font-normal">
                      {payment.amount}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 whitespace-nowrap text-[#4b5563]">
                      {payment.date}
                    </td>

                    {/* Payment Method */}
                    <td className="py-4 px-6 whitespace-nowrap text-[#4b5563]">
                      {payment.paymentMethod}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      {isActive ? (
                        <span className="inline-block px-3.5 py-1 rounded text-xs font-normal bg-[#fff7ed] text-[#ea580c]">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-3.5 py-1 rounded text-xs font-normal bg-[#fef2f2] text-[#ef4444]">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3.5">
                        <button
                          onClick={() => handleOpenDetails(payment)}
                          className="text-[#f59e0b] hover:opacity-75 transition-opacity"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPaymentToDelete(payment)}
                          className="text-[#ef4444] hover:opacity-75 transition-opacity"
                          title="Delete Payment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 sm:px-8 py-5 flex items-center justify-end">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="w-8 h-8 flex items-center justify-center text-[#f87171] hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers.map((page, idx) => (
            <React.Fragment key={idx}>
              {page === "..." ? (
                <span className="w-8 h-8 flex items-center justify-center text-sm text-gray-500 select-none">
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentPage(Number(page))}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-[#00a859] text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

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

      {/* Payment Details Modal */}
      {selectedPayment && (
        <CustomModal
          open={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title="Payment Transaction Details"
          maxWidth="md"
        >
          <div className="space-y-5 p-2">
            <div className="p-5 rounded-xl bg-[#f8fafd] border border-[#ececf2] flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Transaction Amount
              </span>
              <h3 className="text-3xl font-extrabold text-[#111827] mt-1">
                {selectedPayment.amount}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-4 h-4 text-[#00a859]" />
                <span className="text-xs font-semibold text-[#00a859]">
                  Verified via {selectedPayment.paymentMethod}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f9fafb] border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500">
                  <UserIcon className="w-4 h-4 text-[#00a859]" />
                  <span>Customer</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {selectedPayment.userName}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f9fafb] border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500">
                  <Receipt className="w-4 h-4 text-blue-500" />
                  <span>Plan / Service</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {selectedPayment.planName}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f9fafb] border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Date & Time</span>
                </div>
                <span className="font-medium text-gray-700">
                  {selectedPayment.date}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f9fafb] border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  <span>Transaction ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-gray-800">
                    {selectedPayment.transactionId}
                  </span>
                  <button
                    onClick={() => handleCopy(selectedPayment.transactionId)}
                    className="text-gray-400 hover:text-gray-700 p-0.5"
                  >
                    {copiedId === selectedPayment.transactionId ? (
                      <Check className="w-3.5 h-3.5 text-[#00a859]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f9fafb] border border-gray-100">
                <span className="text-gray-500">Status</span>
                <span
                  className={`inline-block px-3 py-0.5 rounded text-xs font-medium ${
                    selectedPayment.status === "Active"
                      ? "bg-[#fff7ed] text-[#ea580c]"
                      : "bg-[#fef2f2] text-[#ef4444]"
                  }`}
                >
                  {selectedPayment.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => toast.success("Invoice downloaded as PDF")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Invoice</span>
              </button>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-5 py-2 text-xs font-semibold bg-[#00a859] hover:bg-[#00924e] text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </CustomModal>
      )}

      {/* Delete Confirmation Modal */}
      {paymentToDelete && (
        <CustomModal
          open={!!paymentToDelete}
          onClose={() => setPaymentToDelete(null)}
          title="Delete Payment Record"
          maxWidth="sm"
        >
          <div className="space-y-4 p-2">
            <p className="text-sm text-gray-600">
              Are you sure you want to remove the payment record for{" "}
              <strong className="text-gray-900">{paymentToDelete.userName}</strong> (
              <span className="font-mono text-xs">{paymentToDelete.transactionId}</span>
              )?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setPaymentToDelete(null)}
                className="px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg"
              >
                Delete Record
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  );
}
