"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  UserCheck,
  UserX,
  RefreshCw,
  Mail,
  Calendar,
  Award,
  BookOpen,
  Phone,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";
import { CustomModal } from "@/components/modal/CustomModal";
import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
} from "@/redux/api/userApi";

export type User = {
  id: string;
  profileImage?: string | null;
  fullName: string;
  email: string;
  score?: string | number;
  assessmentScore?: number;
  matchedPrograms?: string | number;
  joined?: string;
  createdAt?: string;
  status?: string;
  role?: string;
  phoneNumber?: string | null;
  gender?: string | null;
  address?: string | null;
};

interface UserManagementTableProps {
  users?: User[];
  search?: string;
  isEmbedded?: boolean;
}

export default function UserManagementTable({
  users: externalUsers,
  search: externalSearch,
  isEmbedded: explicitIsEmbedded,
}: UserManagementTableProps) {
  // If explicitIsEmbedded is passed, use it; otherwise deduce from externalUsers
  const isEmbedded = explicitIsEmbedded !== undefined ? explicitIsEmbedded : externalUsers !== undefined;

  // Standalone mode state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Queries & Mutations for standalone mode
  const queryArgs = useMemo(() => {
    if (isEmbedded) return undefined;
    return {
      page: currentPage,
      limit: 10,
      search: searchTerm.trim() || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
    };
  }, [isEmbedded, currentPage, searchTerm, statusFilter]);

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllUsersQuery(queryArgs, {
    skip: isEmbedded,
  });

  const [updateUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusMutation();

  // Extract standalone users and pagination metadata
  const serverUsers: User[] = useMemo(() => {
    if (isEmbedded) return [];
    const resData = usersResponse?.data || usersResponse?.result;
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData?.users)) return resData.users;
    if (Array.isArray(resData?.items)) return resData.items;
    return [];
  }, [isEmbedded, usersResponse]);

  // Reset page when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const paginationMeta = useMemo(() => {
    const resData = usersResponse?.data || usersResponse?.result || usersResponse;
    const rawMeta = resData?.meta;
    const total = Number(rawMeta?.total ?? resData?.total ?? serverUsers.length);
    const limit = Number(rawMeta?.limit ?? resData?.limit ?? 10);
    const totalPages = Number(
      rawMeta?.totalPages ??
      rawMeta?.totalPage ??
      resData?.totalPages ??
      resData?.totalPage ??
      Math.max(1, Math.ceil(total / (limit || 10)))
    );
    const page = Number(rawMeta?.page ?? resData?.page ?? currentPage);

    return {
      total,
      limit,
      totalPages: Math.max(1, totalPages),
      currentPage: page,
    };
  }, [usersResponse, serverUsers.length, currentPage]);

  // Determine active user list
  const activeList = useMemo(() => {
    if (isEmbedded) {
      const list = externalUsers || [];
      const query = (externalSearch || "").trim().toLowerCase();
      if (!query) return list.slice(0, 10);
      return list.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query),
      );
    }
    return serverUsers;
  }, [isEmbedded, externalUsers, externalSearch, serverUsers]);

  // Handle status toggle (Active <-> Blocked)
  const handleToggleStatus = async (user: User) => {
    const currentStatus = user.status || "Active";
    const newStatus = currentStatus === "Active" ? "Blocked" : "Active";

    try {
      const res = await updateUserStatus({
        id: user.id,
        status: newStatus,
      }).unwrap();

      if (res?.success || res?.data) {
        toast.success(
          `User "${user.fullName || user.email}" is now ${newStatus}`,
        );
        if (selectedUser?.id === user.id) {
          setSelectedUser({ ...selectedUser, status: newStatus });
        }
      } else {
        toast.error(res?.message || "Failed to update user status");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update user status");
    }
  };

  const openDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const getUserImage = (user: User) => {
    if (
      user.profileImage &&
      typeof user.profileImage === "string" &&
      user.profileImage.startsWith("http") &&
      !user.profileImage.includes("pravatar.cc")
    ) {
      return user.profileImage;
    }
    return null;
  };

  const getUserScore = (user: User) => {
    if (user.score !== undefined && user.score !== null) {
      return String(user.score);
    }
    if (user.assessmentScore !== undefined && user.assessmentScore !== null) {
      return String(user.assessmentScore);
    }
    return "0";
  };

  const getUserMatchedPrograms = (user: User) => {
    if (user.matchedPrograms !== undefined && user.matchedPrograms !== null) {
      return String(user.matchedPrograms);
    }
    return "0";
  };

  const getUserJoinedDate = (user: User) => {
    if (user.joined) return user.joined;
    if (user.createdAt) {
      return new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return "N/A";
  };

  return (
    <div className="bg-background rounded-2xl">
      {/* Standalone Header with Search and Filters */}
      {!isEmbedded && (
        <div className="p-6 border-b border-[#ececf2] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-title">User Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage registered applicants, monitor assessment results, and control account permissions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#ececf2] rounded-xl hover:bg-[#f8fafd] transition-colors disabled:opacity-50"
                title="Refresh users"
              >
                <RefreshCw
                  className={`w-4 h-4 text-muted-foreground ${
                    isFetching ? "animate-spin text-primary" : ""
                  }`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Controls: Search and Status Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a0a0b0]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name or email..."
                className="w-full py-2 pl-9 pr-8 text-sm md:text-base rounded-xl border border-[#ebebf0] bg-[#fbfbfd] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-[#30303a]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#f1f1f5] p-1 rounded-xl self-start md:self-auto">
              {[
                { label: "All Users", value: "ALL" },
                { label: "Active", value: "Active" },
                { label: "Blocked", value: "Blocked" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    statusFilter === tab.value
                      ? "bg-white text-title shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-title"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto p-4 md:p-6">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-y border-[#ececf2] text-left text-sm md:text-base text-title font-semibold">
              <th className="py-4 pr-4">User Name</th>
              <th className="px-4 py-4">Email Address</th>
              <th className="px-4 py-4">Assessment Score</th>
              <th className="px-4 py-4">Matched Programs</th>
              <th className="px-4 py-4">Joined</th>
              <th className="px-4 py-4">Status</th>
              {!isEmbedded && <th className="px-4 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {(isLoading && !isEmbedded) || (isEmbedded && !externalUsers) ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-[#f1f1f5] animate-pulse">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200" />
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 w-16 bg-gray-200 rounded-md" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-8 w-20 bg-gray-200 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))
            ) : activeList.length === 0 ? (
              <tr>
                <td
                  colSpan={isEmbedded ? 6 : 7}
                  className="py-12 text-center text-sm md:text-base text-muted-foreground"
                >
                  <p className="font-medium text-title">No users found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search or status filter.
                  </p>
                </td>
              </tr>
            ) : (
              activeList.map((user: User) => {
                const displayImage = getUserImage(user);
                const displayScore = getUserScore(user);
                const displayMatched = getUserMatchedPrograms(user);
                const displayJoined = getUserJoinedDate(user);
                const displayStatus = user.status || "Active";
                const isActive = displayStatus === "Active";

                return (
                  <tr
                    key={user.id}
                    className="border-b border-[#f1f1f5] text-[#2f2f37] hover:bg-[#fafbfe] transition-colors"
                  >
                    <td className="py-4 pr-4 text-base">
                      <div className="flex items-center gap-3">
                        {displayImage ? (
                          <Image
                            width={40}
                            height={40}
                            src={displayImage}
                            alt={user.fullName || "User"}
                            className="w-9 h-9 rounded-full object-cover border border-gray-100 shadow-sm"
                            unoptimized
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/20">
                            {user.fullName ? user.fullName.charAt(0) : "U"}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-title">
                            {user.fullName || "Anonymous"}
                          </span>
                          {user.role && (
                            <span className="text-xs text-muted-foreground">
                              {user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm md:text-base text-title">
                      {user.email || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm md:text-base font-semibold text-title">
                      {displayScore}
                    </td>
                    <td className="px-4 py-4 text-sm md:text-base text-title">
                      {displayMatched}
                    </td>
                    <td className="px-4 py-4 text-sm md:text-base text-muted-foreground">
                      {displayJoined}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs md:text-sm font-semibold ${
                          isActive
                            ? "bg-[#e6f4ff] text-[#0088ff]"
                            : "bg-[#fff1f1] text-[#d44d4f]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-[#0088ff]" : "bg-[#d44d4f]"
                          }`}
                        />
                        {displayStatus}
                      </span>
                    </td>

                    {/* Actions column for standalone view */}
                    {!isEmbedded && (
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* View details */}
                          <button
                            onClick={() => openDetails(user)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-[#f0f7f2] rounded-lg transition-colors"
                            title="View user details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle status */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={isUpdatingStatus}
                            className={`p-2 rounded-lg transition-colors ${
                              isActive
                                ? "text-[#d44d4f] hover:bg-[#fff1f1]"
                                : "text-[#00a63e] hover:bg-[#e6f9ed]"
                            }`}
                            title={
                              isActive
                                ? "Block this user"
                                : "Activate this user"
                            }
                          >
                            {isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Standalone Pagination */}
      {!isEmbedded && paginationMeta.total > 0 && (
        <div className="px-6 py-4 border-t border-[#ececf2] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing Page{" "}
            <span className="font-semibold text-title">
              {paginationMeta.currentPage || currentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-title">
              {paginationMeta.totalPages}
            </span>{" "}
            ({paginationMeta.total || 0} total users)
          </p>

          <Pagination
            currentPage={currentPage}
            totalPages={paginationMeta.totalPages}
            onPageChange={setCurrentPage}
            className="mt-0"
          />
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <CustomModal
          open={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title="User Profile Details"
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#f8fafd] border border-[#ececf2]">
              {getUserImage(selectedUser) ? (
                <Image
                  width={64}
                  height={64}
                  src={getUserImage(selectedUser)!}
                  alt={selectedUser.fullName || "User"}
                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  unoptimized
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl uppercase border border-primary/20">
                  {selectedUser.fullName ? selectedUser.fullName.charAt(0) : "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-title truncate">
                  {selectedUser.fullName || "Unnamed User"}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedUser.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-xs font-semibold ${
                      selectedUser.status === "Active"
                        ? "bg-[#e6f4ff] text-[#0088ff]"
                        : "bg-[#fff1f1] text-[#d44d4f]"
                    }`}
                  >
                    {selectedUser.status === "Active" ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <ShieldAlert className="w-3 h-3" />
                    )}
                    {selectedUser.status || "Active"}
                  </span>
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                    Role: {selectedUser.role || "User"}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-[#ececf2] bg-white">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Assessment Score</span>
                </div>
                <p className="text-base font-bold text-title">
                  {getUserScore(selectedUser)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#ececf2] bg-white">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <BookOpen className="w-4 h-4 text-[#0088ff]" />
                  <span>Matched Programs</span>
                </div>
                <p className="text-base font-bold text-title">
                  {getUserMatchedPrograms(selectedUser)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#ececf2] bg-white">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4 text-[#faad14]" />
                  <span>Joined Date</span>
                </div>
                <p className="text-sm font-semibold text-title">
                  {getUserJoinedDate(selectedUser)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#ececf2] bg-white">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Mail className="w-4 h-4 text-[#ff6164]" />
                  <span>User ID</span>
                </div>
                <p className="text-xs font-mono font-medium text-title truncate" title={selectedUser.id}>
                  {selectedUser.id}
                </p>
              </div>

              {selectedUser.phoneNumber && (
                <div className="p-3.5 rounded-xl border border-[#ececf2] bg-white">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Phone className="w-4 h-4 text-[#126A19]" />
                    <span>Phone Number</span>
                  </div>
                  <p className="text-sm font-semibold text-title">
                    {selectedUser.phoneNumber}
                  </p>
                </div>
              )}

              {selectedUser.address && (
                <div className="p-3.5 rounded-xl border border-[#ececf2] bg-white">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4 text-[#0F6FD8]" />
                    <span>Address</span>
                  </div>
                  <p className="text-sm font-semibold text-title">
                    {selectedUser.address}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#ececf2]">
              <button
                onClick={() => handleToggleStatus(selectedUser)}
                disabled={isUpdatingStatus}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                  selectedUser.status === "Active"
                    ? "bg-[#fff1f1] text-[#d44d4f] hover:bg-[#ffe3e3]"
                    : "bg-[#e6f9ed] text-[#00a63e] hover:bg-[#d0f5dc]"
                }`}
              >
                {selectedUser.status === "Active" ? (
                  <>
                    <UserX className="w-4 h-4" />
                    Block User
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Activate User
                  </>
                )}
              </button>

              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-5 py-2 rounded-xl text-sm font-medium border border-[#ececf2] hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  );
}
