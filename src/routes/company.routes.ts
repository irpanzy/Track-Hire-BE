import { Router } from "express";
import {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  listDeletedCompanies,
  restoreCompany,
  permanentDeleteCompany,
} from "../controllers/company.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createCompany);
router.get("/", authMiddleware, listCompanies);
router.get("/deleted/list", authMiddleware, listDeletedCompanies);
router.get("/:id", authMiddleware, getCompanyById);
router.put("/:id", authMiddleware, updateCompany);
router.delete("/:id", authMiddleware, deleteCompany);
router.post("/:id/restore", authMiddleware, restoreCompany);
router.delete("/:id/permanent", authMiddleware, permanentDeleteCompany);

export default router;
