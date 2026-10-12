"use client";

import { AdminTab } from "@/components/dashboard/SuperAdmin/PlatformAdministration/AdminTab";
import { OrganizationsTab } from "@/components/dashboard/SuperAdmin/PlatformAdministration/OrganizationsTab";
import { RolesPermissionsTab } from "@/components/dashboard/SuperAdmin/PlatformAdministration/RolesPermissionsTab";
import { SubscriptionPlansTab } from "@/components/dashboard/SuperAdmin/PlatformAdministration/SubscriptionPlansTab";
import { RevenueDashboardTab } from "@/components/dashboard/SuperAdmin/PlatformAdministration/RevenueDashboardTab";
import { CountriesTab } from "@/components/dashboard/SuperAdmin/PlatformAdministration/CountriesTab";
import { ProgramLibrariesTab } from "@/components/dashboard/SuperAdmin/PlatformAdministration/ProgramLibrariesTab";
import { ScoringModelsTab } from "@/components/dashboard/SuperAdmin/PlatformAdministration/ScoringModelsTab";
import { AuditLogsTab } from "@/components/dashboard/SuperAdmin/PlatformAdministration/AuditLogsTab";
import {
  PlatformTabs,
  Tab,
} from "@/components/dashboard/SuperAdmin/PlatformAdministration/PlatformTabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PlatformAdministrationContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabQuery = searchParams.get("tab") as Tab | null;
  const activeTab = tabQuery || "Admin";

  const handleSetTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-full space-y-5">
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-title tracking-tight">
            Platform Administration
          </h2>
          <p className="text-xs md:text-sm text-[#8c8c9e]">
            Super Admin only - multi-tenant SaaS management
          </p>
        </div>

        <div className="bg-[#fde8e8] text-[#ff4d4f] px-4 py-1.5 rounded-xl text-xs md:text-sm font-semibold shadow-xs">
          Super Admin
        </div>
      </div>

      <PlatformTabs activeTab={activeTab} setActiveTab={handleSetTab} />

      <div className="flex-1">
        {activeTab === "Admin" && <AdminTab />}
        {activeTab === "Organizations" && <OrganizationsTab />}
        {activeTab === "Roles & Permissions" && <RolesPermissionsTab />}
        {activeTab === "Subscription Plans" && <SubscriptionPlansTab />}
        {activeTab === "Revenue Dashboard" && <RevenueDashboardTab />}
        {activeTab === "Countries" && <CountriesTab />}
        {activeTab === "Program Libraries" && <ProgramLibrariesTab />}
        {activeTab === "Scoring Models" && <ScoringModelsTab />}
        {activeTab === "Audit Logs" && <AuditLogsTab />}
      </div>
    </div>
  );
}

export default function PlatformAdministrationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-description">
          Loading platform administration...
        </div>
      }
    >
      <PlatformAdministrationContent />
    </Suspense>
  );
}
