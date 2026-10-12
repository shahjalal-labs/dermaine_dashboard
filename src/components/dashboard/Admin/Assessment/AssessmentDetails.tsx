"use client";

import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  Globe,
  DollarSign,
  GraduationCap,
  Briefcase,
  Users,
  Building,
  Languages,
  Info,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useGetSingleAssessmentSubmissionQuery } from "@/redux/api/adminApi";

// 9 Steps ordered exactly as in the visual design
const steps = [
  { num: 1, title: "Personal Profile", category: "PERSONAL" },
  { num: 2, title: "Personal Net Worth", category: "NET_WORTH" },
  { num: 3, title: "Education & Training", category: "EDUCATION" },
  { num: 4, title: "Work History", category: "WORK_HISTORY" },
  { num: 5, title: "Dependents", category: "DEPENDENTS" },
  { num: 6, title: "Candian Relatives and Connections", category: "CANADIAN_RELATIVES" },
  { num: 7, title: "Canadian Job Offer", category: "CANADIAN_JOB_OFFER" },
  { num: 8, title: "Language Skills", category: "LANGUAGE" },
  { num: 9, title: "Additional Information", category: "ADDITIONAL_INFORMATION" },
];

interface AssessmentDetailsProps {
  id?: string;
}

// Read-only presentation field for applicant's submitted data
function ReadOnlyField({
  label,
  value,
  fullWidth = false,
  isTags = false,
  icon: Icon,
}: {
  label: string;
  value?: any;
  fullWidth?: boolean;
  isTags?: boolean;
  icon?: any;
}) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    value !== "" &&
    (!Array.isArray(value) || value.length > 0);

  const displayTags = useMemo(() => {
    if (!hasValue) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.includes(",")) {
      return value.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [String(value)];
  }, [value, hasValue]);

  return (
    <div className={`space-y-2 ${fullWidth ? "md:col-span-2" : ""}`}>
      <label className="block text-base md:text-lg font-semibold text-title">
        {label}
      </label>
      <div className="w-full min-h-[50px] px-4 py-3 rounded-xl border border-[#e9e9ef] bg-[#fdfdfd] text-base md:text-lg text-title font-medium flex items-center justify-between shadow-xs">
        {isTags && hasValue ? (
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#e8f7ee] text-[#16851f] text-sm font-semibold border border-[#bcebd0]"
              >
                <Check className="w-3.5 h-3.5" />
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <span
            className={`break-words ${
              hasValue ? "text-title font-medium" : "text-[#a0a0b0] font-normal italic"
            }`}
          >
            {hasValue ? String(value) : "— Not Provided —"}
          </span>
        )}
        {Icon && <Icon className="w-4 h-4 text-[#a0a0b0] shrink-0 ml-3" />}
      </div>
    </div>
  );
}

export default function AssessmentDetails({ id }: AssessmentDetailsProps) {
  const router = useRouter();
  const params = useParams();
  const submissionId = id || (params?.id as string);
  const [currentStep, setCurrentStep] = useState(1);

  const { data, isLoading, isError } = useGetSingleAssessmentSubmissionQuery(submissionId, {
    skip: !submissionId,
  });

  const submission = data?.data || data?.result || data;

  const answers = useMemo(() => {
    return Array.isArray(submission?.answers) ? submission.answers : [];
  }, [submission]);

  // Helper to extract an answer value by search query
  const getAnswer = (searchTerms: string[]) => {
    if (!answers || !answers.length) return "";
    for (const term of searchTerms) {
      const lower = term.toLowerCase();
      const match = answers.find((a: any) => {
        const qText = (a.question?.questionText || "").toLowerCase();
        const qType = (a.question?.questionType || "").toLowerCase();
        return qText.includes(lower) || qType === lower;
      });
      if (match && match.value !== undefined && match.value !== null && match.value !== "") {
        return match.value;
      }
    }
    return "";
  };

  // Helper to get all custom answers that fall into a category
  const getCategoryAnswers = (categoryKeywords: string[], excludeTerms: string[] = []) => {
    if (!answers || !answers.length) return [];
    return answers.filter((a: any) => {
      const qType = (a.question?.questionType || "").toLowerCase();
      const qText = (a.question?.questionText || "").toLowerCase();
      const inCategory = categoryKeywords.some(
        (kw) => qType.includes(kw.toLowerCase()) || qText.includes(kw.toLowerCase())
      );
      if (!inCategory) return false;
      const isExcluded = excludeTerms.some((ex) => qText.includes(ex.toLowerCase()));
      return !isExcluded;
    });
  };

  const handleNext = () => {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/admin/assessment");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background rounded-2xl p-6 h-full font-sans animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-8" />
        <div className="h-28 bg-gray-100 rounded-2xl mb-8" />
        <div className="h-80 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (isError && !submission) {
    return (
      <div className="bg-background rounded-2xl p-8 h-full font-sans text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-title mb-2">Failed to load assessment submission</h2>
        <p className="text-description mb-6">The requested submission could not be retrieved from the server.</p>
        <Link
          href="/admin/assessment"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Assessment List
        </Link>
      </div>
    );
  }

  // STEP CONTENT RENDERER - PURE READ ONLY
  const renderStepContent = () => {
    switch (currentStep) {
      // 1. Personal Profile
      case 1: {
        const fullName = submission?.user?.fullName || getAnswer(["full name", "name"]);
        const nameParts = fullName ? fullName.split(" ") : [];
        const firstName = getAnswer(["first name"]) || nameParts[0] || "";
        const lastName = getAnswer(["last name"]) || nameParts.slice(1).join(" ") || "";
        const email = submission?.user?.email || getAnswer(["email", "email address"]);
        const telephone = getAnswer(["telephone", "phone", "mobile"]);
        const dob = submission?.dob || getAnswer(["date of birth", "dob", "birth"]);
        const gender = getAnswer(["gender", "sex"]);
        const maritalStatus = getAnswer(["marital status", "marital"]);
        const currentCountry = getAnswer(["current country of residence", "country of residence"]);
        const countryCurrentlyLive = getAnswer(["which country do you currently live", "where do you live"]);
        const multipleCitizenship = getAnswer(["multiple citizenship", "dual citizenship"]);
        const allCitizenships = getAnswer(["all citizenships", "citizenship"]);

        const extraQuestions = getCategoryAnswers(["personal"], [
          "first name",
          "last name",
          "email",
          "telephone",
          "phone",
          "date of birth",
          "dob",
          "gender",
          "marital",
          "residence",
          "citizenship",
        ]);

        return (
          <div className="pt-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#111827] mb-8">
              Personal Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ReadOnlyField label="First Name" value={firstName} />
              <ReadOnlyField label="Last Name" value={lastName} />
              <ReadOnlyField label="Email Address" value={email} icon={Mail} />
              <ReadOnlyField label="Telephone Number" value={telephone} icon={Phone} />
              <ReadOnlyField label="Date of Birth" value={dob} icon={Calendar} />
              <ReadOnlyField label="Gender" value={gender} />
              <ReadOnlyField label="Marital Status" value={maritalStatus} fullWidth />
              <ReadOnlyField label="Current Country of Residence" value={currentCountry} />
              <ReadOnlyField label="In which country do you currently live?" value={countryCurrentlyLive || currentCountry} />
              <ReadOnlyField label="Has multiple citizenship" value={multipleCitizenship} />
              <ReadOnlyField label="All citizenships" value={allCitizenships} isTags />
            </div>

            {/* Any extra questions answered under Personal Profile */}
            {extraQuestions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-title mb-4">
                  Additional Submitted Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extraQuestions.map((ans: any) => (
                    <ReadOnlyField
                      key={ans.id}
                      label={ans.question?.questionText || "Question"}
                      value={ans.value}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // 2. Personal Net Worth
      case 2: {
        const currency = getAnswer(["currency"]) || "CAD - Canada Dollar";
        const netWorth = getAnswer(["net worth range", "net worth", "total net worth"]);
        const income = getAnswer(["annual household income", "household income", "income range"]);
        const funds = getAnswer(["support yourself", "funds", "settlement funds", "proof of funds"]);
        const liquidAssets = getAnswer(["liquid", "bank deposits", "cash"]);
        const realEstate = getAnswer(["real estate", "property"]);
        const debts = getAnswer(["debt", "liabilities", "loans"]);

        const extraQuestions = getCategoryAnswers(["net_worth", "financial", "funds"], [
          "currency",
          "net worth",
          "income",
          "support yourself",
          "liquid",
          "real estate",
          "debt",
        ]);

        return (
          <div className="pt-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#111827] mb-8">
              Personal Net Worth
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ReadOnlyField label="Currency" value={currency} />
              <ReadOnlyField label="Net Worth Range" value={netWorth} />
              <ReadOnlyField label="Annual Household Income Range" value={income} fullWidth />
              <ReadOnlyField
                label="What funds will you have to support yourself in Canada?"
                value={funds}
                fullWidth
              />
              <ReadOnlyField label="Liquid Bank Deposits & Assets" value={liquidAssets} />
              <ReadOnlyField label="Real Estate & Property Valuation" value={realEstate} />
              <ReadOnlyField label="Total Debts & Liabilities" value={debts} fullWidth />
            </div>

            {extraQuestions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-title mb-4">
                  Additional Financial Responses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extraQuestions.map((ans: any) => (
                    <ReadOnlyField
                      key={ans.id}
                      label={ans.question?.questionText || "Question"}
                      value={ans.value}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // 3. Education & Training
      case 3: {
        const postSecondary = getAnswer(["post secondary", "completed post secondary"]);
        const qualification = getAnswer(["type of qualification", "qualification", "highest degree", "level of education"]);
        const country = getAnswer(["which country was this qualification", "country of education", "study country"]);
        const fullTime = getAnswer(["full-time program", "full time", "study mode"]);
        const institution = getAnswer(["institution", "university", "college"]);
        const field = getAnswer(["field of study", "major"]);
        const eca = getAnswer(["eca", "credential assessment", "wes"]);

        const extraQuestions = getCategoryAnswers(["education", "training"], [
          "post secondary",
          "qualification",
          "country",
          "full-time",
          "institution",
          "field",
          "eca",
        ]);

        return (
          <div className="pt-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#111827] mb-8">
              Education & Training
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ReadOnlyField
                label="Have you completed any post secondary education?"
                value={postSecondary}
                fullWidth
              />
              <ReadOnlyField label="What type of qualification is this?" value={qualification} />
              <ReadOnlyField label="In which country was this qualification?" value={country} />
              <ReadOnlyField label="Is this a full-time program?" value={fullTime} />
              <ReadOnlyField label="Institution Name" value={institution} />
              <ReadOnlyField label="Field / Major of Study" value={field} />
              <ReadOnlyField label="Educational Credential Assessment (ECA)" value={eca} />
            </div>

            {extraQuestions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-title mb-4">
                  Additional Education Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extraQuestions.map((ans: any) => (
                    <ReadOnlyField
                      key={ans.id}
                      label={ans.question?.questionText || "Question"}
                      value={ans.value}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // 4. Work History
      case 4: {
        const currentlyEmployed = getAnswer(["currently employed", "working in canada"]);
        const occupation = getAnswer(["occupation", "job title", "primary noc"]);
        const nocCode = getAnswer(["noc", "teer", "noc code"]);
        const totalExperience = getAnswer(["years of work experience", "skilled work experience", "total experience"]);
        const canExperience = getAnswer(["canadian work experience", "experience in canada"]);
        const forExperience = getAnswer(["foreign work experience", "experience outside canada"]);
        const hours = getAnswer(["hours per week", "full time"]);

        const extraQuestions = getCategoryAnswers(["work_history", "employment", "experience"], [
          "currently employed",
          "occupation",
          "noc",
          "years of work",
          "canadian work",
          "foreign work",
          "hours",
        ]);

        return (
          <div className="pt-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#111827] mb-8">
              Work History
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ReadOnlyField label="Currently Employed in Canada?" value={currentlyEmployed} />
              <ReadOnlyField label="Primary Job Title / Occupation" value={occupation} />
              <ReadOnlyField label="NOC / TEER Classification" value={nocCode} />
              <ReadOnlyField label="Total Years of Skilled Work Experience" value={totalExperience} />
              <ReadOnlyField label="Canadian Work Experience" value={canExperience} />
              <ReadOnlyField label="Foreign Work Experience" value={forExperience} />
              <ReadOnlyField label="Average Hours Per Week" value={hours} fullWidth />
            </div>

            {extraQuestions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-title mb-4">
                  Additional Work History Responses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extraQuestions.map((ans: any) => (
                    <ReadOnlyField
                      key={ans.id}
                      label={ans.question?.questionText || "Question"}
                      value={ans.value}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // 5. Dependents
      case 5: {
        const accompanyingSpouse = getAnswer(["accompanying spouse", "spouse coming", "partner"]);
        const hasChildren = getAnswer(["dependent children", "children", "dependents"]);
        const numChildren = getAnswer(["number of dependent children", "number of children"]);
        const ages = getAnswer(["age of children", "children ages", "child age"]);
        const prOrCitizen = getAnswer(["dependents canadian citizen", "children citizen"]);

        const extraQuestions = getCategoryAnswers(["dependents", "family"], [
          "accompanying spouse",
          "dependent children",
          "number of dependent",
          "age of children",
          "canadian citizen",
        ]);

        return (
          <div className="pt-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#111827] mb-8">
              Dependents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ReadOnlyField label="Accompanying Spouse / Common-Law Partner" value={accompanyingSpouse} />
              <ReadOnlyField label="Do you have dependent children?" value={hasChildren} />
              <ReadOnlyField label="Number of Dependent Children" value={numChildren} />
              <ReadOnlyField label="Ages of Dependent Children" value={ages} />
              <ReadOnlyField label="Are any dependents Canadian citizens or PR?" value={prOrCitizen} fullWidth />
            </div>

            {extraQuestions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-title mb-4">
                  Additional Dependents Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extraQuestions.map((ans: any) => (
                    <ReadOnlyField
                      key={ans.id}
                      label={ans.question?.questionText || "Question"}
                      value={ans.value}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // 6. Candian Relatives and Connections
      case 6: {
        const hasRelatives = getAnswer(["relatives living in canada", "relative in canada", "family member living in canada"]);
        const relation = getAnswer(["relationship to applicant", "relation", "relative type"]);
        const status = getAnswer(["relative's immigration status", "status of relative", "citizen or permanent resident"]);
        const province = getAnswer(["province where relative", "relative province", "where in canada"]);
        const priorStay = getAnswer(["previously visited", "previously studied", "prior stay", "visited canada"]);

        const extraQuestions = getCategoryAnswers(
          ["canadian_relatives", "family_member_living_in_canada", "one_other_relative"],
          ["relatives living in canada", "relationship", "immigration status", "province", "previously visited"]
        );

        return (
          <div className="pt-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#111827] mb-8">
              Canadian Relatives and Connections
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ReadOnlyField label="Do you have relatives living in Canada?" value={hasRelatives} fullWidth />
              <ReadOnlyField label="Relationship to Applicant" value={relation} />
              <ReadOnlyField label="Relative's Immigration Status" value={status} />
              <ReadOnlyField label="Province / Territory of Residence" value={province} />
              <ReadOnlyField label="Have you previously visited, studied, or worked in Canada?" value={priorStay} />
            </div>

            {extraQuestions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-title mb-4">
                  Submitted Family & Connection Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extraQuestions.map((ans: any) => (
                    <ReadOnlyField
                      key={ans.id}
                      label={ans.question?.questionText || "Question"}
                      value={ans.value}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // 7. Canadian Job Offer
      case 7: {
        const hasJobOffer = getAnswer(["canadian job offer", "job offer in canada", "have a job offer"]);
        const jobType = getAnswer(["type of job", "job offer title", "noc", "dispatcher"]);
        const isPaid = getAnswer(["job be paid", "paid job", "paid"]);
        const hours = getAnswer(["hours per week", "full-time"]);
        const employer = getAnswer(["name of canadian employer", "employer name", "company"]);
        const location = getAnswer(["province of employment", "job location"]);
        const lmia = getAnswer(["supported by lmia", "lmia"]);

        const extraQuestions = getCategoryAnswers(["job_offer", "canadian_job_offer"], [
          "canadian job offer",
          "type of job",
          "paid",
          "hours per week",
          "employer",
          "location",
          "lmia",
        ]);

        return (
          <div className="pt-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#111827] mb-8">
              Canadian Job Offer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ReadOnlyField label="Do you have a Canadian job offer?" value={hasJobOffer} fullWidth />
              <ReadOnlyField label="What type of job is this?" value={jobType} />
              <ReadOnlyField label="Will this job be paid?" value={isPaid} />
              <ReadOnlyField label="Hours per week" value={hours} />
              <ReadOnlyField label="Name of Canadian Employer" value={employer} />
              <ReadOnlyField label="Location / Province of Employment" value={location} />
              <ReadOnlyField label="Is the job offer supported by LMIA?" value={lmia} />
            </div>

            {extraQuestions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-title mb-4">
                  Additional Job Offer Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extraQuestions.map((ans: any) => (
                    <ReadOnlyField
                      key={ans.id}
                      label={ans.question?.questionText || "Question"}
                      value={ans.value}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // 8. Language Skills
      case 8: {
        const firstLang = getAnswer(["first official language", "primary language", "first language"]);
        const testTaken = getAnswer(["test taken", "language test", "ielts", "celpip", "tef"]);
        const listening = getAnswer(["listening score", "listening clb", "listening"]);
        const reading = getAnswer(["reading score", "reading clb", "reading"]);
        const writing = getAnswer(["writing score", "writing clb", "writing"]);
        const speaking = getAnswer(["speaking score", "speaking clb", "speaking"]);
        const secondLang = getAnswer(["second official language", "second language", "french"]);

        const extraQuestions = getCategoryAnswers(["language", "language_skills"], [
          "first official",
          "test taken",
          "listening",
          "reading",
          "writing",
          "speaking",
          "second official",
        ]);

        return (
          <div className="pt-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#111827] mb-8">
              Language Skills
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ReadOnlyField label="First Official Language" value={firstLang} />
              <ReadOnlyField label="Language Test Taken" value={testTaken} />
              <ReadOnlyField label="Listening Score (CLB)" value={listening} />
              <ReadOnlyField label="Reading Score (CLB)" value={reading} />
              <ReadOnlyField label="Writing Score (CLB)" value={writing} />
              <ReadOnlyField label="Speaking Score (CLB)" value={speaking} />
              <ReadOnlyField label="Second Official Language Proficiency" value={secondLang} fullWidth />
            </div>

            {extraQuestions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-title mb-4">
                  Additional Language Responses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extraQuestions.map((ans: any) => (
                    <ReadOnlyField
                      key={ans.id}
                      label={ans.question?.questionText || "Question"}
                      value={ans.value}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // 9. Additional Information
      case 9:
      default: {
        const appliedBefore = getAnswer(["applied for a canadian visa", "previous application", "applied before"]);
        const refused = getAnswer(["refused a visa", "visa refusal", "inadmissible"]);
        const medical = getAnswer(["medical condition", "criminal record", "inadmissibility"]);
        const explanation = getAnswer(["additional comments", "notes", "final explanation", "additional information"]);

        // Show all remaining answers in submission that haven't been shown in previous steps
        const remainingAnswers = answers.filter((a: any) => {
          const type = (a.question?.questionType || "").toLowerCase();
          return !["personal", "net_worth", "education", "work_history", "dependents", "job_offer", "language"].some(
            (k) => type.includes(k)
          );
        });

        return (
          <div className="pt-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#111827] mb-8">
              Additional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ReadOnlyField
                label="Have you ever applied for a Canadian visa, permit, or PR before?"
                value={appliedBefore}
                fullWidth
              />
              <ReadOnlyField
                label="Have you ever been refused a visa or entry to any country?"
                value={refused}
                fullWidth
              />
              <ReadOnlyField
                label="Medical or Criminal Inadmissibility Details"
                value={medical}
                fullWidth
              />
              <ReadOnlyField
                label="Additional Comments or Notes from Applicant"
                value={explanation}
                fullWidth
              />
            </div>

            {remainingAnswers.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-title mb-4">
                  Additional Submitted Questionnaire Answers ({remainingAnswers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {remainingAnswers.map((ans: any) => (
                    <ReadOnlyField
                      key={ans.id}
                      label={ans.question?.questionText || "Question"}
                      value={ans.value}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
    }
  };

  return (
    <div className="bg-background rounded-2xl p-6 h-full font-sans">
      {/* Top Header Link & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Link
          href={"/admin/assessment"}
          className="inline-flex items-center gap-2 text-base md:text-lg font-semibold text-description hover:text-title transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Assessment List
        </Link>

        {submission?.user?.fullName && (
          <div className="flex items-center gap-3 text-xs md:text-sm font-semibold text-description">
            <span className="text-title font-bold">{submission.user.fullName}</span>
            <span>•</span>
            <span>{submission.user.email}</span>
            {submission.status && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[11px]">
                {submission.status}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stepper matching exactly the 2-row layout in screenshot */}
      <div className="mb-12">
        {/* Row 1: Steps 1 through 6 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-2 mb-8">
          {steps.slice(0, 6).map((step) => {
            const isActive = step.num === currentStep;
            const isCompleted = step.num < currentStep;

            return (
              <div
                key={step.num}
                className="flex items-start w-full group cursor-pointer"
                onClick={() => setCurrentStep(step.num)}
              >
                <div className="flex flex-col w-full pr-2">
                  <div className="flex items-center mb-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "border-[#16851f] bg-white"
                          : isCompleted
                          ? "border-[#16851f] bg-[#16851f]"
                          : "border-[#d1d5db] bg-white"
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    {/* Connecting Line */}
                    <div
                      className={`h-[4px] w-full rounded-full ml-3 transition-colors ${
                        isCompleted ? "bg-[#16851f]" : "bg-[#e5e7eb]"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                        isActive || isCompleted ? "text-[#16851f]" : "text-[#1f1f24]"
                      }`}
                    >
                      STEP {step.num}
                    </p>
                    <p
                      className={`text-sm font-bold leading-tight ${
                        isActive ? "text-[#1f1f24]" : "text-description"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2: Steps 7 through 9 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-2">
          {steps.slice(6, 9).map((step) => {
            const isActive = step.num === currentStep;
            const isCompleted = step.num < currentStep;

            return (
              <div
                key={step.num}
                className="flex items-start w-full group cursor-pointer"
                onClick={() => setCurrentStep(step.num)}
              >
                <div className="flex flex-col w-full pr-2">
                  <div className="flex items-center mb-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "border-[#16851f] bg-white"
                          : isCompleted
                          ? "border-[#16851f] bg-[#16851f]"
                          : "border-[#d1d5db] bg-white"
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    {/* Connecting Line */}
                    <div
                      className={`h-[4px] w-full rounded-full ml-3 transition-colors ${
                        isCompleted ? "bg-[#16851f]" : "bg-[#e5e7eb]"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                        isActive || isCompleted ? "text-[#16851f]" : "text-[#1f1f24]"
                      }`}
                    >
                      STEP {step.num}
                    </p>
                    <p
                      className={`text-sm font-bold leading-tight ${
                        isActive ? "text-[#1f1f24]" : "text-description"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Read-Only Content for Current Step */}
      <div className="w-full">
        {renderStepContent()}

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 h-12 px-6 rounded-xl border border-slate-200 text-title text-base font-semibold hover:bg-slate-50 transition-colors"
            >
              &larr; Previous Step
            </button>
          ) : (
            <div />
          )}

          {currentStep < 9 ? (
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-base font-bold transition-colors shadow-sm"
            >
              Continue &rarr;
            </button>
          ) : (
            <Link
              href="/admin/assessment"
              className="flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-base font-bold transition-colors shadow-sm"
            >
              Back to List &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
