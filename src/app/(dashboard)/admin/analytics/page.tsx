"use client";

import React, { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AnalyticsTabs, Tab } from "@/components/dashboard/Admin/Analytics/AnalyticsTabs";
import { OverviewTab } from "@/components/dashboard/Admin/Analytics/OverviewTab";
import { LeadsTab } from "@/components/dashboard/Admin/Analytics/LeadsTab";

import { FunnelTab } from "@/components/dashboard/Admin/Analytics/FunnelTab";
import { RevenueTab } from "@/components/dashboard/Admin/Analytics/RevenueTab";
import { PathwaysTab } from "@/components/dashboard/Admin/Analytics/PathwaysTab";
import { EmailTab } from "@/components/dashboard/Admin/Analytics/EmailTab";
import { ConsultationsTab } from "@/components/dashboard/Admin/Analytics/ConsultationsTab";
import { ExportsTab } from "@/components/dashboard/Admin/Analytics/ExportsTab";

function AnalyticsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabQuery = searchParams.get("tab") as Tab | null;
  const activeTab = tabQuery || "Overview";

  const handleSetTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-full pb-16 space-y-6">
      <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#111827]">
        Business Intelligence
      </h1>

      <AnalyticsTabs activeTab={activeTab} setActiveTab={handleSetTab} />

      <div className="flex-1">
        {activeTab === "Overview" && <OverviewTab />}
        {activeTab === "Leads" && <LeadsTab />}
        {activeTab === "Funnel" && <FunnelTab />}
        {activeTab === "Revenue" && <RevenueTab />}
        {activeTab === "Pathways" && <PathwaysTab />}
        {activeTab === "Email" && <EmailTab />}
        {activeTab === "Consultations" && <ConsultationsTab />}
        {activeTab === "Exports" && <ExportsTab />}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading analytics...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
