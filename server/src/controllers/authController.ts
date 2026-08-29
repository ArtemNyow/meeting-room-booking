import { Request, Response } from "express";

import { loginUser, registerUser } from "../services/authService";
import { AuthRequest } from "../middleware/authMiddleware";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const result = await registerUser({
      name,
      email,
      password,
    });

    return res.status(201).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User with this email already exists"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    user: req.user,
  });
};
