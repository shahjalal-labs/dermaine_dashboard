import baseApi from "./baseApi";

const ruleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRule: builder.mutation({
      query: (data) => ({
        url: "/mandatory-rules",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["rules"],
    }),

    getAllRules: builder.query({
      query: ({ page, limit, streamId }) => ({
        url: "/mandatory-rules",
        params: { page, limit, streamId },
      }),
      providesTags: ["rules"],
    }),

    updateRule: builder.mutation({
      query: ({ id, data }) => ({
        url: `/mandatory-rules/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["rules"],
    }),

    deleteRule: builder.mutation({
      query: (id) => ({
        url: `/mandatory-rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["rules"],
    }),

    createScoringFactor: builder.mutation({
      query: (data) => ({
        url: "/scoring-factors",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["rules"],
    }),

    getAllScoringFactors: builder.query({
      query: ({ page, limit, streamId }) => ({
        url: "/scoring-factors",
        params: { page, limit, streamId },
      }),
      providesTags: ["rules"],
    }),
  }),
});

export const {
  useCreateRuleMutation,
  useGetAllRulesQuery,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useCreateScoringFactorMutation,
  useGetAllScoringFactorsQuery,
} = ruleApi;
export default ruleApi;
