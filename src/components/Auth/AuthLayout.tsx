import logo from "@/assets/logo.png";

import Image from "next/image";
import type React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex text-white">
      {/* Left side - Logo and branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-[#00A63E33]">
        <div className="text-center flex justify-center items-center gap-3">
          {/* Main Logo */}
          <Image
            src={logo}
            alt="Immica Logo"
            width={180}
            height={180}
            className="mx-auto"
            priority
          />
          <p className="font-bold text-4xl md:text-8xl caros uppercase text-title">
            Immica
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 bg-white ">
        <div className="flex items-center justify-center flex-1">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Image
                src={logo}
                alt="Immica Logo"
                width={120}
                height={120}
                className="mx-auto mb-4"
              />
              <p className="font-bold text-3xl caros uppercase text-title">
                Immica
              </p>
            </div>

            <div className="py-8 rounded-2xl text-title">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-title font-caros mb-2">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-description text-base md:text-lg">
                    {subtitle}
                  </p>
                )}
              </div>
              {children}
            </div>
          </div>
        </div>

        {/* Footer always at bottom */}
        <div className="text-center mt-6">
          <p className="text-base md:text-lg text-description">
            © 2026 Immica, All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
