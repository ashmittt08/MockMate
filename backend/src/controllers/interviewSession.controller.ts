import { Request, Response, NextFunction } from 'express';
import { interviewSessionService } from '../services/interviewSession.service';
import { AnswerStatus } from '@prisma/client';
import { prisma } from '../database/prisma';
import { aiEvaluationService } from '../services/ai/evaluation.service';

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

/**
 * GET /api/interview-sessions/active
 * Retrieves the active interview session for a user.
 */
export const getActiveSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firebaseUid } = req.query;

    if (!firebaseUid || typeof firebaseUid !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Missing or invalid required field: firebaseUid is required as a query parameter.',
      });
      return;
    }

    // User lookup isolated to easily replace with auth middleware in the future
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: `User with firebaseUid "${firebaseUid}" not found`,
      });
      return;
    }

    // Fetch the active session for the user
    const session = await prisma.interviewSession.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: {
        interviewTemplate: {
          include: {
            questions: true,
          }
        },
        answers: true,
      },
    });

    if (!session) {
      res.status(200).json({
        success: true,
        message: 'No active session found',
        data: null,
      });
      return;
    }

    // Check if session has expired
    const durationMinutes = session.interviewTemplate.duration;
    const startedAtMs = new Date(session.startedAt).getTime();
    const expiresAtMs = startedAtMs + durationMinutes * 60 * 1000;
    const nowMs = Date.now();

    if (nowMs >= expiresAtMs) {
      // Automatically complete the session since it has expired
      await interviewSessionService.completeSession(session.id, durationMinutes * 60);
      res.status(200).json({
        success: true,
        message: 'Active session has expired and was automatically completed.',
        data: null,
      });
      return;
    }

    const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000));

    res.status(200).json({
      success: true,
      message: 'Active session retrieved successfully',
      data: {
        ...session,
        remainingSeconds,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/interview-sessions/:id/abandon
 * Marks an interview session as abandoned.
 */
export const abandonSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const session = await interviewSessionService.abandonSession(sessionId);
    res.status(200).json({
      success: true,
      message: 'Interview session abandoned successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interview-sessions/:id/evaluation
 * Retrieves the evaluation details for a specific interview session.
 */
export const getEvaluation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const evaluation = await aiEvaluationService.getEvaluationBySessionId(sessionId);

    if (!evaluation) {
      res.status(404).json({
        success: false,
        message: `Evaluation for session with ID "${sessionId}" not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Evaluation retrieved successfully',
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};
