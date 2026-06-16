import { Request, Response } from "express";
import bcrypt from "bcrypt";
import ms from "ms";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../lib/prisma";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { createVerificationToken, validateToken } from "../utils/token";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  createEmailTemplate,
} from "../utils/email";
import { env } from "../config/env";
import { TokenPayload } from "../models/auth.model";
import { publishToQueue, QUEUES } from "../utils/rabbitmq";

const SALT_ROUNDS = 10;

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const accessMaxAgeMs = ms(
  env.COOKIE_ACCESS_MAX_AGE as Parameters<typeof ms>[0]
);

const refreshMaxAgeMs = ms(
  env.COOKIE_REFRESH_MAX_AGE as Parameters<typeof ms>[0]
);

const buildTokenPayload = (user: TokenPayload): TokenPayload => ({
  id: user.id,
  email: user.email,
  role: user.role,
});

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken?: string
) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    maxAge: accessMaxAgeMs,
  });

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "strict",
      maxAge: refreshMaxAgeMs,
    });
  }
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password } = registerSchema.parse(req.body);

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      res.status(409).json({ message: "Username already taken" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: "USER",
        isEmailVerified: false,
      },
    });

    const token = await createVerificationToken({
      userId: user.id,
      type: "EMAIL_VERIFICATION",
    });

    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
    const emailHtml = createEmailTemplate(
      "Verify Your Email",
      `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for registering at Track Hire! Please verify your email address by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="${verifyUrl}" class="button">Verify Email</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea; font-size: 14px;">${verifyUrl}</p>
      <p>This link will expire in <strong>24 hours</strong>.</p>
      `
    );

    try {
      await publishToQueue(QUEUES.EMAIL_JOBS, {
        to: user.email,
        subject: "Verify Your Email - Track Hire",
        html: emailHtml,
      });
    } catch (queueError) {
      if (env.isProduction) {
        await prisma.verificationToken.deleteMany({
          where: { userId: user.id },
        });

        await prisma.user.delete({
          where: { id: user.id },
        });

        console.error("Failed to publish email job in production:", queueError);
        res.status(503).json({
          message: "Service temporarily unavailable. Please try again later.",
        });
        return;
      }

      console.warn("Failed to publish email job in development:", queueError);
      console.log("Fallback: Sending email directly");

      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        token,
      });
    }

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);

    const result = await validateToken({
      token,
      type: "EMAIL_VERIFICATION",
    });

    if (!result) {
      res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
      return;
    }

    await prisma.user.update({
      where: { id: result.userId },
      data: { isEmailVerified: true },
    });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = loginSchema.parse(req.body);

    const isEmail = emailOrUsername.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: emailOrUsername }
        : { username: emailOrUsername },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.password) {
      res.status(401).json({
        message: "This account uses Google Sign-In. Please login with Google.",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({
        message:
          "Please verify your email before logging in. Check your inbox for the verification link.",
      });
      return;
    }

    const payload = buildTokenPayload(user);

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const googleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idToken } = googleAuthSchema.parse(req.body);

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const googlePayload = ticket.getPayload();

    if (!googlePayload || !googlePayload.email) {
      res.status(401).json({ message: "Invalid Google token" });
      return;
    }

    const { sub: googleId, email, name, picture } = googlePayload;

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatarUrl: picture || user.avatarUrl,
            isEmailVerified: true,
          },
        });
      }
    } else {
      const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
      let username = baseUsername;
      let suffix = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}_${suffix}`;
        suffix++;
      }

      user = await prisma.user.create({
        data: {
          name: name || "Google User",
          username,
          email,
          googleId,
          avatarUrl: picture,
          role: "USER",
          isEmailVerified: true,
        },
      });
    }

    const payload = buildTokenPayload(user);

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Google authentication successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(401).json({
      message:
        error instanceof Error ? error.message : "Google authentication failed",
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
      return;
    }

    if (!user.password) {
      res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
      return;
    }

    const token = await createVerificationToken({
      userId: user.id,
      type: "PASSWORD_RESET",
    });

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
    const emailHtml = createEmailTemplate(
      "Reset Your Password",
      `
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea; font-size: 14px;">${resetUrl}</p>
      <p>This link will expire in <strong>1 hour</strong>.</p>
      `
    );

    try {
      await publishToQueue(QUEUES.EMAIL_JOBS, {
        to: user.email,
        subject: "Reset Your Password - Track Hire",
        html: emailHtml,
      });
    } catch (queueError) {
      if (env.isProduction) {
        await prisma.verificationToken.deleteMany({
          where: { userId: user.id, type: "PASSWORD_RESET" },
        });

        console.error("Failed to publish email job in production:", queueError);
        res.status(503).json({
          message: "Service temporarily unavailable. Please try again later.",
        });
        return;
      }

      console.warn("Failed to publish email job in development:", queueError);
      console.log("Fallback: Sending email directly");

      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        token,
      });
    }

    res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const result = await validateToken({
      token,
      type: "PASSWORD_RESET",
    });

    if (!result) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: result.userId },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    if (!user.password) {
      res.status(400).json({
        message:
          "Password reset is not available for accounts registered via Google. Please sign in with Google.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthCookies(res);

  res.status(200).json({ message: "Logout successful" });
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

    const payload = buildTokenPayload(user);
    const newAccessToken = generateAccessToken(payload);

    setAuthCookies(res, newAccessToken);

    res.status(200).json({
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    res.status(401).json({
      message:
        error instanceof Error ? error.message : "Refresh token not found",
    });
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
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
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
