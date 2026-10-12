import baseApi from "./baseApi";

const programApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProgram: builder.mutation({
      query: (data) => ({
        url: "/program",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["dashboard"],
    }),

    getAllProgram: builder.query({
      // "visibility" removed — Program has no such field, and
      // program.controller's getAllPrograms only picks:
      // search, organizationId, country, category, status
      query: ({ page, limit, search, organizationId, country, category, status }) => ({
        url: "/program",
        method: "GET",
        params: {
          page,
          limit,
          search,
          organizationId,
          country,
          category,
          status,
        },
      }),
      providesTags: ["dashboard"],
    }),

    getSingleProgram: builder.query({
      query: (id) => ({
        url: `/program/${id}`,
        method: "GET",
      }),
      providesTags: ["dashboard"],
    }),

    updateProgram: builder.mutation({
      query: ({ id, data }) => ({
        url: `/program/${id}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: ["dashboard"],
    }),

    deleteProgram: builder.mutation({
      query: ({ id }) => ({
        url: `/program/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["dashboard"],
    }),

    getAllOccupationSynonyms: builder.query<any, { search?: string } | void>({
      query: (params) => ({
        url: "/occupation-synonyms",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["dashboard"],
    }),

    createOccupationSynonym: builder.mutation<any, any>({
      query: (data) => ({
        url: "/occupation-synonyms",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["dashboard"],
    }),

    deleteOccupationSynonym: builder.mutation<any, string>({
      query: (id) => ({
        url: `/occupation-synonyms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["dashboard"],
    }),
  }),
});

export const {
  useCreateProgramMutation,
  useGetAllProgramQuery,
  useGetSingleProgramQuery,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
  useGetAllOccupationSynonymsQuery,
  useCreateOccupationSynonymMutation,
  useDeleteOccupationSynonymMutation,
} = programApi;