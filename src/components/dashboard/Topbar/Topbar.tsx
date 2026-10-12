"use client";

import { useState } from "react";
import { MdOutlineNotifications } from "react-icons/md";

import { useGetMyProfileQuery } from "@/redux/api/userApi";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineMenu } from "react-icons/ai";
import { FaRegUser } from "react-icons/fa";

const Topbar: React.FC<{ onHamburgerClick: () => void }> = ({
  onHamburgerClick,
}) => {
  const { data: myProfileData, isLoading } = useGetMyProfileQuery(undefined);
  const profile = myProfileData?.data?.profileImage || myProfileData?.result?.profileImage;
  const [imageError, setImageError] = useState(false);

  const token = Cookies.get("token");
  let decodedToken: any = null;

  if (token) {
    try {
      decodedToken = jwtDecode(token);
    } catch (e) {
      decodedToken = null;
    }
  }

  const pathname = usePathname();

  const isNotificationActive = pathname === "/admin/notification";

  const getPageTitle = () => {
    if (pathname === "/admin/dashboard" || pathname === "/admin") {
      return "Overview";
    }

    if (pathname.startsWith("/admin/assessment/")) {
      return "Assessments Details";
    }

    if (pathname === "/admin/assessment") {
      return "Assessment";
    }

    if (pathname.startsWith("/admin/rule-scoring")) {
      return (
        <span className="text-title text-lg md:text-2xl font-bold tracking-tight">
          Rule/Scoring
        </span>
      );
    }

    if (pathname.startsWith("/admin/user-management")) {
      return "Users Management";
    }

    if (pathname.startsWith("/admin/platform-administration")) {
      return "Platform Administration";
    }

    if (pathname.startsWith("/admin/notification")) {
      return "Notifications";
    }

    // Fallback: If dynamic ID is at the end, look at parent segment
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];

    if (last && (last.length >= 20 || /^[0-9a-fA-F]{24}$/.test(last))) {
      const parent = segments[segments.length - 2];
      if (parent) {
        return (
          parent.charAt(0).toUpperCase() +
          parent.slice(1).replace(/-/g, " ") +
          " Details"
        );
      }
    }

    if (!last) return "Admin Panel";

    return last
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="bg-secondary py-6 px-4 md:px-6 w-full">
      <div className="flex justify-between items-center flex-wrap">
        <button
          className="lg:hidden text-2xl text-title"
          onClick={onHamburgerClick}
        >
          <AiOutlineMenu />
        </button>

        <div className="flex items-center gap-6">
          <h1 className="text-black text-base md:text-2xl font-bold">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/admin/notification" className="relative">
            <div
              className={`relative p-2 rounded-full ${
                isNotificationActive
                  ? "bg-primary text-white"
                  : "text-title/70 bg-[#52C41A1A]"
              }`}
            >
              <MdOutlineNotifications size={25} />
            </div>
          </Link>
          <Link href={`/admin/settings`} className="flex items-center gap-3">
            {profile && !imageError ? (
              <div className="text-right">
                <Image
                  src={profile}
                  alt="profile"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <FaRegUser size={18} />
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
