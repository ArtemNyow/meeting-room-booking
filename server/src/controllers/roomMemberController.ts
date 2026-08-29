import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware";

import {
  addRoomMember,
  getRoomMembers,
  removeRoomMember,
  updateRoomMemberRole,
} from "../services/roomMemberService";

export const add = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const roomId = Number(req.params.id);
    const { email, role = "USER" } = req.body;

    if (!Number.isInteger(roomId)) {
      return res.status(400).json({
        message: "Invalid room id",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (role !== "USER" && role !== "ADMIN") {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const member = await addRoomMember(roomId, req.user.id, email, role);

    return res.status(201).json({
      member,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Forbidden") {
        return res.status(403).json({
          message: "Only room admins can manage members",
        });
      }

      if (error.message === "User not found") {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (error.message === "User is already a member of this room") {
        return res.status(409).json({
          message: error.message,
        });
      }
    }

    console.error("Add room member error:", error);

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

    const roomId = Number(req.params.id);

    if (!Number.isInteger(roomId)) {
      return res.status(400).json({
        message: "Invalid room id",
      });
    }

    const members = await getRoomMembers(roomId, req.user.id);

    return res.status(200).json({
      members,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return res.status(403).json({
        message: "You are not a member of this room",
      });
    }

    console.error("Get room members error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const roomId = Number(req.params.id);
    const memberUserId = Number(req.params.userId);
    const { role } = req.body;

    if (!Number.isInteger(roomId) || !Number.isInteger(memberUserId)) {
      return res.status(400).json({
        message: "Invalid id",
      });
    }

    if (role !== "USER" && role !== "ADMIN") {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const member = await updateRoomMemberRole(
      roomId,
      memberUserId,
      req.user.id,
      role,
    );

    return res.status(200).json({
      member,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Forbidden") {
        return res.status(403).json({
          message: "Only room admins can manage members",
        });
      }

      if (error.message === "Member not found") {
        return res.status(404).json({
          message: "Member not found",
        });
      }
    }

    console.error("Update room member error:", error);

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
    const memberUserId = Number(req.params.userId);

    if (!Number.isInteger(roomId) || !Number.isInteger(memberUserId)) {
      return res.status(400).json({
        message: "Invalid id",
      });
    }

    await removeRoomMember(roomId, memberUserId, req.user.id);

    return res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Forbidden") {
        return res.status(403).json({
          message: "Only room admins can manage members",
        });
      }

      if (error.message === "You cannot remove yourself") {
        return res.status(400).json({
          message: error.message,
        });
      }

      if (error.message === "Member not found") {
        return res.status(404).json({
          message: "Member not found",
        });
      }
    }

    console.error("Remove room member error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
