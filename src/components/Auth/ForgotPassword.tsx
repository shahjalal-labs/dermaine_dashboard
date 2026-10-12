"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";
import { useForgetPasswordMutation } from "@/redux/api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [forgetPasswordFn] = useForgetPasswordMutation();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await forgetPasswordFn({ email }).unwrap();

      toast.success("OTP sent to your email");
      // Optionally pass email in query param
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password?">
      <form onSubmit={handleSendCode} className="space-y-6">
        <div>
          <label className="block text-base md:text-xl font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-gray-900"
          />
        </div>

        <div className="text-base md:text-lg font-medium text-gray-600">
          Remember the password?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-70 mt-2"
        >
          {isLoading ? "Sending..." : "Send Code"}
        </button>
      </form>
    </AuthLayout>
  );
}
