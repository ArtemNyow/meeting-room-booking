import { Router } from "express";

import {
  cancel,
  create,
  getAll,
  update,
} from "../controllers/bookingController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/rooms/:roomId/bookings", getAll);
router.post("/rooms/:roomId/bookings", create);

router.patch("/bookings/:id", update);
router.delete("/bookings/:id", cancel);

export default router;
