"use client";

import React from "react";
import { Clock } from "lucide-react";

interface PlaceholderPageProps {
  heading: string;
  title: string;
  description: string;
}

export default function PlaceholderPage({
  heading,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#111827] caros">
          {heading}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-[#ECECF2] p-16 md:p-24 shadow-sm flex flex-col items-center justify-center text-center min-h-[360px]">
        {/* Clock Icon inside subtle gray circle */}
        <div className="w-12 h-12 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center mb-4">
          <Clock className="w-5 h-5" />
        </div>

        {/* Coming Soon Pill Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706]">
            Coming Soon
          </span>
        </div>

        {/* Card Title */}
        <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2">
          {title}
        </h3>

        {/* Description Subtitle */}
        <p className="text-sm text-gray-400 max-w-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
