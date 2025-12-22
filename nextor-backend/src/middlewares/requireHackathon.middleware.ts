import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

/**
 * Middleware to ensure `hackathonId` is provided on admin requests.
 * Sources checked (in order): `req.query.hackathonId`, `req.body.hackathonId`, `x-hackathon-id` header.
 * When present, attaches `hackathonId` to the request as `req.hackathonId`.
 */
export const requireHackathonId = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const hackathonId = (req.query.hackathonId as string) || (req.body?.hackathonId as string) || (req.headers['x-hackathon-id'] as string) || undefined;

  if (!hackathonId) {
    return res.status(400).json({ message: 'Missing required parameter: hackathonId. Provide as query param, request body, or x-hackathon-id header.' });
  }

  // Attach to request for downstream handlers (use any to avoid changing global typings here)
  (req as any).hackathonId = hackathonId;

  next();
};

/**
 * Optional hackathon ID middleware.
 * Attaches `hackathonId` to the request if provided, but doesn't fail if missing.
 * Useful for admin routes that can show "all" data when no hackathon is selected.
 */
export const optionalHackathonId = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const hackathonId = (req.query.hackathonId as string) || (req.body?.hackathonId as string) || (req.headers['x-hackathon-id'] as string) || undefined;

  // Attach to request if present (undefined if not)
  (req as any).hackathonId = hackathonId;

  next();
};
