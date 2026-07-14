import { Router } from 'express';
import {
  getAllTemplates,
  getTemplateById,
  getQuestionsByTemplateId,
} from '../controllers/interviewTemplate.controller';

const router = Router();

// GET /api/interview-templates
router.get('/', getAllTemplates);

// GET /api/interview-templates/:id
router.get('/:id', getTemplateById);

// GET /api/interview-templates/:id/questions
router.get('/:id/questions', getQuestionsByTemplateId);

export default router;
