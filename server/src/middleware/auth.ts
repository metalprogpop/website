import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const cookies = req.cookies as Record<string, string> | undefined;
  const token = cookies?.auth_token;

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = verifyToken(token);
    (req as Request & { user: { id: number; email: string } }).user = {
      id: payload.userId,
      email: payload.email,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
