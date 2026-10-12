import React from "react";
import AssessmentView from "@/components/organization/Assessment/AssessmentView";

export const metadata = {
  title: "Organization Dashboard | Assessment",
  description: "Monitor candidate assessment submissions, types, scores, and report purchases.",
};

export default function OrganizationAssessmentPage() {
  return <AssessmentView />;
}
