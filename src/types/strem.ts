export enum StreamStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  PAUSED = "PAUSED",
  ARCHIVED = "ARCHIVED",
  SUSPENDED = "SUSPENDED",
  CLOSED = "CLOSED",
}

export enum StreamVisibility {
  PUBLIC = "PUBLIC",
  INTERNAL = "INTERNAL",
  HIDDEN = "HIDDEN",
  PREMIUM_ONLY = "PREMIUM_ONLY",
  FREE_PREVIEW_ONLY = "FREE_PREVIEW_ONLY",
}

export enum AssessmentType {
  APPLY_FOR_PERMANENT_RESIDENCE = "APPLY_FOR_PERMANENT_RESIDENCE",
  STUDY_IN_CANADA = "STUDY_IN_CANADA",
  WORK_IN_CANADA = "WORK_IN_CANADA",
  JOIN_FAMILY_IN_CANADA = "JOIN_FAMILY_IN_CANADA",
}

export interface IStrem {
  id: string;
  programId: string;
  name: string;
  province: string;
  category: string;
  status: StreamStatus;
  priorityRanking: number;
  assessmentTypes: AssessmentType[];

  description: string;
  publicSummary: string;
  internalNotes: string;
  processingTime: string;

  streamVisibility: StreamVisibility;
  isPremiumOnly: boolean;
  showInFreeResults: boolean;
  isArchived: boolean;
  isDisabled: boolean;

  languageRequirementSummary: string;
  educationRequirementSummary: string;
  workExperienceRequirementSummary: string;
  jobOfferRequirementSummary: string;
  settlementFundsSummary: string;
  provinceConnectionSummary: string;
  familyRelationshipRequirement: string;
  crsRequirementSummary: string;

  effectiveStartDate: string;
  effectiveEndDate: string;
  lastReviewedDate: string;
  versionNumber: number;
}
