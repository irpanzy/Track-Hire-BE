import { Router } from "express";
import {
  createReminder,
  listReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  listDeletedReminders,
  restoreReminder,
  permanentDeleteReminder,
} from "../controllers/reminder.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createReminder);
router.get("/", authMiddleware, listReminders);
router.get("/deleted/list", authMiddleware, listDeletedReminders);
router.get("/:id", authMiddleware, getReminderById);
router.put("/:id", authMiddleware, updateReminder);
router.delete("/:id", authMiddleware, deleteReminder);
router.post("/:id/restore", authMiddleware, restoreReminder);
router.delete("/:id/permanent", authMiddleware, permanentDeleteReminder);

export default router;
