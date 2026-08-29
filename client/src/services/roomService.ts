import { api } from "@/lib/api";

import type { CreateRoomData, Room, UpdateRoomData } from "@/types/room";

export const getRooms = async (): Promise<Room[]> => {
  const { data } = await api.get<{ rooms: Room[] }>("/rooms");

  return data.rooms;
};

export const getRoom = async (id: number): Promise<Room> => {
  const { data } = await api.get<{ room: Room }>(`/rooms/${id}`);

  return data.room;
};

export const createRoom = async (roomData: CreateRoomData): Promise<Room> => {
  const { data } = await api.post<{ room: Room }>("/rooms", roomData);

  return data.room;
};

export const updateRoom = async (
  id: number,
  roomData: UpdateRoomData,
): Promise<Room> => {
  const { data } = await api.patch<{ room: Room }>(`/rooms/${id}`, roomData);

  return data.room;
};

export const deleteRoom = async (id: number): Promise<void> => {
  await api.delete(`/rooms/${id}`);
};
