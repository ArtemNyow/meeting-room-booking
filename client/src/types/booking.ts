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
  user: {
    id: number;
    name: string;
    email: string;
  };
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
