import React from "react";
import ReportsView from "@/components/organization/Reports/ReportsView";

export const metadata = {
  title: "Organization Dashboard | Reports",
  description: "View and filter organization candidate reports, overall scores, and matched programs.",
};

export default function OrganizationReportsPage() {
  return <ReportsView />;
}
