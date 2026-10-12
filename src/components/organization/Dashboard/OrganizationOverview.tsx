"use client";

import React from "react";
import Link from "next/link";
import {
  Globe,
  CheckCircle2,
  FileEdit,
  DollarSign,
  FileText,
  BarChart2,
  Calendar,
  Users,
  LineChart,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useGetOrganizationOverviewQuery } from "@/redux/api/organizationApi";
import { useGetMyProfileQuery } from "@/redux/api/userApi";

const DEFAULT_ACTIVITIES = [
  {
    title: "Assessment Permanent Residence",
    date: "6/3/2026",
    status: "COMPLETED",
  },
  {
    title: "Assessment Permanent Residence",
    date: "6/23/2026",
    status: "COMPLETED",
  },
  {
    title: "Assessment Permanent Residence",
    date: "6/23/2026",
    status: "COMPLETED",
  },
  {
    title: "Report Generated",
    date: "6/23/2026",
    status: "COMPLETED",
  },
  {
    title: "Report Generated",
    date: "6/23/2026",
    status: "COMPLETED",
  },
];

export default function OrganizationOverview() {
  const { data: overviewResponse, isLoading } = useGetOrganizationOverviewQuery(undefined);
  const { data: profileResponse } = useGetMyProfileQuery(undefined);

  const overviewData = overviewResponse?.data || overviewResponse?.result;
  const profile = profileResponse?.data || profileResponse?.result;
  const profileName = profile?.fullName || "Organization Admin";

  const metrics = overviewData?.metrics;
  const recentActivities = overviewData?.recentActivities?.length
    ? overviewData.recentActivities
    : DEFAULT_ACTIVITIES;
  const planInfo = overviewData?.plan;

  const stats = [
    {
      id: "assessments",
      title: "Total Assessments",
      value: metrics ? `${metrics.totalAssessments}` : "10",
      subtext: `${metrics?.assessmentsCompleted ?? 10} completed`,
      icon: Globe,
      iconColor: "text-[#2563EB]",
      iconBg: "bg-[#EAF2FF]",
    },
    {
      id: "reports",
      title: "Reports Generated",
      value: metrics ? `${metrics.reportsGenerated}` : "5",
      subtext: `${metrics?.reportsCompleted ?? 5} completed`,
      icon: CheckCircle2,
      iconColor: "text-[#16851F]",
      iconBg: "bg-[#EAF8EE]",
    },
    {
      id: "consultations",
      title: "Consultations",
      value: metrics ? `${metrics.consultations}` : "4",
      subtext: `${metrics?.consultationsConfirmed ?? 1} confirmed`,
      icon: FileEdit,
      iconColor: "text-[#D97706]",
      iconBg: "bg-[#FFF8EA]",
    },
    {
      id: "revenue",
      title: "Revenue (CAD)",
      value: `$${metrics?.revenueCAD ?? 751}`,
      subtext: `${metrics?.revenuePaymentsCount ?? 9} payments`,
      icon: DollarSign,
      iconColor: "text-[#64748B]",
      iconBg: "bg-[#F1F5F9]",
    },
  ];

  const quickActions = [
    {
      title: "View All Assessments",
      href: "/organization/assessment",
      icon: FileText,
    },
    {
      title: "View all reports",
      href: "/organization/reports",
      icon: BarChart2,
    },
    {
      title: "Manage consultations",
      href: "/organization/consultation",
      icon: Calendar,
    },
    {
      title: "Manage users",
      href: "/organization/users",
      icon: Users,
    },
    {
      title: "View analytics",
      href: "/organization/analytics",
      icon: LineChart,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight caros">
            Welcome back, {profileName}
          </h2>
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-[#00a63e]" />}
        </div>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Organization overview and recent activity
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white rounded-2xl border border-[#ECECF2] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-full ${stat.iconBg} ${stat.iconColor} flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Value & Label */}
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-[#111827]">
                  {stat.value}
                </h3>
                <p className="text-[15px] font-semibold text-gray-800 mt-1">
                  {stat.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Activity (Left Column) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#ECECF2] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#111827] mb-5">
            Recent Activity
          </h3>

          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity: any, index: number) => (
              <div
                key={index}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-[15px] font-semibold text-gray-900">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.date}</p>
                </div>

                <span className="bg-[#F3F4F6] text-[#4B5563] text-[11px] font-bold px-3 py-1 rounded-md tracking-wider">
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (Right Column) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#ECECF2] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#111827] mb-5">
            Quick Actions
          </h3>

          <div className="space-y-1">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[#F8FAFD] group transition-colors text-gray-700 hover:text-[#00a63e]"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#00a63e] transition-colors" />
                    <span className="text-[15px] font-medium">
                      {action.title}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-[#00a63e] transition-all transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Organization Plan Card */}
      <div className="bg-white rounded-2xl border border-[#ECECF2] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base md:text-lg font-bold text-[#111827]">
              Organization Plan {planInfo?.name ? `(${planInfo.name})` : ""}
            </h3>
            {planInfo?.status && (
              <span className="inline-flex items-center bg-[#EAF8EE] text-[#16851F] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {planInfo.status}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {planInfo?.maxUsers
              ? `Plan capacity: up to ${planInfo.maxUsers} team members, ${planInfo.maxAssessments} assessments, and ${planInfo.maxReports || planInfo.maxAssessments} reports.`
              : "Contact your platform administrator to upgrade your subscription plan."}
          </p>
        </div>

        <span className="inline-flex items-center self-start sm:self-auto bg-[#F3F4F6] text-[#374151] border border-gray-200 text-xs font-bold px-3.5 py-1.5 rounded-md tracking-wider uppercase">
          {planInfo?.status || "ACTIVE"}
        </span>
      </div>
    </div>
  );
}
