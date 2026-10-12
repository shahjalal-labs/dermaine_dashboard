import baseApi from "./baseApi";

export interface GetAllPaymentsQueryArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPayments: builder.query<any, GetAllPaymentsQueryArgs | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));
        if (params?.search) queryParams.append("search", params.search);
        if (params?.status) queryParams.append("status", params.status);

        const qs = queryParams.toString();
        return {
          url: `/consultation/payments${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["payments"],
    }),

    getConsultationFees: builder.query<any, void>({
      query: () => ({
        url: "/consultation/fees",
        method: "GET",
      }),
      providesTags: ["consultation"],
    }),

    updateConsultationFees: builder.mutation<
      any,
      {
        phoneThirtyMinutesFee?: number;
        phoneOneHourFee?: number;
        teamsThirtyMinutesFee?: number;
        teamsOneHourFee?: number;
        strategyReport?: number;
        consultation15?: number;
        consultation30?: number;
        consultation60?: number;
        thirtyMinFee?: number;
        sixtyMinFee?: number;
        [key: string]: any;
      }
    >({
      query: (body) => ({
        url: "/consultation/fees",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["consultation"],
    }),

    getAllConsultations: builder.query<
      any,
      { page?: number; limit?: number; status?: string; search?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));
        if (params?.search) queryParams.append("search", params.search);
        if (params?.status) queryParams.append("status", params.status);
        const qs = queryParams.toString();
        return {
          url: `/consultation/all${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["consultation"],
    }),

    updateConsultationStatus: builder.mutation<
      any,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/consultation/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["consultation"],
    }),
  }),
});

export const {
  useGetAllPaymentsQuery,
  useGetConsultationFeesQuery,
  useUpdateConsultationFeesMutation,
  useGetAllConsultationsQuery,
  useUpdateConsultationStatusMutation,
} = paymentApi;

export default paymentApi;
