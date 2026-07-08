import { Router } from 'express';
import healthRouter from './health.route';
import userRouter from './user.route';

const router = Router();

// Register sub-routers
router.use('/health', healthRouter);
router.use('/users', userRouter);

export default router;
