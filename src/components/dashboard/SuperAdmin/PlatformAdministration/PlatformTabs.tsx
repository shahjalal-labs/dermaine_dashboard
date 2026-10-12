import {
  BookOpen,
  ChartColumn,
  ChartLine,
  CreditCard,
  History,
  Lock,
  Scale,
  ShieldCheck,
  Target,
} from "lucide-react";

export type Tab =
  | "Admin"
  | "Organizations"
  | "Roles & Permissions"
  | "Subscription Plans"
  | "Revenue Dashboard"
  | "Countries"
  | "Program Libraries"
  | "Scoring Models"
  | "Audit Logs";

interface PlatformTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TABS: { id: Tab; icon: any }[] = [
  { id: "Admin", icon: ShieldCheck },
  { id: "Organizations", icon: ChartColumn },
  { id: "Roles & Permissions", icon: Scale },
  { id: "Subscription Plans", icon: CreditCard },
  { id: "Revenue Dashboard", icon: ChartLine },
  { id: "Countries", icon: Lock },
  { id: "Program Libraries", icon: BookOpen },
  { id: "Scoring Models", icon: Target },
  { id: "Audit Logs", icon: History },
];

export function PlatformTabs({ activeTab, setActiveTab }: PlatformTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 transition-colors text-xs md:text-sm font-medium ${
              isActive
                ? "bg-white border border-[#e5e7eb] rounded-full px-3.5 py-1 shadow-xs text-title font-semibold"
                : "text-[#8c8c9e] hover:text-title py-1"
            }`}
          >
            <span className={isActive ? "text-[#16851f]" : "text-[#8c8c9e]"}>
              <Icon className="w-4 h-4" />
            </span>
            <span>{tab.id}</span>
          </button>
        );
      })}
    </div>
  );
}
