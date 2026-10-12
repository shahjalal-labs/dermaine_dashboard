import baseApi from "./baseApi";

const streamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createStream: builder.mutation({
      query: (data) => ({
        url: "/streams",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["streams"],
    }),

    getAllStream: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.programId) queryParams.append("programId", params.programId);
        if (params.includeArchived !== undefined)
          queryParams.append("includeArchived", params.includeArchived);
        if (params.includeDisabled !== undefined)
          queryParams.append("includeDisabled", params.includeDisabled);
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);

        const queryString = queryParams.toString();
        return {
          url: queryString ? `/streams?${queryString}` : `/streams`,
          method: "GET",
        };
      },
      providesTags: ["streams"],
    }),

    getSingleStream: builder.query({
      query: (id) => ({
        url: `/streams/${id}`,
        method: "GET",
      }),
      providesTags: ["streams"],
    }),

    updateStrem: builder.mutation({
      query: ({ id, data }) => ({
        url: `/streams/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["streams"],
    }),

    deleteStrem: builder.mutation({
      query: ({ id }) => ({
        url: `/streams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["streams"],
    }),
  }),
});

export const {
  useCreateStreamMutation,
  useGetAllStreamQuery,
  useGetSingleStreamQuery,
  useUpdateStremMutation,
  useDeleteStremMutation,
} = streamApi;
