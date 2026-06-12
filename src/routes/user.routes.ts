import { Router } from "express";
import {
  listUsers,
  getUserById,
  updateUser,
  updateAvatar,
  deleteAvatar,
  deleteUser,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import { uploadSingle } from "../middleware/upload.middleware";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, listUsers);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.put("/:id/avatar", authMiddleware, uploadSingle, updateAvatar);
router.delete("/:id/avatar", authMiddleware, deleteAvatar);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;
