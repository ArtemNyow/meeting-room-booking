export type RoomRole = "USER" | "ADMIN";

export type RoomMember = {
  id: number;
  role: RoomRole;
  userId: number;
  roomId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export type Room = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  members: RoomMember[];
};

export type CreateRoomData = {
  name: string;
  description?: string;
};

export type UpdateRoomData = {
  name?: string;
  description?: string;
};
