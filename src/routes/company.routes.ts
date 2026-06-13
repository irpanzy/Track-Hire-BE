import { Router } from "express";
import {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createCompany);
router.get("/", authMiddleware, listCompanies);
router.get("/:id", authMiddleware, getCompanyById);
router.put("/:id", authMiddleware, updateCompany);
router.delete("/:id", authMiddleware, deleteCompany);

export default router;
