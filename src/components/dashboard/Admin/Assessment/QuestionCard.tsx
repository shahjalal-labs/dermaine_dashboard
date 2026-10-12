import InputField from "@/components/ui/InputField";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Repeat,
  Trash2,
  X,
  Link2,
  Layers,
} from "lucide-react";

export type QuestionType =
  | "PERSONAL"
  | "LANGUAGE_SKILLS"
  | "EDUCATION_AND_TRAINING"
  | "WORK_HISTORY"
  | "YOUR_DEPENDENTS"
  | "CANADIAN_RELATIVES_AND_CONNECTIONS"
  | "CANADIAN_JOB_OFFER"
  | "PERSONAL_NET_WORTH"
  | "SPOUSE_INFORMATION"
  | "SPOUSE_LANGUAGE_SKILLS"
  | "SPOUSE_EDUCATION_AND_TRAINING"
  | "SPOUSE_WORK_HISTORY"
  | "SPOUSE_CANADIAN_JOB_OFFER"
  | "SPOUSE_CANADIAN_RELATIVES_AND_CONNECTIONS"
  | "ADDITIONAL_INFORMATION"
  | "FAMILY_INFORMATION"
  | "PREVIOUS_IMMIGRATION_HISTORY"
  | "EDUCATION_BACKGROUND"
  | "STUDY_PLANS_IN_CANADA"
  | "FINANCIAL_ABILITY"
  | "STUDY_PERMIT_RISK_ASSESSMENT"
  | "FUTURE_IMMIGRATION_GOALS"
  | "EMPLOYMENT_BACKGROUND"
  | "WORK_EXPERIENCE"
  | "LMIA_EXEMPT_WORK_PERMIT_ASSESSMENT"
  | "SPOUSAL_OPEN_WORK_PERMIT"
  | "ADMISSIBILITY_REVIEW"
  | "FAMILY_CONNECTION_TO_CANADA"
  | "SPOUSAL_PARTNER_SPONSORSHIP_LOGIC"
  | "SPONSOR_ELIGIBILITY_LOGIC"
  | "PARENT_GRANDPARENT_PATHWAY_LOGIC"
  | "DEPENDENT_CHILD_SPONSORSHIP_LOGIC"
  | "ADOPTED_CHILD_LOGIC"
  | "ACCOMPANYING_SPOUSE_OF_INTERNATIONAL_STUDENT_LOGIC"
  | "ACCOMPANYING_SPOUSE_OF_FOREIGN_WORKER_LOGIC"
  | "BROTHER_SISTER_LOGIC"
  | "CHILD_OF_A_CANADIAN_CITIZEN_OR_PERMANENT_RESIDENT"
  | "PARENT_SPONSOR_ELIGIBILITY"
  | "CHILD_OF_A_TEMPORARY_WORKER_OR_STUDENT_IN_CANADA"
  | "JOINING_OR_VISITING_A_PARENT_IN_CANADA"
  | "GRANDCHILD_OF_A_CANADIAN_CITIZEN_OR_PERMANENT_RESIDENT"
  | "JOINING_OR_VISITING_A_GRANDPARENT_IN_CANADA"
  | "FAMILY_MEMBER_LIVING_IN_CANADA"
  | "PARENT_OF_A_CANADIAN_CHILD"
  | "PARENT_OF_A_TEMPORARY_RESIDENT_IN_CANADA"
  | "PARENT_OF_AN_ADOPTED_CANADIAN_CHILD"
  | "PARENT_OF_AN_ADOPTED_TEMPORARY_RESIDENT_IN_CANADA"
  | "HUMANITARIAN_COMPASSIONATE_FAMILY_REUNIFICATION_FACTORS"
  | "SIBLING_SPONSORSHIP_AND_FAMILY_REUNIFICATION_SCREENING"
  | "ORPHANED_NIECE_OR_NEPHEW_SCREENING"
  | "JOINING_OR_VISITING_A_TEMPORARY_RESIDENT_RELATIVE"
  | "CANADIAN_RELATIVE_INFORMATION"
  | "MY_COMMON_LAW_PARTNER_CANADIAN_CITIZEN_OR_PR"
  | "MY_CONJUGAL_PARTNER_CANADIAN_CITIZEN_OR_PR"
  | "MY_SPOUSE_CANADIAN_CITIZEN_OR_PR"
  | "ONE_OTHER_RELATIVE_EXCEPTION"
  | "OTHER_RELATIVE_SPECIFICATION"
  | "RELATIVES_UNIVERSAL_INTENT"
  | "SPOUSE_OR_PARTNER_OF_STUDENT_IN_CANADA"
  | "SPOUSE_OR_PARTNER_OF_VISITOR_IN_CANADA"
  | "SPOUSE_OR_PARTNER_OF_WORKER_IN_CANADA"
  | "FINAL_EXPLANATION";

export const QUESTION_TYPES: QuestionType[] = [
  "PERSONAL",
  "LANGUAGE_SKILLS",
  "EDUCATION_AND_TRAINING",
  "WORK_HISTORY",
  "YOUR_DEPENDENTS",
  "CANADIAN_RELATIVES_AND_CONNECTIONS",
  "CANADIAN_JOB_OFFER",
  "PERSONAL_NET_WORTH",
  "SPOUSE_INFORMATION",
  "SPOUSE_LANGUAGE_SKILLS",
  "SPOUSE_EDUCATION_AND_TRAINING",
  "SPOUSE_WORK_HISTORY",
  "SPOUSE_CANADIAN_JOB_OFFER",
  "SPOUSE_CANADIAN_RELATIVES_AND_CONNECTIONS",
  "ADDITIONAL_INFORMATION",
  "FAMILY_INFORMATION",
  "PREVIOUS_IMMIGRATION_HISTORY",
  "EDUCATION_BACKGROUND",
  "STUDY_PLANS_IN_CANADA",
  "FINANCIAL_ABILITY",
  "STUDY_PERMIT_RISK_ASSESSMENT",
  "FUTURE_IMMIGRATION_GOALS",
  "EMPLOYMENT_BACKGROUND",
  "WORK_EXPERIENCE",
  "LMIA_EXEMPT_WORK_PERMIT_ASSESSMENT",
  "SPOUSAL_OPEN_WORK_PERMIT",
  "ADMISSIBILITY_REVIEW",
  "FAMILY_CONNECTION_TO_CANADA",
  "SPOUSAL_PARTNER_SPONSORSHIP_LOGIC",
  "SPONSOR_ELIGIBILITY_LOGIC",
  "PARENT_GRANDPARENT_PATHWAY_LOGIC",
  "DEPENDENT_CHILD_SPONSORSHIP_LOGIC",
  "ADOPTED_CHILD_LOGIC",
  "ACCOMPANYING_SPOUSE_OF_INTERNATIONAL_STUDENT_LOGIC",
  "ACCOMPANYING_SPOUSE_OF_FOREIGN_WORKER_LOGIC",
  "BROTHER_SISTER_LOGIC",
  "CHILD_OF_A_CANADIAN_CITIZEN_OR_PERMANENT_RESIDENT",
  "PARENT_SPONSOR_ELIGIBILITY",
  "CHILD_OF_A_TEMPORARY_WORKER_OR_STUDENT_IN_CANADA",
  "JOINING_OR_VISITING_A_PARENT_IN_CANADA",
  "GRANDCHILD_OF_A_CANADIAN_CITIZEN_OR_PERMANENT_RESIDENT",
  "FAMILY_MEMBER_LIVING_IN_CANADA",
  "JOINING_OR_VISITING_A_GRANDPARENT_IN_CANADA",
  "PARENT_OF_A_CANADIAN_CHILD",
  "PARENT_OF_A_TEMPORARY_RESIDENT_IN_CANADA",
  "PARENT_OF_AN_ADOPTED_CANADIAN_CHILD",
  "PARENT_OF_AN_ADOPTED_TEMPORARY_RESIDENT_IN_CANADA",
  "HUMANITARIAN_COMPASSIONATE_FAMILY_REUNIFICATION_FACTORS",
  "SIBLING_SPONSORSHIP_AND_FAMILY_REUNIFICATION_SCREENING",
  "ORPHANED_NIECE_OR_NEPHEW_SCREENING",
  "JOINING_OR_VISITING_A_TEMPORARY_RESIDENT_RELATIVE",
  "CANADIAN_RELATIVE_INFORMATION",
  "MY_COMMON_LAW_PARTNER_CANADIAN_CITIZEN_OR_PR",
  "MY_CONJUGAL_PARTNER_CANADIAN_CITIZEN_OR_PR",
  "MY_SPOUSE_CANADIAN_CITIZEN_OR_PR",
  "ONE_OTHER_RELATIVE_EXCEPTION",
  "OTHER_RELATIVE_SPECIFICATION",
  "RELATIVES_UNIVERSAL_INTENT",
  "SPOUSE_OR_PARTNER_OF_STUDENT_IN_CANADA",
  "SPOUSE_OR_PARTNER_OF_VISITOR_IN_CANADA",
  "SPOUSE_OR_PARTNER_OF_WORKER_IN_CANADA",
  "FINAL_EXPLANATION",
];

// NOTE: added MULTI_SELECT — your backend's QuestionInputType enum
// already has it, but the frontend type was missing it entirely.
export type InputType =
  | "TEXT"
  | "NUMBER"
  | "SELECT"
  | "MULTI_SELECT"
  | "DATE"
  | "EMAIL"
  | "PHONE"
  | "BOOLEAN"
  | "TEXTAREA";

// Mirrors the backend's RuleOperator enum (reused for Question
// dependsOnOperator, same as Rule.operator).
export type RuleOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN"
  | "LESS_THAN_OR_EQUAL"
  | "IN_LIST"
  | "NOT_IN_LIST"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "IS_TRUE"
  | "IS_FALSE"
  | "IS_EMPTY"
  | "IS_NOT_EMPTY";
// NOTE: BETWEEN is deliberately excluded here — it needs a
// secondaryValue field (like Rule has) that Question doesn't have
// yet. Add it back once that schema gap is closed.

const OPERATOR_LABELS: Record<RuleOperator, string> = {
  EQUALS: "Equals",
  NOT_EQUALS: "Does Not Equal",
  GREATER_THAN: "Greater Than",
  GREATER_THAN_OR_EQUAL: "Greater Than or Equal",
  LESS_THAN: "Less Than",
  LESS_THAN_OR_EQUAL: "Less Than or Equal",
  IN_LIST: "In List",
  NOT_IN_LIST: "Not In List",
  CONTAINS: "Contains",
  NOT_CONTAINS: "Does Not Contain",
  IS_TRUE: "Is True",
  IS_FALSE: "Is False",
  IS_EMPTY: "Is Empty",
  IS_NOT_EMPTY: "Is Not Empty",
};

// Operators that don't need a comparison value at all.
const VALUELESS_OPERATORS: RuleOperator[] = [
  "IS_TRUE",
  "IS_FALSE",
  "IS_EMPTY",
  "IS_NOT_EMPTY",
];
// Operators that can take more than one value (stored as a JSON array string).
const MULTI_VALUE_OPERATORS: RuleOperator[] = ["IN_LIST", "NOT_IN_LIST"];

// NEW: mirrors the backend's QuestionGroup model. A group is a
// section of questions (e.g. "Work Experience") that can optionally
// repeat on the answer side ("Add another experience").
export interface QuestionGroupOption {
  id: string;
  groupKey: string;
  title: string;
  isRepeatable: boolean;
}

export interface Question {
  id: number; // local id, used for React state/keys only
  questionId: string;
  inputType: InputType;
  questionText: string;
  order?: number;
  isOptional?: boolean;
  answerOptions?: string[];
  // NEW: mirrors backend's Question.isCountry. When true on a
  // SELECT/MULTI_SELECT question, the frontend renders the static
  // ~200-country list instead of `answerOptions`. Mutually
  // exclusive with answerOptions — enforced both here (UI) and on
  // the backend (createNewQuestion).
  isCountry?: boolean;
  _realId?: string | number; // set once this question is actually saved in the DB
  questionType: QuestionType;

  // NEW: which repeatable section (QuestionGroup) this question
  // belongs to, if any. Always a real, already-saved group id —
  // groups are created immediately via Swal, not deferred to the
  // bulk question save (see QuestionnaireEditor.handleCreateGroup).
  groupId?: string;

  // ---- Conditional visibility ----
  // Exactly one of these two should be set when a dependency exists:
  // dependsOnQuestionId for an ALREADY-SAVED parent (has a real Mongo id),
  // dependsOnLocalId for a parent that's still unsaved in this editing
  // session (resolved to a real id at save time — see QuestionnaireEditor).
  dependsOnQuestionId?: string;
  dependsOnLocalId?: number;
  dependsOnOperator?: RuleOperator;
  dependsOnValue?: string; // plain value, or JSON-stringified array for IN_LIST/NOT_IN_LIST
}

interface QuestionCardProps {
  question: Question;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updated: Question) => void;
  onDelete: () => void;
  // All questions in the current assessment (saved + unsaved), used
  // to populate the "depends on" dropdown. Excludes nothing by
  // default — filtering (no self-reference, no cycles) happens below.
  allQuestions: Question[];
  // NEW: all repeatable-section groups defined on this assessment so
  // far (saved). Passed down instead of fetched here so there's a
  // single source of truth in the parent.
  groups: QuestionGroupOption[];
  // NEW: opens the "create a new section" modal and, on success,
  // creates the group immediately via the API and returns it so this
  // card can select it right away. Returns null if cancelled/failed.
  onCreateGroup: () => Promise<QuestionGroupOption | null>;
}

const OPTION_BASED_INPUT_TYPES: InputType[] = ["SELECT", "MULTI_SELECT"];
const NEW_GROUP_VALUE = "__new__";

// ---- Shared UI styling (visual-only, no behavior) ----
const fieldLabel =
  "text-xs md:text-sm font-bold text-description uppercase tracking-wider";
const selectClass =
  "w-full px-4 appearance-none rounded-lg border border-[#e2e2ea] py-3 text-sm md:text-base bg-white text-description focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow";
const panelClass = "rounded-xl border border-[#e9e9ef] bg-white p-5";

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "_");
}

export default function QuestionCard({
  question,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  allQuestions,
  groups,
  onCreateGroup,
}: QuestionCardProps) {
  const handleAddOption = () => {
    const opts = question.answerOptions || [];
    onUpdate({ ...question, answerOptions: [...opts, ""] });
  };

  const handleRemoveOption = (optIndex: number) => {
    const opts = question.answerOptions || [];
    const newOpts = opts.filter((_, i) => i !== optIndex);
    onUpdate({ ...question, answerOptions: newOpts });
  };

  const handleOptionChange = (optIndex: number, val: string) => {
    const opts = question.answerOptions || [];
    const newOpts = [...opts];
    newOpts[optIndex] = val;
    onUpdate({ ...question, answerOptions: newOpts });
  };

  // Toggling the country-list shortcut on/off. Mutually exclusive
  // with custom answerOptions — checking it clears any options
  // already entered, matching the backend's validation
  // ("Provide either options or isCountry, not both").
  const handleIsCountryToggle = (checked: boolean) => {
    onUpdate({
      ...question,
      isCountry: checked,
      answerOptions: checked ? undefined : question.answerOptions,
    });
  };

  const selectedGroup = groups.find((g) => g.id === question.groupId);

  // NEW: assigning/clearing a question's repeatable section.
  const handleGroupChange = async (value: string) => {
    if (value === "") {
      onUpdate({ ...question, groupId: undefined });
      return;
    }

    if (value === NEW_GROUP_VALUE) {
      const created = await onCreateGroup();
      if (!created) return; // cancelled or failed — leave selection as-is

      // If the current dependency's parent is no longer valid under
      // the new group (different group, and neither is ungrouped),
      // clear it rather than silently save an invalid combination.
      const parent = allQuestions.find(
        (q) =>
          (question.dependsOnLocalId !== undefined &&
            q.id === question.dependsOnLocalId) ||
          (question.dependsOnQuestionId !== undefined &&
            q._realId === question.dependsOnQuestionId),
      );
      const parentStillValid =
        !parent || !parent.groupId || parent.groupId === created.id;

      onUpdate({
        ...question,
        groupId: created.id,
        ...(parentStillValid
          ? {}
          : {
              dependsOnQuestionId: undefined,
              dependsOnLocalId: undefined,
              dependsOnOperator: undefined,
              dependsOnValue: undefined,
            }),
      });
      return;
    }

    const parent = allQuestions.find(
      (q) =>
        (question.dependsOnLocalId !== undefined &&
          q.id === question.dependsOnLocalId) ||
        (question.dependsOnQuestionId !== undefined &&
          q._realId === question.dependsOnQuestionId),
    );
    const parentStillValid =
      !parent || !parent.groupId || parent.groupId === value;

    onUpdate({
      ...question,
      groupId: value,
      ...(parentStillValid
        ? {}
        : {
            dependsOnQuestionId: undefined,
            dependsOnLocalId: undefined,
            dependsOnOperator: undefined,
            dependsOnValue: undefined,
          }),
    });
  };

  // Candidate parent questions: everyone except this one, and — if
  // this question belongs to a repeatable section — only questions
  // in the SAME section or with no section at all. Mirrors the
  // backend's createNewQuestion guard (a grouped dependency can't
  // point across sections, since it'd be ambiguous which instance's
  // answer to compare against).
  const candidateParents = allQuestions.filter((q) => {
    if (q.id === question.id) return false;
    if (question.groupId) {
      return !q.groupId || q.groupId === question.groupId;
    }
    return true;
  });

  const selectedParent = candidateParents.find(
    (q) =>
      (question.dependsOnLocalId !== undefined &&
        q.id === question.dependsOnLocalId) ||
      (question.dependsOnQuestionId !== undefined &&
        q._realId === question.dependsOnQuestionId),
  );

  const handleParentChange = (localId: string) => {
    if (!localId) {
      // Cleared — remove the whole dependency
      onUpdate({
        ...question,
        dependsOnLocalId: undefined,
        dependsOnQuestionId: undefined,
        dependsOnOperator: undefined,
        dependsOnValue: undefined,
      });
      return;
    }

    const parent = candidateParents.find((q) => q.id === Number(localId));
    if (!parent) return;

    onUpdate({
      ...question,
      dependsOnLocalId: parent._realId ? undefined : parent.id,
      dependsOnQuestionId: parent._realId ? String(parent._realId) : undefined,
      // Reset operator/value when the parent changes — a value valid
      // for the old parent's options is meaningless for a new parent.
      dependsOnOperator: undefined,
      dependsOnValue: undefined,
    });
  };

  const handleOperatorChange = (operator: RuleOperator | "") => {
    onUpdate({
      ...question,
      dependsOnOperator: operator || undefined,
      dependsOnValue: undefined, // reset value when operator changes
    });
  };

  const handleSingleValueChange = (value: string) => {
    onUpdate({ ...question, dependsOnValue: value });
  };

  const handleMultiValueToggle = (optionValue: string) => {
    const current: string[] = question.dependsOnValue
      ? JSON.parse(question.dependsOnValue)
      : [];
    const next = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    onUpdate({ ...question, dependsOnValue: JSON.stringify(next) });
  };

  const showValueInput =
    question.dependsOnOperator &&
    !VALUELESS_OPERATORS.includes(question.dependsOnOperator);
  const isMultiValue =
    question.dependsOnOperator &&
    MULTI_VALUE_OPERATORS.includes(question.dependsOnOperator);
  // A country-list parent has no local answerOptions to pick from,
  // so it falls through to the free-form text input below (the
  // user types the country name as the comparison value).
  const parentHasOptions =
    selectedParent &&
    OPTION_BASED_INPUT_TYPES.includes(selectedParent.inputType) &&
    !selectedParent.isCountry &&
    selectedParent.answerOptions?.length;
  const parentIsBoolean = selectedParent?.inputType === "BOOLEAN";

  return (
    <div>
      <div className="border border-[#e9e9ef] rounded-xl bg-white mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 bg-white">
          <div className="flex items-center flex-1 min-w-0">
            <button className="text-[#c4c4d0] hover:text-description cursor-grab shrink-0">
              <GripVertical className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-full bg-[#e6fcf0] text-primary flex items-center justify-center text-sm font-bold mx-3 shrink-0">
              {index + 1}
            </div>
            <p className="text-base md:text-lg text-description font-medium truncate">
              {question.questionText || "New Question"}
            </p>
            <div className="flex items-center gap-2 ml-3 shrink-0">
              {(question.dependsOnLocalId !== undefined ||
                question.dependsOnQuestionId) && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f0f4ff] text-primary">
                  <Link2 className="w-3 h-3" />
                  Conditional
                </span>
              )}
              {question.isCountry && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#fff4e6] text-[#b76e00]">
                  Country List
                </span>
              )}
              {selectedGroup && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f3f0ff] text-[#6f42c1]">
                  {selectedGroup.isRepeatable && <Repeat className="w-3 h-3" />}
                  {selectedGroup.title}
                </span>
              )}
              {question.isOptional && (
                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f4f4f6] text-[#8a8a99]">
                  Optional
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggle}
              className="text-[#a0a0b0] hover:text-description hover:bg-[#f4f4f6] rounded-md transition-colors p-1.5"
              title={isExpanded ? "Collapse question" : "Expand question"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-[#ff6164] hover:bg-[#fff1f1] rounded-md transition-colors p-1.5"
              title="Delete question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Body */}
        {isExpanded && (
          <div className="p-6 bg-[#fbfbfc] border-t border-[#e9e9ef] flex flex-col gap-6">
            {/* Row 1: Question ID & Input Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className={fieldLabel}>Question ID</label>
                <InputField
                  type="text"
                  value={question.questionId}
                  onChange={(e) =>
                    onUpdate({ ...question, questionId: e.target.value })
                  }
                  placeholder="Enter Question ID"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className={fieldLabel}>Input Type</label>
                <div className="relative">
                  <select
                    value={question.inputType}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        inputType: e.target.value as InputType,
                        // Switching away from a selectable type invalidates
                        // both options and the country-list shortcut.
                        ...(!OPTION_BASED_INPUT_TYPES.includes(
                          e.target.value as InputType,
                        )
                          ? { answerOptions: undefined, isCountry: false }
                          : {}),
                      })
                    }
                    className={selectClass}
                  >
                    <option value="TEXT">Typing</option>
                    <option value="SELECT">Select</option>
                    <option value="MULTI_SELECT">Multi Select</option>
                    <option value="NUMBER">Number</option>
                    <option value="DATE">Date</option>
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Phone</option>
                    <option value="BOOLEAN">Boolean</option>
                    <option value="TEXTAREA">Textarea</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Question Text */}
            <div className="flex flex-col gap-2">
              <label className={fieldLabel}>Question Text</label>
              <InputField
                type="text"
                value={question.questionText}
                onChange={(e) =>
                  onUpdate({ ...question, questionText: e.target.value })
                }
                placeholder="Enter question text..."
              />
            </div>

            {/* Row 3: Answer Options (if Select or Multi Select) */}
            {OPTION_BASED_INPUT_TYPES.includes(question.inputType) && (
              <div className={panelClass}>
                <label className={`${fieldLabel} block mb-3`}>
                  Answer Options
                </label>

                {/* Country-list shortcut — mutually exclusive with
                    custom options below, per backend validation. */}
                <label className="flex items-center gap-2 cursor-pointer w-fit select-none mb-4">
                  <input
                    type="checkbox"
                    checked={!!question.isCountry}
                    onChange={(e) => handleIsCountryToggle(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-description">
                    Use standard country list (~200 countries) instead of custom
                    options
                  </span>
                </label>

                {question.isCountry ? (
                  <p className="text-sm text-[#a0a0b0] italic bg-[#fafafb] border border-dashed border-[#e2e2ea] rounded-lg px-4 py-3">
                    This question will render the standard country list on the
                    frontend — no custom options needed.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      {(question.answerOptions || []).map((opt, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 w-full bg-white border border-[#e9e9ef] rounded-lg h-11 px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-shadow"
                        >
                          <span className="text-[#a0a0b0] text-sm font-medium w-4 shrink-0">
                            {i + 1}.
                          </span>
                          <input
                            type="text"
                            value={opt}
                            placeholder="Enter option..."
                            onChange={(e) =>
                              handleOptionChange(i, e.target.value)
                            }
                            className="flex-1 bg-transparent text-sm md:text-base focus:outline-none text-description"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(i)}
                            className="text-[#c4c4d0] hover:text-[#ff6164] transition-colors p-1 shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(question.answerOptions || []).length === 0 && (
                        <p className="text-sm text-[#a0a0b0] italic px-1">
                          No options added yet.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="flex items-center gap-1.5 text-primary font-semibold text-sm mt-3 hover:opacity-80 transition-opacity w-fit"
                    >
                      <Plus className="w-4 h-4" />
                      Add Option
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Row 4: Question Type & Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className={fieldLabel}>Question Type</label>
                <div className="relative">
                  <select
                    value={question.questionType}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        questionType: e.target.value as QuestionType,
                      })
                    }
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select Question Type
                    </option>
                    {QUESTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className={fieldLabel}>Order</label>
                <InputField
                  type="number"
                  value={question.order ?? 0}
                  onChange={(e) =>
                    onUpdate({ ...question, order: Number(e.target.value) })
                  }
                  placeholder="Order number"
                />
              </div>
            </div>

            {/* Row 5: Optional Toggle */}
            <div className="flex items-center justify-between border border-[#e9e9ef] rounded-lg px-4 py-3 bg-white">
              <div>
                <p className="text-sm font-semibold text-description">
                  Optional
                </p>
                <p className="text-xs text-[#a0a0b0] mt-0.5">
                  Users can skip this question.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={question.isOptional ?? false}
                onClick={() =>
                  onUpdate({
                    ...question,
                    isOptional: !(question.isOptional ?? false),
                  })
                }
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
                  question.isOptional ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    question.isOptional ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* ---- Repeatable Section (NEW) ---- */}
            <div className={panelClass}>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-[#6f42c1]" />
                <label className={fieldLabel}>Repeatable Section</label>
                <span className="text-xs text-[#a0a0b0] font-normal normal-case">
                  (optional)
                </span>
              </div>
              <p className="text-sm text-[#a0a0b0] mb-3">
                Group this with other questions (e.g. Company, Title, Start
                Date) so the whole set can repeat — like &quot;Add another
                experience&quot;.
              </p>
              <div className="relative">
                <select
                  value={question.groupId ?? ""}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Not part of a section</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                      {g.isRepeatable ? " (repeatable)" : ""}
                    </option>
                  ))}
                  <option value={NEW_GROUP_VALUE}>
                    + Create new section...
                  </option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
              </div>
            </div>

            {/* ---- Conditional Visibility ---- */}
            <div className={panelClass}>
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-4 h-4 text-primary" />
                <label className={fieldLabel}>Conditional Visibility</label>
                <span className="text-xs text-[#a0a0b0] font-normal normal-case">
                  (optional)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#a0a0b0] uppercase tracking-wide">
                    Only show if this question...
                  </label>
                  <div className="relative">
                    <select
                      value={selectedParent?.id ?? ""}
                      onChange={(e) => handleParentChange(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">No dependency — always show</option>
                      {candidateParents.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.questionText || `Question ${q.id}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
                  </div>
                </div>

                {selectedParent && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#a0a0b0] uppercase tracking-wide">
                      ...answers with
                    </label>
                    <div className="relative">
                      <select
                        value={question.dependsOnOperator || ""}
                        onChange={(e) =>
                          handleOperatorChange(
                            e.target.value as RuleOperator | "",
                          )
                        }
                        className={selectClass}
                      >
                        <option value="" disabled>
                          Select condition
                        </option>
                        {(Object.keys(OPERATOR_LABELS) as RuleOperator[]).map(
                          (op) => (
                            <option key={op} value={op}>
                              {OPERATOR_LABELS[op]}
                            </option>
                          ),
                        )}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {selectedParent && showValueInput && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-dashed border-[#e2e2ea]">
                  <label className="text-xs font-semibold text-[#a0a0b0] uppercase tracking-wide">
                    Value
                  </label>

                  {/* Parent has fixed options (SELECT/MULTI_SELECT) — pick from them */}
                  {parentHasOptions && !isMultiValue && (
                    <div className="relative">
                      <select
                        value={question.dependsOnValue || ""}
                        onChange={(e) =>
                          handleSingleValueChange(e.target.value)
                        }
                        className={selectClass}
                      >
                        <option value="" disabled>
                          Select value
                        </option>
                        {selectedParent!.answerOptions!.map((opt) => (
                          <option key={opt} value={slugify(opt)}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
                    </div>
                  )}

                  {/* Parent has fixed options AND operator is IN_LIST/NOT_IN_LIST — multi-pick */}
                  {parentHasOptions && isMultiValue && (
                    <div className="flex flex-wrap gap-2">
                      {selectedParent!.answerOptions!.map((opt) => {
                        const slug = slugify(opt);
                        const selected: string[] = question.dependsOnValue
                          ? JSON.parse(question.dependsOnValue)
                          : [];
                        const isChecked = selected.includes(slug);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleMultiValueToggle(slug)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              isChecked
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-description border-[#e2e2ea] hover:border-primary/50"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Parent is BOOLEAN — Yes/No dropdown */}
                  {parentIsBoolean && (
                    <div className="relative">
                      <select
                        value={question.dependsOnValue || ""}
                        onChange={(e) =>
                          handleSingleValueChange(e.target.value)
                        }
                        className={selectClass}
                      >
                        <option value="" disabled>
                          Select value
                        </option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
                    </div>
                  )}

                  {/* Parent is free-form (TEXT/NUMBER/DATE/EMAIL/PHONE),
                      or a country-list parent (no local options to pick from) — plain input */}
                  {!parentHasOptions && !parentIsBoolean && (
                    <InputField
                      type={
                        selectedParent!.inputType === "NUMBER"
                          ? "number"
                          : "text"
                      }
                      value={question.dependsOnValue || ""}
                      onChange={(e) => handleSingleValueChange(e.target.value)}
                      placeholder={
                        selectedParent!.isCountry
                          ? "Enter country name..."
                          : "Enter comparison value..."
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
