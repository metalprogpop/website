import jwt from "jsonwebtoken";
import { authUserSchema, type AuthUser } from "shared";

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
};

export const getJwtExpirationDays = (): number => {
  const days = process.env.JWT_EXPIRATION_DAYS;
  if (!days) {
    return 90;
  }
  const parsed = parseInt(days, 10);
  return Number.isNaN(parsed) ? 90 : parsed;
};

export const signToken = (user: AuthUser): string =>
  jwt.sign({ id: user.id, email: user.email }, getSecret(), {
    expiresIn: getJwtExpirationDays() * 24 * 60 * 60,
  });

export const verifyToken = (token: string): AuthUser => {
  const payload = jwt.verify(token, getSecret());
  const result = authUserSchema.safeParse(payload);
  if (!result.success) {
    throw new Error("Invalid token payload");
  }
  return result.data;
};
