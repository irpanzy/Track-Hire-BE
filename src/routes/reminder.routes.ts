import { Router } from "express";
import {
  createReminder,
  listReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
} from "../controllers/reminder.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createReminder);
router.get("/", authMiddleware, listReminders);
router.get("/:id", authMiddleware, getReminderById);
router.put("/:id", authMiddleware, updateReminder);
router.delete("/:id", authMiddleware, deleteReminder);

export default router;
