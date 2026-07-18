import { Router } from 'express';
import {
  createSession,
  saveAnswer,
  completeSession,
  getSession,
  getActiveSession,
  abandonSession,
  getEvaluation,
} from '../controllers/interviewSession.controller';

const router = Router();

// GET /api/interview-sessions/active
router.get('/active', getActiveSession);

// GET /api/interview-sessions/:id/evaluation
router.get('/:id/evaluation', getEvaluation);

// GET /api/interview-sessions/:id
router.get('/:id', getSession);

// POST /api/interview-sessions
router.post('/', createSession);

// POST /api/interview-sessions/:id/answers
router.post('/:id/answers', saveAnswer);

// PATCH /api/interview-sessions/:id/complete
router.patch('/:id/complete', completeSession);

// PATCH /api/interview-sessions/:id/abandon
router.patch('/:id/abandon', abandonSession);

export default router;
