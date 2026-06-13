import { z } from "zod";

const applicationSourceEnum = z.enum([
  "LINKEDIN",
  "GLINTS",
  "JOBSTREET",
  "UPWORK",
  "INDEED",
  "WEBSITE",
  "INSTAGRAM",
  "X",
  "OTHER",
]);

const applicationStatusEnum = z.enum([
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "TECHNICAL_TEST",
  "HR_INTERVIEW",
  "OFFERING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
]);

const jobTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
  "REMOTE",
]);

export const createApplicationSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be at most 200 characters"),
  companyWebsite: z.string().url("Invalid URL format").optional(),
  companyLocation: z
    .string()
    .max(200, "Company location must be at most 200 characters")
    .optional(),
  position: z
    .string()
    .min(2, "Position must be at least 2 characters")
    .max(200, "Position must be at most 200 characters"),
  jobType: jobTypeEnum,
  location: z
    .string()
    .max(200, "Location must be at most 200 characters")
    .optional(),
  source: applicationSourceEnum,
  sourceUrl: z.string().url("Invalid URL format").optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  salaryRange: z
    .string()
    .max(100, "Salary range must be at most 100 characters")
    .optional(),
  status: applicationStatusEnum.default("APPLIED"),
  appliedDate: z.coerce.date().optional(),
  deadlineDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateApplicationSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be at most 200 characters")
    .optional(),
  companyWebsite: z.string().url("Invalid URL format").optional(),
  companyLocation: z
    .string()
    .max(200, "Company location must be at most 200 characters")
    .optional(),
  position: z
    .string()
    .min(2, "Position must be at least 2 characters")
    .max(200, "Position must be at most 200 characters")
    .optional(),
  jobType: jobTypeEnum.optional(),
  location: z
    .string()
    .max(200, "Location must be at most 200 characters")
    .optional(),
  source: applicationSourceEnum.optional(),
  sourceUrl: z.string().url("Invalid URL format").optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  salaryRange: z
    .string()
    .max(100, "Salary range must be at most 100 characters")
    .optional(),
  status: applicationStatusEnum.optional(),
  appliedDate: z.coerce.date().optional(),
  deadlineDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const listApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: applicationStatusEnum.optional(),
  source: applicationSourceEnum.optional(),
  jobType: jobTypeEnum.optional(),
  sortBy: z
    .enum(["appliedDate", "createdAt", "position", "status"])
    .default("appliedDate"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ListApplicationsQueryInput = z.infer<
  typeof listApplicationsQuerySchema
>;

export const extractUrlSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

export type ExtractUrlInput = z.infer<typeof extractUrlSchema>;
