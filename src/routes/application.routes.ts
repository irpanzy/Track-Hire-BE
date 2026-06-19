import { Router } from "express";
import {
  createApplication,
  listApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  extractApplicationFromUrl,
  listDeletedApplications,
  restoreApplication,
  permanentDeleteApplication,
} from "../controllers/application.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createApplication);
router.post("/extract-url", authMiddleware, extractApplicationFromUrl);
router.get("/", authMiddleware, listApplications);
router.get("/deleted/list", authMiddleware, listDeletedApplications);
router.get("/:id", authMiddleware, getApplicationById);
router.put("/:id", authMiddleware, updateApplication);
router.delete("/:id", authMiddleware, deleteApplication);
router.post("/:id/restore", authMiddleware, restoreApplication);
router.delete("/:id/permanent", authMiddleware, permanentDeleteApplication);

export default router;
