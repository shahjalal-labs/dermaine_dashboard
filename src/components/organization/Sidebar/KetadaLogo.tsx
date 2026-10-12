import React from "react";

export default function KetadaLogo({ className = "h-9" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Stylized Cyan & Blue Ribbon V Mark */}
      <svg
        className="h-full w-auto"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ketada-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="50%" stopColor="#00C2FF" />
            <stop offset="100%" stopColor="#00D26A" />
          </linearGradient>
          <linearGradient id="ketada-grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0052D4" />
            <stop offset="70%" stopColor="#4364F7" />
            <stop offset="100%" stopColor="#6FB1FC" />
          </linearGradient>
          <linearGradient id="ketada-grad3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C2FF" />
            <stop offset="100%" stopColor="#0047FF" />
          </linearGradient>
        </defs>
        {/* Left wing curve */}
        <path
          d="M 6 8 C 8 20, 16 32, 22 38 C 17 31, 13 22, 12 14 C 11 11, 8 9, 6 8 Z"
          fill="url(#ketada-grad2)"
        />
        {/* Main dynamic fold */}
        <path
          d="M 12 8 C 16 7, 21 16, 23 26 C 26 18, 32 10, 37 8 C 30 15, 26 27, 23 38 C 21 38, 19 36, 17 33 C 14 26, 10 16, 12 8 Z"
          fill="url(#ketada-grad1)"
        />
        {/* Right swoosh / check accent */}
        <path
          d="M 18 32 C 22 36, 25 38, 28 35 C 33 30, 37 20, 40 14 C 36 18, 30 27, 25 31 Z"
          fill="url(#ketada-grad3)"
        />
      </svg>
      {/* KETADA Brand typography */}
      <span className="text-2xl font-extrabold tracking-wider text-[#0A2540] select-none font-sans">
        KETADA
      </span>
    </div>
  );
}
