import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { updateUserSchema, listUsersQuerySchema } from "../schemas/user.schema";
import { uploadAvatar, deleteImage } from "../utils/imagekit";

const USER_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  avatarUrl: true,
  isEmailVerified: true,
  createdAt: true,
} as const;

const getParamId = (req: Request): string | null => {
  const { id } = req.params;
  return typeof id === "string" ? id : null;
};

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, role, sortBy, order } =
      listUsersQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Users fetched successfully",
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (req.user.id !== id && req.user.role !== "ADMIN") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_SELECT,
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

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (req.user.id !== id && req.user.role !== "ADMIN") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const data = updateUserSchema.parse(req.body);

    if (Object.keys(data).length === 0) {
      res
        .status(400)
        .json({ message: "At least one field is required to update" });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (data.username && data.username !== existingUser.username) {
      const usernameTaken = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (usernameTaken) {
        res.status(409).json({ message: "Username already taken" });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const updateAvatar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (req.user.id !== id && req.user.role !== "ADMIN") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Delete old avatar from ImageKit if exists
    if (existingUser.avatarFileId) {
      await deleteImage(existingUser.avatarFileId);
    }

    const { url, fileId } = await uploadAvatar(req.file.buffer, `avatar_${id}`);

    const user = await prisma.user.update({
      where: { id },
      data: {
        avatarUrl: url,
        avatarFileId: fileId,
      },
      select: USER_SELECT,
    });

    res.status(200).json({
      message: "Avatar updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to upload avatar",
    });
  }
};

export const deleteAvatar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (req.user.id !== id && req.user.role !== "ADMIN") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!existingUser.avatarUrl) {
      res.status(400).json({ message: "User does not have an avatar" });
      return;
    }

    if (existingUser.avatarFileId) {
      await deleteImage(existingUser.avatarFileId);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        avatarUrl: null,
        avatarFileId: null,
      },
      select: USER_SELECT,
    });

    res.status(200).json({
      message: "Avatar deleted successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to delete avatar",
    });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
