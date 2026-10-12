import React from "react";

export interface StatItem {
  label: string;
  value: string | number;
  color: string;
}

interface StatsProps {
  stats: StatItem[];
}

export function Stats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#f1f1f5] flex flex-col items-center justify-center min-h-[110px]"
        >
          <span className="text-sm md:text-lg font-bold text-[#a0a0b0] tracking-wider uppercase mb-2 text-center">
            {stat.label}
          </span>
          <span className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
