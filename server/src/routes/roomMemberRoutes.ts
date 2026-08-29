import { Router } from "express";

import {
  add,
  getAll,
  remove,
  updateRole,
} from "../controllers/roomMemberController";

import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/:id/members", getAll);
router.post("/:id/members", add);
router.patch("/:id/members/:userId", updateRole);
router.delete("/:id/members/:userId", remove);

export default router;
