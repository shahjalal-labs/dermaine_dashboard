import React from "react";
import UsersView from "@/components/organization/Users/UsersView";

export const metadata = {
  title: "Organization Dashboard | Users",
  description: "Manage and invite users in your organization.",
};

export default function OrganizationUsersPage() {
  return <UsersView />;
}
