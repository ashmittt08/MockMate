import { Request, Response, NextFunction } from 'express';
import { interviewTemplateService } from '../services/interviewTemplate.service';

/**
 * GET /api/interview-templates
 * Returns all interview templates.
 */
export const getAllTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const templates = await interviewTemplateService.getAllTemplates();
    res.status(200).json({
      success: true,
      message: 'Interview templates retrieved successfully',
      data: templates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interview-templates/:id
 * Returns a single interview template by ID.
 */
export const getTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const template = await interviewTemplateService.getTemplateById(id);

    if (!template) {
      res.status(404).json({
        success: false,
        message: `Interview template with ID ${id} not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Interview template retrieved successfully',
      data: template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interview-templates/:id/questions
 * Returns all questions for the specified template (excluding expectedAnswer), ordered by 'order'.
 */
export const getQuestionsByTemplateId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // First, verify the template exists
    const templateExists = await interviewTemplateService.getTemplateById(id);
    if (!templateExists) {
      res.status(404).json({
        success: false,
        message: `Interview template with ID ${id} not found`
      });
      return;
    }

    const questions = await interviewTemplateService.getQuestionsByTemplateId(id);

    res.status(200).json({
      success: true,
      message: 'Questions retrieved successfully',
      data: questions
    });
  } catch (error) {
    next(error);
  }
};
