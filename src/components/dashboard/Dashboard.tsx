"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAdminDashboardOverviewQuery } from "@/redux/api/dashboardApi";
import UserManagementTable from "../table/UserManagementTable";
import StatsCards from "./StatsCards";

type RevenueItem = {
  label: string;
  totalRevenue: number;
};

export default function Dashboard() {
  const [selected, setSelected] = useState("monthly");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch dashboard overview with filter from API
  const {
    data: overviewResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminDashboardOverviewQuery(selected);

  const overviewData = overviewResponse?.result || overviewResponse?.data;
  const isInitialLoading = isLoading && !overviewData;

  // Real chart data strictly from API
  const chartData: RevenueItem[] = useMemo(() => {
    if (
      overviewData?.chartData &&
      Array.isArray(overviewData.chartData) &&
      overviewData.chartData.length > 0
    ) {
      return overviewData.chartData.map((d: any) => ({
        label: d.label || d.month || d.day || "",
        totalRevenue: Number(d.totalRevenue ?? d.revenue ?? 0),
      }));
    }
    return [];
  }, [overviewData]);

  // Real pathway breakdown strictly from API
  const pathwayData = useMemo(() => {
    if (
      overviewData?.pathwayData &&
      Array.isArray(overviewData.pathwayData) &&
      overviewData.pathwayData.length > 0
    ) {
      return overviewData.pathwayData;
    }
    if (
      overviewData?.pathwayBreakdown &&
      Array.isArray(overviewData.pathwayBreakdown) &&
      overviewData.pathwayBreakdown.length > 0
    ) {
      return overviewData.pathwayBreakdown.map((item: any) => ({
        name: `${item.name || item.key} ${item.percentage || 0}%`,
        value: Number(item.percentage || 0),
        color: item.color || "#6140E6",
      }));
    }
    return [];
  }, [overviewData]);

  // Real stats strictly from API
  const stats = useMemo(() => {
    if (
      overviewData?.statsCards &&
      Array.isArray(overviewData.statsCards) &&
      overviewData.statsCards.length > 0
    ) {
      return overviewData.statsCards;
    }
    if (overviewData?.stats) {
      const s = overviewData.stats;
      return [
        {
          title: "Total Users",
          value: String(s.formattedTotalUsers ?? s.totalUsers ?? "0"),
        },
        {
          title: "Assessments",
          value: String(s.totalAssessments ?? s.assessments ?? "0"),
        },
        {
          title: "Total Reports",
          value: String(s.totalReports ?? s.reports ?? "0"),
        },
        {
          title: "Total Revenue",
          value: String(
            s.formattedTotalRevenue ??
              (s.totalRevenue !== undefined ? `$${s.totalRevenue}` : "$0"),
          ),
        },
      ];
    }
    return [
      { title: "Total Users", value: "0" },
      { title: "Assessments", value: "0" },
      { title: "Total Reports", value: "0" },
      { title: "Total Revenue", value: "$0" },
    ];
  }, [overviewData]);

  const maxRevenue = Math.max(
    ...chartData.map((d: RevenueItem) => d.totalRevenue || 0),
    10,
  );

  const options = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const revenueTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-xl border border-[#f1f1f4] bg-white px-3 py-2 shadow-lg">
        <p className="text-base text-[#8a8a94]">{label}</p>
        <p className="text-base font-semibold text-[#252525]">
          ${Number(payload[0].value || 0).toLocaleString()}
        </p>
      </div>
    );
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-[#F8FAFD]">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFD] p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-title">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time analytics, user metrics, and platform performance from live backend database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#ececf2] bg-white rounded-xl hover:bg-[#f8fafd] transition-colors disabled:opacity-50 shadow-sm"
            title="Refresh overview metrics"
          >
            <RefreshCw
              className={`w-4 h-4 text-muted-foreground ${
                isFetching ? "animate-spin text-primary" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error state alert if API connection fails */}
      {isError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              {(error as any)?.status === 401
                ? "Your login session has expired or you are unauthorized. Please log in again."
                : "Failed to sync with backend API. Please check your network connection or login session."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(error as any)?.status === 401 ? (
              <Link
                href="/login"
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Log In
              </Link>
            ) : (
              <button
                onClick={() => refetch()}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="rounded-xl bg-background p-4 shadow-sm border border-[#ececf2]">
        <StatsCards stats={stats} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Revenue Bar Chart */}
        <Card className="xl:col-span-2 rounded-xl border border-[#ececf2] bg-white shadow-sm">
          <div className="relative flex items-start justify-between p-4 md:p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl md:text-2xl font-bold text-title">
                Total Revenue
              </CardTitle>
            </CardHeader>

            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 rounded-xl border border-[#ebebf0] bg-[#fbfbfd] px-4 py-2 text-base md:text-lg font-medium text-[#676779]"
              >
                {options.find((o) => o.value === selected)?.label || "Monthly"}
                <ChevronDown className="h-4 w-4" />
              </button>

              {open && (
                <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-[#ececf2] bg-white shadow-xl">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelected(option.value);
                        setOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-base text-[#676779] transition-colors hover:bg-[#f7f7fb]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <CardContent className="px-1 md:px-6">
            <div className="h-72 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No revenue records found for this period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#efeff5"
                      strokeDasharray="4 5"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9b9bac", fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      domain={[0, maxRevenue + 20]}
                      tick={{ fill: "#9b9bac", fontSize: 12 }}
                      width={35}
                    />
                    <Tooltip
                      cursor={{ fill: "#f3f3f8" }}
                      content={revenueTooltip}
                    />
                    <Bar
                      barSize={30}
                      dataKey="totalRevenue"
                      radius={[10, 10, 10, 10]}
                      minPointSize={5}
                    >
                      {chartData.map((entry: RevenueItem, index: number) => {
                        const isTop =
                          maxRevenue > 0 && entry.totalRevenue === maxRevenue;
                        return (
                          <Cell
                            key={index}
                            fill={isTop ? "#00a63e" : "#c8ebd3"}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* General Pathway Breakdown */}
        <Card className="rounded-2xl border border-[#ececf2] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl md:text-2xl font-bold text-title">
              General Pathway Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pathwayData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                No pathway evaluation data recorded yet.
              </div>
            ) : (
              <>
                <div className="mx-auto h-64 max-w-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pathwayData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={82}
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      >
                        {pathwayData.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || "#6140E6"}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#8a8a94]">
                  {pathwayData.map((item: any, index: number) => (
                    <div key={item.name || index} className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color || "#6140E6" }}
                      />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Management Section */}
      <div className="rounded-2xl border border-[#ececf2] bg-white p-4 md:p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-title">
            Users Management
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative w-full min-w-[220px] md:w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0a0b0]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search candidates..."
                className="py-2 text-base lg:text-lg rounded-xl focus:ring-2 focus:border-primary bg-[#fbfbfd] pl-9 text-[#30303a]"
              />
            </div>
            <Link
              href="/admin/user-management"
              className="rounded-xl bg-primary px-6 py-2 text-xs md:text-base lg:text-lg font-medium text-white shadow-sm transition-opacity hover:opacity-90 inline-flex items-center justify-center"
            >
              See All
            </Link>
          </div>
        </div>

        {/* User table connected to API data with strict embedded mode */}
        <UserManagementTable
          isEmbedded={true}
          users={overviewData?.recentUsers}
          search={search}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#ececf2] bg-[#f9fafc] p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-[#f1d9e3] bg-white/80 p-5"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#ececf2]" />
                <div className="h-4 w-24 rounded bg-[#ececf2]" />
              </div>
              <div className="h-10 w-28 rounded bg-[#ececf2]" />
              <div className="mt-3 h-3 w-32 rounded bg-[#f2f3f7]" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 rounded-2xl border border-[#ececf2] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between p-4 md:p-6">
            <div className="space-y-3">
              <div className="h-8 w-48 rounded bg-[#ececf2]" />
              <div className="h-4 w-32 rounded bg-[#f2f3f7]" />
            </div>
            <div className="h-10 w-28 rounded-xl bg-[#ececf2]" />
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full animate-pulse rounded-2xl border border-dashed border-[#ececf2] bg-[linear-gradient(180deg,#fafafe_0%,#f4f6fb_100%)] p-4">
              <div className="flex h-full items-end gap-3">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="flex-1">
                    <div
                      className="mx-auto w-full rounded-t-2xl bg-[#e5e8ef]"
                      style={{ height: `${25 + (index % 5) * 14}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-[#ececf2] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="space-y-3">
              <div className="h-8 w-44 rounded bg-[#ececf2]" />
              <div className="h-4 w-28 rounded bg-[#f2f3f7]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-center justify-center">
              <div className="h-52 w-52 rounded-full border-[20px] border-[#f1f3f8] animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-[#ececf2] bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="space-y-3">
            <div className="h-8 w-40 rounded bg-[#ececf2]" />
            <div className="h-4 w-56 rounded bg-[#f2f3f7]" />
          </div>
          <div className="h-11 w-full rounded-xl bg-[#ececf2] md:w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 rounded-2xl bg-[#fafbfe] p-4 animate-pulse"
              >
                <div className="h-4 rounded bg-[#ececf2]" />
                <div className="h-4 rounded bg-[#ececf2]" />
                <div className="h-4 rounded bg-[#ececf2]" />
                <div className="h-4 rounded bg-[#ececf2]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
