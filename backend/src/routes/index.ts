import { Router } from 'express';
import healthRouter from './health.route';

const router = Router();

// Register sub-routers
router.use('/health', healthRouter);

export default router;
