import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { getCache, setCache } from "../utils/redis";

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const cacheKey = `dashboard:stats:${req.user.id}`;
    const cachedStats = await getCache<any>(cacheKey);

    if (cachedStats) {
      res.status(200).json({
        message: "Dashboard statistics fetched successfully (cached)",
        data: cachedStats,
      });
      return;
    }

    const monthlyTrend: Record<string, number> = {};
    const monthsList: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyTrend[key] = 0;
      monthsList.push(key);
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalApplications,
      statusGroups,
      sourceGroups,
      recentApplications,
      trendApps,
    ] = await Promise.all([
      prisma.application.count({
        where: { userId: req.user.id, deletedAt: null },
      }),

      prisma.application.groupBy({
        by: ["status"],
        where: { userId: req.user.id, deletedAt: null },
        _count: { status: true },
      }),

      prisma.application.groupBy({
        by: ["source"],
        where: { userId: req.user.id, deletedAt: null },
        _count: { source: true },
      }),

      prisma.application.findMany({
        where: { userId: req.user.id, deletedAt: null },
        take: 5,
        orderBy: { appliedDate: "desc" },
        select: {
          id: true,
          position: true,
          status: true,
          appliedDate: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      }),

      prisma.application.findMany({
        where: {
          userId: req.user.id,
          deletedAt: null,
          appliedDate: { gte: sixMonthsAgo },
        },
        select: { appliedDate: true },
      }),
    ]);

    const statusDistribution: Record<string, number> = {};
    statusGroups.forEach((group) => {
      statusDistribution[group.status] = group._count.status;
    });

    const sourceDistribution: Record<string, number> = {};
    sourceGroups.forEach((group) => {
      sourceDistribution[group.source] = group._count.source;
    });

    trendApps.forEach((app) => {
      const key = app.appliedDate.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (monthlyTrend[key] !== undefined) {
        monthlyTrend[key]++;
      }
    });

    const monthlyTrendData = monthsList.map((month) => ({
      month,
      count: monthlyTrend[month],
    }));

    const statsData = {
      totalApplications,
      statusDistribution,
      sourceDistribution,
      recentApplications,
      monthlyTrend: monthlyTrendData,
    };

    await setCache(cacheKey, statsData, 300);

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      data: statsData,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
