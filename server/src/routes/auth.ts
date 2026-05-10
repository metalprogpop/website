import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import crypto from "node:crypto";
import { eq, and, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, magicTokens } from "../db/schema.js";
import { magicLinkRequestSchema } from "shared";
import { signToken, getJwtExpirationDays } from "../lib/jwt.js";
import { sendMagicLinkEmail, buildMagicLinkUrl } from "../lib/email.js";
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

const isFlagEnabled = (val: string | undefined): boolean =>
  val === "true" || val === "1";

const getTestUserEmails = (): readonly string[] => {
  const raw = process.env.TEST_USER_EMAILS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
};

const isTestUser = (email: string): boolean => {
  if (!isFlagEnabled(process.env.TEST_USERS_ENABLED)) {
    return false;
  }
  return getTestUserEmails().includes(email.toLowerCase());
};

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

const GENERIC_MESSAGE =
  "Si tu email está registrado, te enviamos un link de acceso.";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const genericSuccess = (_req: Request, res: Response): void => {
  res.status(200).json({ message: GENERIC_MESSAGE });
};

const magicLinkIpLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: genericSuccess,
});

const magicLinkEmailLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const body = req.body as { email?: unknown } | undefined;
    if (body && typeof body.email === "string") {
      return body.email.toLowerCase();
    }
    return ipKeyGenerator(req.ip ?? "unknown");
  },
  handler: genericSuccess,
});

const setAuthCookie = (res: Response, jwt: string): void => {
  const maxAge = getJwtExpirationDays() * 24 * 60 * 60 * 1000;
  res.cookie("auth_token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
    path: "/",
  });
};

const upsertTestUser = async (
  email: string,
): Promise<{ id: number; email: string }> => {
  const existing = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const found = existing.at(0);
  if (found) {
    return found;
  }
  const inserted = await db
    .insert(users)
    .values({ email })
    .returning({ id: users.id, email: users.email });
  const created = inserted.at(0);
  if (!created) {
    throw new Error("Failed to upsert test user");
  }
  return created;
};

const issueMagicLinkIfRegistered = async (
  email: string,
): Promise<{ token: string } | null> => {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows.at(0);
  if (!user) {
    return null;
  }

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

  return { token };
};

authRouter.post(
  "/magic-link",
  magicLinkIpLimiter,
  magicLinkEmailLimiter,
  asyncHandler(async (req, res) => {
    const parsed = magicLinkRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const email = parsed.data.email.toLowerCase();

    if (isTestUser(email)) {
      const user = await upsertTestUser(email);
      const jwt = signToken({ id: user.id, email: user.email });
      setAuthCookie(res, jwt);
      res.status(200).json({ authenticated: true, message: GENERIC_MESSAGE });
      return;
    }

    const issued = await issueMagicLinkIfRegistered(email);
    const showLink = isFlagEnabled(process.env.DEV_SHOW_MAGIC_LINK);

    if (issued && showLink) {
      res.status(200).json({
        message: GENERIC_MESSAGE,
        magicLink: buildMagicLinkUrl(issued.token),
      });
      return;
    }

    if (issued) {
      try {
        await sendMagicLinkEmail(email, issued.token);
      } catch (err) {
        console.error("Magic link email send failed", err);
      }
    }

    res.status(200).json({ message: GENERIC_MESSAGE });
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
      setAuthCookie(res, jwt);

      res.redirect(`${getClientUrl()}/fan-clu`);
    } catch (error) {
      console.error("Verify error:", error);
      res.redirect(`${getClientUrl()}/fan-clu?error=invalid`);
    }
  }),
);

authRouter.get("/me", requireAuth, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  res.json(req.user);
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
