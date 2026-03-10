import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import crypto from "node:crypto";
import { eq, and, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, magicTokens } from "../db/schema.js";
import { magicLinkRequestSchema } from "shared";
import { signToken, getJwtExpirationDays } from "../lib/jwt.js";
import { sendMagicLinkEmail } from "../lib/email.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const getClientUrl = (): string =>
  process.env.CLIENT_URL ?? "http://localhost:5173";

const getTokenExpirationMinutes = (): number => {
  const minutes = process.env.MAGIC_LINK_TOKEN_EXPIRATION_MINUTES;
  if (!minutes) {
    return 10;
  }
  const parsed = parseInt(minutes, 10);
  return Number.isNaN(parsed) ? 10 : parsed;
};

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

const GENERIC_MESSAGE =
  "Si tu email está registrado, te enviamos un link de acceso.";

authRouter.post(
  "/magic-link",
  asyncHandler(async (req, res) => {
    try {
      const parsed = magicLinkRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid email address" });
        return;
      }

      const { email } = parsed.data;

      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const user = rows.at(0);

      if (!user) {
        res.status(200).json({ message: GENERIC_MESSAGE });
        return;
      }

      // Cleanup expired tokens for this user
      await db
        .delete(magicTokens)
        .where(
          and(
            eq(magicTokens.userId, user.id),
            lt(magicTokens.expiresAt, new Date()),
          ),
        );

      const token = crypto.randomBytes(32).toString("hex");
      const expirationMinutes = getTokenExpirationMinutes();
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      await db.insert(magicTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      await sendMagicLinkEmail(email, token);

      res.status(200).json({ message: GENERIC_MESSAGE });
    } catch (error) {
      console.error("Magic link error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }),
);

authRouter.get(
  "/verify",
  asyncHandler(async (req, res) => {
    try {
      const { token } = req.query;

      if (typeof token !== "string") {
        res.redirect(`${getClientUrl()}/fan-clu?error=invalid`);
        return;
      }

      const results = await db
        .select({
          tokenId: magicTokens.id,
          userId: users.id,
          email: users.email,
          expiresAt: magicTokens.expiresAt,
        })
        .from(magicTokens)
        .innerJoin(users, eq(magicTokens.userId, users.id))
        .where(eq(magicTokens.token, token))
        .limit(1);

      const result = results.at(0);

      if (!result || result.expiresAt < new Date()) {
        if (result) {
          await db
            .delete(magicTokens)
            .where(eq(magicTokens.id, result.tokenId));
        }
        res.redirect(`${getClientUrl()}/fan-clu?error=invalid`);
        return;
      }

      await db.delete(magicTokens).where(eq(magicTokens.id, result.tokenId));

      const jwt = signToken({ id: result.userId, email: result.email });
      const maxAge = getJwtExpirationDays() * 24 * 60 * 60 * 1000;

      res.cookie("auth_token", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge,
        path: "/",
      });

      res.redirect(`${getClientUrl()}/fan-clu`);
    } catch (error) {
      console.error("Verify error:", error);
      res.redirect(`${getClientUrl()}/fan-clu?error=invalid`);
    }
  }),
);

authRouter.get("/me", requireAuth, (req, res) => {
  const user = (req as Request & { user: { id: number; email: string } }).user;
  res.json({ id: user.id, email: user.email });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.status(200).json({ message: "Logged out" });
});
