"use client";
import React, { forwardRef, useState } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  rightElement?: React.ReactNode;
  error?: string;
  icon?: React.ReactNode;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    { label, type = "text", rightElement, error, icon, className, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <div className="flex justify-between items-center">
            <label className="text-lg md:text-xl font-semibold text-title">
              {label}
            </label>
          </div>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#a0a0b0]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`w-full ${icon ? "pl-10 pr-6" : "px-6"} py-3 rounded-lg border bg-transparent text-base md:text-lg shadow-sm focus:outline-none focus:ring-1 ${isPassword ? "pr-10" : ""} ${error ? "border-destructive focus:ring-destructive" : "border-input focus:border-primary focus:ring-primary"} ${className || ""}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-base md:text-lgtext-destructive mt-0.5">{error}</p>
        )}
        {rightElement && !error && (
          <div className="flex justify-end mt-0.5">{rightElement}</div>
        )}
        {rightElement && error && (
          <div className="absolute right-0 -bottom-5">{rightElement}</div>
        )}
      </div>
    );
  },
);
InputField.displayName = "InputField";

export default InputField;
