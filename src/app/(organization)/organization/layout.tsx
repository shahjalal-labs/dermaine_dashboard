"use client";

import React, { useState } from "react";
import OrganizationSidebar from "@/components/organization/Sidebar/OrganizationSidebar";
import OrganizationTopbar from "@/components/organization/Topbar/OrganizationTopbar";

export default function OrganizationDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-row">
      {/* Sidebar - Desktop static & Mobile drawer */}
      <div
        className={`lg:w-72 w-72 fixed lg:static top-0 left-0 h-screen z-50 transform bg-white transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <OrganizationSidebar onCloseClick={closeSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <OrganizationTopbar onHamburgerClick={toggleSidebar} />

        <main className="flex-1 p-5 md:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
