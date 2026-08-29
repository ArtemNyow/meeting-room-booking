import { api } from "@/lib/api";
import type {
  Booking,
  CreateBookingData,
  UpdateBookingData,
} from "@/types/booking";

export const getRoomBookings = async (roomId: number): Promise<Booking[]> => {
  const { data } = await api.get<{ bookings: Booking[] }>(
    `/rooms/${roomId}/bookings`,
  );

  return data.bookings;
};

export const createBooking = async (
  roomId: number,
  bookingData: CreateBookingData,
): Promise<Booking> => {
  const { data } = await api.post<{ booking: Booking }>(
    `/rooms/${roomId}/bookings`,
    bookingData,
  );

  return data.booking;
};

export const updateBooking = async (
  id: number,
  bookingData: UpdateBookingData,
): Promise<Booking> => {
  const { data } = await api.patch<{ booking: Booking }>(
    `/bookings/${id}`,
    bookingData,
  );

  return data.booking;
};

export const cancelBooking = async (id: number): Promise<Booking> => {
  const { data } = await api.delete<{ booking: Booking }>(`/bookings/${id}`);

  return data.booking;
};
