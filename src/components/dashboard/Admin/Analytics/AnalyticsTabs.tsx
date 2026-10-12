"use client";

import React from "react";
import {
  Menu,
  Users,
  TrendingUp,
  DollarSign,
  Compass,
  Mail,
  Phone,
  Download,
} from "lucide-react";

export type Tab =
  | "Overview"
  | "Leads"
  | "Funnel"
  | "Revenue"
  | "Pathways"
  | "Email"
  | "Consultations"
  | "Exports";

interface AnalyticsTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "Overview", label: "Overview", icon: Menu },
  { id: "Leads", label: "Leads", icon: Users },
  { id: "Funnel", label: "Funnel", icon: TrendingUp },
  { id: "Revenue", label: "Revenue", icon: DollarSign },
  { id: "Pathways", label: "Pathways", icon: Compass },
  { id: "Email", label: "Email", icon: Mail },
  { id: "Consultations", label: "Consultations", icon: Phone },
  { id: "Exports", label: "Exports", icon: Download },
];

export function AnalyticsTabs({ activeTab, setActiveTab }: AnalyticsTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${isActive
                ? "bg-white text-[#111827] border border-gray-200/90 shadow-xs"
                : "text-gray-500 hover:text-gray-900 border border-transparent"
              }`}
          >
            <Icon
              className={`w-4 h-4 ${isActive ? "text-[#00a859]" : "text-gray-400"
                }`}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
