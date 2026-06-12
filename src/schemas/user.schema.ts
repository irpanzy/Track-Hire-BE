import { z } from "zod";

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  sortBy: z
    .enum(["name", "username", "email", "createdAt"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQueryInput = z.infer<typeof listUsersQuerySchema>;
