import { prisma } from "../lib/prisma";

export const addRoomMember = async (
  roomId: number,
  currentUserId: number,
  email: string,
  role: "USER" | "ADMIN",
) => {
  const currentMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: currentUserId,
        roomId,
      },
    },
  });

  if (!currentMember || currentMember.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const existingMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: user.id,
        roomId,
      },
    },
  });

  if (existingMember) {
    throw new Error("User is already a member of this room");
  }

  return prisma.roomMember.create({
    data: {
      userId: user.id,
      roomId,
      role,
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
  });
};

export const getRoomMembers = async (roomId: number, currentUserId: number) => {
  const currentMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: currentUserId,
        roomId,
      },
    },
  });

  if (!currentMember) {
    throw new Error("Forbidden");
  }

  return prisma.roomMember.findMany({
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
      id: "asc",
    },
  });
};

export const updateRoomMemberRole = async (
  roomId: number,
  memberUserId: number,
  currentUserId: number,
  role: "USER" | "ADMIN",
) => {
  const currentMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: currentUserId,
        roomId,
      },
    },
  });

  if (!currentMember || currentMember.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: memberUserId,
        roomId,
      },
    },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  return prisma.roomMember.update({
    where: {
      userId_roomId: {
        userId: memberUserId,
        roomId,
      },
    },
    data: {
      role,
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
  });
};

export const removeRoomMember = async (
  roomId: number,
  memberUserId: number,
  currentUserId: number,
) => {
  const currentMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: currentUserId,
        roomId,
      },
    },
  });

  if (!currentMember || currentMember.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  if (memberUserId === currentUserId) {
    throw new Error("You cannot remove yourself");
  }

  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: memberUserId,
        roomId,
      },
    },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  await prisma.roomMember.delete({
    where: {
      userId_roomId: {
        userId: memberUserId,
        roomId,
      },
    },
  });
};
