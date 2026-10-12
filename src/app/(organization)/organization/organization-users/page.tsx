import React from "react";
import OrganizationUsersView from "@/components/organization/OrganizationUsers/OrganizationUsersView";

export const metadata = {
  title: "Organization Dashboard | Organization Users",
  description: "Monitor and manage members of your organization.",
};

export default function OrganizationMembersPage() {
  return <OrganizationUsersView />;
}
