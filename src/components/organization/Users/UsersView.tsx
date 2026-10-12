"use client";
import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import InviteOrganizationUserModal, {
  OrganizationUser,
} from "../Modal/InviteOrganizationUserModal";
import { useGetOrganizationUsersQuery } from "@/redux/api/organizationApi";

const INITIAL_USERS: OrganizationUser[] = [
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

export default function UsersView() {
  const [localUsers, setLocalUsers] = useState<OrganizationUser[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { data: usersResponse, isLoading, refetch } = useGetOrganizationUsersQuery();
  const serverUsers: OrganizationUser[] | undefined =
    usersResponse?.data?.users ||
    usersResponse?.result?.users ||
    (Array.isArray(usersResponse?.data) ? usersResponse?.data : undefined);

  // Use server users if present, otherwise fall back to local/initial users
  const users: OrganizationUser[] =
    serverUsers && serverUsers.length > 0
      ? serverUsers
      : localUsers.length > 0
      ? localUsers
      : INITIAL_USERS;

  const handleInviteSuccess = (newUser: OrganizationUser) => {
    setLocalUsers((prev) => [newUser, ...prev]);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#ECECF2] p-6 md:p-8 shadow-sm">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <h2 className="text-xl md:text-2xl font-bold text-[#111827]">
            Users
          </h2>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#00a63e] hover:bg-[#13721a] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Invite user</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 pl-2">USER</th>
                <th className="py-4 px-4">ORGANIZATION</th>
                <th className="py-4 px-4">ROLE</th>
                <th className="py-4 px-4">STATUS</th>
                <th className="py-4 pr-2">INVITED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[15px]">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  <td className="py-4 pl-2 font-medium text-[#111827]">
                    {user.name}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {user.organization}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {user.role}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-[#E8F7EC] text-[#16851f]"
                          : user.status === "Invited"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 pr-2 text-gray-400">
                    {user.invitedDate || "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="py-12 flex justify-center items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a63e]" />
              <span>Loading users...</span>
            </div>
          )}

          {!isLoading && users.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No users found. Click &quot;+ Invite user&quot; to invite members.
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteOrganizationUserModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSuccess={handleInviteSuccess}
        organizations={[users[0]?.organization || "My Organization"]}
      />
    </div>
  );
}
