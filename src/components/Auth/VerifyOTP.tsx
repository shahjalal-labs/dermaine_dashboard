"use client";

import { useOtpVerificationMutation } from "@/redux/api/authApi";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyboardEvent, Suspense, useRef, useState } from "react";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";

function VerifyOTPContent() {
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [verifyOtpFn] = useOtpVerificationMutation();

  const email = searchParams.get("email");

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().slice(0, 4);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      if (i < 4 && !isNaN(Number(pasted[i]))) {
        newOtp[i] = pasted[i];
      }
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length < 4) {
      toast.error("Please enter the complete 4-digit OTP");
      return;
    }

    if (!email) {
      toast.error("Email is missing. Please go back to forgot password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOtpFn({ email, otp: otpValue }).unwrap();

      const token =
        response?.result?.accessToken ||
        response?.data?.accessToken ||
        response?.result?.token ||
        response?.data?.token ||
        response?.result?.forgetToken ||
        response?.data?.forgetToken;

      if (token) {
        Cookies.set("resetToken", token, { path: "/", expires: 1 });
      }

      toast.success("OTP verified successfully");
      router.push("/reset-password");
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Enter OTP" subtitle="Enter OTP sent to your email">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-3 mt-4 mb-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-semibold rounded-full border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-gray-900 bg-transparent"
            />
          ))}
        </div>

        <div className="space-y-1 mt-6">
          <p className="text-base md:text-lg text-gray-600">
            Didn&apos;t receive code?{" "}
            <button
              type="button"
              className="font-semibold text-gray-900 hover:underline"
            >
              Resend Code
            </button>
          </p>
          <p className="text-base md:text-lg text-gray-500">
            Resend code in <span className="text-gray-900">00:30</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.join("").length < 4}
          className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-70 mt-6"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function VerifyOTP() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
