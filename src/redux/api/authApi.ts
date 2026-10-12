import baseApi from "./baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    userLogin: builder.mutation({
      query: (data) => ({
        url: `/auth/login`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    sendOtp: builder.mutation({
      query: (data) => ({
        url: `/auth/send-otp`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    OtpVerification: builder.mutation({
      query: (data) => ({
        url: `/auth/verify-otp`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    resetPassword: builder.mutation({
      query: ({ data, token }) => ({
        url: `/auth/reset-password`,
        method: "PATCH",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["auth"],
    }),

    forgetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/forget-password`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
    googleLogin: builder.mutation({
      query: ({ data }) => ({
        url: `/auth/google-login`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
  }),
});

export const {
  useUserLoginMutation,
  useSendOtpMutation,
  useOtpVerificationMutation,
  useResetPasswordMutation,
  useForgetPasswordMutation,
  useGoogleLoginMutation,
} = authApi;
