import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import {
  createReminderSchema,
  updateReminderSchema,
  listRemindersQuerySchema,
} from "../schemas/reminder.schema";

const getParamId = (req: Request): string | null => {
  const { id } = req.params;
  return typeof id === "string" ? id : null;
};

export const createReminder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { title, description, reminderDate, applicationId } =
      createReminderSchema.parse(req.body);

    if (applicationId) {
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          userId: req.user.id,
          deletedAt: null,
        },
      });

      if (!application) {
        res.status(404).json({ message: "Job application not found" });
        return;
      }
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: req.user.id,
        applicationId: applicationId || null,
        title,
        description: description || null,
        reminderDate,
      },
      include: {
        application: {
          select: {
            id: true,
            position: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "Reminder created successfully",
      reminder,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const listReminders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { page, limit, isDone, applicationId, upcoming, sortBy, order } =
      listRemindersQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where: Record<string, any> = {
      userId: req.user.id,
      deletedAt: null,
    };

    if (isDone !== undefined) {
      where.isDone = isDone;
    }

    if (applicationId) {
      where.applicationId = applicationId;
    }

    if (upcoming) {
      where.isDone = false;
      where.reminderDate = { gte: new Date() };
    }

    const [reminders, total] = await Promise.all([
      prisma.reminder.findMany({
        where,
        include: {
          application: {
            select: {
              id: true,
              position: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.reminder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Reminders fetched successfully",
      reminders,
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

export const getReminderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid reminder ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const reminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: req.user.id,
        deletedAt: null,
      },
      include: {
        application: {
          select: {
            id: true,
            position: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!reminder) {
      res.status(404).json({ message: "Reminder not found" });
      return;
    }

    res.status(200).json({
      message: "Reminder fetched successfully",
      reminder,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateReminder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid reminder ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = updateReminderSchema.parse(req.body);

    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: req.user.id,
        deletedAt: null,
      },
    });

    if (!existingReminder) {
      res.status(404).json({ message: "Reminder not found" });
      return;
    }

    if (data.applicationId) {
      const application = await prisma.application.findFirst({
        where: {
          id: data.applicationId,
          userId: req.user.id,
          deletedAt: null,
        },
      });

      if (!application) {
        res.status(404).json({ message: "Job application not found" });
        return;
      }
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data: {
        title: data.title,
        description:
          data.description !== undefined ? data.description || null : undefined,
        reminderDate: data.reminderDate,
        isDone: data.isDone,
        applicationId:
          data.applicationId !== undefined
            ? data.applicationId || null
            : undefined,
      },
      include: {
        application: {
          select: {
            id: true,
            position: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: "Reminder updated successfully",
      reminder,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const deleteReminder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid reminder ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: req.user.id,
        deletedAt: null,
      },
    });

    if (!existingReminder) {
      res.status(404).json({ message: "Reminder not found" });
      return;
    }

    await prisma.reminder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
