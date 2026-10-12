import type { NextFunction, Request, Response } from "express";

// Forwards rejected promises from async route handlers to Express error
// middleware (Express 4 does not await handlers).
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
