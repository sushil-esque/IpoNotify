import { NextFunction, Request, Response } from "express";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(`[DEBUG] Protect Middleware: isAuthenticated: ${typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : 'N/A'}, hasUser: ${!!req.user}`);
  
  if (req && typeof req.isAuthenticated === "function") {
    if (req.isAuthenticated()) return next();
  }
  if (req && req.user) return next();
  
  console.log(`[DEBUG] Protect Middleware: Access Denied (401)`);
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