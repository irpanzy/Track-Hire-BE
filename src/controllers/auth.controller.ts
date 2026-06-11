import { Request, Response } from "express";
import bcrypt from "bcrypt";
import ms from "ms";
import { prisma } from "../../lib/prisma";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../schemas/auth.schema";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { env } from "../config/env";

const SALT_ROUNDS = 10;

const accessMaxAgeMs = ms(
  env.COOKIE_ACCESS_MAX_AGE as Parameters<typeof ms>[0]
);
const refreshMaxAgeMs = ms(
  env.COOKIE_REFRESH_MAX_AGE as Parameters<typeof ms>[0]
);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "strict",
      maxAge: accessMaxAgeMs,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "strict",
      maxAge: refreshMaxAgeMs,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "strict",
      maxAge: accessMaxAgeMs,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "strict",
      maxAge: refreshMaxAgeMs,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = refreshTokenSchema.parse({
      refreshToken: req.cookies.refreshToken,
    });

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "strict",
      maxAge: accessMaxAgeMs,
    });

    res.status(200).json({ message: "Access token refreshed successfully" });
  } catch (error) {
    res.status(401).json({ message: "Refresh token not found" });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
