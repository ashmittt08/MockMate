import { Router } from 'express';
import healthRouter from './health.route';
import userRouter from './user.route';
import interviewTemplateRouter from './interviewTemplate.route';

const router = Router();

// Register sub-routers
router.use('/health', healthRouter);
router.use('/users', userRouter);
router.use('/interview-templates', interviewTemplateRouter);

export default router;
