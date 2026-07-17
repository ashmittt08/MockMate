import { Request, Response, NextFunction } from 'express';
import { interviewSessionService } from '../services/interviewSession.service';
import { AnswerStatus } from '@prisma/client';

/**
 * POST /api/interview-sessions
 * Creates a new interview session for a user.
 */
export const createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firebaseUid, templateId } = req.body;

    if (!firebaseUid) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: firebaseUid is required.',
      });
      return;
    }

    if (!templateId) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: templateId is required.',
      });
      return;
    }

    const session = await interviewSessionService.createSession(firebaseUid, templateId);

    res.status(201).json({
      success: true,
      message: 'Interview session created successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/interview-sessions/:id/answers
 * Saves or updates a user's answer for a question in the session.
 */
export const saveAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const { questionId, userAnswer, status, timeSpentSeconds, hintUsed, visited } = req.body;

    if (!questionId) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: questionId is required.',
      });
      return;
    }

    if (userAnswer === undefined || userAnswer === null) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: userAnswer is required.',
      });
      return;
    }

    // Validate status if provided
    if (status && !Object.values(AnswerStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status: "${status}". Must be one of: ${Object.values(AnswerStatus).join(', ')}`,
      });
      return;
    }

    // Validate integer for timeSpentSeconds if provided
    if (timeSpentSeconds !== undefined && (typeof timeSpentSeconds !== 'number' || isNaN(timeSpentSeconds))) {
      res.status(400).json({
        success: false,
        message: 'timeSpentSeconds must be a number.',
      });
      return;
    }

    const answer = await interviewSessionService.saveAnswer(sessionId, {
      questionId,
      userAnswer,
      status,
      timeSpentSeconds: timeSpentSeconds ? Math.floor(timeSpentSeconds) : undefined,
      hintUsed,
      visited,
    });

    res.status(200).json({
      success: true,
      message: 'Answer saved successfully',
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/interview-sessions/:id/complete
 * Marks an interview session as completed.
 */
export const completeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const { totalTime } = req.body;

    if (totalTime !== undefined && (typeof totalTime !== 'number' || isNaN(totalTime))) {
      res.status(400).json({
        success: false,
        message: 'totalTime must be a number.',
      });
      return;
    }

    const session = await interviewSessionService.completeSession(
      sessionId,
      totalTime !== undefined ? Math.floor(totalTime) : undefined
    );

    res.status(200).json({
      success: true,
      message: 'Interview session completed successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interview-sessions/:id
 * Retrieves an interview session by ID.
 */
export const getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const session = await interviewSessionService.getSessionById(sessionId);

    if (!session) {
      res.status(404).json({
        success: false,
        message: `Interview session with ID "${sessionId}" not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Interview session retrieved successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};
