import { Router } from 'express';
import {
  createSession,
  saveAnswer,
  completeSession,
  getSession,
} from '../controllers/interviewSession.controller';

const router = Router();

// GET /api/interview-sessions/:id
router.get('/:id', getSession);

// POST /api/interview-sessions
router.post('/', createSession);

// POST /api/interview-sessions/:id/answers
router.post('/:id/answers', saveAnswer);

// PATCH /api/interview-sessions/:id/complete
router.patch('/:id/complete', completeSession);

export default router;
