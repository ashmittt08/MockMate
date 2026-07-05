import { Request, Response } from 'express';

/**
 * GET /api/health
 * Returns the health status of the API with a consistent response structure.
 */
export const getHealth = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'MockMate Backend Running',
    timestamp: new Date().toISOString(),
  });
};
