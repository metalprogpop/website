import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { hasFanClubAccess } from "../fanClub/access.js";
import { latestStatusForEmail } from "../fanClub/queries.js";
import { verifyToken } from "../lib/jwt.js";

const cookiesSchema = z.object({ auth_token: z.string().min(1) });

// Members-only routes: staff, and fans whose latest subscription is active.
// Access is read from the database on every request (never from the JWT),
// so a lapsed subscription stops getting video URLs right away.
export const requireFanClubAccess = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const cookies = cookiesSchema.safeParse(req.cookies);
  let userId: number;
  try {
    if (!cookies.success) {
      throw new Error("No session");
    }
    const user = verifyToken(cookies.data.auth_token);
    req.user = user;
    userId = user.id;
  } catch {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  db.select({ email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then(async (rows) => {
      const user = rows.at(0);
      if (!user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const latestStatus = await latestStatusForEmail(user.email);
      if (!hasFanClubAccess({ role: user.role, latestStatus })) {
        res.status(403).json({ error: "Solo para el Fan Clú" });
        return;
      }
      next();
    })
    .catch(next);
};
