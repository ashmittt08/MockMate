import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

/**
 * POST /api/users/sync
 * Synchronize Firebase user with PostgreSQL database.
 */
export const syncUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firebaseUid, name, email, photoUrl } = req.body;

    // Validate required fields
    if (!firebaseUid || !name || !email) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: firebaseUid, name, and email are required.',
      });
      return;
    }

    const user = await userService.syncUser({
      firebaseUid,
      name,
      email,
      photoUrl,
    });

    res.status(200).json({
      success: true,
      message: 'User synchronized successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
