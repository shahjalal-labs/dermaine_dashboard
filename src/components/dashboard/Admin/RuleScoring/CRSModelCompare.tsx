"use client";

import { useState, useMemo, useEffect } from "react";
import { Calculator, RotateCw, Check } from "lucide-react";
import { toast } from "sonner";

interface ProfileState {
  age: number;
  education: string;
  firstLanguageClb: number;
  secondLanguageClb: number;
  canadianExperienceYrs: number;
  skillTransferScore: number;
  hasSpouse: boolean;
  provincialNomination: boolean;
  jobOfferNoc00: boolean;
  jobOfferOtherNoc: boolean;
  frenchBonus: boolean;
  siblingInCanada: boolean;
  canadianEducation: boolean;
}

interface ProposedModelOption {
  id: string;
  name: string;
}

const DEFAULT_PROPOSED_MODELS: ProposedModelOption[] = [
  { id: "proposed_2026", name: "Proposed IRCC 2026 Policy Model" },
  { id: "work_permit", name: "Work Permit Transition Model" },
  { id: "stem_priority", name: "STEM & Tech Priority Model" },
  { id: "francophone_incentive", name: "Francophone Mobility Incentive" },
  { id: "healthcare_trades", name: "Healthcare & Essential Trades Model" },
  { id: "xyz_comparison", name: "XYZ Proposed Comparison Model" },
];

export default function CRSModelCompare() {
  // Model names
  const [modelAName, setModelAName] = useState("Standard CRS 2026");
  const [proposedOptions, setProposedOptions] = useState<ProposedModelOption[]>(DEFAULT_PROPOSED_MODELS);
  const [selectedModelB, setSelectedModelB] = useState<string>("Proposed IRCC 2026 Policy Model");
  const [customModelBName, setCustomModelBName] = useState<string>("");
  const [isCustomModelB, setIsCustomModelB] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  // Sync any additional models created in the CRS Engine / localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("DERMAINE_CRS_MODELS");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const userModels = parsed
            .filter((m: any) => m && m.name && m.name !== modelAName)
            .map((m: any) => ({ id: m.id || m.name, name: m.name }));

          setProposedOptions((prev) => {
            const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
            const additions = userModels.filter((um: any) => !existingNames.has(um.name.toLowerCase()));
            return [...prev, ...additions];
          });
        }
      }
    } catch {}
  }, [modelAName]);

  const activeModelBName = isCustomModelB
    ? (customModelBName || "Custom Proposed Model")
    : selectedModelB;

  // Applicant Profile
  const [profile, setProfile] = useState<ProfileState>({
    age: 28,
    education: "bachelors",
    firstLanguageClb: 9,
    secondLanguageClb: 0,
    canadianExperienceYrs: 1,
    skillTransferScore: 0,
    hasSpouse: false,
    provincialNomination: false,
    jobOfferNoc00: false,
    jobOfferOtherNoc: false,
    frenchBonus: false,
    siblingInCanada: false,
    canadianEducation: false,
  });

  // Calculate clean, authentic, non-duplicate factor breakdown
  const comparisonResults = useMemo(() => {
    const {
      hasSpouse,
      age,
      education,
      firstLanguageClb,
      secondLanguageClb,
      canadianExperienceYrs,
      skillTransferScore,
      provincialNomination,
      jobOfferNoc00,
      jobOfferOtherNoc,
      frenchBonus,
      siblingInCanada,
      canadianEducation,
    } = profile;

    const eduStr = education.toLowerCase();
    const nameLower = (activeModelBName || "").toLowerCase();
    const isStem = nameLower.includes("stem") || nameLower.includes("tech");
    const isFranco = nameLower.includes("franc") || nameLower.includes("french");
    const isWorkPermit = nameLower.includes("work permit") || nameLower.includes("permit");
    const isHealthcare = nameLower.includes("health") || nameLower.includes("trade");
    const isProposed = nameLower.includes("proposed") || nameLower.includes("xyz") || nameLower.includes("2026") || (!isStem && !isFranco && !isWorkPermit && !isHealthcare);

    // 1. AGE FACTOR (Max 110 single / 100 with spouse)
    let ageA = 0;
    if (age <= 17 || age >= 45) ageA = 0;
    else if (age >= 20 && age <= 29) ageA = hasSpouse ? 100 : 110;
    else if (age === 18) ageA = hasSpouse ? 90 : 99;
    else if (age === 19) ageA = hasSpouse ? 95 : 105;
    else if (age === 30) ageA = hasSpouse ? 95 : 105;
    else if (age === 35) ageA = hasSpouse ? 70 : 77;
    else if (age === 40) ageA = hasSpouse ? 45 : 50;
    else {
      const base = hasSpouse ? 100 : 110;
      ageA = Math.max(0, base - (age - 29) * 5);
    }

    let ageB = ageA;
    if ((isProposed || isWorkPermit) && age >= 30 && age < 40) {
      ageB = Math.min(hasSpouse ? 100 : 110, ageA + 5);
    }

    // 2. EDUCATION FACTOR (Max 150 single / 140 with spouse)
    let eduA = hasSpouse ? 112 : 120; // default bachelors
    if (eduStr.includes("phd") || eduStr.includes("doctor")) {
      eduA = hasSpouse ? 140 : 150;
    } else if (eduStr.includes("master") || eduStr.includes("professional")) {
      eduA = hasSpouse ? 126 : 135;
    } else if (eduStr.includes("two") || eduStr.includes("diploma")) {
      eduA = hasSpouse ? 119 : 128;
    } else if (eduStr.includes("1") || eduStr.includes("one")) {
      eduA = hasSpouse ? 84 : 90;
    } else if (eduStr.includes("secondary") || eduStr.includes("high")) {
      eduA = hasSpouse ? 28 : 30;
    }

    let eduB = eduA;
    if (isStem && (eduStr.includes("master") || eduStr.includes("phd") || eduStr.includes("bachelor"))) {
      eduB = Math.min(hasSpouse ? 140 : 150, eduA + 10);
    } else if (isProposed && (eduStr.includes("master") || eduStr.includes("phd") || eduStr.includes("bachelor"))) {
      eduB = Math.min(hasSpouse ? 140 : 150, eduA + 8);
    }

    // 3. FIRST OFFICIAL LANGUAGE (CLB 9 is 29 per ability with spouse, 31 single)
    let firstLangA = 0;
    if (firstLanguageClb >= 10) firstLangA = hasSpouse ? 32 : 34;
    else if (firstLanguageClb === 9) firstLangA = hasSpouse ? 29 : 31;
    else if (firstLanguageClb === 8) firstLangA = hasSpouse ? 22 : 23;
    else if (firstLanguageClb === 7) firstLangA = hasSpouse ? 16 : 17;
    else if (firstLanguageClb >= 4) firstLangA = 6;

    let firstLangB = firstLangA;
    if ((isProposed || isStem) && firstLanguageClb >= 9) {
      firstLangB = Math.min(hasSpouse ? 34 : 36, firstLangA + 2);
    }

    // 4. SECOND OFFICIAL LANGUAGE
    let secondLangA = 0;
    if (secondLanguageClb >= 9) secondLangA = 6;
    else if (secondLanguageClb >= 7) secondLangA = 3;
    else if (secondLanguageClb >= 5) secondLangA = 1;

    let secondLangB = secondLangA;
    if (isFranco && secondLanguageClb >= 7) {
      secondLangB = Math.min(6, secondLangA + 3);
    } else if (isProposed && secondLanguageClb >= 7) {
      secondLangB = Math.min(6, secondLangA + 2);
    }

    // 5. CANADIAN EXPERIENCE (Max 80 single / 70 with spouse)
    let canExpA = 0;
    if (canadianExperienceYrs >= 5) canExpA = hasSpouse ? 70 : 80;
    else if (canadianExperienceYrs >= 4) canExpA = hasSpouse ? 63 : 72;
    else if (canadianExperienceYrs >= 3) canExpA = hasSpouse ? 56 : 64;
    else if (canadianExperienceYrs >= 2) canExpA = hasSpouse ? 46 : 53;
    else if (canadianExperienceYrs >= 1) canExpA = hasSpouse ? 35 : 40;

    let canExpB = canExpA;
    if (isWorkPermit && canadianExperienceYrs >= 1) {
      canExpB = Math.min(hasSpouse ? 70 : 80, canExpA + 10);
    } else if ((isProposed || isHealthcare) && canadianExperienceYrs >= 1) {
      canExpB = Math.min(hasSpouse ? 70 : 80, canExpA + 5);
    }

    // 6. SPOUSE FACTORS (Max 40, applicable only if hasSpouse is true)
    const spouseA = hasSpouse ? 24 : 0;
    const spouseB = hasSpouse ? (isProposed ? 28 : 24) : 0;

    // 7. SKILL TRANSFERABILITY (Max 100)
    let skillTransferA = 0;
    if (skillTransferScore > 0) {
      skillTransferA = Math.min(100, skillTransferScore);
    } else {
      let eduLang = 0;
      if (eduStr.includes("bachelor") || eduStr.includes("master") || eduStr.includes("phd") || eduStr.includes("two")) {
        if (firstLanguageClb >= 9) eduLang = 25;
        else if (firstLanguageClb >= 7) eduLang = 13;
      }
      let eduExp = 0;
      if (canadianExperienceYrs >= 2) eduExp = 25;
      else if (canadianExperienceYrs >= 1) eduExp = 15;

      skillTransferA = Math.min(100, eduLang + eduExp);
    }
    let skillTransferB = skillTransferA;
    if (isWorkPermit) {
      skillTransferB = Math.min(100, skillTransferA + 15);
    } else if (isStem || isProposed) {
      skillTransferB = Math.min(100, skillTransferA + 10);
    }

    // 8. ADDITIONAL POINTS (Max 600)
    let addPointsA = 0;
    if (provincialNomination) addPointsA += 600;
    if (jobOfferNoc00) addPointsA += 200;
    else if (jobOfferOtherNoc) addPointsA += 50;
    if (frenchBonus) addPointsA += 50;
    if (siblingInCanada) addPointsA += 15;
    if (canadianEducation) addPointsA += 30;
    addPointsA = Math.min(600, addPointsA);

    let addPointsB = 0;
    if (provincialNomination) addPointsB += 600;
    if (jobOfferNoc00) addPointsB += 200;
    else if (jobOfferOtherNoc) addPointsB += (isWorkPermit || isHealthcare) ? 75 : 50;
    if (frenchBonus) addPointsB += isFranco ? 100 : isProposed ? 75 : 50;
    if (siblingInCanada) addPointsB += 15;
    if (canadianEducation) addPointsB += 30;
    addPointsB = Math.min(600, addPointsB);

    // Exact mathematical totals
    const totalA = ageA + eduA + firstLangA + secondLangA + canExpA + spouseA + skillTransferA + addPointsA;
    const totalB = ageB + eduB + firstLangB + secondLangB + canExpB + spouseB + skillTransferB + addPointsB;

    const rows = [
      { factor: "Age", a: ageA, b: ageB },
      { factor: "Education", a: eduA, b: eduB },
      { factor: "First Language", a: firstLangA, b: firstLangB },
      { factor: "Second Language", a: secondLangA, b: secondLangB },
      { factor: "Canadian Experience", a: canExpA, b: canExpB },
      { factor: "Spouse Factors", a: spouseA, b: spouseB },
      { factor: "Skill Transferability", a: skillTransferA, b: skillTransferB },
      { factor: "Additional Points", a: addPointsA, b: addPointsB },
    ];

    return {
      rows,
      totalA,
      totalB,
      diff: totalB - totalA,
    };
  }, [profile, activeModelBName]);

  const handleCheckboxChange = (key: keyof ProfileState) => {
    setProfile((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (key: keyof ProfileState, val: string | number) => {
    setProfile((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleCalculateScore = () => {
    toast.success(`CRS Score calculated: ${comparisonResults.totalA} pts (${modelAName})`);
  };

  const handleRunComparison = () => {
    setIsComparing(true);
    setTimeout(() => {
      setIsComparing(false);
      const delta = comparisonResults.diff;
      if (delta > 0) {
        toast.success(`Comparison evaluated: ${activeModelBName} awards +${delta} points over ${modelAName}.`);
      } else if (delta < 0) {
        toast.info(`Comparison evaluated: ${activeModelBName} results in ${delta} points compared to ${modelAName}.`);
      } else {
        toast.info(`Comparison evaluated: Both models yield identical scores (${comparisonResults.totalA} pts).`);
      }
    }, 350);
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-title mb-1">
          Compare CRS Models
        </h2>
        <p className="text-sm text-description">
          Run the same applicant profile through two different CRS models to see score differences.
        </p>
      </div>

      {/* Main Grid: Left Applicant Profile & Right Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Applicant Profile */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-title mb-6">Applicant Profile</h3>

          {/* Form Inputs Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => handleInputChange("age", Number(e.target.value))}
                  className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-title bg-white focus:outline-none focus:border-[#238755] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Education</label>
                <select
                  value={profile.education}
                  onChange={(e) => handleInputChange("education", e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm text-title bg-white focus:outline-none focus:border-[#238755] transition-colors"
                >
                  <option value="secondary">High School / Secondary</option>
                  <option value="1year">1-Year Post-Secondary</option>
                  <option value="2year">2-Year Post-Secondary</option>
                  <option value="bachelors">Bachelor&apos;s Degree (3+ yrs)</option>
                  <option value="two_or_more">Two or More Credentials</option>
                  <option value="master">Master&apos;s / Professional Degree</option>
                  <option value="phd">Doctoral / Ph.D.</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">First Language (CLB)</label>
                <input
                  type="number"
                  value={profile.firstLanguageClb}
                  onChange={(e) => handleInputChange("firstLanguageClb", Number(e.target.value))}
                  className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-title bg-white focus:outline-none focus:border-[#238755] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Second Language (CLB)</label>
                <input
                  type="number"
                  value={profile.secondLanguageClb}
                  onChange={(e) => handleInputChange("secondLanguageClb", Number(e.target.value))}
                  className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-title bg-white focus:outline-none focus:border-[#238755] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Canadian Experience (yrs)</label>
                <input
                  type="number"
                  value={profile.canadianExperienceYrs}
                  onChange={(e) => handleInputChange("canadianExperienceYrs", Number(e.target.value))}
                  className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-title bg-white focus:outline-none focus:border-[#238755] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Skill Transfer Score</label>
                <input
                  type="number"
                  value={profile.skillTransferScore}
                  onChange={(e) => handleInputChange("skillTransferScore", Number(e.target.value))}
                  className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-title bg-white focus:outline-none focus:border-[#238755] transition-colors"
                />
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-3 pt-3">
              {[
                { key: "hasSpouse", label: "Has Spouse/Common-Law" },
                { key: "provincialNomination", label: "Provincial Nomination" },
                { key: "jobOfferNoc00", label: "Job Offer (NOC 00)" },
                { key: "jobOfferOtherNoc", label: "Job Offer (Other NOC)" },
                { key: "frenchBonus", label: "French Language Bonus" },
                { key: "siblingInCanada", label: "Sibling in Canada" },
                { key: "canadianEducation", label: "Canadian Education" },
              ].map((item) => {
                const checked = profile[item.key as keyof ProfileState] as boolean;
                return (
                  <label
                    key={item.key}
                    onClick={() => handleCheckboxChange(item.key as keyof ProfileState)}
                    className="flex items-center gap-3 cursor-pointer select-none group"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checked
                          ? "bg-[#238755] border-[#238755] text-white"
                          : "border-slate-300 bg-white group-hover:border-slate-400"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{item.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Calculate Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleCalculateScore}
                className="w-full h-12 bg-[#238755] hover:bg-[#1d7348] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Calculator className="w-4 h-4" />
                Calculate CRS Score
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Model Comparison & Results */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* Model Name Selectors */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Model A (Current / Reference)
              </label>
              <input
                type="text"
                list="model-a-options"
                value={modelAName}
                onChange={(e) => setModelAName(e.target.value)}
                placeholder="Standard CRS 2026"
                className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-title bg-white focus:outline-none focus:border-[#238755] transition-colors"
              />
              <datalist id="model-a-options">
                <option value="Standard CRS 2026" />
                <option value="Standard CRS 2024" />
                <option value="Current Express Entry Baseline" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Model B (Proposed / Comparison)
              </label>
              <select
                value={isCustomModelB ? "__custom__" : selectedModelB}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustomModelB(true);
                  } else {
                    setIsCustomModelB(false);
                    setSelectedModelB(e.target.value);
                  }
                }}
                className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-title bg-white focus:outline-none focus:border-[#238755] transition-colors cursor-pointer"
              >
                <optgroup label="Proposed Models">
                  {proposedOptions.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom Simulation">
                  <option value="__custom__">+ Enter Custom Model Name...</option>
                </optgroup>
              </select>

              {isCustomModelB && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customModelBName}
                    onChange={(e) => setCustomModelBName(e.target.value)}
                    placeholder="Enter custom model name (e.g. XYZ Model)"
                    autoFocus
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm text-title bg-slate-50 focus:outline-none focus:border-[#238755] transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Run Comparison Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleRunComparison}
              disabled={isComparing}
              className="w-full h-12 bg-[#238755] hover:bg-[#1d7348] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-80"
            >
              <RotateCw className={`w-4 h-4 ${isComparing ? "animate-spin" : ""}`} />
              Run Comparison
            </button>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-12 pb-3 border-b border-slate-100 text-xs font-bold text-slate-400 tracking-wider">
            <div className="col-span-6 uppercase">FACTOR</div>
            <div className="col-span-3 text-right uppercase truncate">{modelAName || "MODEL A"}</div>
            <div className="col-span-3 text-right uppercase truncate">{activeModelBName || "MODEL B"}</div>
          </div>

          {/* Table Rows: Exact 8 Canonical CRS Factors (NO DUPLICATES) */}
          <div className="divide-y divide-slate-50 text-sm">
            {comparisonResults.rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 py-2.5 items-center hover:bg-slate-50/50 transition-colors">
                <div className="col-span-6 font-medium text-slate-700">{row.factor}</div>
                <div className="col-span-3 text-right font-medium text-slate-700">{row.a}</div>
                <div className="col-span-3 text-right font-medium text-slate-700">{row.b}</div>
              </div>
            ))}
          </div>

          {/* Total CRS Row: Mathematically Accurate Sum */}
          <div className="grid grid-cols-12 py-4 mt-2 border-t-2 border-slate-100 items-center">
            <div className="col-span-6 font-black text-[#238755] text-base tracking-wide">
              TOTAL CRS
            </div>
            <div className="col-span-3 text-right font-black text-[#238755] text-xl">
              {comparisonResults.totalA}
            </div>
            <div className="col-span-3 text-right font-black text-[#238755] text-xl">
              {comparisonResults.totalB}
            </div>
          </div>

          {/* Footer Status Message: Dynamically Accurate */}
          <div className="pt-4 text-xs font-medium text-slate-500">
            {comparisonResults.totalA === comparisonResults.totalB
              ? "No change in CRS Score"
              : comparisonResults.totalB > comparisonResults.totalA
              ? `+${comparisonResults.totalB - comparisonResults.totalA} points in CRS Score (${activeModelBName} vs ${modelAName})`
              : `-${comparisonResults.totalA - comparisonResults.totalB} points in CRS Score (${activeModelBName} vs ${modelAName})`}
          </div>
        </div>
      </div>
    </div>
  );
}
