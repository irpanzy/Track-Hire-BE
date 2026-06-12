import { Request, Response, NextFunction } from "express";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({ message: "Forbidden. Admin access required." });
    return;
  }

  next();
};
