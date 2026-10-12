/* eslint-disable react-hooks/exhaustive-deps */
import {
  useAllAssessmentsQuery,
  useAssessmentWiseQuestionQuery,
  useCreateAssessmentMutation,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useCreateQuestionGroupMutation,
  useDeleteQuestionMutation,
} from "@/redux/api/adminApi";
import { Loader, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import QuestionCard, {
  Question,
  QuestionGroupOption,
  QuestionType,
} from "./QuestionCard";

interface AssessmentType {
  id: string;
  name: string;
  questionCount: number;
}

// Fields the backend's createNewQuestion actually accepts — kept in
// one place so the payload builder below can't silently drift from
// what the API expects.
interface CreateQuestionPayload {
  questionId: string;
  questionText: string;
  inputType: string;
  order: number;
  isOptional: boolean;
  questionType: string;
  assesmentId: string;
  options?: { label: string; value: string }[];
  // NEW: mirrors backend's Question.isCountry. Mutually exclusive
  // with `options` — only ever set one of the two, never both.
  isCountry?: boolean;
  // NEW: mirrors backend's Question.groupId — assigns this question
  // to a repeatable section (QuestionGroup), if any.
  groupId?: string;
  dependsOnQuestionId?: string;
  dependsOnOperator?: string;
  dependsOnValue?: string;
}

const OPTION_BASED_INPUT_TYPES = ["SELECT", "MULTI_SELECT"];

export default function QuestionnaireEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const subTabParam = searchParams.get("subtab");
  const activeSubTab = subTabParam || "Assessment";

  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [activeTypeId, setActiveTypeId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groups, setGroups] = useState<QuestionGroupOption[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [originalSnapshots, setOriginalSnapshots] = useState<Map<string | number, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [createQuestionGroup] = useCreateQuestionGroupMutation();
  const { data, isLoading: assessmentsLoading } = useAllAssessmentsQuery({});
  const assessments = data?.result || data?.data;

  const [deleteQuestion] = useDeleteQuestionMutation();
  const [addAssessmentType] = useCreateAssessmentMutation();

  const handleToggleExpand = (id: number) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTabChange = (tabId: string) => {
    setActiveTypeId(tabId);
    setExpandedIds({});
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "Assessment");
    params.set("subtab", tabId);
    router.push(`${pathname}?${params.toString()}`);
  };
  useEffect(() => {
    if (assessments && assessments.length > 0) {
      const formattedAssessments = assessments.map((a: any) => ({
        id: a.id,
        name: a.title,
        questionCount: a._count?.questions || 0,
      }));
      setAssessmentTypes(formattedAssessments);

      setActiveTypeId((prev) => {
        if (
          subTabParam &&
          formattedAssessments.find((t: AssessmentType) => t.id === subTabParam)
        ) {
          return subTabParam;
        }
        if (!formattedAssessments.find((t: AssessmentType) => t.id === prev)) {
          return formattedAssessments[0].id;
        }
        return prev;
      });
    }
  }, [assessments]);

  const activeType = assessmentTypes.find((t) => t.id === activeTypeId);

  const { data: questionsData, isLoading: questionsLoading } =
    useAssessmentWiseQuestionQuery(activeTypeId, { skip: !activeTypeId });

  useEffect(() => {
    const rawQuestions = questionsData?.result || questionsData?.data;
    if (rawQuestions?.questions) {
      const fetchedQuestions = rawQuestions.questions.map(
        (q: any, index: number) => ({
          id: typeof q.id === "string" ? index : q.id,
          _realId: q.id,
          questionId: q.questionId,
          inputType: q.inputType, // pass through as-is — MULTI_SELECT is now a valid backend value too
          questionText: q.questionText,
          questionType: q.questionType,
          isOptional: q.isOptional ?? false,
          order: q.order,
          answerOptions:
            q.options && q.options.length > 0
              ? q.options.map((opt: any) => opt.label)
              : undefined,
          // NEW: pass through the country-list shortcut from the backend.
          isCountry: q.isCountry || undefined,
          // NEW: pass through which repeatable section this question
          // belongs to, if any.
          groupId: q.groupId || undefined,
          // Already-saved questions only ever carry a real
          // dependsOnQuestionId from the backend — never a local id.
          dependsOnQuestionId: q.dependsOnQuestionId || undefined,
          dependsOnOperator: q.dependsOnOperator || undefined,
          dependsOnValue: q.dependsOnValue || undefined,
        }),
      );
      setQuestions(fetchedQuestions);
      const snap = new Map<string | number, string>();
      fetchedQuestions.forEach((q: Question) => {
        if (q._realId) {
          snap.set(q._realId, JSON.stringify(q));
        }
      });
      setOriginalSnapshots(snap);
    } else {
      setQuestions([]);
      setOriginalSnapshots(new Map());
    }

    // NEW: load the sections (QuestionGroups) already defined for this
    // assessment. Assumes the assessment-wise-question endpoint returns
    // `groups` alongside `questions` — add that on the backend if it
    // doesn't yet.
    if (rawQuestions?.groups) {
      setGroups(rawQuestions.groups);
    } else {
      setGroups([]);
    }
  }, [questionsData]);

  const handleUpdateQuestion = (updated: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q)),
    );
  };

  const handleDeleteQuestion = async (id: number) => {
    const questionToDelete = questions.find((q) => q.id === id);
    if (!questionToDelete) return;

    // Any question that depends on this one (locally, unsaved) loses
    // its dependency if the parent gets removed — otherwise it'd
    // silently reference a local id that no longer exists.
    const hasLocalDependents = questions.some(
      (q) => q.dependsOnLocalId === id,
    );
    if (hasLocalDependents) {
      const confirmResult = await Swal.fire({
        title: "This question has dependents",
        text: "Other questions in this form are set to only show based on this one's answer. Deleting it will remove that condition from them.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete anyway",
      });
      if (!confirmResult.isConfirmed) return;
    }

    if (!questionToDelete._realId) {
      setQuestions((prev) =>
        prev
          .filter((q) => q.id !== id)
          .map((q) =>
            q.dependsOnLocalId === id
              ? { ...q, dependsOnLocalId: undefined, dependsOnOperator: undefined, dependsOnValue: undefined }
              : q,
          ),
      );
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteQuestion(questionToDelete._realId);

      setQuestions((prev) =>
        prev
          .filter((q) => q.id !== id)
          .map((q) =>
            q.dependsOnLocalId === id
              ? { ...q, dependsOnLocalId: undefined, dependsOnOperator: undefined, dependsOnValue: undefined }
              : q,
          ),
      );

      Swal.fire({
        title: "Deleted!",
        text: "Question has been deleted successfully.",
        icon: "success",
      });
    } catch (error) {
      console.error("Failed to delete question:", error);

      Swal.fire({
        title: "Error!",
        text: "Failed to delete the question.",
        icon: "error",
      });
    }
  };

  const handleAddQuestion = () => {
    const newId = Math.max(...questions.map((q) => q.id), 0) + 1;
    const newQuestion: Question = {
      id: newId,
      questionId: `question_${Date.now()}`,
      inputType: "TEXT",
      questionText: "",
      order: 0,
      isOptional: false,
      questionType: "PERSONAL" as QuestionType,
    };
    setQuestions([...questions, newQuestion]);
    setExpandedIds((prev) => ({ ...prev, [newId]: true }));
  };

  const handleAddAssessmentType = async () => {
    const { value: title } = await Swal.fire({
      title: "Add New Assessment",
      input: "text",
      inputLabel: "Assessment Title",
      inputPlaceholder: "Enter assessment title",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    if (title) {
      try {
        await addAssessmentType({ title }).unwrap();
        Swal.fire({
          title: "Added!",
          text: "New assessment has been added.",
          icon: "success",
        });
      } catch (error) {
        console.error("Failed to add assessment:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to add assessment.",
          icon: "error",
        });
      }
    }
  };

  // NEW: creates a repeatable section (QuestionGroup) immediately —
  // unlike questions, groups aren't deferred to the bulk save, since
  // a question needs a real groupId the moment it's assigned (so
  // multiple questions in the same editing session can reference the
  // same section reliably).
  const handleCreateGroup = async (): Promise<QuestionGroupOption | null> => {
    const { value: formValues } = await Swal.fire({
      title: "Create Repeatable Section",
      html:
        '<input id="swal-group-title" class="swal2-input" placeholder="Section title, e.g. Work Experience">' +
        '<label style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:14px;">' +
        '<input id="swal-group-repeatable" type="checkbox" checked /> Allow multiple entries (e.g. "Add more experience")' +
        "</label>",
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Create",
      preConfirm: () => {
        const titleInput = document.getElementById(
          "swal-group-title",
        ) as HTMLInputElement | null;
        const repeatableInput = document.getElementById(
          "swal-group-repeatable",
        ) as HTMLInputElement | null;

        const title = titleInput?.value?.trim();
        if (!title) {
          Swal.showValidationMessage("Please enter a section title");
          return;
        }
        return { title, isRepeatable: !!repeatableInput?.checked };
      },
    });

    if (!formValues) return null;

    try {
      const result = await createQuestionGroup({
        assesmentId: activeTypeId,
        groupKey: `${title_to_key(formValues.title)}_${Date.now()}`,
        title: formValues.title,
        isRepeatable: formValues.isRepeatable,
      }).unwrap();



      const newGroup: QuestionGroupOption = {
        id: result?.result?.id,
        groupKey: result?.result?.groupKey,
        title: result?.result?.title,
        isRepeatable: result?.result?.isRepeatable,
      };
      setGroups((prev) => [...prev, newGroup]);
      return newGroup;
    } catch (error) {
      console.error("Failed to create group:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to create the section.",
        icon: "error",
      });
      return null;
    }
  };

  // Orders unsaved questions so a question depending on another
  // unsaved (local) question is always saved AFTER its parent —
  // otherwise dependsOnQuestionId would point at a local id the
  // backend has never heard of. Detects cycles and reports them
  // instead of looping forever.
  function resolveSaveOrder(newQuestions: Question[]): Question[] {
    const byLocalId = new Map(newQuestions.map((q) => [q.id, q]));
    const resolved: Question[] = [];
    const resolvedIds = new Set<number>();
    const remaining = [...newQuestions];

    while (remaining.length > 0) {
      const before = remaining.length;

      for (let i = remaining.length - 1; i >= 0; i--) {
        const q = remaining[i];
        const parentIsLocalAndUnresolved =
          q.dependsOnLocalId !== undefined &&
          byLocalId.has(q.dependsOnLocalId) &&
          !resolvedIds.has(q.dependsOnLocalId);

        if (!parentIsLocalAndUnresolved) {
          resolved.push(q);
          resolvedIds.add(q.id);
          remaining.splice(i, 1);
        }
      }

      if (remaining.length === before) {
        // No progress made — there's a cycle among unsaved questions.
        throw new Error(
          `Circular dependency detected among unsaved questions: ${remaining
            .map((q) => q.questionText || q.questionId)
            .join(", ")}`,
        );
      }
    }

    return resolved;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newQuestions = questions.filter((q) => !q._realId);
      const existingQuestions = questions.filter((q) => !!q._realId);

      // Find which existing questions have actually changed
      const modifiedQuestions = existingQuestions.filter((q) => {
        const originalStr = originalSnapshots.get(q._realId!);
        if (!originalStr) return true;
        return originalStr !== JSON.stringify(q);
      });

      if (newQuestions.length === 0 && modifiedQuestions.length === 0) {
        Swal.fire({
          title: "No Changes",
          text: "No new questions or edits to save.",
          icon: "info",
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }

      // Validation step — a SELECT/MULTI_SELECT question needs either
      // custom options OR the country-list shortcut.
      for (const q of [...newQuestions, ...modifiedQuestions]) {
        if (OPTION_BASED_INPUT_TYPES.includes(q.inputType) && !q.isCountry) {
          const validOptions = (q.answerOptions || []).filter(
            (opt: string) => opt && opt.trim() !== "",
          );
          if (validOptions.length === 0) {
            Swal.fire({
              title: "Validation Error",
              text: `Please add at least one option, or enable the country list, for the question: "${q.questionText || "Question " + (q.id + 1)}"`,
              icon: "warning",
            });
            return;
          }
        }
      }

      let hasError = false;

      // 1. Update modified existing questions
      for (const q of modifiedQuestions) {
        try {
          const payload: any = {
            questionId: q.questionId,
            questionText: q.questionText,
            inputType: q.inputType,
            order:
              q.order !== undefined && q.order !== 0
                ? q.order
                : questions.indexOf(q) + 1,
            questionType: q.questionType,
            isOptional: q.isOptional ?? false,
            isCountry: !!q.isCountry,
          };

          if (OPTION_BASED_INPUT_TYPES.includes(q.inputType)) {
            if (q.isCountry) {
              payload.isCountry = true;
              payload.options = [];
            } else if (q.answerOptions) {
              payload.options = q.answerOptions
                .filter((opt) => opt && opt.trim() !== "")
                .map((opt) => ({
                  label: opt,
                  value: opt.toLowerCase().replace(/\s+/g, "_"),
                }));
            }
          }

          if (q.groupId) {
            payload.groupId = q.groupId;
          }

          if (q.dependsOnQuestionId) {
            payload.dependsOnQuestionId = q.dependsOnQuestionId;
            payload.dependsOnOperator = q.dependsOnOperator;
            payload.dependsOnValue = q.dependsOnValue;
          }

          await updateQuestion({ id: q._realId!, data: payload }).unwrap();
        } catch (err) {
          console.error("Failed to update question:", q._realId, err);
          hasError = true;
        }
      }

      // 2. Create newly added questions
      if (newQuestions.length > 0) {
        let saveOrder: Question[];
        try {
          saveOrder = resolveSaveOrder(newQuestions);
        } catch (err: any) {
          Swal.fire({
            title: "Validation Error",
            text: err.message,
            icon: "warning",
          });
          return;
        }

        const localIdToRealId = new Map<number, string>();

        for (const q of saveOrder) {
          const order =
            q.order !== undefined && q.order !== 0
              ? q.order
              : questions.indexOf(q) + 1;

          const payload: CreateQuestionPayload = {
            questionId: q.questionId,
            questionText: q.questionText,
            inputType: q.inputType,
            order,
            questionType: q.questionType,
            assesmentId: activeTypeId,
            isOptional: q.isOptional ?? false,
          };

          if (OPTION_BASED_INPUT_TYPES.includes(q.inputType)) {
            if (q.isCountry) {
              payload.isCountry = true;
            } else if (q.answerOptions) {
              payload.options = q.answerOptions
                .filter((opt) => opt && opt.trim() !== "")
                .map((opt) => ({
                  label: opt,
                  value: opt.toLowerCase().replace(/\s+/g, "_"),
                }));
            }
          }

          if (q.groupId) {
            payload.groupId = q.groupId;
          }

          if (q.dependsOnQuestionId) {
            payload.dependsOnQuestionId = q.dependsOnQuestionId;
          } else if (q.dependsOnLocalId !== undefined) {
            const resolvedId = localIdToRealId.get(q.dependsOnLocalId);
            if (!resolvedId) {
              console.error(
                `Could not resolve real id for local dependency ${q.dependsOnLocalId} on question "${q.questionText}" — skipping.`,
              );
              hasError = true;
              continue;
            }
            payload.dependsOnQuestionId = resolvedId;
          }

          if (payload.dependsOnQuestionId) {
            payload.dependsOnOperator = q.dependsOnOperator;
            payload.dependsOnValue = q.dependsOnValue;
          }

          try {
            const result = await createQuestion(payload).unwrap();
            if (result?.id || result?.data?.id) {
              localIdToRealId.set(q.id, result.id || result.data.id);
            }
          } catch (error) {
            console.error("Failed to create question:", error);
            hasError = true;
          }
        }
      }

      if (!hasError) {
        Swal.fire({
          title: "Success!",
          text: "Questionnaire changes saved successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        const snap = new Map<string | number, string>();
        questions.forEach((q: Question) => {
          if (q._realId) {
            snap.set(q._realId, JSON.stringify(q));
          }
        });
        setOriginalSnapshots(snap);
      } else {
        Swal.fire({
          title: "Partial Save / Error",
          text: "Some changes could not be saved. Please check the console.",
          icon: "error",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 custom-scrollbar flex-1">
          {assessmentsLoading ? (
            <div className="flex justify-center items-center py-12 text-description w-full">
              <Loader size={40} className="animate-spin" />
            </div>
          ) : (
            assessmentTypes.map((type) => {
              const isActive = type.id === activeTypeId;
              return (
                <div
                  key={type.id}
                  onClick={() => handleTabChange(type.id)}
                  className={`flex items-center gap-2 h-10 px-4 rounded-full cursor-pointer shrink-0 transition-colors border ${isActive
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-[#e9e9ef] text-[#5b616e] hover:border-primary/50"
                    }`}
                >
                  <span className="text-sm font-semibold">{type.name}</span>
                  <div
                    className={`flex items-center justify-center text-base md:text-lg font-bold px-1.5 py-0.5 rounded ${isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#f4f4f6] text-[#a0a0b0]"
                      }`}
                  >
                    {type.questionCount}
                  </div>
                  <button
                    className={`p-0.5 ml-1 transition-opacity hover:opacity-70 ${isActive ? "text-white" : "text-[#a0a0b0]"
                      }`}
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    className={`p-0.5 transition-opacity hover:opacity-70  ${isActive ? "text-white" : "text-[#ff6164]"
                      }`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })
          )}
          <button
            onClick={handleAddAssessmentType}
            className="flex items-center gap-2 h-10 px-5 rounded-full bg-primary text-white text-base md:text-lg font-semibold shrink-0 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Top Save Changes Action Bar (matching screenshot) */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 h-10 px-6 rounded-lg text-white text-base md:text-lg font-medium shrink-0 bg-primary hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
        >
          {isSaving ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* Questions List */}
      <div className="flex flex-col mb-6">
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            isExpanded={!!expandedIds[q.id]}
            onToggle={() => handleToggleExpand(q.id)}
            onUpdate={handleUpdateQuestion}
            onDelete={() => handleDeleteQuestion(q.id)}
            allQuestions={questions}
            groups={groups}
            onCreateGroup={handleCreateGroup}
          />
        ))}
      </div>

      {/* Add New Question Button */}
      <button
        onClick={handleAddQuestion}
        className="w-full flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-dashed border-[#e9e9ef] text-[#a0a0b0] font-semibold text-base hover:border-primary hover:text-primary transition-colors bg-white"
      >
        <Plus className="w-5 h-5" />
        Add Question to {activeType?.name || "Assessment"}
      </button>

      <div className="w-full flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 h-10 px-6 rounded-lg text-white text-base md:text-lg font-medium shrink-0 w-full md:w-auto bg-primary hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
        >
          {isSaving ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}

// Slugifies a section title into a groupKey base — timestamp gets
// appended at the call site to keep it unique even if two sections
// share a title.
function title_to_key(title: string) {
  return title.toLowerCase().trim().replace(/\s+/g, "_");
}