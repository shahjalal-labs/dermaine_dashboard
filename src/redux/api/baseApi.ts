import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL_LOCAL || "https://dermaine-backend.vercel.app/api/v1",
  prepareHeaders: (headers, { getState }) => {
    headers.set("x-vercel-protection-bypass", "HeYVdBnKoux2yeXahDVlfvbZTee73ZOa");
    let token =
      (getState() as any)?.auth?.token ||
      Cookies.get("token") ||
      Cookies.get("accessToken");

    if (!token && typeof window !== "undefined") {
      token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        undefined;
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQuery: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const response = await rawBaseQuery(args, api, extraOptions);

  if (response.error && (response.error.status === 401 || response.error.status === 403)) {
    Cookies.remove("token");
    Cookies.remove("accessToken");
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
    }
  }

  if (response.data && typeof response.data === "object") {
    const payload = response.data as Record<string, any>;
    if (payload.result === undefined && payload.data !== undefined) {
      payload.result = payload.data;
    } else if (payload.data === undefined && payload.result !== undefined) {
      payload.data = payload.result;
    }
  }
  return response;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery,
  endpoints: () => ({}),
  tagTypes: [
    "auth",
    "dashboard",
    "admins",
    "users",
    "payments",
    "consultation",
    "streams",
    "rules",
    "availability",
    "organization",
    "support",
    "assessments",
  ],
});

export default baseApi;
