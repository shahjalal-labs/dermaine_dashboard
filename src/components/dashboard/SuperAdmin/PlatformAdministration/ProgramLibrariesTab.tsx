"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, RefreshCw, BookOpen } from "lucide-react";
import { useGetAllProgramQuery } from "@/redux/api/programApi";
import { useGetAllOrganizationsQuery } from "@/redux/api/adminApi";
import { Pagination } from "@/components/ui/Pagination";

interface CountryCard {
  code: string;
  name: string;
  count: string;
  engine: string;
  status: string;
}

const COUNTRY_CARDS: CountryCard[] = [
  { code: "NZ", name: "New Zealand", count: "0 Program", engine: "Skilled Migrant Category Points", status: "Coming soon" },
  { code: "AU", name: "Australia", count: "0 Program", engine: "Skilled Migrant Category Points", status: "Coming soon" },
  { code: "US", name: "United States", count: "0 Program", engine: "Skilled Migrant Category Points", status: "Coming soon" },
  { code: "CA", name: "Canada", count: "Active", engine: "Skilled Migrant Category Points", status: "Coming soon" },
  { code: "UK", name: "United Kingdom", count: "0 Program", engine: "Skilled Migrant Category Points", status: "Coming soon" },
];

export function ProgramLibrariesTab() {
  const [selectedCountry, setSelectedCountry] = useState("CA");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Fetch all programs (limit 100)
  const { data: programData, isLoading } = useGetAllProgramQuery({
    page: 1,
    limit: 100,
  });

  // Fetch organizations for the All Orgs filter dropdown
  const { data: orgData } = useGetAllOrganizationsQuery({
    page: 1,
    limit: 100,
  });

  const organizations = useMemo(() => {
    const raw = orgData?.result?.organizations || orgData?.data?.organizations || [];
    return Array.isArray(raw) ? raw : [];
  }, [orgData]);

  const selectedCountryData = useMemo(() => {
    return COUNTRY_CARDS.find((c) => c.code === selectedCountry) || COUNTRY_CARDS[3];
  }, [selectedCountry]);

  const allPrograms = useMemo(() => {
    const raw = programData?.result?.items || programData?.data?.items || programData?.items || [];
    return Array.isArray(raw) ? raw : [];
  }, [programData]);

  // Reset page when any filter or country changes
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter, orgFilter, selectedCountry]);

  // Filter programs by country, organization, category, status, and search query
  const filteredPrograms = useMemo(() => {
    return allPrograms.filter((p: any) => {
      // 1. Country filter
      const pCountry = (p.country || "").trim().toLowerCase();
      if (selectedCountry === "CA") {
        const isCanada =
          !p.country ||
          pCountry.includes("canada") ||
          p.province?.toLowerCase().includes("ontario") ||
          p.name?.toLowerCase().includes("ontario");
        if (!isCanada) return false;
      } else if (selectedCountry === "US") {
        const isUS =
          pCountry.includes("united states") ||
          pCountry === "usa" ||
          pCountry === "us";
        if (!isUS) return false;
      } else if (selectedCountry === "AU") {
        const isAU = pCountry.includes("australia") || pCountry === "au";
        if (!isAU) return false;
      } else if (selectedCountry === "NZ") {
        const isNZ = pCountry.includes("new zealand") || pCountry === "nz";
        if (!isNZ) return false;
      } else if (selectedCountry === "UK") {
        const isUK =
          pCountry.includes("united kingdom") ||
          pCountry === "uk" ||
          pCountry.includes("britain");
        if (!isUK) return false;
      }

      // 2. Organization filter
      if (orgFilter !== "all") {
        const orgMatch =
          p.organizationId === orgFilter ||
          p.organization?.id === orgFilter ||
          p.organization?._id === orgFilter;
        if (!orgMatch) return false;
      }

      // 3. Category filter
      if (categoryFilter !== "all") {
        const cat = (p.category || "").toLowerCase();
        const filt = categoryFilter.toLowerCase();
        if (filt.includes("family") && !cat.includes("family")) return false;
        else if (filt.includes("work") && !cat.includes("work")) return false;
        else if (!filt.includes("family") && !filt.includes("work") && !cat.includes(filt)) return false;
      }

      // 4. Status filter
      if (statusFilter !== "all") {
        const st = (p.status || "ACTIVE").toUpperCase();
        if (st !== statusFilter.toUpperCase()) return false;
      }

      // 5. Search query (searches name, province, category, stream, and description)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const name = (p.name || p.title || "").toLowerCase();
        const province = (p.province || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        const stream = (p.stream || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const match =
          name.includes(q) ||
          province.includes(q) ||
          cat.includes(q) ||
          stream.includes(q) ||
          desc.includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allPrograms, selectedCountry, orgFilter, categoryFilter, statusFilter, search]);

  const itemsPerPage = 10;
  const totalItems = filteredPrograms.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedPrograms = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredPrograms.slice(start, start + itemsPerPage);
  }, [filteredPrograms, page, itemsPerPage]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-title mb-1">Country Program Libraries</h3>
        <p className="text-sm md:text-base text-description">
          View and manage programs across all countries. Each country has its own isolated program library.
        </p>
      </div>

      {/* Top Country Switcher Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COUNTRY_CARDS.map((c) => {
          const isSelected = selectedCountry === c.code;
          return (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-white border-[#16851f] shadow-md ring-2 ring-[#16851f]/10"
                  : "bg-white border-[#f1f1f5] hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 font-bold text-xs flex items-center justify-center text-title">
                  {c.code}
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16851f] border border-emerald-200">
                  {c.status}
                </span>
              </div>
              <div className="font-bold text-title text-sm">{c.name}</div>
              <div className="text-[11px] text-description mt-0.5">{c.engine}</div>
              <div className="text-[11px] font-bold text-title mt-2">{c.count}</div>
            </button>
          );
        })}
      </div>

      {/* Program Table Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#f1f1f5] shadow-sm space-y-6">
        <h4 className="font-bold text-title text-lg">
          {selectedCountryData.name} Program Libraries
        </h4>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-description" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search programs..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#e9e9ef] bg-[#f8fafd] text-sm text-title placeholder-description focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2 pr-8 rounded-lg border border-[#e9e9ef] bg-white text-xs font-semibold text-title appearance-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Economic">Economic</option>
                <option value="PNP">PNP</option>
                <option value="Work Permit">Work Permit</option>
                <option value="Family Sponsorship">Family Sponsorship</option>
                <option value="Study">Study</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-description pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 pr-8 rounded-lg border border-[#e9e9ef] bg-white text-xs font-semibold text-title appearance-none focus:outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Paused">Paused</option>
                <option value="Archived">Archived</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-description pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="px-3.5 py-2 pr-8 rounded-lg border border-[#e9e9ef] bg-white text-xs font-semibold text-title appearance-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Orgs</option>
                {organizations.map((org: any) => (
                  <option key={org.id || org._id} value={org.id || org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-description pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[#f1f1f5] text-xs font-bold text-description uppercase tracking-wider text-left">
                <th className="pb-3 pl-2">Program Name</th>
                <th className="pb-3">Stream</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Province/State</th>
                <th className="pb-3">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f1f5] text-sm font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-description">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary mb-2" />
                      <span className="text-sm font-medium">Loading programs...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPrograms.length > 0 ? (
                paginatedPrograms.map((p: any, idx: number) => {
                  let metaObj: any = {};
                  if (p.description && p.description.includes("<!--DERMAINE_METADATA-->")) {
                    try {
                      const [, jsonStr] = p.description.split("<!--DERMAINE_METADATA-->");
                      metaObj = JSON.parse(jsonStr);
                    } catch {}
                  }

                  const streamText =
                    metaObj.streamName ||
                    p.stream ||
                    (p._count?.streams ? `${p._count.streams} Streams` : "--");

                  const priorityVal = metaObj.priorityRanking || p.priorityRanking || "1";
                  const versionVal = metaObj.versionNumber ? `v${metaObj.versionNumber}` : "v1";

                  const statusVal = (p.status || "ACTIVE").toUpperCase();
                  const statusBadge =
                    statusVal === "ACTIVE" ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e6fcf0] text-[#16851f]">
                        Active
                      </span>
                    ) : statusVal === "DRAFT" ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Draft
                      </span>
                    ) : statusVal === "PAUSED" ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        Paused
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        {p.status || "Archived"}
                      </span>
                    );

                  return (
                    <tr key={p.id || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-title">
                        {p.name || p.title || "Untitled Program"}
                      </td>
                      <td className="py-3.5 text-description">{streamText}</td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-title border border-gray-200">
                          {p.category || "General"}
                        </span>
                      </td>
                      <td className="py-3.5">{statusBadge}</td>
                      <td className="py-3.5 text-description">{p.province || "Federal"}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-title">{priorityVal}</span>
                          <span className="text-xs text-description">{versionVal}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-description">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6 stroke-[1.5] text-[#8c8c9e]" />
                      </div>
                      <p className="font-semibold text-title text-base">
                        {selectedCountry === "CA"
                          ? "No matching programs found"
                          : `No programs configured for ${selectedCountryData.name}`}
                      </p>
                      <p className="text-xs text-description mt-1 max-w-sm">
                        {selectedCountry === "CA"
                          ? "No programs matched your current search and filter criteria."
                          : `Architecture prepared. Programs for ${selectedCountryData.name} are coming soon or haven't been published yet.`}
                      </p>
                      {(search || categoryFilter !== "all" || statusFilter !== "all" || orgFilter !== "all") && (
                        <button
                          onClick={() => {
                            setSearch("");
                            setCategoryFilter("all");
                            setStatusFilter("all");
                            setOrgFilter("all");
                          }}
                          className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="pt-4 border-t border-[#f1f1f5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-description">
              Showing Page <span className="font-semibold text-title">{page}</span> of{" "}
              <span className="font-semibold text-title">{totalPages}</span> ({totalItems} total programs)
            </p>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
                className="mt-0"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
