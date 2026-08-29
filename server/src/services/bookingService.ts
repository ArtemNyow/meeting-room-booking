import { prisma } from "../lib/prisma";

type CreateBookingData = {
  roomId: number;
  userId: number;
  startTime: Date;
  endTime: Date;
  description?: string;
};

type UpdateBookingData = {
  startTime?: Date;
  endTime?: Date;
  description?: string;
};

const checkRoomMembership = async (roomId: number, userId: number) => {
  return prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
  });
};

const checkBookingConflict = async (
  roomId: number,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: number,
) => {
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      status: "ACTIVE",
      ...(excludeBookingId && {
        id: {
          not: excludeBookingId,
        },
      }),
      startTime: {
        lt: endTime,
      },
      endTime: {
        gt: startTime,
      },
    },
  });

  return Boolean(conflictingBooking);
};

export const createBooking = async ({
  roomId,
  userId,
  startTime,
  endTime,
  description,
}: CreateBookingData) => {
  const member = await checkRoomMembership(roomId, userId);

  if (!member) {
    throw new Error("Forbidden");
  }

  if (startTime >= endTime) {
    throw new Error("Invalid booking time");
  }

  const hasConflict = await checkBookingConflict(roomId, startTime, endTime);

  if (hasConflict) {
    throw new Error("Booking time conflicts with an existing booking");
  }

  return prisma.booking.create({
    data: {
      roomId,
      userId,
      startTime,
      endTime,
      description: description?.trim() || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      room: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const getRoomBookings = async (roomId: number, userId: number) => {
  const member = await checkRoomMembership(roomId, userId);

  if (!member) {
    throw new Error("Forbidden");
  }

  return prisma.booking.findMany({
    where: {
      roomId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });
};

export const updateBooking = async (
  bookingId: number,
  userId: number,
  data: UpdateBookingData,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const member = await checkRoomMembership(booking.roomId, userId);

  if (!member) {
    throw new Error("Forbidden");
  }

  if (member.role !== "ADMIN" && booking.userId !== userId) {
    throw new Error("Forbidden");
  }

  const startTime = data.startTime ?? booking.startTime;
  const endTime = data.endTime ?? booking.endTime;

  if (startTime >= endTime) {
    throw new Error("Invalid booking time");
  }

  const hasConflict = await checkBookingConflict(
    booking.roomId,
    startTime,
    endTime,
    bookingId,
  );

  if (hasConflict) {
    throw new Error("Booking time conflicts with an existing booking");
  }

  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      ...(data.startTime && {
        startTime: data.startTime,
      }),
      ...(data.endTime && {
        endTime: data.endTime,
      }),
      ...(data.description !== undefined && {
        description: data.description.trim() || null,
      }),
    },
  });
};

export const cancelBooking = async (bookingId: number, userId: number) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const member = await checkRoomMembership(booking.roomId, userId);

  if (!member) {
    throw new Error("Forbidden");
  }

  if (member.role !== "ADMIN" && booking.userId !== userId) {
    throw new Error("Forbidden");
  }

  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: "CANCELLED",
    },
  });
};
