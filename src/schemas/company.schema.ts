import { z } from "zod";

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be at most 200 characters"),
  website: z
    .string()
    .url("Invalid URL format")
    .optional()
    .nullable()
    .or(z.literal("")),
  location: z
    .string()
    .max(200, "Company location must be at most 200 characters")
    .optional()
    .nullable(),
});

export const updateCompanySchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be at most 200 characters")
    .optional(),
  website: z
    .string()
    .url("Invalid URL format")
    .optional()
    .nullable()
    .or(z.literal("")),
  location: z
    .string()
    .max(200, "Company location must be at most 200 characters")
    .optional()
    .nullable(),
});

export const listCompaniesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  userOnly: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .default(false),
  sortBy: z.enum(["name", "createdAt"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type ListCompaniesQueryInput = z.infer<typeof listCompaniesQuerySchema>;
