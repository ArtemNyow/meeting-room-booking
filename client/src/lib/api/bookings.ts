import { api } from "../api";

export type BookingStatus = "ACTIVE" | "CANCELLED";

export type Booking = {
  id: number;
  startTime: string;
  endTime: string;
  description: string | null;
  status: BookingStatus;
  userId: number;
  roomId: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateBookingData = {
  startTime: string;
  endTime: string;
  description?: string;
};

export type UpdateBookingData = {
  startTime?: string;
  endTime?: string;
  description?: string;
};

export const getRoomBookings = async (roomId: number): Promise<Booking[]> => {
  const response = await api.get(`/rooms/${roomId}/bookings`);

  return response.data.bookings;
};

export const createBooking = async (
  roomId: number,
  data: CreateBookingData,
): Promise<Booking> => {
  const response = await api.post(`/rooms/${roomId}/bookings`, data);

  return response.data.booking;
};

export const updateBooking = async (
  bookingId: number,
  data: UpdateBookingData,
): Promise<Booking> => {
  const response = await api.patch(`/bookings/${bookingId}`, data);

  return response.data.booking;
};

export const cancelBooking = async (bookingId: number): Promise<Booking> => {
  const response = await api.delete(`/bookings/${bookingId}`);

  return response.data.booking;
};
