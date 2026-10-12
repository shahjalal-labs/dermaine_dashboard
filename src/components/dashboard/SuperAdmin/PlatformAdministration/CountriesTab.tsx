"use client";

import { useMemo, useState } from "react";
import { Plus, Search, ChevronDown, CheckCircle2, FileText, ClipboardList, ShieldCheck } from "lucide-react";
import { AddCountryModal } from "@/components/modal/AddCountryModal";
import { ProgramLibrariesTab } from "./ProgramLibrariesTab";
import { ScoringModelsTab } from "./ScoringModelsTab";
import { useGetAllStreamQuery } from "@/redux/api/stremApi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface CountryItem {
  code: string;
  name: string;
  currency: string;
  scoringEngine: string;
  status: string;
  note: string;
}

const DEFAULT_COUNTRIES: CountryItem[] = [
  {
    code: "NZ",
    name: "New Zealand",
    currency: "CAD",
    scoringEngine: "Skilled Migrant Category Points",
    status: "Coming soon",
    note: "Architecture prepared. Not yet activated",
  },
  {
    code: "AU",
    name: "Australia",
    currency: "CAD",
    scoringEngine: "Skilled Migrant Category Points",
    status: "Coming soon",
    note: "Architecture prepared. Not yet activated",
  },
  {
    code: "US",
    name: "USA",
    currency: "CAD",
    scoringEngine: "Skilled Migrant Category Points",
    status: "Coming soon",
    note: "Architecture prepared. Not yet activated",
  },
  {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    scoringEngine: "Skilled Migrant Category Points",
    status: "Coming soon",
    note: "Architecture prepared. Not yet activated",
  },
  {
    code: "UK",
    name: "United Kingdom",
    currency: "CAD",
    scoringEngine: "Skilled Migrant Category Points",
    status: "Coming soon",
    note: "Architecture prepared. Not yet activated",
  },
];

const HIERARCHY_TABS = [
  "Country",
  "Program",
  "Streams",
  "Rules",
  "Assessment",
  "Report",
] as const;

type HierarchyTab = (typeof HIERARCHY_TABS)[number];

export function CountriesTab() {
  const [activeHierarchy, setActiveHierarchy] = useState<HierarchyTab>("Country");
  const [countries, setCountries] = useState<CountryItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dermaine_platform_countries");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_COUNTRIES;
  });
  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (c: CountryItem) => {
    setSelectedCountry(c);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCountry(null);
    setIsModalOpen(true);
  };

  const handleSaveCountry = (updatedCountry: any, originalCode?: string) => {
    const codeToMatch = originalCode || updatedCountry.code;
    setCountries((prev) => {
      const exists = prev.some((c) => c.code === codeToMatch);
      const next = exists
        ? prev.map((c) => (c.code === codeToMatch ? updatedCountry : c))
        : [...prev, updatedCountry];
      try {
        localStorage.setItem("dermaine_platform_countries", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setSelectedCountry(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-title mb-1">
            Country Management
          </h3>
          <p className="text-xs md:text-sm text-[#8c8c9e]">
            Configure countries, their scoring engines, and immigration program structure. Only Canada is active today.
          </p>
        </div>
        {activeHierarchy === "Country" && (
          <button
            onClick={handleAdd}
            className="h-10 px-5 bg-[#16851f] hover:bg-[#13721a] text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 self-start md:self-auto shadow-xs cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Country</span>
          </button>
        )}
      </div>

      {/* Country Data Hierarchy Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#f0f0f5] shadow-xs">
        <h4 className="font-bold text-title text-sm mb-3">Country Data Hierarchy</h4>
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-semibold">
          {HIERARCHY_TABS.map((tab) => {
            const isActive = activeHierarchy === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveHierarchy(tab)}
                className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer text-xs md:text-sm font-semibold ${
                  isActive
                    ? "bg-[#16851f] text-white shadow-xs"
                    : "bg-white border border-[#e5e7eb] text-[#8c8c9e] hover:text-title hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[#8c8c9e] mt-3">
          Each country maintains its own isolated program library, scoring engine, and assessment logic.
        </p>
      </div>

      {/* Dynamic Content Based on Active Hierarchy Tab */}
      {activeHierarchy === "Country" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((country, idx) => (
            <div
              key={country.code || idx}
              className="bg-white rounded-2xl p-6 border border-[#f0f0f5] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#f4f4f6] text-title font-semibold flex items-center justify-center text-sm shrink-0">
                      {country.code}
                    </div>
                    <h4 className="font-semibold text-title text-base md:text-lg">
                      {country.name}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#e6fcf0] text-[#16851f] border border-emerald-100">
                    {country.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#8c8c9e]">Currency</span>
                    <span className="font-semibold text-title">{country.currency}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[#8c8c9e] shrink-0">Scoring Engine</span>
                    <span className="font-semibold text-title text-right">
                      {country.scoringEngine}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#8c8c9e] mt-3">{country.note}</p>
              </div>

              <div className="border-t border-[#f0f0f5] pt-4 mt-5">
                <button
                  onClick={() => handleEdit(country)}
                  className="w-full h-10 rounded-lg border border-[#e5e7eb] bg-white text-title font-semibold text-xs md:text-sm hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
                >
                  Edit Country
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeHierarchy === "Program" && (
        <div className="pt-2">
          <ProgramLibrariesTab />
        </div>
      )}

      {activeHierarchy === "Streams" && (
        <div className="pt-2">
          <StreamsHierarchyView />
        </div>
      )}

      {activeHierarchy === "Rules" && (
        <div className="pt-2">
          <ScoringModelsTab />
        </div>
      )}

      {activeHierarchy === "Assessment" && (
        <div className="pt-2">
          <AssessmentHierarchyView />
        </div>
      )}

      {activeHierarchy === "Report" && (
        <div className="pt-2">
          <ReportHierarchyView />
        </div>
      )}

      <AddCountryModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCountry(null);
        }}
        country={selectedCountry}
        onSave={handleSaveCountry}
      />
    </div>
  );
}

function StreamsHierarchyView() {
  const [streamSearch, setStreamSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const { data: streamsData, isLoading } = useGetAllStreamQuery({});

  const streams = useMemo(() => {
    const raw = streamsData?.data?.items || streamsData?.data?.streams || streamsData?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [streamsData]);

  const filteredStreams = useMemo(() => {
    return streams.filter((s: any) => {
      if (selectedCountry !== "all" && s.country?.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }
      if (streamSearch.trim()) {
        const q = streamSearch.toLowerCase().trim();
        const name = (s.streamName || "").toLowerCase();
        const prog = (s.program?.name || "").toLowerCase();
        const cat = (s.category || "").toLowerCase();
        return name.includes(q) || prog.includes(q) || cat.includes(q);
      }
      return true;
    });
  }, [streams, selectedCountry, streamSearch]);

  const countryOptions = [
    { label: "All Countries", value: "all" },
    { label: "Canada", value: "Canada" },
    { label: "Australia", value: "Australia" },
    { label: "New Zealand", value: "New Zealand" },
    { label: "United Kingdom", value: "United Kingdom" },
    { label: "United States", value: "United States" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#f0f0f5] shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8c9e]" />
            <input
              type="text"
              value={streamSearch}
              onChange={(e) => setStreamSearch(e.target.value)}
              placeholder="Search streams or programs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ebebed] bg-[#fafafa] text-sm text-title placeholder-[#a0a0b0] focus:outline-none focus:ring-1 focus:ring-[#16851f]"
            />
          </div>

          <div className="relative shrink-0 w-44">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-[#ebebed] bg-white text-sm font-medium text-title appearance-none focus:outline-none focus:ring-1 focus:ring-[#16851f] cursor-pointer"
            >
              {countryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8c9e] pointer-events-none" />
          </div>
        </div>

        {/* Streams Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f5]">
                <th className="pb-4 text-left text-xs font-bold text-[#a0a0b0] uppercase tracking-wider pl-4">
                  Stream Name
                </th>
                <th className="pb-4 text-left text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">
                  Program
                </th>
                <th className="pb-4 text-left text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">
                  Category
                </th>
                <th className="pb-4 text-left text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">
                  Country
                </th>
                <th className="pb-4 text-center text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="py-12">
                    <div className="flex justify-center">
                      <AiOutlineLoading3Quarters className="animate-spin text-[#16851f]" size={24} />
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : filteredStreams.length > 0 ? (
              <tbody className="divide-y divide-[#f7f7fa]">
                {filteredStreams.map((stream: any) => (
                  <tr key={stream.id} className="hover:bg-[#fafafc] transition-colors">
                    <td className="py-4 pl-4 text-sm font-medium text-title">
                      {stream.streamName}
                    </td>
                    <td className="py-4 text-sm text-[#8c8c9e]">
                      {stream.program?.name || "General Program"}
                    </td>
                    <td className="py-4 text-sm text-[#8c8c9e] capitalize">
                      {stream.category || "Economic"}
                    </td>
                    <td className="py-4 text-sm text-[#8c8c9e]">
                      {stream.country || "Canada"}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          stream.status?.toLowerCase() === "active"
                            ? "text-[#16851f] bg-[#e6f7ec]"
                            : "text-[#d97706] bg-[#fef3c7]"
                        }`}
                      >
                        {stream.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[#8c8c9e]">
                    No streams found matching your filter criteria.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

function AssessmentHierarchyView() {
  const frameworks = [
    {
      country: "Canada",
      code: "CA",
      name: "Comprehensive Ranking System (CRS)",
      sections: "Core/Human Capital, Spouse Factors, Skill Transferability, Additional Points",
      questionsCount: 42,
      status: "Active",
      version: "v2026.1",
    },
    {
      country: "Canada",
      code: "CA",
      name: "Federal Skilled Worker 67-Point Grid",
      sections: "Language, Education, Experience, Age, Arranged Employment, Adaptability",
      questionsCount: 28,
      status: "Active",
      version: "v2026.1",
    },
    {
      country: "Australia",
      code: "AU",
      name: "General Skilled Migration Points Test",
      sections: "Age, English Skills, Overseas/Australian Experience, Qualifications, Partner",
      questionsCount: 35,
      status: "Coming soon",
      version: "v2026.0",
    },
    {
      country: "New Zealand",
      code: "NZ",
      name: "Skilled Migrant Category Points Indicator",
      sections: "Skilled Employment, Qualifications, Income Threshold, Experience",
      questionsCount: 24,
      status: "Coming soon",
      version: "v2026.0",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#f0f0f5] shadow-xs">
        <h4 className="font-bold text-title text-base mb-1">Country Assessment Frameworks</h4>
        <p className="text-xs md:text-sm text-[#8c8c9e] mb-6">
          Automated questionnaire grids and scoring evaluation engines mapped per country.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {frameworks.map((fw, idx) => (
            <div
              key={idx}
              className="border border-[#f0f0f5] rounded-xl p-5 bg-white shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#f4f4f6] text-title font-semibold text-xs flex items-center justify-center">
                      {fw.code}
                    </span>
                    <span className="text-xs font-semibold text-[#8c8c9e]">{fw.country}</span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      fw.status === "Active"
                        ? "bg-[#e6fcf0] text-[#16851f]"
                        : "bg-gray-100 text-[#8c8c9e]"
                    }`}
                  >
                    {fw.status}
                  </span>
                </div>
                <h5 className="font-bold text-title text-base mb-1">{fw.name}</h5>
                <p className="text-xs text-[#8c8c9e] leading-relaxed">
                  Sections: {fw.sections}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0f0f5] flex justify-between items-center text-xs text-[#8c8c9e]">
                <span>Questions: <strong className="text-title">{fw.questionsCount}</strong></span>
                <span>Active Version: <strong className="text-title">{fw.version}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportHierarchyView() {
  const reports = [
    {
      title: "Comprehensive Eligibility & Scoring Report",
      country: "Canada & Multi-country",
      description: "Generates full breakdown of applicant points, missing factors, and pathway recommendations with official immigration benchmarks.",
      format: "PDF & Web Portal",
      versioning: "Locked to assessment submission timestamp",
    },
    {
      title: "Stream Comparison Matrix",
      country: "Multi-country",
      description: "Side-by-side comparison across all eligible streams within the selected country, ranking feasibility by processing times and requirements.",
      format: "PDF Summary",
      versioning: "Real-time program rules snapshot",
    },
    {
      title: "Immigration Audit Compliance Trail",
      country: "All Countries",
      description: "Immutable historical log preserving the exact scoring engine rules and formulas active when client report was issued.",
      format: "Audit JSON / PDF",
      versioning: "Compliance Certified",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#f0f0f5] shadow-xs">
        <h4 className="font-bold text-title text-base mb-1">Country Reports & Audit Versioning</h4>
        <p className="text-xs md:text-sm text-[#8c8c9e] mb-6">
          Report output templates, client deliverables, and compliance audit trail version locks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reports.map((r, i) => (
            <div
              key={i}
              className="border border-[#f0f0f5] rounded-xl p-5 bg-white shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#e6fcf0] text-[#16851f] flex items-center justify-center mb-3">
                  <FileText size={18} />
                </div>
                <h5 className="font-bold text-title text-base mb-1.5">{r.title}</h5>
                <p className="text-xs text-[#8c8c9e] leading-relaxed mb-4">{r.description}</p>
              </div>

              <div className="pt-3 border-t border-[#f0f0f5] space-y-1 text-xs text-[#8c8c9e]">
                <div className="flex justify-between">
                  <span>Scope:</span>
                  <span className="font-semibold text-title">{r.country}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deliverable:</span>
                  <span className="font-semibold text-title">{r.format}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
