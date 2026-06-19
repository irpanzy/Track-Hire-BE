import { Router } from "express";
import {
  listUsers,
  getUserById,
  updateUser,
  updateAvatar,
  deleteAvatar,
  deleteUser,
  listDeletedUsers,
  restoreUser,
  permanentDeleteUser,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import { uploadSingle } from "../middleware/upload.middleware";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, listUsers);
router.get("/deleted/list", authMiddleware, adminMiddleware, listDeletedUsers);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.put("/:id/avatar", authMiddleware, uploadSingle, updateAvatar);
router.delete("/:id/avatar", authMiddleware, deleteAvatar);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);
router.post("/:id/restore", authMiddleware, adminMiddleware, restoreUser);
router.delete(
  "/:id/permanent",
  authMiddleware,
  adminMiddleware,
  permanentDeleteUser
);

export default router;
