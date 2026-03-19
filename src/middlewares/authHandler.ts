import { NextFunction, Request, Response } from "express";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req && typeof req.isAuthenticated === "function") {
    if (req.isAuthenticated()) return next();
  }
  if (req && req.user) return next();
  return res.status(401).send({ message: "session expired" });
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req && req.user && req.user.role === "admin") return next();
  return res.sendStatus(403);
};

export default {protect, isAdmin}