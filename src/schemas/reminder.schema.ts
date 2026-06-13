import { z } from "zod";

export const createReminderSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .nullable(),
  reminderDate: z.coerce.date({
    message: "Invalid date format",
  }),
  applicationId: z.string().optional().nullable(),
});

export const updateReminderSchema = z.object({
  title: z
    .string()
    .min(1, "Title must be at least 1 character")
    .max(100, "Title must be at most 100 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .nullable(),
  reminderDate: z.coerce
    .date({
      message: "Invalid date format",
    })
    .optional(),
  isDone: z.boolean().optional(),
  applicationId: z.string().optional().nullable(),
});

export const listRemindersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  isDone: z
    .preprocess((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  applicationId: z.string().optional(),
  upcoming: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .default(false),
  sortBy: z.enum(["reminderDate", "createdAt"]).default("reminderDate"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type ListRemindersQueryInput = z.infer<typeof listRemindersQuerySchema>;
