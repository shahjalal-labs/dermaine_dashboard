import React from "react";
import PlaceholderPage from "@/components/organization/Shared/PlaceholderPage";

interface Props {
  params: Promise<{ slug: string }>;
}

const MODULE_META: Record<
  string,
  { heading: string; title: string; description: string }
> = {
  templates: {
    heading: "Email & Report Templates",
    title: "Email & Report Templates",
    description:
      "Template management for emails and reports Will be available in a future update.",
  },
  programs: {
    heading: "Programs",
    title: "Programs Management",
    description:
      "Program and eligibility criteria management will be available in a future update.",
  },
  branding: {
    heading: "Branding",
    title: "Organization Branding",
    description:
      "Custom branding, logo customization, and theme settings will be available in a future update.",
  },
  analytics: {
    heading: "Analytics",
    title: "Analytics & Insights",
    description:
      "Comprehensive analytics and detailed performance metrics will be available in a future update.",
  },
  billing: {
    heading: "Billing",
    title: "Billing & Subscription",
    description:
      "Subscription plans, invoices, and billing settings will be available in a future update.",
  },
  settings: {
    heading: "Settings",
    title: "Organization Settings",
    description:
      "Security preferences, team roles, and organization configurations will be available in a future update.",
  },
};

export default async function DynamicOrganizationModulePage({ params }: Props) {
  const { slug } = await params;
  const meta = MODULE_META[slug] || {
    heading: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    title: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    description: `${slug.charAt(0).toUpperCase() + slug.slice(1)} management will be available in a future update.`,
  };

  return (
    <PlaceholderPage
      heading={meta.heading}
      title={meta.title}
      description={meta.description}
    />
  );
}
