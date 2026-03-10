import jwt from "jsonwebtoken";
import type { AuthUser } from "shared";

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
};

export const getJwtExpirationDays = (): number => {
  const days = process.env.JWT_EXPIRATION_DAYS;
  return days ? parseInt(days, 10) : 90;
};

export const signToken = (user: AuthUser): string => {
  return jwt.sign({ userId: user.id, email: user.email }, getSecret(), {
    expiresIn: `${getJwtExpirationDays()}d`,
  });
};

export const verifyToken = (
  token: string,
): { userId: number; email: string } => {
  const payload = jwt.verify(token, getSecret());
  if (
    typeof payload === "object" &&
    "userId" in payload &&
    "email" in payload &&
    typeof payload.userId === "number" &&
    typeof payload.email === "string"
  ) {
    return { userId: payload.userId, email: payload.email };
  }
  throw new Error("Invalid token payload");
};
