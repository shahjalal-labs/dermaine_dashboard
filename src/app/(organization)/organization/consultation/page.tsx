import React from "react";
import ConsultationView from "@/components/organization/Consultation/ConsultationView";

export const metadata = {
  title: "Organization Dashboard | Consultation",
  description: "Manage candidate consultation sessions, schedules, statuses, and payments.",
};

export default function OrganizationConsultationPage() {
  return <ConsultationView />;
}
