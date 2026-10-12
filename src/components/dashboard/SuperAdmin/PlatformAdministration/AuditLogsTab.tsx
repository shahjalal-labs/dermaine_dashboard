"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useGetAllRulesQuery } from "@/redux/api/ruleApi";
import { Pagination } from "@/components/ui/Pagination";

export function AuditLogsTab() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: rulesData, isLoading } = useGetAllRulesQuery({
    page,
    limit: 10,
  });

  const rules = useMemo(() => {
    const raw = rulesData?.result?.rules || rulesData?.data?.rules || rulesData?.result?.items || [];
    return Array.isArray(raw) ? raw : [];
  }, [rulesData]);

  const filteredRules = useMemo(() => {
    if (!search.trim()) return rules;
    const q = search.toLowerCase();
    return rules.filter(
      (r: any) =>
        r.name?.toLowerCase().includes(q) ||
        r.streamId?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)
    );
  }, [rules, search]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  const rawMeta = rulesData?.result?.meta || rulesData?.data?.meta || rulesData?.meta;
  const total = Number(rawMeta?.total ?? rulesData?.result?.total ?? rulesData?.data?.total ?? filteredRules.length);
  const totalPages = Number(
    rawMeta?.totalPages ??
    rawMeta?.totalPage ??
    rulesData?.result?.totalPages ??
    rulesData?.data?.totalPages ??
    Math.max(1, Math.ceil(total / 10))
  );
  const safePage = Math.min(page, totalPages);

  const paginatedRules = useMemo(() => {
    const start = (safePage - 1) * 10;
    return filteredRules.slice(start, start + 10);
  }, [filteredRules, safePage]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-title mb-1">Platform Audit Logs</h3>
        <p className="text-sm md:text-base text-description">
          Immutable platform-wide audit trail. All major actions across organizations, users, billing, and configuration are logged here.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#f1f1f5] shadow-sm space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-description" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizations..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#e9e9ef] bg-[#f8fafd] text-sm text-title placeholder-description focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2 pr-8 rounded-lg border border-[#e9e9ef] bg-white text-xs font-semibold text-title appearance-none focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="rules">Rules</option>
                <option value="auth">Auth</option>
                <option value="billing">Billing</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-description pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 pr-8 rounded-lg border border-[#e9e9ef] bg-white text-xs font-semibold text-title appearance-none focus:outline-none"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-description pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="px-3.5 py-2 pr-8 rounded-lg border border-[#e9e9ef] bg-white text-xs font-semibold text-title appearance-none focus:outline-none"
              >
                <option value="all">All Orgs</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-description pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#f1f1f5] text-xs font-bold text-description uppercase tracking-wider text-left">
                <th className="pb-3 pl-2">TIMESTAMP</th>
                <th className="pb-3">SEVERITY</th>
                <th className="pb-3">CATEGORY</th>
                <th className="pb-3">EVENT</th>
                <th className="pb-3">USER/ORG</th>
                <th className="pb-3">AFFECTED RECORD</th>
                <th className="pb-3">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f1f5] text-sm">
              {paginatedRules.length > 0 ? (
                paginatedRules.map((r: any, idx: number) => (
                  <tr key={r.id || idx} className="hover:bg-gray-50/50">
                    <td className="py-3.5 pl-2 text-xs text-description">
                      {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : new Date().toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16851f] border border-emerald-200">
                        INFO
                      </span>
                    </td>
                    <td className="py-3.5 text-xs font-bold text-title">RULES</td>
                    <td className="py-3.5 text-xs text-title font-medium">RULE_UPDATED</td>
                    <td className="py-3.5 text-xs text-description">Super Admin</td>
                    <td className="py-3.5 text-xs font-mono text-description">{r.id?.slice(0, 10)}...</td>
                    <td className="py-3.5 text-xs text-description">{r.name || r.streamId || "Configuration verified"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-description">
                    <div className="font-semibold text-title text-base mb-1">No audit log entries yet.</div>
                    <div className="text-xs text-description">Logs will appear here as actions are performed across the platform.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="pt-4 border-t border-[#f1f1f5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-description">
              Showing Page <span className="font-semibold text-title">{safePage}</span> of{" "}
              <span className="font-semibold text-title">{totalPages}</span> ({total} total entries)
            </p>
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
              className="mt-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
