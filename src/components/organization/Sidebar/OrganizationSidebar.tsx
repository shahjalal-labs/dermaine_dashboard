"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { logOut } from "@/redux/ReduxFunction";
import KetadaLogo from "./KetadaLogo";
import {
  LayoutGrid,
  User,
  Users,
  UserCheck,
  ClipboardList,
  FileBarChart2,
  CalendarCheck,
  Receipt,
  LayoutTemplate,
  FileText,
  Feather,
  LineChart,
  CreditCard,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface OrganizationSidebarProps {
  onCloseClick?: () => void;
}

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const organizationMenuItems: MenuItem[] = [
  { href: "/organization/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/organization/users", icon: User, label: "Users" },
  { href: "/organization/organization-users", icon: Users, label: "Organization Users" },
  { href: "/organization/applicants", icon: UserCheck, label: "Applicants" },
  { href: "/organization/assessment", icon: ClipboardList, label: "Assessment" },
  { href: "/organization/reports", icon: FileBarChart2, label: "Reports" },
  { href: "/organization/consultation", icon: CalendarCheck, label: "Consultation" },
  { href: "/organization/payments", icon: Receipt, label: "Payments" },
  { href: "/organization/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/organization/programs", icon: FileText, label: "Programs" },
  { href: "/organization/branding", icon: Feather, label: "Branding" },
  { href: "/organization/analytics", icon: LineChart, label: "Analytics" },
  { href: "/organization/billing", icon: CreditCard, label: "Billing" },
  { href: "/organization/settings", icon: Settings, label: "Settings" },
];

export default function OrganizationSidebar({ onCloseClick }: OrganizationSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("accessToken", { path: "/" });
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
    }
    dispatch(logOut());
    window.location.href = "/login";
  };

  return (
    <aside className="w-full lg:w-72 h-screen bg-white flex flex-col border-r border-[#EFEFEF]">
      {/* Mobile Close Button */}
      <button
        onClick={onCloseClick}
        className="absolute top-4 right-4 lg:hidden p-2 rounded-md text-gray-500 hover:text-red-500 hover:bg-gray-100 transition-colors z-20"
        aria-label="Close Sidebar"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-gray-100 flex items-center">
        <Link href="/organization/dashboard" className="flex items-center">
          <KetadaLogo className="h-9" />
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar">
        <ul className="space-y-1.5">
          {organizationMenuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/organization/dashboard" && pathname.startsWith(item.href));

            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onCloseClick}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                    isActive
                      ? "bg-[#00a63e] text-white shadow-sm font-semibold"
                      : "text-[#5b616e] hover:bg-[#f8fafd] hover:text-[#111111]"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-white" : "text-[#7e8594]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Action */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-[#FFF1F0] text-[#FF4D4F] hover:bg-[#FFE6E6] transition-colors"
        >
          <LogOut className="w-4 h-4 text-[#FF4D4F]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
