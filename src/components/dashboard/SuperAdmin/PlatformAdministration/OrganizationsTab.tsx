import { EditOrganizationModal } from "@/components/modal/EditOrganizationModal";
import { NewOrganizationModal } from "@/components/modal/NewOrganizationModal";
import { Pagination } from "@/components/ui/Pagination";
import { useGetAllOrganizationsQuery } from "@/redux/api/adminApi";
import { IOrganization } from "@/types/flatFormAdministration";
import { ChevronDown, Edit2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const PAGE_SIZE = 10;

export function OrganizationsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<IOrganization | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localUpdates, setLocalUpdates] = useState<Record<string, IOrganization>>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAllOrganizationsQuery({
    page: 1,
    limit: 100,
  });

  const organizations: IOrganization[] = useMemo(() => {
    const raw = data?.result?.organizations || data?.data?.organizations || [];
    const list: IOrganization[] = Array.isArray(raw) ? raw : [];
    return list.map((org) => {
      const key = org.id || (org as any)._id;
      return localUpdates[key] ? { ...org, ...localUpdates[key] } : org;
    });
  }, [data, localUpdates]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // Overall statistics from all loaded organizations
  const stats = useMemo(() => {
    const rawMeta = data?.result?.meta || data?.data?.meta;
    const total = rawMeta?.totalOrganizations ?? rawMeta?.total ?? organizations.length;
    const active = organizations.filter((o) => o.status?.toLowerCase() === "active").length;
    const trial = organizations.filter(
      (o) => o.status?.toLowerCase() === "trial" || o.plan?.toLowerCase() === "trial"
    ).length;
    const suspended = organizations.filter((o) => o.status?.toLowerCase() === "suspended").length;

    return [
      { label: "Total Organizations", value: String(total), color: "text-[#1f2937]" },
      { label: "Active", value: String(active), color: "text-[#16851f]" },
      { label: "Trial", value: String(trial), color: "text-[#0088ff]" },
      { label: "Suspended", value: String(suspended), color: "text-[#f59e0b]" },
    ];
  }, [data, organizations]);

  // Filter organizations by search query and status filter
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      // Status filter
      if (statusFilter !== "all") {
        const orgStatus = (org.status || "").toLowerCase();
        const orgPlan = (org.plan || "").toLowerCase();

        if (statusFilter === "active" && orgStatus !== "active") {
          return false;
        }
        if (statusFilter === "trial" && orgStatus !== "trial" && orgPlan !== "trial") {
          return false;
        }
        if (statusFilter === "suspended" && orgStatus !== "suspended") {
          return false;
        }
        if (statusFilter === "pending" && orgStatus !== "pending") {
          return false;
        }
        if (
          statusFilter !== "active" &&
          statusFilter !== "trial" &&
          statusFilter !== "suspended" &&
          statusFilter !== "pending" &&
          orgStatus !== statusFilter.toLowerCase()
        ) {
          return false;
        }
      }

      // Search filter across name, contact email, type, plan, and status
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const orgName = (org.companyName || org.billingName || "").toLowerCase();
        const email = (org.billingEmail || "").toLowerCase();
        const type = (org.type || "").toLowerCase();
        const plan = (org.plan || "").toLowerCase();
        const status = (org.status || "").toLowerCase();

        const matches =
          orgName.includes(q) ||
          email.includes(q) ||
          type.includes(q) ||
          plan.includes(q) ||
          status.includes(q);

        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }, [organizations, statusFilter, search]);

  // Pagination calculation
  const totalFiltered = filteredOrganizations.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedOrganizations = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredOrganizations.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredOrganizations, currentPage]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        });
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl py-6 px-4 shadow-xs border border-[#f0f0f5] flex flex-col items-center justify-center min-h-[105px]"
          >
            <span className={`text-3xl font-bold ${stat.color} mb-1 tracking-tight`}>
              {stat.value}
            </span>
            <span className="text-xs md:text-sm font-medium text-[#8c8c9e]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#f0f0f5]">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 w-full max-w-xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizations..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#ebebed] bg-[#fafafa] text-sm text-title placeholder-[#a0a0b0] focus:outline-none focus:ring-1 focus:ring-[#16851f] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative shrink-0 w-36">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-[#ebebed] bg-white text-sm font-medium text-title appearance-none focus:outline-none focus:ring-1 focus:ring-[#16851f] cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8c9e] pointer-events-none" />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="h-10 px-5 bg-[#16851f] hover:bg-[#13721a] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>+ New Organization</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f5]">
                <th className="pb-4 text-left text-xs font-bold text-[#a0a0b0] uppercase tracking-wider pl-6">
                  Organization
                </th>
                <th className="pb-4 text-left text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">
                  Type
                </th>
                <th className="pb-4 text-center text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">
                  Plan
                </th>
                <th className="pb-4 text-center text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">
                  Status
                </th>
                <th className="pb-4 text-center text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">
                  User Limits
                </th>
                <th className="pb-4 text-left text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">
                  Contact
                </th>
                <th className="pb-4 text-left text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">
                  Created
                </th>
                <th className="pb-4 text-right text-xs font-bold text-[#a0a0b0] uppercase tracking-wider pr-6">
                  {/* Action */}
                </th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={8} className="py-12">
                    <div className="flex justify-center">
                      <AiOutlineLoading3Quarters
                        className="animate-spin text-[#16851f]"
                        size={24}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : paginatedOrganizations.length > 0 ? (
              <tbody className="divide-y divide-[#f7f7fa]">
                {paginatedOrganizations.map((org: IOrganization, i: number) => (
                  <tr
                    key={org.id || i}
                    className="hover:bg-[#fafafc] transition-colors"
                  >
                    <td className="py-4 pl-6 text-sm font-medium text-title uppercase">
                      {org.companyName || org.billingName}
                    </td>
                    <td className="py-4 text-sm text-[#8c8c9e] capitalize">
                      {org.type}
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center px-4 py-0.5 rounded-full border border-[#d9d9e3] bg-white text-xs font-semibold text-title capitalize shadow-xs">
                        {org.plan || "Starter"}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          org.status?.toLowerCase() === "active"
                            ? "text-[#16851f] bg-[#e6f7ec]"
                            : org.status?.toLowerCase() === "trial"
                            ? "text-[#0088ff] bg-[#eef7ff]"
                            : org.status?.toLowerCase() === "suspended"
                            ? "text-[#f59e0b] bg-[#fef3c7]"
                            : "text-[#ff6164] bg-[#fff1f1]"
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="py-4 text-center text-sm text-[#8c8c9e]">
                      {org.maxUsers ?? 999}
                    </td>
                    <td className="py-4 text-sm text-[#8c8c9e]">
                      {org.billingEmail}
                    </td>
                    <td className="py-4 text-sm text-[#8c8c9e]">
                      {formatDate(org.createdAt)}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <button
                        onClick={() => {
                          setEditingOrg(org);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1 text-[#8c8c9e] hover:text-title hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit organization"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#8c8c9e]">
                    No organizations found matching your search and filter criteria.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {totalFiltered > 0 && (
          <div className="mt-6 border-t border-[#f0f0f5] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs md:text-sm text-[#8c8c9e]">
              Showing Page <span className="font-semibold text-title">{currentPage}</span> of{" "}
              <span className="font-semibold text-title">{totalPages}</span> ({totalFiltered} total organizations)
            </p>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
                className="mt-0"
              />
            )}
          </div>
        )}
      </div>

      <NewOrganizationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditOrganizationModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingOrg(null);
        }}
        organization={editingOrg}
        onUpdated={(updated) => {
          const key = updated.id || (updated as any)._id;
          setLocalUpdates((prev) => ({
            ...prev,
            [key]: updated,
          }));
        }}
      />
    </div>
  );
}
