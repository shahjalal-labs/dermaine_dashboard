"use client";

import Link from "next/link";
import { useGetAllScoringFactorsQuery } from "@/redux/api/ruleApi";

const COUNTRY_MODELS = [
  {
    code: "NZ",
    name: "New Zealand",
    status: "Coming soon",
    engine: "Skilled Migrant Category Points",
    description: "Points-based test assessing age, English proficiency, skilled employment, educational qualifications, and partner skills.",
    badge: "Planned",
  },
  {
    code: "AU",
    name: "Australia",
    status: "Coming soon",
    engine: "General Skilled Migration (Points Test)",
    description: "Points-based test evaluating skilled work experience, qualification level, age, English proficiency, and regional sponsorship.",
    badge: "Planned",
  },
  {
    code: "US",
    name: "United States",
    status: "Coming soon",
    engine: "Preference Points System (EB Category)",
    description: "Employment-based preference criteria evaluating advanced degrees, exceptional abilities, and labor certifications.",
    badge: "Planned",
  },
  {
    code: "CA",
    name: "Canada",
    status: "Active",
    engine: "Comprehensive Ranking System (CRS)",
    description: "Federal Express Entry points calculation engine evaluating core human capital, spousal factors, skill transferability, and additional points.",
    badge: "Active",
  },
  {
    code: "UK",
    name: "United Kingdom",
    status: "Coming soon",
    engine: "Points-Based System (PBS)",
    description: "Points-based immigration system evaluating job offer at required skill level, English speaking ability, salary threshold, and educational qualifications.",
    badge: "Planned",
  },
];

export function ScoringModelsTab() {
  const { data: factorsData } = useGetAllScoringFactorsQuery({ page: 1, limit: 20 });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-title mb-1">Country Scoring Models</h3>
        <p className="text-sm md:text-base text-description">
          Platform-wide view of all scoring engines and their configuration status per country.
        </p>
      </div>

      {/* Country Scoring Cards */}
      <div className="space-y-4">
        <h4 className="font-bold text-title text-base">Country Scoring Models</h4>
        <div className="space-y-3">
          {COUNTRY_MODELS.map((item) => (
            <div
              key={item.code}
              className="bg-white rounded-2xl p-5 border border-[#f1f1f5] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 font-extrabold text-title text-sm flex items-center justify-center shrink-0">
                  {item.code}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-title text-base">{item.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16851f] border border-emerald-200">
                      {item.status}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-title mb-1">{item.engine}</div>
                  <p className="text-xs text-description">{item.description}</p>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-md self-end md:self-auto ${
                  item.badge === "Active"
                    ? "bg-[#e6fcf0] text-[#16851f]"
                    : "bg-gray-100 text-description"
                }`}
              >
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CRS CONFIGURATION MODELS (CANADA) */}
      <div className="space-y-3">
        <h4 className="font-bold text-title text-base uppercase text-xs tracking-wider">
          CRS CONFIGURATION MODELS (CANADA)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/rule-scoring?tab=CRS%20Engine"
            className="bg-white rounded-2xl p-5 border border-[#f1f1f5] shadow-sm flex items-center justify-between hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 font-extrabold text-title text-sm flex items-center justify-center">
                CA
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-title text-sm">Standard CRS 2026</span>
                  <span className="text-[11px] font-bold text-[#16851f] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16851f]" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-description mt-0.5">Active calculation formula</p>
              </div>
            </div>
          </Link>
        </div>
        <p className="text-xs text-description">
          Manage CRS models in detail via <span className="font-semibold">Admin → Rule / Scoring → CRS Engine tab</span>.
        </p>
      </div>

      {/* Assessment & Report Versioning Notice */}
      <div className="bg-white rounded-2xl p-5 border border-[#f1f1f5] shadow-sm">
        <h4 className="font-bold text-title text-sm mb-1">Assessment & Report Versioning</h4>
        <p className="text-xs text-description leading-relaxed">
          All assessments and reports are locked to the scoring model version that was active when they were generated. Future rule or scoring changes will never alter historical results. Version history is preserved for compliance and auditing.
        </p>
      </div>
    </div>
  );
}
