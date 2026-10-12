import baseApi from "./baseApi";

export const organizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationOverview: builder.query<any, void | Record<string, any>>({
      query: (params) => ({
        url: "/organization/dashboard-overview",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["organization", "dashboard"],
    }),

    getOrganizationUsers: builder.query<
      any,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: "/organization/users",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["organization"],
    }),

    inviteOrganizationUser: builder.mutation<
      any,
      {
        email: string;
        fullName: string;
        role: string;
        organizationId?: string;
      }
    >({
      query: (data) => ({
        url: "/organization/invite-user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["organization", "admins"],
    }),

    getOrganizationMembers: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        organization?: string;
      } | void
    >({
      query: (params) => ({
        url: "/organization/members",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["organization"],
    }),

    addOrganizationMember: builder.mutation<any, any>({
      query: (data: any) => ({
        url: "/organization/add-member",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["organization", "admins"],
    }),

    getOrganizationApplicants: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: "/organization/applicants",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["organization"],
    }),

    getOrganizationAssessments: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        type?: string;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: "/organization/assessments",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["organization"],
    }),

    getOrganizationReports: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: "/organization/reports",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["organization"],
    }),

    getOrganizationConsultations: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: "/organization/consultations",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["organization"],
    }),

    getOrganizationPayments: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: "/organization/payments",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["organization"],
    }),
  }),
});

export const {
  useGetOrganizationOverviewQuery,
  useGetOrganizationUsersQuery,
  useInviteOrganizationUserMutation,
  useGetOrganizationMembersQuery,
  useAddOrganizationMemberMutation,
  useGetOrganizationApplicantsQuery,
  useGetOrganizationAssessmentsQuery,
  useGetOrganizationReportsQuery,
  useGetOrganizationConsultationsQuery,
  useGetOrganizationPaymentsQuery,
} = organizationApi;
