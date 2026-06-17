import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import {
  createCompanySchema,
  updateCompanySchema,
  listCompaniesQuerySchema,
} from "../schemas/company.schema";

const COMPANY_SELECT = {
  id: true,
  name: true,
  website: true,
  location: true,
  createdAt: true,
  updatedAt: true,
} as const;

const getParamId = (req: Request): string | null => {
  const { id } = req.params;
  return typeof id === "string" ? id : null;
};

export const createCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, website, location } = createCompanySchema.parse(req.body);

    const existing = await prisma.company.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (existing) {
      res.status(409).json({ message: "Company already exists" });
      return;
    }

    const company = await prisma.company.create({
      data: {
        name,
        website: website || null,
        location: location || null,
      },
      select: COMPANY_SELECT,
    });

    res.status(201).json({
      message: "Company created successfully",
      company,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const listCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { page, limit, search, userOnly, sortBy, order } =
      listCompaniesQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where: Record<string, any> = {
      deletedAt: null,
    };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (userOnly) {
      where.applications = {
        some: {
          userId: req.user.id,
          deletedAt: null,
        },
      };
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        select: COMPANY_SELECT,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.company.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Companies fetched successfully",
      companies,
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

export const getCompanyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid company ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const company = await prisma.company.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...COMPANY_SELECT,
        applications: {
          where: {
            userId: req.user.id,
            deletedAt: null,
          },
          select: {
            id: true,
            position: true,
            jobType: true,
            status: true,
            appliedDate: true,
            createdAt: true,
          },
          orderBy: { appliedDate: "desc" },
        },
      },
    });

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    res.status(200).json({
      message: "Company fetched successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid company ID" });
      return;
    }

    const data = updateCompanySchema.parse(req.body);

    const existingCompany = await prisma.company.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingCompany) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    if (
      data.name &&
      data.name.toLowerCase() !== existingCompany.name.toLowerCase()
    ) {
      const conflict = await prisma.company.findFirst({
        where: {
          name: { equals: data.name, mode: "insensitive" },
          deletedAt: null,
        },
      });

      if (conflict) {
        res.status(409).json({ message: "Company name already taken" });
        return;
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name: data.name,
        website: data.website !== undefined ? data.website || null : undefined,
        location:
          data.location !== undefined ? data.location || null : undefined,
      },
      select: COMPANY_SELECT,
    });

    res.status(200).json({
      message: "Company updated successfully",
      company,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Bad request",
    });
  }
};

export const deleteCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid company ID" });
      return;
    }

    const existingCompany = await prisma.company.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingCompany) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    await prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({
      message: "Company deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listDeletedCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { page, limit, search, sortBy, order } =
      listCompaniesQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where: Record<string, any> = {
      deletedAt: { not: null },
    };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        select: {
          ...COMPANY_SELECT,
          deletedAt: true,
        },
        skip,
        take: limit,
        orderBy: { deletedAt: "desc" },
      }),
      prisma.company.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Deleted companies fetched successfully",
      companies,
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

export const restoreCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid company ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existingCompany = await prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    if (!existingCompany.deletedAt) {
      res.status(400).json({ message: "Company is not deleted" });
      return;
    }

    const company = await prisma.company.update({
      where: { id },
      data: { deletedAt: null },
      select: COMPANY_SELECT,
    });

    res.status(200).json({
      message: "Company restored successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const permanentDeleteCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req);

    if (!id) {
      res.status(400).json({ message: "Invalid company ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        applications: {
          select: { id: true },
        },
      },
    });

    if (!existingCompany) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    if (existingCompany.applications.length > 0) {
      res.status(400).json({
        message:
          "Cannot permanently delete company with existing applications. Delete or reassign applications first.",
      });
      return;
    }

    await prisma.company.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Company permanently deleted",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
