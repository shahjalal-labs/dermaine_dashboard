import baseApi from "./baseApi";

const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAdmin: builder.mutation({
      query: (data) => ({
        url: "/admin/create-admin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admins"],
    }),
    getAdmins: builder.query({
      query: () => "/admins",
      providesTags: ["admins"],
    }),
    adminRegister: builder.mutation({
      query: (data) => ({
        url: "/admin/register-admin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admins", "auth"],
    }),

    getAllAdmins: builder.query({
      query: (data?: { page: number; limit: number; search?: string }) => ({
        url: `/admin/all-admins?page=${data?.page}&limit=${data?.limit}&search=${data?.search}`,
        method: "GET",
      }),
      providesTags: ["admins"],
    }),

    deleteAdmin: builder.mutation({
      query: (id: string) => ({
        url: `/admin/delete-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["admins"],
    }),

    createOrganization: builder.mutation({
      query: (data) => ({
        url: "/admin/create-organization",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admins"],
    }),

    organizationCreate: builder.mutation({
      query: (data) => ({
        url: "/organization/register-organization",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admins"],
    }),

    getAllOrganizations: builder.query({
      query: (data?: { page?: number; limit?: number; search?: string }) => ({
        url: `/admin/all-organizations?page=${data?.page ?? 1}&limit=${data?.limit ?? 100}${data?.search ? `&search=${encodeURIComponent(data.search)}` : ""}`,
        method: "GET",
      }),
      providesTags: ["admins"],
    }),

    updateOrganization: builder.mutation({
      query: ({ id, ...data }: { id: string; [key: string]: any }) => ({
        url: `/admin/update-organization/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["admins"],
    }),

    getAllAssessments: builder.query({
      query: (data: { page: number; limit: number; search?: string }) => ({
        url: `/admin/all-assessments?page=${data?.page}&limit=${data?.limit}&search=${data?.search}`,
        method: "GET",
      }),
      providesTags: ["admins"],
    }),

    supportMessage: builder.mutation({
      query: (data) => ({
        url: "/support/send-message",
        method: "POST",
        body: data,
      }),
    }),

    allAssessments: builder.query({
      query: () => ({
        url: `/admin/all-assessments`,
        method: "GET",
      }),
      providesTags: ["admins"],
    }),

    assessmentWiseQuestion: builder.query({
      query: (assessmentId) => ({
        url: `/admin/assessment/${assessmentId}`,
        method: "GET",
      }),
      providesTags: ["admins"],
    }),

    createQuestion: builder.mutation({
      query: (data) => ({
        url: "/admin/create-question",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admins"],
    }),

    deleteQuestion: builder.mutation({
      query: (questionId) => ({
        url: `/admin/delete-question/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["admins"],
    }),

    updateQuestion: builder.mutation({
      query: ({ id, data }: { id: string | number; data: any }) => ({
        url: `/admin/update-question/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["admins"],
    }),

    createAssessment: builder.mutation({
      query: (data) => ({
        url: "/admin/create-assessment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["admins"],
    }),
    createQuestionGroup: builder.mutation({
      query: (body) => ({
        url: "/admin/question-group",
        method: "POST",
        body,
      }),
      invalidatesTags: ["admins"],
    }),

    getAllSupportMessages: builder.query({
      query: () => ({
        url: "/support/all-messages",
        method: "GET",
      }),
      providesTags: ["support"],
    }),

    respondSupportMessage: builder.mutation({
      query: ({ id, adminResponse }: { id: string; adminResponse: string }) => ({
        url: `/support/${id}/respond`,
        method: "PATCH",
        body: { adminResponse },
      }),
      invalidatesTags: ["support"],
    }),

    deleteSupportMessage: builder.mutation({
      query: (id: string) => ({
        url: `/support/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["support"],
    }),

    getAssessmentSubmissions: builder.query({
      query: (params?: { page?: number; limit?: number; search?: string }) => ({
        url: `/admin/assessment-submissions?page=${params?.page || 1}&limit=${params?.limit || 10}${params?.search ? `&search=${encodeURIComponent(params.search)}` : ""}`,
        method: "GET",
      }),
      providesTags: ["assessments"],
    }),

    getSingleAssessmentSubmission: builder.query({
      query: (id: string) => ({
        url: `/assessment/submissions/${id}`,
        method: "GET",
      }),
      providesTags: ["assessments"],
    }),
  }),
});

export const {
  useCreateAdminMutation,
  useGetAdminsQuery,
  useAdminRegisterMutation,
  useCreateQuestionGroupMutation,
  useGetAllAdminsQuery,
  useCreateOrganizationMutation,
  useGetAllOrganizationsQuery,
  useOrganizationCreateMutation,
  useGetAllAssessmentsQuery,
  useSupportMessageMutation,
  useGetAllSupportMessagesQuery,
  useRespondSupportMessageMutation,
  useDeleteSupportMessageMutation,
  useGetAssessmentSubmissionsQuery,
  useGetSingleAssessmentSubmissionQuery,
  useAllAssessmentsQuery,
  useAssessmentWiseQuestionQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useCreateAssessmentMutation,
  useUpdateOrganizationMutation,
  useDeleteAdminMutation,
} = adminApi;
