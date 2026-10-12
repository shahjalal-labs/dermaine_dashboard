import React from "react";
import PaymentsView from "@/components/organization/Payments/PaymentsView";

export const metadata = {
  title: "Organization Dashboard | Payments",
  description: "Monitor candidate payment transactions, invoices, product purchases, and filtered revenue.",
};

export default function OrganizationPaymentsPage() {
  return <PaymentsView />;
}
