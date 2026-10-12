import React from "react";
import OrganizationSettingsView from "@/components/organization/Settings/OrganizationSettingsView";

export const metadata = {
  title: "Organization Dashboard | Setting",
  description: "Configure profile information and account password settings.",
};

export default function OrganizationSettingsPage() {
  return <OrganizationSettingsView />;
}
