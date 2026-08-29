import { Request, Response } from "express";

import {
  createRoom,
  deleteRoom,
  getRoomById,
  getRooms,
  updateRoom,
} from "../services/roomService";

import { AuthRequest } from "../middleware/authMiddleware";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Room name is required",
      });
    }

    const room = await createRoom({
      name,
      description,
      userId: req.user.id,
    });

    return res.status(201).json({
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const rooms = await getRooms(req.user.id);

    return res.status(200).json({
      rooms,
    });
  } catch (error) {
    console.error("Get rooms error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getOne = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const roomId = Number(req.params.id);

    if (!Number.isInteger(roomId)) {
      return res.status(400).json({
        message: "Invalid room id",
      });
    }

    const room = await getRoomById(roomId, req.user.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    return res.status(200).json({
      room,
    });
  } catch (error) {
    console.error("Get room error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const roomId = Number(req.params.id);

    if (!Number.isInteger(roomId)) {
      return res.status(400).json({
        message: "Invalid room id",
      });
    }

    const { name, description } = req.body;

    const room = await updateRoom(roomId, req.user.id, {
      name,
      description,
    });

    return res.status(200).json({
      room,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return res.status(403).json({
        message: "Only room admins can update the room",
      });
    }

    console.error("Update room error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const roomId = Number(req.params.id);

    if (!Number.isInteger(roomId)) {
      return res.status(400).json({
        message: "Invalid room id",
      });
    }

    await deleteRoom(roomId, req.user.id);

    return res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return res.status(403).json({
        message: "Only room admins can delete the room",
      });
    }

    console.error("Delete room error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
