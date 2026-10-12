"use client";

import { useOrganizationCreateMutation } from "@/redux/api/adminApi";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { FaCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";

const passwordRequirements = [
  { id: 1, text: "At least 8 characters in length" },
  { id: 2, text: "One or more uppercase letter" },
  { id: 3, text: "One or more lower case letter" },
  { id: 4, text: "One or more special character (e.g. @ # $ % & *)" },
];

function OrganizationRegisterContent() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [orgRegisterFn, { isLoading }] = useOrganizationCreateMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token) {
      toast.error("Registration token is missing or invalid.");
      return;
    }

    try {
      await orgRegisterFn({ token, password }).unwrap();
      toast.success("Organization account created successfully! Please login.");
      router.replace("/login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create account");
    }
  };

  return (
    <AuthLayout
      title="Create your Organization Account"
      subtitle="Set your password to finish registration."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div>
          <label className="block text-base md:text-xl font-medium text-title mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-base md:text-xl font-medium text-title  mb-1">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="mt-4 pt-2">
          <p className="text-base md:text-lg font-medium text-gray-900 mb-2">
            Password Requirements:
          </p>
          <ul className="text-base md:text-lg text-title space-y-1.5 ml-1">
            {passwordRequirements.map((req) => (
              <li key={req.id} className="flex items-center gap-2">
                <FaCircle className="w-1.5 h-1.5 text-gray-400" />
                {req.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-70 mt-4"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function OrganizationRegister() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <OrganizationRegisterContent />
    </Suspense>
  );
}
