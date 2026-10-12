import baseApi from "./baseApi";

export interface GetAllUsersQueryArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface UpdateUserStatusArgs {
  id: string;
  status: "Active" | "Blocked" | "Deleted" | string;
}

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<any, GetAllUsersQueryArgs | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));
        if (params?.search) queryParams.append("search", params.search);
        if (params?.status) queryParams.append("status", params.status);

        const qs = queryParams.toString();
        return {
          url: `/users${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["users"],
    }),

    updateUserStatus: builder.mutation<any, UpdateUserStatusArgs>({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["users", "dashboard"],
    }),

    createUser: builder.mutation({
      query: (data) => ({
        url: `/users/create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth", "users"],
    }),

    getMyProfile: builder.query({
      query: () => ({
        url: "/users/my-profile",
        method: "GET",
      }),
      providesTags: ["auth"],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: `/users/update-profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["auth", "users"],
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: `/users/change-password`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    deleteAccount: builder.mutation({
      query: () => ({
        url: `/users/delete-account`,
        method: "DELETE",
      }),
      invalidatesTags: ["auth", "users"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useCreateUserMutation,
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = userApi;
