"use client";

import { useState } from "react";
import { Check, ChevronRight, Info, Layers, Award, Sparkles, BookOpen } from "lucide-react";

export default function CRSScoreTables() {
  const [activeSection, setActiveSection] = useState<"core" | "spouse" | "transferability" | "additional">("core");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-title mb-1">
            Comprehensive CRS Scoring Tables
          </h2>
          <p className="text-sm text-description">
            Official IRCC Comprehensive Ranking System (CRS) criteria, maximum point allocations, and CLB conversion matrices.
          </p>
        </div>
      </div>

      {/* Section navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "core", label: "A. Core / Human Capital", max: "Max 460 / 500" },
          { id: "spouse", label: "B. Spouse Factors", max: "Max 40" },
          { id: "transferability", label: "C. Skill Transferability", max: "Max 100" },
          { id: "additional", label: "D. Additional Points", max: "Max 600" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSection === tab.id
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeSection === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.max}
            </span>
          </button>
        ))}
      </div>

      {/* SECTION A: CORE FACTORS */}
      {activeSection === "core" && (
        <div className="space-y-6">
          {/* Age Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-title mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              1. Age Factor (Maximum with spouse: 100 pts | without spouse: 110 pts)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Age</th>
                    <th className="py-3 px-4 font-semibold">With Spouse (pts)</th>
                    <th className="py-3 px-4 font-semibold">Without Spouse (pts)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr><td className="py-2.5 px-4">17 years of age or less</td><td className="py-2.5 px-4">0</td><td className="py-2.5 px-4">0</td></tr>
                  <tr><td className="py-2.5 px-4">18 years of age</td><td className="py-2.5 px-4">90</td><td className="py-2.5 px-4">99</td></tr>
                  <tr><td className="py-2.5 px-4">19 years of age</td><td className="py-2.5 px-4">95</td><td className="py-2.5 px-4">105</td></tr>
                  <tr className="bg-emerald-50/50 font-semibold text-emerald-800"><td className="py-2.5 px-4">20 to 29 years of age (Peak Points)</td><td className="py-2.5 px-4">100</td><td className="py-2.5 px-4">110</td></tr>
                  <tr><td className="py-2.5 px-4">30 years of age</td><td className="py-2.5 px-4">95</td><td className="py-2.5 px-4">105</td></tr>
                  <tr><td className="py-2.5 px-4">35 years of age</td><td className="py-2.5 px-4">70</td><td className="py-2.5 px-4">77</td></tr>
                  <tr><td className="py-2.5 px-4">40 years of age</td><td className="py-2.5 px-4">45</td><td className="py-2.5 px-4">50</td></tr>
                  <tr><td className="py-2.5 px-4">45 years of age or older</td><td className="py-2.5 px-4">0</td><td className="py-2.5 px-4">0</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Education Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-title mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              2. Level of Education (Maximum with spouse: 140 pts | without spouse: 150 pts)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Level of Education</th>
                    <th className="py-3 px-4 font-semibold">With Spouse (pts)</th>
                    <th className="py-3 px-4 font-semibold">Without Spouse (pts)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr><td className="py-2.5 px-4">Secondary (high school) credential or less</td><td className="py-2.5 px-4">28</td><td className="py-2.5 px-4">30</td></tr>
                  <tr><td className="py-2.5 px-4">One-year post-secondary program</td><td className="py-2.5 px-4">84</td><td className="py-2.5 px-4">90</td></tr>
                  <tr><td className="py-2.5 px-4">Two-year post-secondary program</td><td className="py-2.5 px-4">91</td><td className="py-2.5 px-4">98</td></tr>
                  <tr><td className="py-2.5 px-4">Bachelor&apos;s degree or 3+ year program</td><td className="py-2.5 px-4">112</td><td className="py-2.5 px-4">120</td></tr>
                  <tr className="bg-emerald-50/50 font-semibold text-emerald-800"><td className="py-2.5 px-4">Two or more certificates/diplomas/degrees (one 3+ yrs)</td><td className="py-2.5 px-4">119</td><td className="py-2.5 px-4">128</td></tr>
                  <tr className="bg-emerald-50/50 font-semibold text-emerald-800"><td className="py-2.5 px-4">Master&apos;s degree or professional degree</td><td className="py-2.5 px-4">126</td><td className="py-2.5 px-4">135</td></tr>
                  <tr className="bg-emerald-50/50 font-semibold text-emerald-800"><td className="py-2.5 px-4">Doctoral level university degree (Ph.D.)</td><td className="py-2.5 px-4">140</td><td className="py-2.5 px-4">150</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* First Official Language */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-title mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              3. First Official Language (CLB per ability: Reading, Writing, Listening, Speaking)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Canadian Language Benchmark (CLB)</th>
                    <th className="py-3 px-4 font-semibold">With Spouse (per ability)</th>
                    <th className="py-3 px-4 font-semibold">Without Spouse (per ability)</th>
                    <th className="py-3 px-4 font-semibold">Max All 4 Abilities (No Spouse)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr><td className="py-2.5 px-4">Less than CLB 4</td><td className="py-2.5 px-4">0</td><td className="py-2.5 px-4">0</td><td className="py-2.5 px-4">0</td></tr>
                  <tr><td className="py-2.5 px-4">CLB 4 or 5</td><td className="py-2.5 px-4">6</td><td className="py-2.5 px-4">6</td><td className="py-2.5 px-4">24</td></tr>
                  <tr><td className="py-2.5 px-4">CLB 6</td><td className="py-2.5 px-4">8</td><td className="py-2.5 px-4">9</td><td className="py-2.5 px-4">36</td></tr>
                  <tr><td className="py-2.5 px-4">CLB 7</td><td className="py-2.5 px-4">16</td><td className="py-2.5 px-4">17</td><td className="py-2.5 px-4">68</td></tr>
                  <tr><td className="py-2.5 px-4">CLB 8</td><td className="py-2.5 px-4">22</td><td className="py-2.5 px-4">23</td><td className="py-2.5 px-4">92</td></tr>
                  <tr><td className="py-2.5 px-4">CLB 9</td><td className="py-2.5 px-4">29</td><td className="py-2.5 px-4">31</td><td className="py-2.5 px-4">124</td></tr>
                  <tr className="bg-emerald-50/50 font-semibold text-emerald-800"><td className="py-2.5 px-4">CLB 10 or more (Max points)</td><td className="py-2.5 px-4">32</td><td className="py-2.5 px-4">34</td><td className="py-2.5 px-4">136</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: SPOUSE FACTORS */}
      {activeSection === "spouse" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-title mb-2">Spouse or Common-Law Partner Factors (Max 40 Points)</h3>
          <p className="text-sm text-description">
            If a candidate has an accompanying spouse or common-law partner, up to 40 CRS points can be claimed based on their credentials.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Spouse Education</span>
              <p className="text-2xl font-black text-title mt-1">10 pts max</p>
              <ul className="text-xs text-description mt-2 space-y-1">
                <li>• Master&apos;s or Ph.D.: 10 pts</li>
                <li>• Bachelor&apos;s or 3+ yr degree: 8 pts</li>
                <li>• 1 or 2-year diploma: 6-7 pts</li>
                <li>• Secondary school: 2 pts</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Spouse Language</span>
              <p className="text-2xl font-black text-title mt-1">20 pts max</p>
              <ul className="text-xs text-description mt-2 space-y-1">
                <li>• CLB 9+: 5 pts per ability</li>
                <li>• CLB 7-8: 3 pts per ability</li>
                <li>• CLB 5-6: 1 pt per ability</li>
                <li>• Below CLB 5: 0 pts</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Canadian Work Exp.</span>
              <p className="text-2xl font-black text-title mt-1">10 pts max</p>
              <ul className="text-xs text-description mt-2 space-y-1">
                <li>• 5+ years: 10 pts</li>
                <li>• 3-4 years: 7-8 pts</li>
                <li>• 1-2 years: 5-6 pts</li>
                <li>• Less than 1 year: 0 pts</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: SKILL TRANSFERABILITY */}
      {activeSection === "transferability" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-title mb-2">Skill Transferability Factors (Max 100 Points)</h3>
          <p className="text-sm text-description">
            Points awarded for combinations of high education, official language benchmarks (CLB 7+ or CLB 9+), and Canadian or foreign work experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-title text-sm">Education + Language</h4>
              <p className="text-xs text-description mt-1">Post-secondary degree with CLB 7 or CLB 9+ in all 4 language abilities.</p>
              <span className="inline-block mt-2 font-bold text-primary text-sm">Up to 50 pts</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-title text-sm">Education + Canadian Work</h4>
              <p className="text-xs text-description mt-1">Post-secondary degree with 1+ or 2+ years of Canadian skilled work experience.</p>
              <span className="inline-block mt-2 font-bold text-primary text-sm">Up to 50 pts</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-title text-sm">Foreign Work + Language</h4>
              <p className="text-xs text-description mt-1">1-3+ years of foreign skilled work combined with CLB 7 or CLB 9+ official language scores.</p>
              <span className="inline-block mt-2 font-bold text-primary text-sm">Up to 50 pts</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-title text-sm">Certificate of Qualification in Trades</h4>
              <p className="text-xs text-description mt-1">Provincial or federal certificate in skilled trades combined with CLB 5 or CLB 7+ language.</p>
              <span className="inline-block mt-2 font-bold text-primary text-sm">Up to 50 pts</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: ADDITIONAL POINTS */}
      {activeSection === "additional" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-title mb-2">Additional Factors (Max 600 Points)</h3>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div>
                <p className="font-bold text-title text-sm">Provincial or Territorial Nomination (PNP)</p>
                <p className="text-xs text-description">Enhanced nomination from any Canadian province (e.g. OINP, BC PNP, AAIP)</p>
              </div>
              <span className="text-lg font-black text-emerald-600">+600 pts</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="font-bold text-title text-sm">Qualifying Offer of Arranged Employment (NOC 00 Senior Executive)</p>
                <p className="text-xs text-description">Major Group 00 senior executive level job offer with LMIA or LMIA-exempt status</p>
              </div>
              <span className="text-lg font-black text-primary">+200 pts</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="font-bold text-title text-sm">Qualifying Offer of Arranged Employment (NOC TEER 0, 1, 2, 3)</p>
                <p className="text-xs text-description">Skilled job offer with LMIA or approved employer-specific work permit</p>
              </div>
              <span className="text-lg font-black text-primary">+50 pts</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="font-bold text-title text-sm">French Language Skills Bonus (NCLC 7+ in all 4 French abilities)</p>
                <p className="text-xs text-description">+25 if English is CLB 4 or lower; +50 if English is CLB 5 or higher</p>
              </div>
              <span className="text-lg font-black text-primary">+25 to +50 pts</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="font-bold text-title text-sm">Post-Secondary Education in Canada Credential</p>
                <p className="text-xs text-description">+15 for 1 or 2-year eligible program; +30 for 3+ years, Master&apos;s, or Ph.D.</p>
              </div>
              <span className="text-lg font-black text-primary">+15 to +30 pts</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="font-bold text-title text-sm">Sibling in Canada (Brother or Sister)</p>
                <p className="text-xs text-description">Sibling who is 18+ and a Canadian Citizen or Permanent Resident</p>
              </div>
              <span className="text-lg font-black text-primary">+15 pts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
