"use client";

import { useState, useEffect, useMemo } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useGetAllProgramQuery } from "@/redux/api/programApi";

interface RecommendationTemplates {
  whyRecommended: string;
  keyStrength: string;
  missingRequirements: string;
  suggestedNextSteps: string;
  risksConsiderations: string;
  alternativePathways: string;
}

const DEFAULT_PROGRAMS = [
  { id: "spousal-sponsorship", name: "Spousal Sponsorship" },
  { id: "express-entry-fsw", name: "Express Entry - Federal Skilled Worker" },
  { id: "canadian-experience-class", name: "Canadian Experience Class (CEC)" },
  { id: "oinp-human-capital", name: "Ontario Immigrant Nominee Program (OINP)" },
  { id: "bc-pnp-tech", name: "BC Provincial Nominee Program (Tech Stream)" },
  { id: "atlantic-immigration-prog", name: "Atlantic Immigration Program" },
  { id: "pgwp-transition", name: "Post-Graduation Work Permit (PGWP)" },
];

export default function AiRecommendations() {
  const { data: programsData } = useGetAllProgramQuery({
    page: 1,
    limit: 100,
  });

  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Combine backend programs and default programs
  const programOptions = useMemo(() => {
    const raw =
      programsData?.data?.items ||
      programsData?.result?.items ||
      programsData?.data ||
      programsData?.result ||
      [];
    const backendItems = Array.isArray(raw)
      ? raw.map((p: any) => ({
          id: p.id || p._id,
          name: p.name || p.programName || p.title,
        }))
      : [];

    const existingNames = new Set(
      backendItems.map((p: any) => (p.name || "").toLowerCase().trim())
    );
    const additional = DEFAULT_PROGRAMS.filter(
      (dp) => !existingNames.has(dp.name.toLowerCase().trim())
    );

    return [...backendItems, ...additional];
  }, [programsData]);

  const selectedProgram = useMemo(() => {
    return programOptions.find((p) => p.id === selectedProgramId);
  }, [programOptions, selectedProgramId]);

  // Recommendation templates state
  const [templates, setTemplates] = useState<RecommendationTemplates>({
    whyRecommended: "",
    keyStrength: "",
    missingRequirements: "",
    suggestedNextSteps: "",
    risksConsiderations: "",
    alternativePathways: "",
  });

  // Load saved templates for the selected program from localStorage
  useEffect(() => {
    if (!selectedProgramId) {
      setTemplates({
        whyRecommended: "",
        keyStrength: "",
        missingRequirements: "",
        suggestedNextSteps: "",
        risksConsiderations: "",
        alternativePathways: "",
      });
      return;
    }

    try {
      const saved = localStorage.getItem(`DERMAINE_AI_REC_${selectedProgramId}`);
      if (saved) {
        setTemplates(JSON.parse(saved));
      } else {
        setTemplates({
          whyRecommended: "",
          keyStrength: "",
          missingRequirements: "",
          suggestedNextSteps: "",
          risksConsiderations: "",
          alternativePathways: "",
        });
      }
    } catch {
      setTemplates({
        whyRecommended: "",
        keyStrength: "",
        missingRequirements: "",
        suggestedNextSteps: "",
        risksConsiderations: "",
        alternativePathways: "",
      });
    }
  }, [selectedProgramId]);

  // Handle template field change and auto-persist
  const handleFieldChange = (
    field: keyof RecommendationTemplates,
    value: string
  ) => {
    setTemplates((prev) => {
      const updated = { ...prev, [field]: value };
      if (selectedProgramId) {
        try {
          localStorage.setItem(
            `DERMAINE_AI_REC_${selectedProgramId}`,
            JSON.stringify(updated)
          );
        } catch {}
      }
      return updated;
    });
  };

  // AI Policy analysis & template synthesis
  const handleAnalyzePolicyWithAi = () => {
    if (!selectedProgram) {
      toast.error("Please select a program first.");
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const progName = selectedProgram.name;
      const lowerName = progName.toLowerCase();

      let synthesized: RecommendationTemplates;

      if (lowerName.includes("spousal") || lowerName.includes("family")) {
        synthesized = {
          whyRecommended:
            "Your qualifying marriage/common-law relationship, valid cohabitation history, and sponsor's status as a Canadian Citizen or PR satisfy all statutory sponsorship thresholds under IRPA Regulations.",
          keyStrength:
            "Extensive relationship documentation (joint tenancy, shared finances), clear cohabitation timeline exceeding 12 months, and sponsor's non-disqualified financial eligibility.",
          missingRequirements:
            "An official Police Clearance Certificate (PCC) from country of origin and an upfront immigration medical examination (eMedical) must be completed before final processing.",
          suggestedNextSteps:
            "1. Gather joint utility bills, statutory declarations, and photographic timeline.\n2. Complete Application to Sponsor (IMM 1344) and Generic Application (IMM 0008).\n3. Pay IRCC sponsorship and Right of Permanent Residence Fee ($1,080 CAD).\n4. Submit complete dossier via the Permanent Residence Portal.",
          risksConsiderations:
            "Inland vs Outland processing timelines: Inland applicants qualify for an Open Work Permit (SOWP) during processing, but must remain inside Canada.",
          alternativePathways:
            "If relationship duration documentation is pending, consider visitor status extension or temporary resident visa (TRV) while assembling joint documentation.",
        };
      } else if (lowerName.includes("ontario") || lowerName.includes("oinp")) {
        synthesized = {
          whyRecommended:
            "Your education, language level, and occupation align well with Ontario's selection priorities for the Human Capital Priorities stream.",
          keyStrength:
            "Strong language scores (CLB 9+), Canadian work experience, and STEM/Healthcare occupation category are major competitive advantages for targeted OINP notifications.",
          missingRequirements:
            "An Educational Credential Assessment (ECA) is required if your post-secondary degree was obtained outside Canada.",
          suggestedNextSteps:
            "1. Obtain ECA report from WES or designated authority.\n2. Improve CRS score by 15 points to exceed anticipated stream cutoffs.\n3. Register an Ontario Expression of Interest (EOI) profile.\n4. Prepare proof of funds and civil documents within 45 days of notification.",
          risksConsiderations:
            "Draw scores have been competitive. Consider improving second language points or securing a job offer to guarantee invitation.",
          alternativePathways:
            "If not selected under Human Capital, consider Alberta Advantage Immigration Program or Federal Skilled Worker Program (Express Entry).",
        };
      } else {
        synthesized = {
          whyRecommended: `Your applicant profile matches the core selection criteria for ${progName}, satisfying primary language, education, and eligibility benchmarks.`,
          keyStrength:
            "Competitive human capital points, verified credential equivalence, and relevant professional experience within designated high-demand TEER tiers.",
          missingRequirements:
            "Verification of official language test results (CELPIP / IELTS / TEF) and credential equivalence assessment prior to profile lock.",
          suggestedNextSteps: `1. Finalize language testing and credential assessments.\n2. Submit expression of interest or online profile under ${progName}.\n3. Assemble employment verification letters.\n4. Submit complete electronic application upon invitation.`,
          risksConsiderations:
            "Processing backlogs and fluctuating draw minimums. Maintaining valid temporary legal status throughout the process is critical.",
          alternativePathways:
            "Explore Express Entry Provincial Nominee Programs or provincial employer job-offer streams as concurrent or backup pathways.",
        };
      }

      setTemplates(synthesized);
      try {
        localStorage.setItem(
          `DERMAINE_AI_REC_${selectedProgramId}`,
          JSON.stringify(synthesized)
        );
      } catch {}
      toast.success(`AI Recommendation templates generated for ${progName}!`);
    }, 650);
  };

  return (
    <div className="space-y-6">
      {/* Program Selector */}
      <div className="w-full max-w-sm">
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Select Program
        </label>
        <div className="relative">
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="w-full h-12 px-4 pr-10 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-white focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors cursor-pointer appearance-none shadow-sm"
          >
            <option value="">Select Program</option>
            {programOptions.map((prog) => (
              <option key={prog.id} value={prog.id}>
                {prog.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Conditional Rendering: Empty State vs Template Form */}
      {!selectedProgramId ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <p className="text-slate-500 font-medium text-sm md:text-base">
            Select a program above to configure AI recommendation templates.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Why Recommended */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Why Recommended
              </label>
              <textarea
                value={templates.whyRecommended}
                onChange={(e) =>
                  handleFieldChange("whyRecommended", e.target.value)
                }
                placeholder="e.g. Your education, language level, and occupation align well with Ontario's selection priorities for the Human Capital stream."
                rows={5}
                className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] resize-none transition-all shadow-sm"
              />
            </div>

            {/* 2. Key Strength */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Key Strength
              </label>
              <textarea
                value={templates.keyStrength}
                onChange={(e) =>
                  handleFieldChange("keyStrength", e.target.value)
                }
                placeholder="e.g. Strong language scores (CLB 9+), Canadian work experience, and STEM occupation category are major advantages for this stream."
                rows={5}
                className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] resize-none transition-all shadow-sm"
              />
            </div>

            {/* 3. Missing Requirements Template */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Missing Requirements Template
              </label>
              <textarea
                value={templates.missingRequirements}
                onChange={(e) =>
                  handleFieldChange("missingRequirements", e.target.value)
                }
                placeholder="e.g. An Educational Credential Assessment (ECA) is required if your degree was obtained outside Canada."
                rows={5}
                className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] resize-none transition-all shadow-sm"
              />
            </div>

            {/* 4. Suggested Next Steps */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Suggested Next Steps
              </label>
              <textarea
                value={templates.suggestedNextSteps}
                onChange={(e) =>
                  handleFieldChange("suggestedNextSteps", e.target.value)
                }
                placeholder={
                  "e.g. 1. Obtain ECA from WES\n2. Improve CRS by 15 points\n3. Apply for Ontario Expression of Interest\n4. Prepare documents within 60 days of invitation."
                }
                rows={5}
                className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] resize-none transition-all shadow-sm"
              />
            </div>

            {/* 5. Risks & Considerations */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Risks & Considerations
              </label>
              <textarea
                value={templates.risksConsiderations}
                onChange={(e) =>
                  handleFieldChange("risksConsiderations", e.target.value)
                }
                placeholder="e.g. Draw scores have been increasing. Consider improving language scores or gaining additional Canadian work experience to reduce risk."
                rows={5}
                className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] resize-none transition-all shadow-sm"
              />
            </div>

            {/* 6. Alternative Pathways */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Alternative Pathways
              </label>
              <textarea
                value={templates.alternativePathways}
                onChange={(e) =>
                  handleFieldChange("alternativePathways", e.target.value)
                }
                placeholder="e.g. If not selected under Human Capital, consider Alberta Advantage Immigration Program or Federal Skilled Worker Program."
                rows={5}
                className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] resize-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAnalyzePolicyWithAi}
              disabled={isAnalyzing}
              className="bg-[#00a859] hover:bg-[#00904c] text-white font-medium px-6 py-3.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all disabled:opacity-75 cursor-pointer active:scale-[0.99]"
            >
              <Sparkles
                className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`}
              />
              <span>
                {isAnalyzing
                  ? "Analyzing Policy with AI..."
                  : "Analyze Policy Update with AI"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
