import { api } from "@/lib/api";

import type { RoomMember } from "@/types/room";

export type RoomMemberPayload = {
  email: string;
  role?: "USER" | "ADMIN";
};

export const getRoomMembers = async (roomId: number): Promise<RoomMember[]> => {
  const { data } = await api.get<{ members: RoomMember[] }>(
    `/rooms/${roomId}/members`,
  );

  return data.members;
};

export const addRoomMember = async (
  roomId: number,
  payload: RoomMemberPayload,
): Promise<RoomMember> => {
  const { data } = await api.post<{ member: RoomMember }>(
    `/rooms/${roomId}/members`,
    payload,
  );

  return data.member;
};

export const updateRoomMemberRole = async (
  roomId: number,
  memberUserId: number,
  role: "USER" | "ADMIN",
): Promise<RoomMember> => {
  const { data } = await api.patch<{ member: RoomMember }>(
    `/rooms/${roomId}/members/${memberUserId}`,
    { role },
  );

  return data.member;
};

export const removeRoomMember = async (
  roomId: number,
  memberUserId: number,
): Promise<void> => {
  await api.delete(`/rooms/${roomId}/members/${memberUserId}`);
};
