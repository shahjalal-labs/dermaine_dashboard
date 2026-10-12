import baseApi from "./baseApi";

export interface AdminDashboardQueryArgs {
  filter?: string;
  year?: string | number;
}

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminDashboardOverview: builder.query<any, string | AdminDashboardQueryArgs | void>({
      query: (arg) => {
        let queryString = "";
        if (typeof arg === "string") {
          queryString = `?filter=${encodeURIComponent(arg)}`;
        } else if (arg && typeof arg === "object") {
          const params = new URLSearchParams();
          if (arg.filter) params.append("filter", arg.filter);
          if (arg.year) params.append("year", String(arg.year));
          queryString = params.toString() ? `?${params.toString()}` : "";
        } else {
          queryString = "?filter=monthly";
        }

        return {
          url: `/dashboard/admin${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
  }),
});

export const { useAdminDashboardOverviewQuery } = dashboardApi;
