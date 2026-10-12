"use client";

import { useState, useMemo } from "react";
import { Calculator, Sparkles, CheckCircle2, RotateCcw, Award } from "lucide-react";

export default function CRSCalculator() {
  const [hasSpouse, setHasSpouse] = useState(false);
  const [age, setAge] = useState<number>(28);
  const [education, setEducation] = useState<string>("bachelor");
  const [languageClb, setLanguageClb] = useState<number>(9);
  const [secondLangClb, setSecondLangClb] = useState<number>(0);
  const [canadianWorkYears, setCanadianWorkYears] = useState<number>(1);
  const [foreignWorkYears, setForeignWorkYears] = useState<number>(3);
  const [hasPnp, setHasPnp] = useState(false);
  const [jobOfferType, setJobOfferType] = useState<"none" | "teer0123" | "noc00">("none");
  const [canadianStudy, setCanadianStudy] = useState<"none" | "1-2year" | "3plus">("none");
  const [hasSibling, setHasSibling] = useState(false);
  const [hasFrenchBonus, setHasFrenchBonus] = useState(false);

  // Calculations
  const agePoints = useMemo(() => {
    if (age <= 17 || age >= 45) return 0;
    if (age >= 20 && age <= 29) return hasSpouse ? 100 : 110;
    if (age === 18) return hasSpouse ? 90 : 99;
    if (age === 19) return hasSpouse ? 95 : 105;
    if (age === 30) return hasSpouse ? 95 : 105;
    if (age === 31) return hasSpouse ? 90 : 99;
    if (age === 32) return hasSpouse ? 85 : 94;
    if (age === 33) return hasSpouse ? 80 : 88;
    if (age === 34) return hasSpouse ? 75 : 83;
    if (age === 35) return hasSpouse ? 70 : 77;
    if (age === 36) return hasSpouse ? 65 : 72;
    if (age === 37) return hasSpouse ? 60 : 66;
    if (age === 38) return hasSpouse ? 55 : 61;
    if (age === 39) return hasSpouse ? 50 : 55;
    if (age === 40) return hasSpouse ? 45 : 50;
    if (age === 41) return hasSpouse ? 35 : 39;
    if (age === 42) return hasSpouse ? 25 : 28;
    if (age === 43) return hasSpouse ? 15 : 17;
    if (age === 44) return hasSpouse ? 5 : 6;
    return 0;
  }, [age, hasSpouse]);

  const educationPoints = useMemo(() => {
    const mapWithout: Record<string, number> = {
      secondary: 30,
      "1year": 90,
      "2year": 98,
      bachelor: 120,
      two_or_more: 128,
      master: 135,
      phd: 150,
    };
    const mapWith: Record<string, number> = {
      secondary: 28,
      "1year": 84,
      "2year": 91,
      bachelor: 112,
      two_or_more: 119,
      master: 126,
      phd: 140,
    };
    return (hasSpouse ? mapWith[education] : mapWithout[education]) || 0;
  }, [education, hasSpouse]);

  const languagePoints = useMemo(() => {
    let perAbility = 0;
    if (languageClb >= 10) perAbility = hasSpouse ? 32 : 34;
    else if (languageClb === 9) perAbility = hasSpouse ? 29 : 31;
    else if (languageClb === 8) perAbility = hasSpouse ? 22 : 23;
    else if (languageClb === 7) perAbility = hasSpouse ? 16 : 17;
    else if (languageClb === 6) perAbility = hasSpouse ? 8 : 9;
    else if (languageClb >= 4) perAbility = 6;
    return perAbility * 4;
  }, [languageClb, hasSpouse]);

  const canadianWorkPoints = useMemo(() => {
    if (canadianWorkYears === 0) return 0;
    if (canadianWorkYears === 1) return hasSpouse ? 35 : 40;
    if (canadianWorkYears === 2) return hasSpouse ? 46 : 53;
    if (canadianWorkYears === 3) return hasSpouse ? 56 : 64;
    if (canadianWorkYears === 4) return hasSpouse ? 63 : 72;
    return hasSpouse ? 70 : 80;
  }, [canadianWorkYears, hasSpouse]);

  const coreTotal = Math.min(hasSpouse ? 460 : 500, agePoints + educationPoints + languagePoints + canadianWorkPoints);

  // Transferability
  const transferabilityPoints = useMemo(() => {
    let eduLang = 0;
    if (["bachelor", "two_or_more", "master", "phd"].includes(education)) {
      if (languageClb >= 9) eduLang = 50;
      else if (languageClb >= 7) eduLang = 25;
    }
    let eduCan = 0;
    if (["bachelor", "two_or_more", "master", "phd"].includes(education)) {
      if (canadianWorkYears >= 2) eduCan = 50;
      else if (canadianWorkYears === 1) eduCan = 25;
    }
    let forLang = 0;
    if (foreignWorkYears >= 3) {
      if (languageClb >= 9) forLang = 50;
      else if (languageClb >= 7) forLang = 25;
    } else if (foreignWorkYears >= 1) {
      if (languageClb >= 9) forLang = 25;
      else if (languageClb >= 7) forLang = 13;
    }
    return Math.min(100, eduLang + eduCan + forLang);
  }, [education, languageClb, canadianWorkYears, foreignWorkYears]);

  // Additional points
  const additionalPoints = useMemo(() => {
    let pts = 0;
    if (hasPnp) pts += 600;
    if (jobOfferType === "noc00") pts += 200;
    else if (jobOfferType === "teer0123") pts += 50;
    if (canadianStudy === "3plus") pts += 30;
    else if (canadianStudy === "1-2year") pts += 15;
    if (hasSibling) pts += 15;
    if (hasFrenchBonus) pts += 50;
    return Math.min(600, pts);
  }, [hasPnp, jobOfferType, canadianStudy, hasSibling, hasFrenchBonus]);

  const totalCrs = coreTotal + transferabilityPoints + additionalPoints;

  const handleReset = () => {
    setHasSpouse(false);
    setAge(28);
    setEducation("bachelor");
    setLanguageClb(9);
    setSecondLangClb(0);
    setCanadianWorkYears(1);
    setForeignWorkYears(3);
    setHasPnp(false);
    setJobOfferType("none");
    setCanadianStudy("none");
    setHasSibling(false);
    setHasFrenchBonus(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-title mb-1">
            Interactive CRS Points Calculator
          </h2>
          <p className="text-sm text-description">
            Simulate CRS candidate profiles and verify score calculations in real-time under current IRCC draw parameters.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 bg-white text-sm font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset Calculator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Marital & Age */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-title text-base">Candidate Profile & Age</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-description uppercase tracking-wider mb-2">
                  Marital Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasSpouse(false)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${
                      !hasSpouse ? "bg-primary text-white border-primary" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Single (No Spouse)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasSpouse(true)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${
                      hasSpouse ? "bg-primary text-white border-primary" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    With Spouse
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-description uppercase tracking-wider mb-2">
                  Age ({age} years old)
                </label>
                <input
                  type="range"
                  min="17"
                  max="50"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>18 yrs</span>
                  <span>29 yrs (Max)</span>
                  <span>45+ yrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Education & Language */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-title text-base">Education & Official Languages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-description uppercase tracking-wider mb-2">
                  Level of Education
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm text-title focus:outline-none focus:border-primary bg-white"
                >
                  <option value="secondary">Secondary (High School)</option>
                  <option value="1year">One-Year Program / Certificate</option>
                  <option value="2year">Two-Year Program / Diploma</option>
                  <option value="bachelor">Bachelor&apos;s Degree (3+ years)</option>
                  <option value="two_or_more">Two or More Degrees/Diplomas</option>
                  <option value="master">Master&apos;s / Professional Degree</option>
                  <option value="phd">Doctoral / Ph.D.</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-description uppercase tracking-wider mb-2">
                  1st Language Benchmark (CLB)
                </label>
                <select
                  value={languageClb}
                  onChange={(e) => setLanguageClb(Number(e.target.value))}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm text-title focus:outline-none focus:border-primary bg-white"
                >
                  <option value="10">CLB 10 or higher (Maximum pts)</option>
                  <option value="9">CLB 9 (IELTS 8.0L, 7.0R, 7.0W, 7.0S)</option>
                  <option value="8">CLB 8</option>
                  <option value="7">CLB 7 (Minimum skilled threshold)</option>
                  <option value="6">CLB 6</option>
                  <option value="5">CLB 5</option>
                  <option value="4">CLB 4 or below</option>
                </select>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-title text-base">Work Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-description uppercase tracking-wider mb-2">
                  Canadian Skilled Work Experience
                </label>
                <select
                  value={canadianWorkYears}
                  onChange={(e) => setCanadianWorkYears(Number(e.target.value))}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm text-title focus:outline-none focus:border-primary bg-white"
                >
                  <option value="0">None / Less than 1 year</option>
                  <option value="1">1 year of Canadian experience</option>
                  <option value="2">2 years of Canadian experience</option>
                  <option value="3">3 years of Canadian experience</option>
                  <option value="4">4 years of Canadian experience</option>
                  <option value="5">5 or more years (Max pts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-description uppercase tracking-wider mb-2">
                  Foreign Skilled Work Experience
                </label>
                <select
                  value={foreignWorkYears}
                  onChange={(e) => setForeignWorkYears(Number(e.target.value))}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm text-title focus:outline-none focus:border-primary bg-white"
                >
                  <option value="0">None</option>
                  <option value="1">1 to 2 years</option>
                  <option value="3">3 or more years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Bonus Factors */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-title text-base">Additional Factors (Section D)</h3>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPnp}
                  onChange={(e) => setHasPnp(e.target.checked)}
                  className="w-4 h-4 rounded text-primary accent-primary"
                />
                <span className="text-sm font-medium text-title">
                  Provincial or Territorial Nomination Certificate (+600 points)
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFrenchBonus}
                  onChange={(e) => setHasFrenchBonus(e.target.checked)}
                  className="w-4 h-4 rounded text-primary accent-primary"
                />
                <span className="text-sm font-medium text-title">
                  French Language Skills Bonus (NCLC 7+ in all 4 French abilities, +50 points)
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSibling}
                  onChange={(e) => setHasSibling(e.target.checked)}
                  className="w-4 h-4 rounded text-primary accent-primary"
                />
                <span className="text-sm font-medium text-title">
                  Brother or Sister living in Canada as Citizen or PR (+15 points)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Calculation Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border-2 border-primary/20 rounded-2xl p-6 shadow-md sticky top-6">
            <div className="text-center pb-6 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                Estimated CRS Total Score
              </span>
              <div className="text-5xl font-black text-primary my-2">
                {totalCrs}
              </div>
              <span className="text-xs font-semibold text-slate-500">out of 1,200 points</span>

              {/* Progress gauge */}
              <div className="w-full bg-slate-100 h-3 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalCrs / 1200) * 100)}%` }}
                />
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 py-4 border-b border-slate-100 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">A. Core / Human Capital:</span>
                <span className="font-bold text-title">{coreTotal} / {hasSpouse ? 460 : 500}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 pl-3">
                <span>• Age</span>
                <span>{agePoints} pts</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 pl-3">
                <span>• Education</span>
                <span>{educationPoints} pts</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 pl-3">
                <span>• 1st Language (CLB {languageClb})</span>
                <span>{languagePoints} pts</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 pl-3">
                <span>• Canadian Work ({canadianWorkYears} yr)</span>
                <span>{canadianWorkPoints} pts</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-600">C. Skill Transferability:</span>
                <span className="font-bold text-title">{transferabilityPoints} / 100</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">D. Additional Points:</span>
                <span className="font-bold text-emerald-600">+{additionalPoints} / 600</span>
              </div>
            </div>

            {/* Verdict */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-primary" /> Express Entry Draw Analysis
              </span>
              <p className="text-xs text-slate-600">
                {totalCrs >= 500 ? (
                  <span className="text-emerald-700 font-semibold">
                    Highly competitive score for General all-program Express Entry draws.
                  </span>
                ) : totalCrs >= 440 ? (
                  <span className="text-blue-700 font-semibold">
                    Competitive for Category-Based Selection draws (STEM, French, Healthcare, Trades).
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    Recommend pursuing a Provincial Nomination (PNP) or French language enhancement for +600 points boost.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
