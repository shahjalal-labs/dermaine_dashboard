"use client";

import { BarChart2, DollarSign, FileText, UserRoundCheck } from "lucide-react";
import { Card, CardContent } from "../ui/card";

type StatItem = {
  title: string;
  value: string;
  description?: string;
};

const defaultIcons: Record<string, any> = {
  "Total Users": UserRoundCheck,
  "Total Revenue": DollarSign,
  Assessments: FileText,
  "Total Reports": BarChart2,
};

const defaultColors: Record<string, { bg: string; iconBg: string }> = {
  "Total Users": {
    bg: "bg-[#36B8401A]",
    iconBg: "bg-[#126A19]",
  },
  Assessments: {
    bg: "bg-[#0F6FD81A]",
    iconBg: "bg-[#0F6FD8]",
  },
  "Total Reports": {
    bg: "bg-[#FAAD141A]",
    iconBg: "bg-[#FAAD14]",
  },
  "Total Revenue": {
    bg: "bg-[#FF00001A]",
    iconBg: "bg-[#FF6164]",
  },
};

interface StatsCardsProps {
  stats?: StatItem[];
}

export default function StatsCards({ stats: customStats }: StatsCardsProps) {
  const defaultStats = [
    { title: "Total Users", value: "0" },
    { title: "Assessments", value: "0" },
    { title: "Total Reports", value: "0" },
    { title: "Total Revenue", value: "$0" },
  ];

  const displayStats = customStats || defaultStats;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {displayStats.map((stat) => {
        const Icon = defaultIcons[stat.title] || UserRoundCheck;
        const colors = defaultColors[stat.title] || {
          bg: "bg-[#f7e7ef]",
          iconBg: "bg-[#ea2d72]",
        };

        return (
          <Card
            key={stat.title}
            className={`${colors.bg} border-none shadow-none rounded-2xl`}
          >
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-title">
                <span
                  className={`${colors.iconBg} inline-flex p-3 items-center justify-center rounded-full text-white`}
                >
                  <Icon size={25} />
                </span>
                <p className="text-lg md:text-xl font-medium text-[#111111]">
                  {stat.title}
                </p>
              </div>
              <p className="text-xl md:text-2xl font-bold text-[#1f1f24]">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
