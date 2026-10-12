import React from "react";
import ApplicantsView from "@/components/organization/Applicants/ApplicantsView";

export const metadata = {
  title: "Organization Dashboard | Applicants",
  description: "Monitor user applications, assessments, and statuses submitted to admin.",
};

export default function OrganizationApplicantsPage() {
  return <ApplicantsView />;
}
