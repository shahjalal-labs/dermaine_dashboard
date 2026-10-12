"use client";

import logo from "@/assets/logo.png";
import { logOut } from "@/redux/ReduxFunction";
import Cookies from "js-cookie";
import {
  AlertCircle,
  CalendarCheck,
  ClipboardList,
  FileText,
  Hammer,
  LayoutGrid,
  LineChart,
  LogOut,
  Receipt,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface SidebarProps {
  onCloseClick?: () => void;
}

interface MenuItem {
  href?: string;
  label: string;
  icon?: any;
  subItems?: { label: string; href: string; icon?: any }[];
}

const Sidebar = ({ onCloseClick }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (
      pathname.startsWith("/admin/player-management") ||
      pathname.startsWith("/admin/coach-management") ||
      pathname.startsWith("/admin/scout")
    ) {
      setUserDropdownOpen(true);
    }
  }, [pathname]);

  const allMenuItems: MenuItem[] = [
    { href: "/admin/dashboard", icon: LayoutGrid, label: "Overview" },
    { href: "/admin/user-management", icon: Users, label: "Users Management" },
    { href: "/admin/assessment", icon: ClipboardList, label: "Assessment" },
    { href: "/admin/programs", icon: FileText, label: "Programs" },
    { href: "/admin/rule-scoring", icon: Hammer, label: "Rule/Scoring" },
    { href: "/admin/payments", icon: Receipt, label: "Payments" },
    { href: "/admin/consultation", icon: CalendarCheck, label: "Consultation" },
    { href: "/admin/analytics", icon: LineChart, label: "Analytics" },
    { href: "/admin/support", icon: AlertCircle, label: "Support" },
    {
      href: "/admin/platform-administration",
      icon: Shield,
      label: "Platform Administration",
    },
    { href: "/admin/settings", icon: Settings, label: "Setting" },
  ];

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
    <div className="relative">
      <aside className="w-full lg:w-72 h-screen bg-background flex flex-col text-title font-semibold">
        <button
          onClick={onCloseClick}
          className="absolute top-4 right-4 lg:hidden p-2 rounded-md text-red-500"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <Image
            src={logo}
            alt="logo"
            width={40}
            height={50}
            className="object-contain"
          />
          <h2 className="text-2xl text-title font-bold caros">IMMICA</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto no-scrollbar">
          <ul className="space-y-2">
            {allMenuItems.map((item, idx) => {
              const isActive = item.href === pathname;

              if (item.subItems) {
                return (
                  <div key={idx} className={`rounded-lg  `}>
                    <li>
                      <button
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className={`flex justify-between items-center w-full px-4 py-3 rounded-xl text-base transition-colors ${
                          userDropdownOpen ||
                          pathname.includes("/admin/player-management") ||
                          pathname.includes("/admin/coach-management") ||
                          pathname.includes("/admin/scout")
                            ? "bg-primary text-white font-medium shadow-sm"
                            : "text-[#5b616e] hover:bg-[#f8fafd]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && <item.icon className="w-5 h-5" />}
                          <span>{item.label}</span>
                        </div>
                        <span>{userDropdownOpen ? "▲" : "▼"}</span>
                      </button>
                    </li>
                  </div>
                );
              }

              return (
                <li key={idx}>
                  <Link
                    href={item.href!}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base transition-colors ${
                      isActive
                        ? "bg-primary text-white font-medium shadow-sm"
                        : "text-[#5b616e] hover:bg-[#f8fafd] hover:text-title"
                    }`}
                    onClick={onCloseClick}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium bg-[#FF00001A] text-[#FF0000] hover:bg-[#FF00002A] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
