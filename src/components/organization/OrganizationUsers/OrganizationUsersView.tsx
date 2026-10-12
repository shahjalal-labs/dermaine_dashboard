"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Plus, Loader2 } from "lucide-react";
import AddOrganizationMemberModal from "../Modal/AddOrganizationMemberModal";
import { OrganizationUser } from "../Modal/InviteOrganizationUserModal";
import { useGetOrganizationMembersQuery } from "@/redux/api/organizationApi";
import { Pagination } from "@/components/ui/Pagination";

const INITIAL_MEMBERS: OrganizationUser[] = [
  {
    id: "1",
    name: "Milon",
    email: "hi@gmail.com",
    organization: "IMMICA",
    role: "Consultant",
    status: "Active",
    invitedDate: "--",
    lastActive: "06/02/26",
  },
];

export default function OrganizationUsersView() {
  const [localMembers, setLocalMembers] = useState<OrganizationUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("All Organizations");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: membersResponse, isLoading, refetch } = useGetOrganizationMembersQuery({
    search: searchTerm || undefined,
    organization: selectedOrg !== "All Organizations" ? selectedOrg : undefined,
  });

  const serverMembers: OrganizationUser[] | undefined =
    membersResponse?.data?.members ||
    membersResponse?.result?.members ||
    (Array.isArray(membersResponse?.data) ? membersResponse?.data : undefined);
  const rawMembers: OrganizationUser[] =
    serverMembers && serverMembers.length > 0
      ? serverMembers
      : localMembers.length > 0
      ? localMembers
      : INITIAL_MEMBERS;

  const orgOptions = useMemo(() => {
    const orgs = Array.from(new Set(rawMembers.map((m) => m.organization).filter(Boolean)));
    return ["All Organizations", ...orgs];
  }, [rawMembers]);

  const filteredMembers = useMemo(() => {
    return rawMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOrg =
        selectedOrg === "All Organizations" || member.organization === selectedOrg;

      return matchesSearch && matchesOrg;
    });
  }, [rawMembers, searchTerm, selectedOrg]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOrg]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedMembers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, safeCurrentPage, pageSize]);

  const handleAddSuccess = (newMember: OrganizationUser) => {
    setLocalMembers((prev) => [newMember, ...prev]);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a63e]/20 focus:border-[#00a63e] shadow-sm"
            />
          </div>

          {/* Organization Select Dropdown */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00a63e]/20 focus:border-[#00a63e] shadow-sm cursor-pointer pr-10"
            >
              {orgOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Add Member Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#00a63e] hover:bg-[#13721a] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Member</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#ECECF2] p-6 md:p-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 pl-2">USER</th>
                <th className="py-4 px-4">ORGANIZATION</th>
                <th className="py-4 px-4">ROLE</th>
                <th className="py-4 px-4">STATUS</th>
                <th className="py-4 px-4">INVITED</th>
                <th className="py-4 pr-2">LAST ACTIVE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[15px]">
              {paginatedMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  <td className="py-4 pl-2 font-medium text-[#111827]">
                    {member.name}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {member.organization}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {member.role}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        member.status === "Active"
                          ? "bg-[#E8F7EC] text-[#16851f]"
                          : member.status === "Invited"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {member.invitedDate || "--"}
                  </td>
                  <td className="py-4 pr-2 text-gray-500 font-medium">
                    {member.lastActive || "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="py-12 flex justify-center items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a63e]" />
              <span>Loading members...</span>
            </div>
          )}

          {!isLoading && filteredMembers.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No organization members matched your search.
            </div>
          )}
        </div>

        {filteredMembers.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing Page <span className="font-semibold text-gray-800">{safeCurrentPage}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalPages}</span> ({filteredMembers.length} total members)
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

      {/* Add Member Modal */}
      <AddOrganizationMemberModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSuccess={handleAddSuccess}
        organizations={[rawMembers[0]?.organization || "My Organization"]}
      />
    </div>
  );
}
