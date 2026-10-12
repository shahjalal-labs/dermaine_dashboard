import React from "react";
import OrganizationOverview from "@/components/organization/Dashboard/OrganizationOverview";

export const metadata = {
  title: "Organization Dashboard | Overview",
  description: "Overview of assessments, reports, consultations, and activities.",
};

export default function OrganizationDashboardPage() {
  return <OrganizationOverview />;
}
