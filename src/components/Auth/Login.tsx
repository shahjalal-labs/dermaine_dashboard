"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useUserLoginMutation } from "@/redux/api/authApi";
import { setUser } from "@/redux/ReduxFunction";
import Cookies from "js-cookie";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [loginFn] = useUserLoginMutation();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginFn({ email, password }).unwrap();
      const authData = response?.result || response?.data;
      if (response.success && authData) {
        toast.success("Login successful");
        const token = authData?.accessToken || authData?.token;
        if (token) {
          // Explicitly set cookie path to "/" so all pages and middleware receive it
          Cookies.set("token", token, { path: "/", expires: 7, sameSite: "lax" });
          Cookies.set("accessToken", token, { path: "/", expires: 7, sameSite: "lax" });
          if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
            localStorage.setItem("accessToken", token);
          }
        }

        dispatch(
          setUser({
            role: authData?.role,
            token: token,
            email: email,
            me: authData,
          }),
        );

        const userRole = (authData?.role || "").toLowerCase();
        const targetUrl =
          userRole === "organization" || userRole === "organizationmember"
            ? "/organization/dashboard"
            : "/admin/dashboard";

        // Full window navigation guarantees immediate session hydration without client router stall
        window.location.href = targetUrl;
        return;
      }
    } catch (err: any) {
      console.error("Login error", err);
      if (err?.data?.message) {
        toast.error(err.data.message);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Login" subtitle="Let’s login into your account first">
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-base md:text-lg font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="text"
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-gray-900"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-base md:text-lg font-medium text-gray-700 mb-1">
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
            {/* Eye Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end pt-1">
          <Link
            href="/forgot-password"
            className="text-base md:text-lg font-medium hover:underline text-primary"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-70 mt-2 text-base md:text-lg"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}
