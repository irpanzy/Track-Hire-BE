import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post("/register", register);

/**
 * POST /auth/login
 * Login user
 */
router.post("/login", login);

/**
 * POST /auth/logout
 * Logout user
 */
router.post("/logout", logout);

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post("/refresh", refreshAccessToken);

/**
 * GET /auth/me
 * Get current user profile (protected route)
 */
router.get("/me", authMiddleware, getCurrentUser);

export default router;
