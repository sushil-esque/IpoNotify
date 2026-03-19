import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      googleId?: string;
      email: string;
      role: "admin" | "user";
      password?: string;
    }
  }
}
