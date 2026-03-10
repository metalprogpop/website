import jwt from "jsonwebtoken";
import type { AuthUser } from "shared";

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
};

const getExpirationDays = (): number => {
  const days = process.env.JWT_EXPIRATION_DAYS;
  return days ? parseInt(days, 10) : 90;
};

export const signToken = (user: AuthUser): string => {
  return jwt.sign({ userId: user.id, email: user.email }, getSecret(), {
    expiresIn: `${getExpirationDays()}d`,
  });
};

export const verifyToken = (
  token: string,
): { userId: number; email: string } => {
  return jwt.verify(token, getSecret()) as { userId: number; email: string };
};
