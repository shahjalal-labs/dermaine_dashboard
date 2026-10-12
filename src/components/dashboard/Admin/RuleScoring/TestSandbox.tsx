"use client";

import { useState, useMemo } from "react";
import {
  Play,
  Download,
  CheckCircle2,
  TrendingUp,
  Info,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface MatchResult {
  id: string;
  name: string;
  description: string;
  score: number;
  matchTier: "strong" | "moderate" | "fair";
  matchTierLabel: string;
  keyStrengths: string[];
}

export default function TestSandbox() {
  // Test Configuration State (Matching Screenshot)
  const [age, setAge] = useState<number>(28);
  const [education, setEducation] = useState<string>("bachelor");
  const [clbScore, setClbScore] = useState<string>("clb8");
  const [experienceMonths, setExperienceMonths] = useState<number>(24);
  const [activeTab, setActiveTab] = useState<"strong" | "moderate" | "fair">("strong");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Dynamic Rule Simulation Calculation
  const simulationResults = useMemo<MatchResult[]>(() => {
    // Scoring variables based on test inputs
    const agePts = age >= 20 && age <= 29 ? 12 : age <= 35 ? 10 : age <= 40 ? 6 : 2;
    const eduPts =
      education === "phd"
        ? 25
        : education === "master"
        ? 23
        : education === "bachelor"
        ? 21
        : education === "two_or_more"
        ? 22
        : 15;
    const clbPts =
      clbScore === "clb10"
        ? 24
        : clbScore === "clb9"
        ? 22
        : clbScore === "clb8"
        ? 19
        : clbScore === "clb7"
        ? 15
        : 10;
    const expPts =
      experienceMonths >= 36
        ? 20
        : experienceMonths >= 24
        ? 18
        : experienceMonths >= 12
        ? 14
        : 5;

    // 1. Federal Skilled Worker
    const fswScore = Math.min(99, Math.max(45, 20 + agePts + eduPts + clbPts + expPts));
    // 2. Canadian Experience Class
    const cecScore = Math.min(
      98,
      Math.max(40, 15 + agePts + eduPts + clbPts + Math.round(expPts * 1.15))
    );
    // 3. OINP Human Capital
    const oinpScore = Math.min(92, Math.max(35, 10 + agePts + eduPts + clbPts + expPts - 4));
    // 4. Alberta Advantage
    const aaipScore = Math.min(90, Math.max(30, 8 + agePts + eduPts + clbPts + expPts - 8));
    // 5. Atlantic Immigration
    const aipScore = Math.min(85, Math.max(25, 5 + agePts + eduPts + clbPts + expPts - 15));

    const results: MatchResult[] = [
      {
        id: "fsw",
        name: "Federal Skilled Worker - Express Entry",
        description:
          "Your education, language level, and work experience align excellently with FSW requirements. Your CRS score is competitive.",
        score: fswScore,
        matchTier: fswScore >= 80 ? "strong" : fswScore >= 70 ? "moderate" : "fair",
        matchTierLabel: fswScore >= 80 ? "Strong Match" : fswScore >= 70 ? "Moderate Match" : "Fair Match",
        keyStrengths: [
          `High CRS score (${Math.round(420 + (fswScore - 50) * 1.5)})`,
          "Strong English proficiency",
          education === "master"
            ? "Master's degree"
            : education === "phd"
            ? "Doctoral degree"
            : "Bachelor's degree",
          "Skilled work experience",
        ],
      },
      {
        id: "cec",
        name: "Canadian Experience Class",
        description:
          "Your Canadian work experience and language skills make you an excellent candidate for this program.",
        score: cecScore,
        matchTier: cecScore >= 80 ? "strong" : cecScore >= 70 ? "moderate" : "fair",
        matchTierLabel: cecScore >= 80 ? "Strong Match" : cecScore >= 70 ? "Moderate Match" : "Fair Match",
        keyStrengths: [
          `${Math.floor(experienceMonths / 12)} years Canadian experience`,
          `CLB ${clbScore.replace("clb", "")} in all abilities`,
          "NOC TEER 1 occupation",
        ],
      },
      {
        id: "oinp",
        name: "Ontario Immigrant Nominee Program - Human Capital",
        description:
          "Your profile aligns well with Ontario's priority nomination draws for high-demand skilled professions.",
        score: oinpScore,
        matchTier: oinpScore >= 80 ? "strong" : oinpScore >= 70 ? "moderate" : "fair",
        matchTierLabel: oinpScore >= 80 ? "Strong Match" : oinpScore >= 70 ? "Moderate Match" : "Fair Match",
        keyStrengths: [
          "Eligible for Ontario Tech/Healthcare draws",
          "Post-secondary degree verified",
          "Strong language proficiency benchmark",
        ],
      },
      {
        id: "aaip",
        name: "Alberta Advantage Immigration Program",
        description:
          "Competitive profile under Alberta Express Entry with favorable provincial points allocation.",
        score: aaipScore,
        matchTier: aaipScore >= 80 ? "strong" : aaipScore >= 70 ? "moderate" : "fair",
        matchTierLabel: aaipScore >= 80 ? "Strong Match" : aaipScore >= 70 ? "Moderate Match" : "Fair Match",
        keyStrengths: [
          "Qualifies for Alberta accelerated pathways",
          "Consistent employment track record",
          "Favorable demographic age score",
        ],
      },
      {
        id: "aip",
        name: "Atlantic Immigration Program",
        description:
          "Meets fundamental regional requirements. Employer endorsement within Atlantic Canada will unlock direct stream entry.",
        score: aipScore,
        matchTier: aipScore >= 80 ? "strong" : aipScore >= 70 ? "moderate" : "fair",
        matchTierLabel: aipScore >= 80 ? "Strong Match" : aipScore >= 70 ? "Moderate Match" : "Fair Match",
        keyStrengths: [
          "Core education and language thresholds satisfied",
          `${experienceMonths} months verified skilled work experience`,
        ],
      },
    ];

    return results;
  }, [age, education, clbScore, experienceMonths]);

  // Counts by match tier
  const strongMatches = useMemo(
    () => simulationResults.filter((r) => r.matchTier === "strong"),
    [simulationResults]
  );
  const moderateMatches = useMemo(
    () => simulationResults.filter((r) => r.matchTier === "moderate"),
    [simulationResults]
  );
  const fairMatches = useMemo(
    () => simulationResults.filter((r) => r.matchTier === "fair"),
    [simulationResults]
  );

  const displayedMatches = useMemo(() => {
    if (activeTab === "strong") return strongMatches;
    if (activeTab === "moderate") return moderateMatches;
    return fairMatches;
  }, [activeTab, strongMatches, moderateMatches, fairMatches]);

  const handleRunTest = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      toast.success(
        `Simulation evaluated! Found ${strongMatches.length} strong, ${moderateMatches.length} moderate, and ${fairMatches.length} fair matches.`
      );
    }, 400);
  };

  const handleExportReport = () => {
    const reportText = `IMMIGRATION RULE ENGINE - TEST SANDBOX REPORT
Generated: ${new Date().toLocaleString()}
--------------------------------------------------
APPLICANT PROFILE:
- Age: ${age}
- Education: ${education}
- CLB Score: ${clbScore}
- Canadian Experience: ${experienceMonths} months
--------------------------------------------------
ELIGIBILITY RESULTS SUMMARY:
- Strong Matches: ${strongMatches.length}
- Moderate Matches: ${moderateMatches.length}
- Fair Matches: ${fairMatches.length}

DETAILED PATHWAY MATCHES:
${simulationResults
  .map(
    (r, idx) =>
      `${idx + 1}. ${r.name} (${r.score}%) - ${r.matchTierLabel}\n   ${r.description}\n   Key Strengths: ${r.keyStrengths.join(", ")}`
  )
  .join("\n\n")}
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eligibility-test-report-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Eligibility report exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* 1. Test Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Test Configuration
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Enter test profile data to simulate rule matching
        </p>

        {/* 4 Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Age */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-11 px-4 bg-slate-100/70 border-0 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a859] transition-all"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Education
            </label>
            <div className="relative">
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full h-11 px-4 pr-10 bg-slate-100/70 border-0 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a859] transition-all appearance-none cursor-pointer"
              >
                <option value="highschool">High School</option>
                <option value="1year">1-Year Post-Secondary</option>
                <option value="2year">2-Year Post-Secondary</option>
                <option value="bachelor">Bachelor&apos;s Degree</option>
                <option value="two_or_more">Two or More Credentials</option>
                <option value="master">Master&apos;s Degree</option>
                <option value="phd">Doctoral / Ph.D.</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* CLB Score */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              CLB Score
            </label>
            <div className="relative">
              <select
                value={clbScore}
                onChange={(e) => setClbScore(e.target.value)}
                className="w-full h-11 px-4 pr-10 bg-slate-100/70 border-0 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a859] transition-all appearance-none cursor-pointer"
              >
                <option value="clb4">CLB 4</option>
                <option value="clb5">CLB 5</option>
                <option value="clb6">CLB 6</option>
                <option value="clb7">CLB 7</option>
                <option value="clb8">CLB 8</option>
                <option value="clb9">CLB 9</option>
                <option value="clb10">CLB 10+</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Experience (months) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Experience (months)
            </label>
            <input
              type="number"
              value={experienceMonths}
              onChange={(e) => setExperienceMonths(Number(e.target.value))}
              className="w-full h-11 px-4 bg-slate-100/70 border-0 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a859] transition-all"
            />
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunTest}
            disabled={isRunning}
            className="flex-1 h-11 bg-[#00a859] hover:bg-[#00904c] text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99] disabled:opacity-75"
          >
            <Play className={`w-4 h-4 fill-white ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Running Simulation..." : "Run Test"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportReport}
            className="h-11 px-5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Eligibility Results Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Eligibility Results
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Pathway matches based on test profile
        </p>

        {/* Pill Navigation Tabs */}
        <div className="bg-slate-100/80 p-1 rounded-xl flex items-center gap-1 max-w-xl mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("strong")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "strong"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Strong ({strongMatches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("moderate")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "moderate"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Moderate ({moderateMatches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fair")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "fair"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Fair ({fairMatches.length})</span>
          </button>
        </div>

        {/* Match Cards List */}
        <div className="space-y-4">
          {displayedMatches.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium text-sm">
              No pathway matches found in this category for the current profile.
            </div>
          ) : (
            displayedMatches.map((match) => (
              <div
                key={match.id}
                className="border-2 border-emerald-400 bg-white rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm"
              >
                {/* Top Section */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        {match.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {match.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-emerald-600 leading-none">
                      {match.score}%
                    </div>
                    <span className="inline-block mt-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {match.matchTierLabel}
                    </span>
                  </div>
                </div>

                {/* Progress / Divider Bar */}
                <div className="h-2 bg-slate-900 rounded-full w-full my-4" />

                {/* Key Strengths */}
                <div>
                  <span className="text-xs font-bold text-slate-900 mb-2 block">
                    Key Strengths
                  </span>
                  <div className="space-y-1.5">
                    {match.keyStrengths.map((strength, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
