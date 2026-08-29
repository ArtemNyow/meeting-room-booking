import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware";

import {
  cancelBooking,
  createBooking,
  getRoomBookings,
  updateBooking,
} from "../services/bookingService";

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const roomId = Number(req.params.roomId);
    const { startTime, endTime, description } = req.body;

    if (!Number.isInteger(roomId)) {
      return res.status(400).json({
        message: "Invalid room id",
      });
    }

    const parsedStartTime = parseDate(startTime);
    const parsedEndTime = parseDate(endTime);

    if (!parsedStartTime || !parsedEndTime) {
      return res.status(400).json({
        message: "Invalid startTime or endTime",
      });
    }

    const booking = await createBooking({
      roomId,
      userId: req.user.id,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      description,
    });

    return res.status(201).json({
      booking,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Forbidden") {
        return res.status(403).json({
          message: "You are not a member of this room",
        });
      }

      if (error.message === "Invalid booking time") {
        return res.status(400).json({
          message: error.message,
        });
      }

      if (error.message === "Booking time conflicts with an existing booking") {
        return res.status(409).json({
          message: error.message,
        });
      }
    }

    console.error("Create booking error:", error);

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

    const roomId = Number(req.params.roomId);

    if (!Number.isInteger(roomId)) {
      return res.status(400).json({
        message: "Invalid room id",
      });
    }

    const bookings = await getRoomBookings(roomId, req.user.id);

    return res.status(200).json({
      bookings,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return res.status(403).json({
        message: "You are not a member of this room",
      });
    }

    console.error("Get bookings error:", error);

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

    const bookingId = Number(req.params.id);

    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking id",
      });
    }

    const { startTime, endTime, description } = req.body;

    const data: {
      startTime?: Date;
      endTime?: Date;
      description?: string;
    } = {};

    if (startTime !== undefined) {
      const parsedStartTime = parseDate(startTime);

      if (!parsedStartTime) {
        return res.status(400).json({
          message: "Invalid startTime",
        });
      }

      data.startTime = parsedStartTime;
    }

    if (endTime !== undefined) {
      const parsedEndTime = parseDate(endTime);

      if (!parsedEndTime) {
        return res.status(400).json({
          message: "Invalid endTime",
        });
      }

      data.endTime = parsedEndTime;
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Invalid description",
        });
      }

      data.description = description;
    }

    const booking = await updateBooking(bookingId, req.user.id, data);

    return res.status(200).json({
      booking,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Booking not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error.message === "Forbidden") {
        return res.status(403).json({
          message: "You do not have permission to update this booking",
        });
      }

      if (error.message === "Invalid booking time") {
        return res.status(400).json({
          message: error.message,
        });
      }

      if (error.message === "Booking time conflicts with an existing booking") {
        return res.status(409).json({
          message: error.message,
        });
      }
    }

    console.error("Update booking error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const cancel = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const bookingId = Number(req.params.id);

    if (!Number.isInteger(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking id",
      });
    }

    const booking = await cancelBooking(bookingId, req.user.id);

    return res.status(200).json({
      booking,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Booking not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error.message === "Forbidden") {
        return res.status(403).json({
          message: "You do not have permission to cancel this booking",
        });
      }
    }

    console.error("Cancel booking error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
