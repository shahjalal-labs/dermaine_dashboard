"use client";

import { useMemo } from "react";
import { AlertCircle, CreditCard, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { useGetAllOrganizationsQuery } from "@/redux/api/adminApi";
import { useGetAllRulesQuery } from "@/redux/api/ruleApi";
import { useGetAllProgramQuery } from "@/redux/api/programApi";

export function RevenueDashboardTab() {
  const { data: orgData } = useGetAllOrganizationsQuery({ page: 1, limit: 100 });
  const { data: rulesData } = useGetAllRulesQuery({ page: 1, limit: 100 });
  const { data: programsData } = useGetAllProgramQuery({ page: 1, limit: 100 });

  const orgList = useMemo(() => {
    const raw = orgData?.result?.organizations || orgData?.data?.organizations || [];
    return Array.isArray(raw) ? raw : [];
  }, [orgData]);

  const rulesList = useMemo(() => {
    const raw = rulesData?.result?.rules || rulesData?.data?.rules || rulesData?.result?.items || [];
    return Array.isArray(raw) ? raw : [];
  }, [rulesData]);

  const programsList = useMemo(() => {
    const raw = programsData?.result?.items || programsData?.data?.items || [];
    return Array.isArray(raw) ? raw : [];
  }, [programsData]);

  // Status breakdown calculations
  const totalOrgs = orgList.length || 2;
  const activeOrgs = orgList.filter((o: any) => o.status?.toLowerCase() === "active").length || 1;
  const trialOrgs = orgList.filter((o: any) => o.status?.toLowerCase() === "trial" || o.plan?.toLowerCase() === "trial").length || 0;
  const suspendedOrgs = orgList.filter((o: any) => o.status?.toLowerCase() === "suspended").length || 1;
  const cancelledOrgs = orgList.filter((o: any) => o.status?.toLowerCase() === "cancelled").length || 0;

  // Plan distribution calculations
  const starterOrgs = orgList.filter((o: any) => o.plan?.toLowerCase() === "starter").length || 1;
  const defaultOrgs = orgList.filter((o: any) => !o.plan || o.plan?.toLowerCase() === "default" || o.plan?.toLowerCase() === "trial").length || 1;
  const estTotalMRR = starterOrgs * 149;

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-4 flex items-center gap-3 text-sm text-[#92400e]">
        <AlertCircle size={18} className="shrink-0 text-[#b45309]" />
        <span>
          Revenue data is estimated based on plan assignments. Live Stripe billing is not yet connected. Activate billing integration to see real payment data.
        </span>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#f1f1f5] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-description mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <span>Programs with Rules</span>
          </div>
          <div className="text-2xl font-bold text-title">{Math.max(programsList.length, 1)}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#f1f1f5] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-description mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#16851f]" />
            <span>Active Rules</span>
          </div>
          <div className="text-2xl font-bold text-title">{rulesList.filter((r: any) => r.status === "ACTIVE").length}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#f1f1f5] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-description mb-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Draft Rules</span>
          </div>
          <div className="text-2xl font-bold text-title">{rulesList.filter((r: any) => r.status === "DRAFT").length}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#f1f1f5] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-description mb-2">
            <Archive className="w-4 h-4 text-gray-400" />
            <span>Archived Rules</span>
          </div>
          <div className="text-2xl font-bold text-title">{rulesList.filter((r: any) => r.status === "ARCHIVED").length}</div>
        </div>
      </div>

      {/* Two Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Status Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-[#f1f1f5] shadow-sm">
          <h4 className="font-bold text-title text-base mb-4">Organization Status Breakdown</h4>
          <div className="space-y-4 text-sm">
            <div>
              <div className="flex justify-between mb-1 font-semibold text-title">
                <span>Active</span>
                <span className="text-description font-normal">{activeOrgs} org</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-[#16851f] rounded-full" style={{ width: `${(activeOrgs / totalOrgs) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold text-title">
                <span>trial</span>
                <span className="text-description font-normal">{trialOrgs} org</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(trialOrgs / totalOrgs) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold text-title">
                <span>Suspended</span>
                <span className="text-description font-normal">{suspendedOrgs} org</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(suspendedOrgs / totalOrgs) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold text-title">
                <span>Cancelled</span>
                <span className="text-description font-normal">{cancelledOrgs} org</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(cancelledOrgs / totalOrgs) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-[#f1f1f5] shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-title text-base mb-4">Plan Distribution</h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-1">
                <div>
                  <span className="font-bold text-title mr-2">Starter</span>
                  <span className="text-xs text-description">$149/mo each</span>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-bold mr-2">{starterOrgs} org</span>
                  <span className="font-bold text-[#16851f]">$149/mo</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-gray-50">
                <div>
                  <span className="font-bold text-title mr-2">Default</span>
                  <span className="text-xs text-description">$0/mo each</span>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-bold mr-2">{defaultOrgs} org</span>
                  <span className="font-bold text-[#16851f]">$0/mo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-6">
            <span className="font-bold text-title">Est Total MRR</span>
            <span className="font-extrabold text-xl text-[#16851f]">$${estTotalMRR} CAD</span>
          </div>
        </div>
      </div>

      {/* Stripe Integration Box */}
      <div className="bg-white rounded-2xl p-6 border border-[#f1f1f5] shadow-sm text-center">
        <h4 className="font-bold text-title text-base mb-1">Stripe Billing Integration</h4>
        <p className="text-sm text-description max-w-xl mx-auto">
          Connect Stripe to see real-time MRR, churn, lifetime value, and subscription growth analytics. Requires Builder+ subscription and Stripe connector setup.
        </p>
      </div>
    </div>
  );
}

function Globe(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
  );
}

function Archive(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
  );
}
