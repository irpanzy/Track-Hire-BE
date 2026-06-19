import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import {
  createApplicationSchema,
  updateApplicationSchema,
  listApplicationsQuerySchema,
  extractUrlSchema,
} from "../schemas/application.schema";
import { scrapeUrl } from "../utils/scraper";
import { extractJobDetails } from "../utils/gemini";
import {
  deleteCache,
  getCache,
  setCache,
  checkRateLimit,
} from "../utils/redis";
import { createHash } from "crypto";

const APPLICATION_SELECT = {
  id: true,
  position: true,
  jobType: true,
  location: true,
  source: true,
  sourceUrl: true,
  description: true,
  requirements: true,
  salaryRange: true,
  status: true,
  appliedDate: true,
  deadlineDate: true,
  notes: true,
  createdAt: true,
  company: {
    select: {
      id: true,
      name: true,
      website: true,
      location: true,
    },
  },
} as const;

const getParamId = (req: Request): string | null => {
  const { id } = req.params;
  return typeof id === "string" ? id : null;
};

const findOrCreateCompany = async (
  name: string,
  website?: string,
  location?: string
) => {
  const existing = await prisma.company.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      deletedAt: null,
    },
  });

  if (existing) {
    const updateData: Record<string, string> = {};
    if (website && !existing.website) updateData.website = website;
    if (location && !existing.location) updateData.location = location;

    if (Object.keys(updateData).length > 0) {
      return prisma.company.update({
        where: { id: existing.id },
        data: updateData,
      });
    }

    return existing;
  }

  return prisma.company.create({
    data: { name, website, location },
  });
};

export const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const {
      companyName,
      companyWebsite,
      companyLocation,
      position,
      jobType,
      location,
      source,
      sourceUrl,
      description,
      requirements,
      salaryRange,
      status,
      appliedDate,
      deadlineDate,
      notes,
    } = createApplicationSchema.parse(req.body);

    const company = await findOrCreateCompany(
      companyName,
      companyWebsite,
      companyLocation
    );

    const application = await prisma.application.create({
      data: {
        userId: req.user.id,
        companyId: company.id,
        position,
        jobType,
        location,
        source,
        sourceUrl,
        description,
        requirements,
        salaryRange,
        status,
        appliedDate: appliedDate || new Date(),
        deadlineDate,
        notes,
        histories: {
          create: {
            oldStatus: null,
            newStatus: status,
            notes: "Application created",
          },
        },
      },
      select: APPLICATION_SELECT,
    });

    await deleteCache(`dashboard:stats:${req.user.id}`);

    res.status(201).json({
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const listApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { page, limit, search, status, source, jobType, sortBy, order } =
      listApplicationsQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (req.user.role !== "ADMIN") {
      where.userId = req.user.id;
    }

    if (search) {
      where.OR = [
        { position: { contains: search, mode: "insensitive" } },
        {
          company: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (jobType) {
      where.jobType = jobType;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        select: APPLICATION_SELECT,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.application.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Applications fetched successfully",
      applications,
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

export const getApplicationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid application ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const application = await prisma.application.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...APPLICATION_SELECT,
        histories: {
          select: {
            id: true,
            oldStatus: true,
            newStatus: true,
            notes: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    const applicationOwner = await prisma.application.findFirst({
      where: { id, deletedAt: null },
      select: { userId: true },
    });

    if (
      applicationOwner &&
      applicationOwner.userId !== req.user.id &&
      req.user.role !== "ADMIN"
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.status(200).json({
      message: "Application fetched successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid application ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = updateApplicationSchema.parse(req.body);

    if (Object.keys(data).length === 0) {
      res
        .status(400)
        .json({ message: "At least one field is required to update" });
      return;
    }

    const existingApplication = await prisma.application.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingApplication) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    if (
      existingApplication.userId !== req.user.id &&
      req.user.role !== "ADMIN"
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { companyName, companyWebsite, companyLocation, ...applicationData } =
      data;

    let { companyId } = existingApplication;

    if (companyName) {
      const company = await findOrCreateCompany(
        companyName,
        companyWebsite,
        companyLocation
      );
      companyId = company.id;
    }

    const statusChanged =
      data.status && data.status !== existingApplication.status;

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...applicationData,
        companyId,
        ...(statusChanged
          ? {
              histories: {
                create: {
                  oldStatus: existingApplication.status,
                  newStatus: data.status!,
                  notes: data.notes || null,
                },
              },
            }
          : {}),
      },
      select: APPLICATION_SELECT,
    });

    await deleteCache(`dashboard:stats:${req.user.id}`);

    res.status(200).json({
      message: "Application updated successfully",
      application,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const deleteApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid application ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existingApplication = await prisma.application.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingApplication) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    if (
      existingApplication.userId !== req.user.id &&
      req.user.role !== "ADMIN"
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    await prisma.application.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await deleteCache(`dashboard:stats:${req.user.id}`);

    res.status(200).json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const extractApplicationFromUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { url } = extractUrlSchema.parse(req.body);

    const rateLimitKey = `ai-import:rate:${req.user.id}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 10, 3600);

    if (!rateLimit.allowed) {
      res.status(429).json({
        message: "Rate limit exceeded. You can extract up to 10 URLs per hour.",
        retryAfter: 3600,
      });
      return;
    }

    const urlHash = createHash("sha256").update(url).digest("hex");
    const cacheKey = `ai-import:${urlHash}`;

    const cachedData = await getCache<any>(cacheKey);

    if (cachedData) {
      res.status(200).json({
        message: "Job details extracted successfully (cached)",
        data: {
          ...cachedData,
          sourceUrl: url,
        },
      });
      return;
    }

    const cleanText = await scrapeUrl(url);
    const extractedData = await extractJobDetails(cleanText, url);

    await setCache(cacheKey, extractedData, 604800);

    const result = {
      ...extractedData,
      sourceUrl: url,
    };

    res.status(200).json({
      message: "Job details extracted successfully",
      data: result,
    });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      res.status(400).json({
        message: "Validation failed",
        errors: error,
      });
      return;
    }

    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to extract job details",
    });
  }
};

export const listDeletedApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { page, limit, search, status, source, jobType } =
      listApplicationsQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: { not: null },
      userId: req.user.id,
    };

    if (search) {
      where.OR = [
        { position: { contains: search, mode: "insensitive" } },
        {
          company: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (jobType) {
      where.jobType = jobType;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        select: {
          ...APPLICATION_SELECT,
          deletedAt: true,
        },
        skip,
        take: limit,
        orderBy: { deletedAt: "desc" },
      }),
      prisma.application.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Deleted applications fetched successfully",
      applications,
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

export const restoreApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid application ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    if (existingApplication.userId !== req.user.id) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (!existingApplication.deletedAt) {
      res.status(400).json({ message: "Application is not deleted" });
      return;
    }

    const application = await prisma.application.update({
      where: { id },
      data: { deletedAt: null },
      select: APPLICATION_SELECT,
    });

    await deleteCache(`dashboard:stats:${req.user.id}`);

    res.status(200).json({
      message: "Application restored successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const permanentDeleteApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid application ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    if (existingApplication.userId !== req.user.id) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.applicationHistory.deleteMany({
        where: { applicationId: id },
      });

      await tx.reminder.updateMany({
        where: { applicationId: id },
        data: { applicationId: null },
      });

      await tx.application.delete({
        where: { id },
      });
    });

    await deleteCache(`dashboard:stats:${req.user.id}`);

    res.status(200).json({
      message: "Application permanently deleted",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
