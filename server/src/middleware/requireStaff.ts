import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { verifyToken } from "../lib/jwt.js";

const notFound = (res: Response): void => {
  res.status(404).json({ error: "Not found" });
};

// Staff-only routes answer 404 to everyone else (including anonymous users)
// so the admin's existence is not revealed. The role is read from the
// database on every request, so revoking access takes effect immediately.
export const requireStaff = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const cookies = req.cookies as Record<string, string> | undefined;
  const token = cookies?.auth_token;
  if (!token) {
    notFound(res);
    return;
  }

  let userId: number;
  try {
    const user = verifyToken(token);
    req.user = user;
    userId = user.id;
  } catch {
    notFound(res);
    return;
  }

  db.select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then((rows) => {
      if (rows.at(0)?.role !== "staff") {
        notFound(res);
        return;
      }
      next();
    })
    .catch(next);
};
