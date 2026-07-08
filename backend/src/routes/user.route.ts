import { Router } from 'express';
import { syncUser } from '../controllers/user.controller';

const router = Router();

// POST /api/users/sync
router.post('/sync', syncUser);

export default router;
