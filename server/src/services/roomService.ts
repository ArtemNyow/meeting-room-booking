import { prisma } from "../lib/prisma";

type CreateRoomData = {
  name: string;
  description?: string;
};

type UpdateRoomData = {
  name?: string;
  description?: string;
};

export const createRoom = async ({
  name,
  description,
  userId,
}: CreateRoomData & { userId: number }) => {
  const room = await prisma.room.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      members: {
        create: {
          userId,
          role: "ADMIN",
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return room;
};

export const getRooms = async (userId: number) => {
  return prisma.room.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getRoomById = async (roomId: number, userId: number) => {
  return prisma.room.findFirst({
    where: {
      id: roomId,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

export const updateRoom = async (
  roomId: number,
  userId: number,
  data: UpdateRoomData,
) => {
  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
  });

  if (!member || member.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      ...(data.name !== undefined && {
        name: data.name.trim(),
      }),
      ...(data.description !== undefined && {
        description: data.description.trim() || null,
      }),
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

export const deleteRoom = async (roomId: number, userId: number) => {
  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
  });

  if (!member || member.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  await prisma.room.delete({
    where: {
      id: roomId,
    },
  });
};
