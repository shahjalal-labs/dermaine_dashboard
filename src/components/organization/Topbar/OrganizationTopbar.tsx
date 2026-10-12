"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { useGetMyProfileQuery } from "@/redux/api/userApi";

interface OrganizationTopbarProps {
  onHamburgerClick: () => void;
  title?: string;
}

export default function OrganizationTopbar({
  onHamburgerClick,
  title,
}: OrganizationTopbarProps) {
  const pathname = usePathname();
  const { data: myProfileData } = useGetMyProfileQuery(undefined);
  const profileImage =
    myProfileData?.data?.profileImage || myProfileData?.result?.profileImage;

  const getPageTitle = () => {
    if (title) return title;
    if (pathname === "/organization/dashboard" || pathname === "/organization") {
      return "Organization Dashboard";
    }
    if (pathname === "/organization/users") {
      return "Users";
    }
    if (pathname === "/organization/organization-users") {
      return "Organization Users";
    }
    if (pathname === "/organization/settings") {
      return "Setting";
    }

    const segment = pathname.split("/").pop();
    if (!segment) return "Organization Dashboard";
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="bg-white border-b border-[#F0F2F5] py-4 px-6 md:px-8 w-full sticky top-0 z-30">
      <div className="flex justify-between items-center">
        {/* Left: Hamburger & Dynamic Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onHamburgerClick}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-[#111827] tracking-tight caros">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Link
            href="/organization/notifications"
            className="relative p-2.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-[#555C68]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </Link>

          {/* Profile Avatar */}
          <Link
            href="/organization/settings"
            className="flex items-center gap-3 p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500/30 transition-all"
            aria-label="User Profile"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-600/30 shadow-sm bg-gray-100 flex items-center justify-center">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="John Doe"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
