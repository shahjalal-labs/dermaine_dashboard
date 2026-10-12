"use client";

import React from "react";

export interface FunnelStage {
  label: string;
  value: number;
  percentage: number;
  dropOff?: number;
  color: string;
}

export const DEFAULT_FUNNEL_DATA: FunnelStage[] = [
  { label: "Assessment Started", value: 8, percentage: 100.0, color: "#22c55e" },
  { label: "Assessment Completed", value: 8, percentage: 100.0, color: "#22c55e" },
  { label: "Results Viewed", value: 8, percentage: 100.0, color: "#22c55e" },
  { label: "Pricing Viewed", value: 6, percentage: 75.0, dropOff: 25.0, color: "#86efac" },
  { label: "Checkout Started", value: 4, percentage: 50.0, dropOff: 33.3, color: "#a3e635" },
  { label: "Payment Completed", value: 3, percentage: 37.5, dropOff: 25.0, color: "#f59e0b" },
  { label: "Report Downloaded", value: 5, percentage: 62.5, color: "#f97316" },
  { label: "Consultation Booked", value: 1, percentage: 12.5, dropOff: 80.0, color: "#f87171" },
];

interface ConversionFunnelChartProps {
  data?: FunnelStage[];
}

export function ConversionFunnelChart({
  data = DEFAULT_FUNNEL_DATA,
}: ConversionFunnelChartProps) {
  return (
    <div className="w-full bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#ececf2]">
      <div className="mb-6 space-y-1">
        <h3 className="text-base md:text-lg font-bold text-[#111827]">
          Conversion Funnel
        </h3>
        <p className="text-xs text-gray-500">
          End-to-end user journey with drop-off at each stage
        </p>
      </div>

      <div className="space-y-4">
        {data.map((stage, index) => (
          <div key={index} className="flex items-center text-xs">
            {/* Stage Label */}
            <div className="w-40 sm:w-52 shrink-0 font-medium text-xs sm:text-sm text-gray-700 truncate pr-2">
              {stage.label}
            </div>

            {/* Subtle Divider Line */}
            <div className="hidden sm:block w-px h-5 bg-gray-200 shrink-0 mx-3" />

            {/* Bar Track & Fill */}
            <div className="flex-1 flex items-center pr-4 sm:pr-8">
              <div
                className="h-6 rounded-md flex items-center px-3 text-white text-xs font-bold shadow-2xs transition-all duration-500"
                style={{
                  width: `${Math.max(5, stage.percentage)}%`,
                  backgroundColor: stage.color,
                }}
              >
                {stage.value}
              </div>
            </div>

            {/* Percentage & Drop-off */}
            <div className="w-20 shrink-0 text-right flex flex-col justify-center">
              <span className="font-bold text-xs sm:text-sm text-[#111827]">
                {stage.percentage.toFixed(1)}%
              </span>
              {stage.dropOff !== undefined && stage.dropOff > 0 ? (
                <span className="text-[10px] text-[#ef4444] font-medium leading-tight">
                  -{stage.dropOff.toFixed(1)}% drop
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConversionFunnelChart;
