"use client";

import InputField from "@/components/ui/InputField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { CheckCircle2, Save, Sliders, Layers, ArrowUpDown, Award } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useGetAllProgramQuery } from "@/redux/api/programApi";

export default function ScoringAndWeights() {
  const { data: programsData } = useGetAllProgramQuery({});
  const programs = useMemo(() => {
    return programsData?.result?.items || programsData?.result || [];
  }, [programsData]);

  const [selectedProgram, setSelectedProgram] = useState<string>("global");

  const [weights, setWeights] = useState({
    crsStrength: 30,
    occupationCategory: 25,
    languageScore: 20,
    educationLevel: 15,
    canadianTies: 10,
  });

  // Doc Section 10: Recommended Output Limits
  const [outputLimits, setOutputLimits] = useState({
    bestMatches: 10,
    improvementOpportunities: 3,
    alternativePathways: 3,
    notEligibleYetFuture: 3,
  });

  // Match Thresholds (Doc Section 7)
  const [thresholds, setThresholds] = useState({
    strongMatch: 80,
    moderateMatch: 65,
    fairMatch: 50,
    improvementRequired: 35,
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  const categories = [
    "Healthcare",
    "STEM",
    "Trades",
    "Transport",
    "Agriculture",
    "Education",
    "French",
    "Business",
    "Family Sponsorship",
  ];

  const [activeCategories, setActiveCategories] = useState<string[]>([
    "Healthcare",
    "STEM",
    "Trades",
    "French",
  ]);

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSaveConfig = () => {
    if (totalWeight !== 100) {
      toast.error(`Total weight must equal exactly 100% (currently ${totalWeight}%)`);
      return;
    }
    toast.success("Scoring weights, thresholds, and output limits saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Top Select Program */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Select Program or Scope to Configure
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Configure default global search engine scoring factors, or override weights for a specific immigration program.
        </p>
        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
          <SelectTrigger className="w-full sm:w-[450px] h-auto px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500">
            <SelectValue placeholder="Select Program Scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">Global Engine Default (All Programs & Streams)</SelectItem>
            {programs.map((p: any) => (
              <SelectItem key={p.id || p._id} value={p.id || p._id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Match Scoring Weights (Doc Section 6) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Match Scoring Weights (Doc Spec 6)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formula: Final Match Score = &Sigma; (Factor Score &times; Weight)
                </p>
              </div>
              <div
                className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${
                  totalWeight === 100
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                <CheckCircle2 size={16} />
                <span>Total: {totalWeight}%</span>
              </div>
            </div>

            <div className="space-y-5">
              {[
                { key: "crsStrength", label: "CRS Strength", desc: "Express Entry / Benchmark Score" },
                { key: "occupationCategory", label: "Occupation Category", desc: "TEER 0/1/2/3 & In-demand targeting" },
                { key: "languageScore", label: "Language Score", desc: "CLB benchmark score weighting" },
                { key: "educationLevel", label: "Education Level", desc: "Degree qualification & ECA credential" },
                { key: "canadianTies", label: "Canadian Ties", desc: "Canadian work, study, family or provincial ties" },
              ].map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      <span className="text-[11px] text-slate-400 block">{item.desc}</span>
                    </div>
                    <span className="font-black text-emerald-700 text-base">
                      {weights[item.key as keyof typeof weights]}%
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights[item.key as keyof typeof weights]}
                      onChange={(e) =>
                        handleWeightChange(
                          item.key as keyof typeof weights,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 10: Recommended Output Limits */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers size={18} className="text-purple-600" />
                  Recommended Output Limits (Doc Spec 10)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controls how many results appear in the user-facing report to avoid overwhelming the applicant.
                </p>
              </div>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Section 10
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="font-bold text-slate-800 block mb-1">
                  Top Best Matches
                </label>
                <span className="text-slate-500 block mb-2 text-[11px]">Recommended: 5–10</span>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={outputLimits.bestMatches}
                  onChange={(e) =>
                    setOutputLimits({ ...outputLimits, bestMatches: Number(e.target.value) })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-sm text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="font-bold text-slate-800 block mb-1">
                  Top Improvement Opportunities
                </label>
                <span className="text-slate-500 block mb-2 text-[11px]">Recommended: Top 3</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={outputLimits.improvementOpportunities}
                  onChange={(e) =>
                    setOutputLimits({
                      ...outputLimits,
                      improvementOpportunities: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-sm text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="font-bold text-slate-800 block mb-1">
                  Top Alternative Pathways
                </label>
                <span className="text-slate-500 block mb-2 text-[11px]">Recommended: Top 3</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={outputLimits.alternativePathways}
                  onChange={(e) =>
                    setOutputLimits({
                      ...outputLimits,
                      alternativePathways: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-sm text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="font-bold text-slate-800 block mb-1">
                  Top Not Eligible Yet (Future)
                </label>
                <span className="text-slate-500 block mb-2 text-[11px]">Recommended: Top 3</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={outputLimits.notEligibleYetFuture}
                  onChange={(e) =>
                    setOutputLimits({
                      ...outputLimits,
                      notEligibleYetFuture: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <Save size={16} />
            Save Scoring & Output Configuration
          </button>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Match Thresholds (Doc Section 7) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Match Classification Bands (Doc Spec 7)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Composite percentage threshold boundaries for stream classification.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <div>
                  <div className="font-bold text-emerald-800 text-sm">Strong Match</div>
                  <div className="text-[11px] text-emerald-600">Minimum cutoff for prime recommendations</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={thresholds.strongMatch}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, strongMatch: Number(e.target.value) })
                    }
                    className="w-16 p-1.5 bg-white border border-emerald-300 rounded text-center font-bold text-sm text-slate-900"
                  />
                  <span className="text-xs font-bold text-emerald-700">% - 100%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                <div>
                  <div className="font-bold text-blue-800 text-sm">Moderate Match</div>
                  <div className="text-[11px] text-blue-600">Viable nomination opportunity</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={thresholds.moderateMatch}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, moderateMatch: Number(e.target.value) })
                    }
                    className="w-16 p-1.5 bg-white border border-blue-300 rounded text-center font-bold text-sm text-slate-900"
                  />
                  <span className="text-xs font-bold text-blue-700">% - {thresholds.strongMatch - 1}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div>
                  <div className="font-bold text-amber-800 text-sm">Fair Match</div>
                  <div className="text-[11px] text-amber-600">Alternative pathway candidate</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={thresholds.fairMatch}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, fairMatch: Number(e.target.value) })
                    }
                    className="w-16 p-1.5 bg-white border border-amber-300 rounded text-center font-bold text-sm text-slate-900"
                  />
                  <span className="text-xs font-bold text-amber-700">% - {thresholds.moderateMatch - 1}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50/60 border border-orange-200 rounded-xl">
                <div>
                  <div className="font-bold text-orange-800 text-sm">Improvement Required</div>
                  <div className="text-[11px] text-orange-600">Remediable requirements missing</div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={thresholds.improvementRequired}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, improvementRequired: Number(e.target.value) })
                    }
                    className="w-16 p-1.5 bg-white border border-orange-300 rounded text-center font-bold text-sm text-slate-900"
                  />
                  <span className="text-xs font-bold text-orange-700">% - {thresholds.fairMatch - 1}%</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900">Mandatory Rule Override Clause (Doc Sec 7):</span> Even if an applicant achieves &ge;80% score, if any mandatory rule returns <strong>FAIL</strong>, the stream classification is automatically capped at <strong>Improvement Required</strong> or <strong>Not Eligible Yet</strong>.
              </div>
            </div>
          </div>

          {/* Stream Ranking Priority Hierarchy (Doc Section 9) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpDown size={18} className="text-blue-600" />
              Suggested Ranking Order Hierarchy (Doc Spec 9)
            </h2>
            <div className="space-y-2 text-xs">
              {[
                { rank: 1, label: "Eligible + Strong Match", desc: "Top priority recommendation" },
                { rank: 2, label: "Eligible + Moderate Match", desc: "Solid secondary pathway" },
                { rank: 3, label: "Improvement Required but High Potential", desc: "Lacks ECA or minor points" },
                { rank: 4, label: "Future Opportunity", desc: "Requires Canadian experience" },
                { rank: 5, label: "Alternative Pathway", desc: "Fair match or other provinces" },
                { rank: 6, label: "Not Eligible Yet", desc: "Major criteria unsatisfied" },
              ].map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                      {item.rank}
                    </span>
                    <span className="font-semibold text-slate-900">{item.label}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Matching */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              Active Category Groupings (Doc Spec 14)
            </h2>
            <p className="text-xs text-slate-500">
              Select categories active for occupation and pathway grouping in free/paid reports.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((category) => {
                const isSelected = activeCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected ? `✓ ${category}` : category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
