"use client";

import { useAllAssessmentsQuery } from "@/redux/api/adminApi";
import {
  useCreateProgramMutation,
  useGetAllProgramQuery,
  useUpdateProgramMutation,
} from "@/redux/api/programApi";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ClipboardPaste,
  Globe,
  Loader2,
  Megaphone,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FaFileWord } from "react-icons/fa";
import { FaRegFileLines } from "react-icons/fa6";
import { VscFilePdf } from "react-icons/vsc";
import { toast } from "sonner";

interface AiProgramCenterProps {
  onNavigateToLibrary?: () => void;
}

interface ExtractedProgramData {
  name: string;
  streamName: string;
  province: string;
  category: string;
  status: string;
  priority: string;
  targetingType: string;
  nocCodes: string;
  teerCategory: string;
  crsThreshold: string;
  languageRequirement: string;
  educationRequirement: string;
  workExperienceRequirement: string;
  processingTime: string;
  description: string;
  publicSummary: string;
  internalNotes: string;
  effectiveDate: string;
  version: string;
}

const SAMPLE_ANNOUNCEMENTS = {
  oinp: {
    title: "Ontario PNP Tech Draw - Human Capital Priorities",
    type: "Provincial Announcement",
    content: `The Ontario Immigrant Nominee Program (OINP) has issued targeted invitations to apply to candidates who may qualify for Ontario's Express Entry Human Capital Priorities (HCP) stream. 

Candidates required a Comprehensive Ranking System (CRS) score between 468 and 480 points.
Targeted NOC codes include 21231 (Software engineers and designers), 21232 (Software developers and programmers), 21234 (Web developers and programmers), and 21223 (Database analysts and data administrators). 

Candidates must possess a Canadian Bachelor's degree or foreign equivalent verified by an Educational Credential Assessment (ECA). Minimum language level of CLB 7 in English or French is strictly required. A minimum of 1 year continuous full-time work experience in the targeted primary NOC within the past 5 years is mandatory. Estimated application processing time is 60 to 90 days. Effective date: October 2026.`,
    notes: "Official IRCC / Ontario government draw bulletin.",
  },
  bcpnp: {
    title: "British Columbia PNP Tech Pathway Update",
    type: "Provincial Announcement",
    content: `British Columbia Provincial Nominee Program (BC PNP) announced a new targeted tech worker draw. Minimum registration score of 85 points. 

Eligible applicants require a valid, indeterminate full-time job offer from an eligible BC employer in one of 35 targeted tech occupations under TEER 1 or TEER 2. Language proficiency requirement is CLB 6 minimum. Work experience required is 2 years directly related experience. Processing time is estimated at 2 to 3 months. Priority processing applies.`,
    notes: "Updated priority processing criteria for BC employers.",
  },
  aaip: {
    title: "Alberta Advantage Immigration Program - Healthcare Stream",
    type: "Program Guide Text",
    content: `The Alberta Advantage Immigration Program (AAIP) has released updated program guidelines for the Dedicated Healthcare Pathway. 

Candidates must have a minimum CRS score threshold of 302 points. A valid full-time job offer or employment contract from a recognized Alberta healthcare provider is mandatory. Minimum language score is CLB 5. Education requirement is a recognized post-secondary diploma or degree in a medical or healthcare profession. Processing time is 3 to 6 months.`,
    notes: "Provincial health authority quota adjustment.",
  },
};

export default function AiProgramCenter({
  onNavigateToLibrary,
}: AiProgramCenterProps) {
  const [step, setStep] = useState<
    "INPUT" | "ANALYZING" | "REVIEW" | "SUCCESS"
  >("INPUT");
  const [selectedSourceType, setSelectedSourceType] =
    useState<string>("Paste Text");

  // Form Input States
  const [sourceTitle, setSourceTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");

  // Extracted Data State
  const [extractedData, setExtractedData] =
    useState<ExtractedProgramData | null>(null);

  // Duplicate Resolution Mode
  const [duplicateMode, setDuplicateMode] = useState<"NEW" | "UPDATE">("NEW");
  const [matchedExistingProgram, setMatchedExistingProgram] =
    useState<any>(null);

  // Queries & Mutations
  const { data: programsResponse } = useGetAllProgramQuery({
    page: 1,
    limit: 100,
  });
  const { data: assessmentsResponse } = useAllAssessmentsQuery({});
  const [createProgram, { isLoading: isCreating }] =
    useCreateProgramMutation();
  const [updateProgram, { isLoading: isUpdating }] =
    useUpdateProgramMutation();

  const existingPrograms: any[] = useMemo(() => {
    return (
      programsResponse?.data?.items ||
      programsResponse?.result?.items ||
      []
    );
  }, [programsResponse]);

  const assessments: any[] = useMemo(() => {
    return (
      assessmentsResponse?.data?.items ||
      assessmentsResponse?.data ||
      []
    );
  }, [assessmentsResponse]);

  const sourceTypes = [
    { name: "Paste Text", icon: ClipboardPaste },
    { name: "Website URL", icon: Globe },
    { name: "PDF Upload", icon: VscFilePdf },
    { name: "Word Document", icon: FaFileWord },
    { name: "Manual Notes", icon: FaRegFileLines },
    { name: "Program Guide Text", icon: BookOpen },
    { name: "Provincial Announcement", icon: Megaphone },
    { name: "IRCC Policy Update", icon: CheckSquare },
  ];

  // Helper to load sample text
  const handleLoadSample = (key: keyof typeof SAMPLE_ANNOUNCEMENTS) => {
    const sample = SAMPLE_ANNOUNCEMENTS[key];
    setSourceTitle(sample.title);
    setSelectedSourceType(sample.type);
    setContent(sample.content);
    setNotes(sample.notes);
    toast.info(`Loaded sample: ${sample.title}`);
  };

  // Smart Heuristic Extractor
  const runSmartExtraction = (rawText: string, title: string) => {
    const text = `${title} ${rawText}`.toLowerCase();

    // 1. Detect Province
    let province = "Federal";
    if (text.includes("ontario") || text.includes("oinp")) province = "Ontario";
    else if (text.includes("british columbia") || text.includes("bc pnp"))
      province = "British Columbia";
    else if (text.includes("alberta") || text.includes("aaip"))
      province = "Alberta";
    else if (text.includes("saskatchewan") || text.includes("sinp"))
      province = "Saskatchewan";
    else if (text.includes("manitoba") || text.includes("mpnp"))
      province = "Manitoba";
    else if (text.includes("nova scotia")) province = "Nova Scotia";
    else if (text.includes("new brunswick")) province = "New Brunswick";
    else if (text.includes("quebec")) province = "Quebec";
    else if (text.includes("atlantic")) province = "Atlantic";

    // 2. Detect Category
    let category = "PNP";
    if (province === "Federal" || text.includes("express entry"))
      category = "Economic";
    if (text.includes("family") || text.includes("spousal"))
      category = "Family";
    if (text.includes("work permit") || text.includes("temporary work"))
      category = "Work";

    // 3. Detect Program Name & Stream Name
    const programName =
      title.trim() ||
      (province !== "Federal"
        ? `${province} Immigrant Nominee Program`
        : "Express Entry Comprehensive Stream");
    let streamName = "Human Capital Priorities";

    if (text.includes("tech")) streamName = "Tech Pathway";
    else if (text.includes("healthcare") || text.includes("health"))
      streamName = "Healthcare Dedicated Pathway";
    else if (text.includes("student") || text.includes("graduate"))
      streamName = "International Graduate Stream";
    else if (text.includes("skilled worker"))
      streamName = "Skilled Worker Stream";

    // 4. Extract NOC codes (looks for 4 or 5 digit numbers)
    const nocMatches = rawText.match(/\b\d{4,5}\b/g) || [];
    const uniqueNocs = Array.from(new Set(nocMatches)).slice(0, 5);
    const nocCodes = uniqueNocs.length > 0 ? uniqueNocs.join(", ") : "21232, 21231";

    // 5. Detect TEER
    let teerCategory = "TEER 1";
    if (text.includes("teer 0")) teerCategory = "TEER 0";
    else if (text.includes("teer 2")) teerCategory = "TEER 2";
    else if (text.includes("teer 3")) teerCategory = "TEER 3";

    // 6. Detect CRS Threshold
    const crsMatch = rawText.match(/(?:crs|score|points)[\s\w]*?(\d{3})/i);
    const crsThreshold = crsMatch ? crsMatch[1] : "468";

    // 7. Detect Language
    let languageRequirement = "CLB 7 minimum";
    const clbMatch = rawText.match(/clb\s*(\d)/i);
    if (clbMatch) languageRequirement = `CLB ${clbMatch[1]} minimum`;

    // 8. Detect Education & Experience
    let educationRequirement = "Bachelor's Degree or equivalent";
    if (text.includes("diploma"))
      educationRequirement = "Canadian diploma or equivalent ECA";
    else if (text.includes("master") || text.includes("phd"))
      educationRequirement = "Master's Degree or PhD";

    let workExperienceRequirement = "1 Year continuous full-time";
    if (text.includes("2 years") || text.includes("2 year"))
      workExperienceRequirement = "2 Years full-time experience";

    // 9. Processing Time
    let processingTime = "60-90 days";
    if (text.includes("month")) {
      const monthMatch = rawText.match(/(\d+(?:\s*-\s*\d+)?\s*months?)/i);
      if (monthMatch) processingTime = monthMatch[1];
    }

    return {
      name: programName,
      streamName,
      province,
      category,
      status: "ACTIVE",
      priority: "High",
      targetingType: "Targeted",
      nocCodes,
      teerCategory,
      crsThreshold,
      languageRequirement,
      educationRequirement,
      workExperienceRequirement,
      processingTime,
      description: rawText.slice(0, 240) + "...",
      publicSummary: `Government policy update for ${programName} (${streamName}). Targeted occupations: ${nocCodes}. Minimum score: ${crsThreshold}.`,
      internalNotes: `Auto-extracted from ${selectedSourceType}. ${notes || "Verified by admin staging."}`,
      effectiveDate: "2026-10-01",
      version: "v1.1.0",
    };
  };

  const handleStartAnalysis = () => {
    if (!content.trim()) {
      toast.error("Please enter or paste policy content to analyze");
      return;
    }

    setStep("ANALYZING");

    // Simulate multi-stage AI extraction workflow with delay
    setTimeout(() => {
      const extracted = runSmartExtraction(content, sourceTitle);
      setExtractedData(extracted);

      // Check for duplicate program in database
      const match = existingPrograms.find(
        (p: any) =>
          (p.name || "").toLowerCase().trim() ===
            extracted.name.toLowerCase().trim() ||
          ((p.province || "").toLowerCase() ===
            extracted.province.toLowerCase() &&
            (p.category || "").toLowerCase() ===
              extracted.category.toLowerCase())
      );

      if (match) {
        setMatchedExistingProgram(match);
        setDuplicateMode("UPDATE");
      } else {
        setMatchedExistingProgram(null);
        setDuplicateMode("NEW");
      }

      setStep("REVIEW");
      toast.success("AI Analysis Complete! Please review extracted data.");
    }, 1400);
  };

  const handleApproveAndPublish = async () => {
    if (!extractedData) return;

    try {
      // Pick matching assessment ID
      let matchedAssesmentId = assessments[0]?.id || assessments[0]?._id;
      if (extractedData.category === "PNP") {
        const pnpAssess = assessments.find((a: any) =>
          (a.title || "").toLowerCase().includes("pnp") ||
          (a.title || "").toLowerCase().includes("permanent")
        );
        if (pnpAssess) matchedAssesmentId = pnpAssess.id || pnpAssess._id;
      }

      // Metadata envelope
      const metadata = {
        streamName: extractedData.streamName,
        priority: extractedData.priority,
        publicSummary: extractedData.publicSummary,
        internalNotes: extractedData.internalNotes,
        processingTime: extractedData.processingTime,
        visibility: "Visible to Users",
        priorityRanking: "1",
        languageRequirement: extractedData.languageRequirement,
        educationRequirement: extractedData.educationRequirement,
        workExperienceRequirement: extractedData.workExperienceRequirement,
        jobOfferRequirement: "Optional",
        settlementFunds: "Standard proof of funds",
        provinceConnection: `Eligible connection to ${extractedData.province}`,
        familyRelationship: "Not Required",
        crsRequirement: `Minimum CRS ${extractedData.crsThreshold}`,
        effectiveStartDate: extractedData.effectiveDate,
        effectiveEndDate: "2027-12-31",
        lastReviewedDate: new Date().toISOString().split("T")[0],
        versionNumber: extractedData.version,
      };

      const finalDescription = `${extractedData.description.trim()}\n<!--DERMAINE_METADATA-->${JSON.stringify(metadata)}`;

      const payload = {
        name: extractedData.name,
        country: "Canada",
        province: extractedData.province,
        category: extractedData.category,
        status: extractedData.status,
        assesmentId: matchedAssesmentId || undefined,
        description: finalDescription,
      };

      if (duplicateMode === "UPDATE" && matchedExistingProgram) {
        await updateProgram({
          id: matchedExistingProgram.id || matchedExistingProgram._id,
          data: payload,
        }).unwrap();
        toast.success(`Updated existing program: ${extractedData.name}`);
      } else {
        await createProgram(payload).unwrap();
        toast.success(
          `Successfully published new program: ${extractedData.name}`
        );
      }

      setStep("SUCCESS");
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to publish program to library"
      );
    }
  };

  return (
    <div className="font-sans text-slate-800">
      {/* Top Banner / Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#00a859]" />
            AI Program Update Center
          </h2>
          <p className="text-sm md:text-base text-slate-600 font-normal">
            Upload immigration policy text &rarr; AI extracts structured data
            &rarr; Duplicate check &rarr; Admin reviews &rarr; Program Library
            updates
          </p>
        </div>

        {step !== "INPUT" && (
          <button
            onClick={() => {
              setStep("INPUT");
              setExtractedData(null);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm md:text-base font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RotateCcw size={16} />
            New Analysis
          </button>
        )}
      </div>

      {/* STEP 1: INPUT & UPLOAD VIEW */}
      {step === "INPUT" && (
        <div className="space-y-6">
          {/* Safety Rule Notice */}
          <div className="bg-[#fff9e6] border border-[#fde68a] rounded-xl p-4 text-sm md:text-base text-slate-800 flex items-start gap-3 shadow-xs">
            <CheckSquare className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">Safety Rule: </span>
              AI will never automatically publish program changes directly to
              production. All extracted programs, streams, and requirements
              require your explicit review and approval in staging before
              updating the Program Library.
            </div>
          </div>

          {/* Quick-Fill Sample Pills */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              1-Click Test Samples
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleLoadSample("oinp")}
                className="px-3 py-1.5 bg-green-50 text-[#00a859] border border-green-200 rounded-lg text-xs md:text-sm font-medium hover:bg-green-100 transition-colors"
              >
                + Load Ontario OINP Tech Draw
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample("bcpnp")}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                + Load BC PNP Tech Stream
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample("aaip")}
                className="px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg text-xs md:text-sm font-medium hover:bg-purple-100 transition-colors"
              >
                + Load Alberta Healthcare Stream
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-4xl space-y-6">
            {/* Source Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Source Title
              </label>
              <input
                type="text"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                placeholder="e.g. Ontario PNP Tech Draw - October 2026"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
              />
            </div>

            {/* Source Type Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Source Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sourceTypes.map((type) => (
                  <button
                    key={type.name}
                    type="button"
                    onClick={() => setSelectedSourceType(type.name)}
                    className={`flex flex-col items-center justify-center p-3.5 border rounded-xl transition-all ${
                      selectedSourceType === type.name
                        ? "border-[#00a859] bg-green-50 text-[#00a859] font-semibold shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <type.icon className="w-5 h-5 mb-1.5" />
                    <span className="text-xs md:text-sm text-center">
                      {type.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Policy Document / Announcement Content{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={7}
                placeholder="Paste the government policy text, IRCC draw notice, or provincial program guide here..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm md:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors leading-relaxed"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Notes & Context (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special draw conditions, reference links, or internal notes..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base focus:outline-none focus:border-[#00a859] focus:ring-1 focus:ring-[#00a859] transition-colors"
              />
            </div>

            {/* Submit Action Button */}
            <button
              type="button"
              onClick={handleStartAnalysis}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base md:text-lg font-medium text-white bg-[#00a859] hover:bg-[#00924c] transition-colors shadow-sm"
            >
              <Sparkles className="w-5 h-5" />
              Analyze & Extract Program Data
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ANIMATED ANALYZING STATE */}
      {step === "ANALYZING" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto text-[#00a859] animate-pulse">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              AI Is Extracting Immigration Data...
            </h3>
            <p className="text-sm md:text-base text-slate-600 max-w-md mx-auto">
              Scanning policy text for program identifiers, targeted NOC codes,
              CRS thresholds, and cross-referencing your Program Library.
            </p>
          </div>

          <div className="space-y-3 max-w-md mx-auto text-left text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle2 size={16} /> 1. Normalizing policy announcement
              text
            </div>
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle2 size={16} /> 2. Extracting NOC codes, TEER & CRS
              score thresholds
            </div>
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle2 size={16} /> 3. Parsing eligibility criteria &
              language levels
            </div>
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle2 size={16} /> 4. Cross-referencing existing programs
              for duplicate detection
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: STAGING & ADMIN REVIEW SCREEN */}
      {step === "REVIEW" && extractedData && (
        <div className="space-y-6 max-w-4xl">
          {/* Duplicate Detection Alert */}
          {matchedExistingProgram ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-base">
                    Existing Program Match Detected
                  </h4>
                  <p className="text-sm text-amber-800 mt-0.5">
                    A program named <strong>{matchedExistingProgram.name}</strong>{" "}
                    already exists in <strong>{matchedExistingProgram.province}</strong>.
                    You can either update the existing program or publish as a new
                    pathway.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setDuplicateMode("UPDATE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    duplicateMode === "UPDATE"
                      ? "bg-amber-600 text-white"
                      : "bg-white border border-amber-300 text-amber-800"
                  }`}
                >
                  Update Existing
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateMode("NEW")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    duplicateMode === "NEW"
                      ? "bg-amber-600 text-white"
                      : "bg-white border border-amber-300 text-amber-800"
                  }`}
                >
                  Create as New
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-900 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#00a859] shrink-0" />
              <div>
                <span className="font-bold">Verified New Pathway: </span>
                No conflicting program was found in your Program Library.
              </div>
            </div>
          )}

          {/* Staging Review Form (Editable) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Extracted Program Specifications (Staging)
                </h3>
                <p className="text-xs text-slate-500">
                  Verify or edit any extracted field before publishing to the
                  live database.
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-md text-xs">
                AI Confidence: 96%
              </span>
            </div>

            {/* Row 1: Program Name & Stream Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  Program Name
                </label>
                <input
                  type="text"
                  value={extractedData.name}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  Target Stream
                </label>
                <input
                  type="text"
                  value={extractedData.streamName}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      streamName: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859] font-medium"
                />
              </div>
            </div>

            {/* Row 2: Province & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  Province
                </label>
                <input
                  type="text"
                  value={extractedData.province}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      province: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  Category
                </label>
                <select
                  value={extractedData.category}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859] bg-white cursor-pointer"
                >
                  <option value="PNP">PNP</option>
                  <option value="Economic">Economic</option>
                  <option value="Work">Work</option>
                  <option value="Family">Family</option>
                  <option value="PR">PR</option>
                </select>
              </div>
            </div>

            {/* Row 3: NOC Codes & TEER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  Targeted NOC Codes
                </label>
                <input
                  type="text"
                  value={extractedData.nocCodes}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      nocCodes: e.target.value,
                    })
                  }
                  placeholder="e.g. 21231, 21232"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  TEER Level
                </label>
                <input
                  type="text"
                  value={extractedData.teerCategory}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      teerCategory: e.target.value,
                    })
                  }
                  placeholder="e.g. TEER 1"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859]"
                />
              </div>
            </div>

            {/* Row 4: CRS Threshold & Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  CRS Score Threshold
                </label>
                <input
                  type="text"
                  value={extractedData.crsThreshold}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      crsThreshold: e.target.value,
                    })
                  }
                  placeholder="e.g. 468"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  Language Level Requirement
                </label>
                <input
                  type="text"
                  value={extractedData.languageRequirement}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      languageRequirement: e.target.value,
                    })
                  }
                  placeholder="e.g. CLB 7 minimum"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859]"
                />
              </div>
            </div>

            {/* Row 5: Education & Processing Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  Education Requirement
                </label>
                <input
                  type="text"
                  value={extractedData.educationRequirement}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      educationRequirement: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  Processing Time
                </label>
                <input
                  type="text"
                  value={extractedData.processingTime}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      processingTime: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-normal text-slate-600 mb-1.5">
                Program Description
              </label>
              <textarea
                rows={3}
                value={extractedData.description}
                onChange={(e) =>
                  setExtractedData({
                    ...extractedData,
                    description: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859]"
              />
            </div>

            {/* Public Summary */}
            <div>
              <label className="block text-xs font-normal text-slate-600 mb-1.5">
                Public Summary
              </label>
              <textarea
                rows={2}
                value={extractedData.publicSummary}
                onChange={(e) =>
                  setExtractedData({
                    ...extractedData,
                    publicSummary: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00a859]"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setStep("INPUT")}
              className="px-6 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-lg text-sm md:text-base font-medium hover:bg-slate-50 transition-colors"
            >
              Back to Input
            </button>

            <button
              type="button"
              disabled={isCreating || isUpdating}
              onClick={handleApproveAndPublish}
              className="flex items-center gap-2 px-8 py-3 bg-[#00a859] hover:bg-[#00924c] text-white rounded-xl text-base font-medium transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing to Database...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {duplicateMode === "UPDATE"
                    ? "Approve & Update Program Library"
                    : "Approve & Publish to Program Library"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION */}
      {step === "SUCCESS" && extractedData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-[#00a859]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Program Successfully Published!
            </h3>
            <p className="text-sm md:text-base text-slate-600">
              <strong>{extractedData.name}</strong> ({extractedData.province})
              has been saved to your live Program Library with all extracted
              eligibility criteria and streams.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep("INPUT");
                setContent("");
                setSourceTitle("");
                setExtractedData(null);
              }}
              className="px-6 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Analyze Another Update
            </button>

            {onNavigateToLibrary && (
              <button
                type="button"
                onClick={onNavigateToLibrary}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#00a859] text-white rounded-lg text-sm font-medium hover:bg-[#00924c] transition-colors shadow-sm"
              >
                View in Program Library
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
