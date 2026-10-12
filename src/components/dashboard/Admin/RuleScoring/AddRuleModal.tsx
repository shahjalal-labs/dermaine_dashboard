"use client";
import { CustomModal } from "@/components/modal/CustomModal";
import InputField from "@/components/ui/InputField";
import { useGetAllProgramQuery } from "@/redux/api/programApi";
import { useGetAllStreamQuery } from "@/redux/api/stremApi";
import { ChevronDown } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  initialData?: any;
  defaultProgramId?: string;
  defaultStreamId?: string;
}

// Mirrors `RuleOperator` in schema.prisma
const OPERATOR_OPTIONS = [
  { value: "EQUALS", label: "Equals" },
  { value: "NOT_EQUALS", label: "Not Equals" },
  { value: "GREATER_THAN", label: "Greater Than" },
  { value: "GREATER_THAN_OR_EQUAL", label: "Greater Than Or Equal" },
  { value: "LESS_THAN", label: "Less Than" },
  { value: "LESS_THAN_OR_EQUAL", label: "Less Than Or Equal" },
  { value: "BETWEEN", label: "Between" },
  { value: "IN_LIST", label: "In List" },
  { value: "NOT_IN_LIST", label: "Not In List" },
  { value: "CONTAINS", label: "Contains" },
  { value: "NOT_CONTAINS", label: "Not Contains" },
  { value: "IS_TRUE", label: "Is True" },
  { value: "IS_FALSE", label: "Is False" },
  { value: "IS_EMPTY", label: "Is Empty" },
  { value: "IS_NOT_EMPTY", label: "Is Not Empty" },
];

// Mirrors `QuestionInputType`
const DATA_TYPE_OPTIONS = [
  "TEXT",
  "NUMBER",
  "SELECT",
  "MULTI_SELECT",
  "DATE",
  "EMAIL",
  "PHONE",
  "BOOLEAN",
  "TEXTAREA"
];

// Mirrors `RuleStatus`
const STATUS_OPTIONS = ["DRAFT", "ACTIVE", "INACTIVE", "TESTING", "ARCHIVED"];

// Mirrors `FailureResult`
const FAILURE_RESULT_OPTIONS = [
  "NOT_ELIGIBLE",
  "POTENTIALLY_ELIGIBLE",
  "MISSING_REQUIREMENT",
  "FURTHER_REVIEW_REQUIRED",
];

// Mirrors `ScoringMethod`
const SCORING_METHOD_OPTIONS = [
  "FIXED_SCORE",
  "PERCENTAGE",
  "RANGE_BAND",
  "LOOKUP_TABLE",
  "FORMULA",
  "BOOLEAN_SCORE",
];

// Mirrors `OccupationMatchType`
const OCCUPATION_MATCH_TYPE_OPTIONS = [
  "EXACT_NOC",
  "NOC_LIST",
  "TEER_RANGE",
  "BROAD_OCCUPATIONAL_CATEGORY",
  "PRIORITY_OCCUPATION_LIST",
  "EXCLUDED_OCCUPATION_LIST",
];

// ruleCategory is admin-configurable free text in the schema, not an
// enum — these are just suggestions offered through a datalist.
const RULE_CATEGORY_SUGGESTIONS = [
  "work_experience",
  "language",
  "education",
  "settlement_funds",
  "canadian_experience",
  "occupation",
  "province_connection",
  "job_offer",
  "family_relationship",
  "crs_score",
];

// Categories that need the Occupation Matching sub-form.
const OCCUPATION_RELATED_CATEGORIES = ["occupation", "work_experience"];

const emptyFormData = {
  organizationId: "",
  ruleName: "",
  ruleGroup: "",
  ruleCategory: "work_experience",
  rulePurpose: "MANDATORY_ELIGIBILITY_RULE",
  status: "DRAFT",
  priorityOrder: 0,

  assessmentSection: "",
  questionId: "",
  dataField: "",
  dataType: "",
  operator: "GREATER_THAN_OR_EQUAL",
  comparisonValue: "",
  secondaryValue: "",

  // Mandatory-only
  failureResult: "MISSING_REQUIREMENT",
  missingRequirementMessage: "",
  furtherReviewRequired: false,

  // Scoring-only
  weightPercentage: "",
  maximumFactorScore: "",
  scoringMethod: "",
  scoreAwarded: "",
  scoringBands: "",

  // Occupation matching (only relevant for occupation-related categories)
  nocCode: "",
  occupationName: "",
  teer: "",
  occupationCategory: "",
  priorityOccupation: false,
  matchType: "",
  includedNocList: "",
  excludedNocList: "",

  whyRecommended: "",
  improvementRecommendation: "",
  nextSteps: "",

  effectiveStartDate: "",
  effectiveEndDate: "",
  doesNotExpire: false,
  changeNotes: "",
  streamId: "",
};

export default function AddRuleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
  defaultProgramId,
  defaultStreamId,
}: AddRuleModalProps) {
  const [formData, setFormData] = React.useState(emptyFormData);

  const { data: programsData } = useGetAllProgramQuery({ page: 1, limit: 100 });
  const { data: streamsData } = useGetAllStreamQuery({});

  const programs = React.useMemo(() => {
    const raw = programsData?.data?.items || programsData?.result?.items || programsData?.data || programsData?.result || [];
    return Array.isArray(raw) ? raw : [];
  }, [programsData]);

  const streams = React.useMemo(() => {
    const raw = streamsData?.data?.items || streamsData?.result?.items || streamsData?.data || streamsData?.result || [];
    return Array.isArray(raw) ? raw : [];
  }, [streamsData]);

  const [selectedProgramId, setSelectedProgramId] = React.useState<string>(defaultProgramId || "");

  React.useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const occ = initialData.occupationCondition || {};
      const activeStreamId = initialData.streamId || defaultStreamId || "";
      setFormData({
        streamId: activeStreamId,
        organizationId: initialData.organizationId || "",
        ruleName: initialData.ruleName || "",
        ruleGroup: initialData.ruleGroup || "",
        ruleCategory: initialData.ruleCategory || "work_experience",
        rulePurpose: initialData.rulePurpose || "MANDATORY_ELIGIBILITY_RULE",
        status: initialData.status || "DRAFT",
        priorityOrder: initialData.priorityOrder ?? 0,

        assessmentSection: initialData.assessmentSection || "",
        questionId: initialData.questionId || "",
        dataField: initialData.dataField || "",
        dataType: initialData.dataType || "",
        operator: initialData.operator || "GREATER_THAN_OR_EQUAL",
        comparisonValue: initialData.comparisonValue || "",
        secondaryValue: initialData.secondaryValue || "",

        failureResult: initialData.failureResult || "MISSING_REQUIREMENT",
        missingRequirementMessage: initialData.missingRequirementMessage || "",
        furtherReviewRequired: initialData.furtherReviewRequired || false,

        weightPercentage: initialData.weightPercentage ?? "",
        maximumFactorScore: initialData.maximumFactorScore ?? "",
        scoringMethod: initialData.scoringMethod || "",
        scoreAwarded: initialData.scoreAwarded ?? "",
        scoringBands: initialData.scoringBands
          ? JSON.stringify(initialData.scoringBands, null, 2)
          : "",

        nocCode: occ.nocCode || "",
        occupationName: occ.occupationName || "",
        teer: occ.teer ?? "",
        occupationCategory: occ.occupationCategory || "",
        priorityOccupation: occ.priorityOccupation || false,
        matchType: occ.matchType || "",
        includedNocList: (occ.includedNocList || []).join(", "),
        excludedNocList: (occ.excludedNocList || []).join(", "),

        whyRecommended: initialData.whyRecommended || "",
        improvementRecommendation: initialData.improvementRecommendation || "",
        nextSteps: initialData.nextSteps || "",

        effectiveStartDate: initialData.effectiveStartDate
          ? new Date(initialData.effectiveStartDate).toISOString().split("T")[0]
          : "",
        effectiveEndDate: initialData.effectiveEndDate
          ? new Date(initialData.effectiveEndDate).toISOString().split("T")[0]
          : "",
        doesNotExpire: initialData.doesNotExpire || false,
        changeNotes: initialData.changeNotes || "",
      });

      if (initialData.programId) {
        setSelectedProgramId(initialData.programId);
      } else if (activeStreamId && streams.length > 0) {
        const matchingStream = streams.find((s: any) => s.id === activeStreamId || s._id === activeStreamId);
        if (matchingStream?.programId) {
          setSelectedProgramId(matchingStream.programId);
        }
      }
    } else {
      setFormData({
        ...emptyFormData,
        streamId: defaultStreamId || "",
      });
      if (defaultProgramId) {
        setSelectedProgramId(defaultProgramId);
      } else if (defaultStreamId && streams.length > 0) {
        const matchingStream = streams.find((s: any) => s.id === defaultStreamId || s._id === defaultStreamId);
        if (matchingStream?.programId) {
          setSelectedProgramId(matchingStream.programId);
        }
      }
    }
  }, [isOpen, initialData, defaultProgramId, defaultStreamId, streams]);

  const availableStreams = React.useMemo(() => {
    if (!selectedProgramId) return streams;
    return streams.filter((s: any) => s.programId === selectedProgramId);
  }, [streams, selectedProgramId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isMandatory = formData.rulePurpose === "MANDATORY_ELIGIBILITY_RULE";
  const isScoring = formData.rulePurpose === "SCORING_FACTOR";
  const needsOccupationSection = OCCUPATION_RELATED_CATEGORIES.includes(
    formData.ruleCategory,
  );
  const needsSecondaryValue = formData.operator === "BETWEEN";
  const needsScoringBands = ["RANGE_BAND", "LOOKUP_TABLE"].includes(
    formData.scoringMethod,
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-base md:text-lg font-bold text-title mb-2">
      {children}
    </label>
  );

  const Select = ({
    className,
    children,
    ...props
  }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
      <select
        className={`w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-title appearance-none bg-white focus:outline-none focus:border-slate-300 ${className || ""}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-description pointer-events-none"
      />
    </div>
  );

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-base md:text-lg font-bold text-title border-b border-slate-100 pb-2 mb-4">
      {children}
    </h3>
  );

  const handleSubmit = () => {
    const {
      streamId,
      nocCode,
      occupationName,
      teer,
      occupationCategory,
      priorityOccupation,
      matchType,
      includedNocList,
      excludedNocList,
      scoringBands,
      ...rest
    } = formData;

    const hasOccupationData =
      needsOccupationSection &&
      (nocCode ||
        occupationName ||
        teer ||
        occupationCategory ||
        matchType ||
        includedNocList ||
        excludedNocList);

    let parsedScoringBands: any = undefined;
    if (isScoring && needsScoringBands && scoringBands.trim()) {
      try {
        parsedScoringBands = JSON.parse(scoringBands);
      } catch {
        // left undefined — parent's submit handler / validation layer
        // should surface this back to the user rather than silently
        // sending malformed JSON.
        parsedScoringBands = scoringBands;
      }
    }

    if (!streamId) {
      toast.error("Please select a Target Stream for this rule.");
      return;
    }

    const payload: any = {
      ...rest,
      streamId: streamId,
      programId: selectedProgramId || undefined,
      organizationId: formData.organizationId || undefined,
      ruleGroup: formData.ruleGroup || undefined,
      priorityOrder: Number(formData.priorityOrder) || 0,

      assessmentSection: formData.assessmentSection || undefined,
      questionId: formData.questionId || undefined,
      dataField: formData.dataField || undefined,
      dataType: formData.dataType || undefined,
      comparisonValue: formData.comparisonValue || undefined,
      secondaryValue: needsSecondaryValue
        ? formData.secondaryValue || undefined
        : undefined,

      // Only send the block relevant to this rule's purpose.
      failureResult: isMandatory ? formData.failureResult : undefined,
      missingRequirementMessage: isMandatory
        ? formData.missingRequirementMessage || undefined
        : undefined,
      furtherReviewRequired: isMandatory
        ? formData.furtherReviewRequired
        : undefined,

      weightPercentage: isScoring
        ? Number(formData.weightPercentage) || undefined
        : undefined,
      maximumFactorScore: isScoring
        ? Number(formData.maximumFactorScore) || undefined
        : undefined,
      scoringMethod: isScoring
        ? formData.scoringMethod || undefined
        : undefined,
      scoreAwarded: isScoring
        ? Number(formData.scoreAwarded) || undefined
        : undefined,
      scoringBands: parsedScoringBands,

      whyRecommended: formData.whyRecommended || undefined,
      improvementRecommendation:
        formData.improvementRecommendation || undefined,
      nextSteps: formData.nextSteps || undefined,

      effectiveStartDate: formData.effectiveStartDate
        ? new Date(formData.effectiveStartDate).toISOString()
        : undefined,
      effectiveEndDate: formData.effectiveEndDate
        ? new Date(formData.effectiveEndDate).toISOString()
        : undefined,
      doesNotExpire: formData.doesNotExpire,
      changeNotes: formData.changeNotes || undefined,

      occupationCondition: hasOccupationData
        ? {
            nocCode: nocCode || undefined,
            occupationName: occupationName || undefined,
            teer: teer !== "" ? Number(teer) : undefined,
            occupationCategory: occupationCategory || undefined,
            priorityOccupation,
            matchType: matchType || undefined,
            includedNocList: includedNocList
              ? includedNocList
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean)
              : [],
            excludedNocList: excludedNocList
              ? excludedNocList
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean)
              : [],
          }
        : undefined,
    };

    onSubmit(payload);
  };

  return (
    <CustomModal
      open={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Rule" : "Add Rule"}
      maxWidth="3xl"
      actions={[
        { label: "Cancel", onClick: onClose, variant: "secondary" },
        {
          label: isLoading
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
              ? "Update Rule"
              : "Create Rule",
          onClick: handleSubmit,
          variant: "primary",
        },
      ]}
    >
      <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Target Program & Stream Assignment */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <SectionHeading>Target Program & Stream Assignment *</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Target Program</Label>
              <Select
                value={selectedProgramId}
                onChange={(e) => {
                  const pId = e.target.value;
                  setSelectedProgramId(pId);
                  const currentStream = streams.find((s: any) => (s.id || s._id) === formData.streamId);
                  if (currentStream && pId && currentStream.programId !== pId) {
                    setFormData((prev) => ({ ...prev, streamId: "" }));
                  }
                }}
              >
                <option value="">-- All Programs / Select Program --</option>
                {programs.map((p: any) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Target Stream *</Label>
              <Select
                name="streamId"
                value={formData.streamId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Stream --</option>
                {availableStreams.map((s: any) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.streamName || s.name || s.id}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {!formData.streamId && (
            <p className="text-xs text-amber-600 font-medium mt-2">
              ⚠️ A target stream is required to bind this rule to the eligibility engine.
            </p>
          )}
        </div>

        {/* A. Rule Identification */}
        <div>
          <SectionHeading>Rule Identification</SectionHeading>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Rule Name *"
                name="ruleName"
                value={formData.ruleName}
                onChange={handleChange}
                placeholder="e.g. Canadian Work Experience Minimum"
              />
              <InputField
                label="Rule Group"
                name="ruleGroup"
                value={formData.ruleGroup}
                onChange={handleChange}
                placeholder="e.g. eligibility_core"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rule Category *</Label>
                <input
                  list="rule-category-suggestions"
                  name="ruleCategory"
                  value={formData.ruleCategory}
                  onChange={handleChange}
                  placeholder="e.g. work_experience"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-title focus:outline-none focus:border-slate-300"
                />
                <datalist id="rule-category-suggestions">
                  {RULE_CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label>Rule Purpose *</Label>
                <Select
                  name="rulePurpose"
                  value={formData.rulePurpose}
                  onChange={handleChange}
                >
                  <option value="MANDATORY_ELIGIBILITY_RULE">
                    Mandatory Eligibility Rule
                  </option>
                  <option value="SCORING_FACTOR">Scoring Factor</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
              </div>
              <InputField
                label="Priority Order"
                name="priorityOrder"
                type="number"
                value={formData.priorityOrder}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Stream ID *"
                name="streamId"
                value={formData.streamId}
                onChange={handleChange}
                placeholder="e.g. stream_abc123"
              />
              <InputField
                label="Organization ID"
                name="organizationId"
                value={formData.organizationId}
                onChange={handleChange}
                placeholder="Leave blank if not org-scoped"
              />
            </div>
          </div>
        </div>

        {/* B. Condition Logic */}
        <div>
          <SectionHeading>Condition Logic</SectionHeading>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Assessment Section"
                name="assessmentSection"
                value={formData.assessmentSection}
                onChange={handleChange}
                placeholder="e.g. work_history"
              />
              <InputField
                label="Question ID"
                name="questionId"
                value={formData.questionId}
                onChange={handleChange}
                placeholder="e.g. canadian_work_experience_months"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Data Field"
                name="dataField"
                value={formData.dataField}
                onChange={handleChange}
                placeholder="e.g. workExperience.canadianMonths"
              />
              <div>
                <Label>Data Type</Label>
                <Select
                  name="dataType"
                  value={formData.dataType}
                  onChange={handleChange}
                >
                  <option value="">Select data type</option>
                  {DATA_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div
              className={`grid gap-4 ${needsSecondaryValue ? "grid-cols-3" : "grid-cols-2"}`}
            >
              <div>
                <Label>Operator *</Label>
                <Select
                  name="operator"
                  value={formData.operator}
                  onChange={handleChange}
                >
                  {OPERATOR_OPTIONS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </Select>
              </div>
              <InputField
                label="Comparison Value *"
                name="comparisonValue"
                value={formData.comparisonValue}
                onChange={handleChange}
                placeholder="e.g. 12"
              />
              {needsSecondaryValue && (
                <InputField
                  label="Secondary Value *"
                  name="secondaryValue"
                  value={formData.secondaryValue}
                  onChange={handleChange}
                  placeholder="upper bound for BETWEEN"
                />
              )}
            </div>
          </div>
        </div>

        {/* C. Mandatory Rule Settings — only when rulePurpose is MANDATORY_ELIGIBILITY_RULE */}
        {isMandatory && (
          <div>
            <SectionHeading>Mandatory Rule Settings</SectionHeading>
            <div className="space-y-4">
              <div>
                <Label>Failure Result</Label>
                <Select
                  name="failureResult"
                  value={formData.failureResult}
                  onChange={handleChange}
                >
                  {FAILURE_RESULT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Missing Requirement Message</Label>
                <textarea
                  name="missingRequirementMessage"
                  value={formData.missingRequirementMessage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-description/70 placeholder-description focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary min-h-[80px]"
                  placeholder="e.g. You need at least 12 months of skilled Canadian work experience for this pathway."
                ></textarea>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="furtherReviewRequired"
                  checked={formData.furtherReviewRequired}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-base md:text-lg text-title">
                  Further review required
                </span>
              </label>
            </div>
          </div>
        )}

        {/* D. Scoring Settings — only when rulePurpose is SCORING_FACTOR */}
        {isScoring && (
          <div>
            <SectionHeading>Scoring Settings</SectionHeading>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Weight Percentage"
                  name="weightPercentage"
                  type="number"
                  value={formData.weightPercentage}
                  onChange={handleChange}
                  placeholder="0–100"
                />
                <InputField
                  label="Maximum Factor Score"
                  name="maximumFactorScore"
                  type="number"
                  value={formData.maximumFactorScore}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Scoring Method</Label>
                  <Select
                    name="scoringMethod"
                    value={formData.scoringMethod}
                    onChange={handleChange}
                  >
                    <option value="">Select scoring method</option>
                    {SCORING_METHOD_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m.replace(/_/g, " ")}
                      </option>
                    ))}
                  </Select>
                </div>
                <InputField
                  label="Score Awarded"
                  name="scoreAwarded"
                  type="number"
                  value={formData.scoreAwarded}
                  onChange={handleChange}
                  placeholder="static score, for FIXED_SCORE / BOOLEAN_SCORE"
                />
              </div>

              {needsScoringBands && (
                <div>
                  <Label>Scoring Bands (JSON)</Label>
                  <textarea
                    name="scoringBands"
                    value={formData.scoringBands}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-sm text-description/70 placeholder-description focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary min-h-[100px]"
                    placeholder='e.g. [{"min": 0, "max": 6, "score": 0}, {"min": 7, "max": 12, "score": 5}]'
                  ></textarea>
                  <p className="text-sm text-slate-400 mt-1">
                    Exact shape is still being finalized — enter whatever the
                    scoring method expects.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* E. Occupation Matching — only for occupation/work-experience categories */}
        {needsOccupationSection && (
          <div>
            <SectionHeading>Occupation Matching</SectionHeading>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="NOC Code"
                  name="nocCode"
                  value={formData.nocCode}
                  onChange={handleChange}
                  placeholder="e.g. 21231"
                />
                <InputField
                  label="Occupation Name"
                  name="occupationName"
                  value={formData.occupationName}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="TEER"
                  name="teer"
                  type="number"
                  value={formData.teer}
                  onChange={handleChange}
                  placeholder="0–5"
                />
                <InputField
                  label="Occupation Category"
                  name="occupationCategory"
                  value={formData.occupationCategory}
                  onChange={handleChange}
                  placeholder="e.g. STEM"
                />
              </div>

              <div>
                <Label>Match Type</Label>
                <Select
                  name="matchType"
                  value={formData.matchType}
                  onChange={handleChange}
                >
                  <option value="">Select match type</option>
                  {OCCUPATION_MATCH_TYPE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Included NOC List"
                  name="includedNocList"
                  value={formData.includedNocList}
                  onChange={handleChange}
                  placeholder="comma-separated, e.g. 21231, 21232"
                />
                <InputField
                  label="Excluded NOC List"
                  name="excludedNocList"
                  value={formData.excludedNocList}
                  onChange={handleChange}
                  placeholder="comma-separated"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="priorityOccupation"
                  checked={formData.priorityOccupation}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-base md:text-lg text-title">
                  Priority occupation
                </span>
              </label>
            </div>
          </div>
        )}

        {/* F. Recommendation Content */}
        <div>
          <SectionHeading>Recommendation Content</SectionHeading>
          <div className="space-y-4">
            <div>
              <Label>Why Recommended</Label>
              <textarea
                name="whyRecommended"
                value={formData.whyRecommended}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-description/70 placeholder-description focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary min-h-[70px]"
                placeholder="e.g. Your Canadian work experience meets the minimum for this stream."
              ></textarea>
            </div>
            <div>
              <Label>Improvement Recommendation</Label>
              <textarea
                name="improvementRecommendation"
                value={formData.improvementRecommendation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-description/70 placeholder-description focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary min-h-[80px]"
                placeholder="e.g. Continue working in a TEER 0, 1, 2, or 3 occupation until you reach 12 months of Canadian experience."
              ></textarea>
            </div>
            <div>
              <Label>Next Steps</Label>
              <textarea
                name="nextSteps"
                value={formData.nextSteps}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-description/70 placeholder-description focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary min-h-[70px]"
                placeholder="e.g. Gather pay stubs and a reference letter as proof of experience."
              ></textarea>
            </div>
          </div>
        </div>

        {/* G. Dates and Versioning */}
        <div>
          <SectionHeading>Dates and Versioning</SectionHeading>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Effective Start Date"
                name="effectiveStartDate"
                type="date"
                value={formData.effectiveStartDate}
                onChange={handleChange}
              />
              <InputField
                label="Effective End Date"
                name="effectiveEndDate"
                type="date"
                value={formData.effectiveEndDate}
                onChange={handleChange}
                disabled={formData.doesNotExpire}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="doesNotExpire"
                checked={formData.doesNotExpire}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <span className="text-base md:text-lg text-title">
                Does not expire
              </span>
            </label>

            <div>
              <Label>Change Notes</Label>
              <textarea
                name="changeNotes"
                value={formData.changeNotes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-base md:text-lg text-description/70 placeholder-description focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary min-h-[60px]"
                placeholder="What changed and why, for the audit trail"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}
