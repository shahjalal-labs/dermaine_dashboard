import baseApi from "./baseApi";

export interface TimeSlot {
  id?: string;
  _id?: string;
  startTime: string;
}

export interface DayAvailability {
  id?: string;
  _id?: string;
  dayOfWeek: number;
  createdAt?: string;
  updatedAt?: string;
  slots: TimeSlot[];
}

export interface CreateSlotPayload {
  dayOfWeek: number;
  startTime: string;
}

export interface AvailabilityResponse<T> {
  success: boolean;
  message: string;
  result: T;
  data?: T;
}

const availabilityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAvailability: builder.query<
      AvailabilityResponse<DayAvailability[]>,
      void
    >({
      query: () => ({
        url: "/availability/all",
        method: "GET",
      }),
      providesTags: ["availability"],
    }),

    getDayWiseSlots: builder.query<
      AvailabilityResponse<DayAvailability>,
      number
    >({
      query: (dayOfWeek) => ({
        url: `/availability/slots/${dayOfWeek}`,
        method: "GET",
      }),
      providesTags: ["availability"],
    }),

    addSlot: builder.mutation<AvailabilityResponse<null>, CreateSlotPayload>({
      query: (data) => ({
        url: "/availability/slot",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["availability"],
    }),

    deleteSlot: builder.mutation<AvailabilityResponse<null>, string>({
      query: (slotId) => ({
        url: `/availability/slot/${slotId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["availability"],
    }),
  }),
});

export const {
  useGetAllAvailabilityQuery,
  useGetDayWiseSlotsQuery,
  useAddSlotMutation,
  useDeleteSlotMutation,
} = availabilityApi;

export default availabilityApi;
