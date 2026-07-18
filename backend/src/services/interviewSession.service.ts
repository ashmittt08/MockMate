import { prisma } from '../database/prisma';
import { SessionStatus, AnswerStatus } from '@prisma/client';
import { aiEvaluationService } from './ai/evaluation.service';

export interface SaveAnswerInput {
  questionId: string;
  userAnswer: string;
  status?: AnswerStatus;
  timeSpentSeconds?: number;
  hintUsed?: boolean;
  visited?: boolean;
}

export const interviewSessionService = {
  /**
   * Retrieves an interview session by ID.
   */
  async getSessionById(id: string) {
    return prisma.interviewSession.findUnique({
      where: { id },
      include: {
        answers: true,
        interviewTemplate: true,
      },
    });
  },

  /**
   * Creates a new interview session.
   * Resolves the user by their firebaseUid and checks if the template exists.
   */
  async createSession(firebaseUid: string, templateId: string) {
    // Look up the user by firebaseUid
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });
    if (!user) {
      const error = new Error(`User with firebaseUid "${firebaseUid}" not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    // Check for an existing active session
    const activeSession = await prisma.interviewSession.findFirst({
      where: {
        userId: user.id,
        status: SessionStatus.ACTIVE,
      },
      include: {
        interviewTemplate: true,
      },
    });

    if (activeSession) {
      const durationMinutes = activeSession.interviewTemplate.duration;
      const startedAtMs = new Date(activeSession.startedAt).getTime();
      const expiresAtMs = startedAtMs + durationMinutes * 60 * 1000;
      const nowMs = Date.now();

      if (nowMs >= expiresAtMs) {
        // Expired: complete it automatically on the backend!
        await this.completeSession(activeSession.id, durationMinutes * 60);
      } else {
        // Not expired: throw 400 Bad Request error
        const error = new Error('An active interview session already exists. Please resume or abandon it before starting a new one.');
        (error as any).statusCode = 400;
        throw error;
      }
    }

    // Look up the template by templateId
    const template = await prisma.interviewTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      const error = new Error(`Interview template with ID "${templateId}" not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    return prisma.interviewSession.create({
      data: {
        userId: user.id,
        interviewTemplateId: templateId,
        status: SessionStatus.ACTIVE,
      },
      include: {
        answers: true,
        interviewTemplate: true,
      },
    });
  },

  /**
   * Saves or updates a user's answer for a question in a specific session.
   * Uses Prisma's upsert to avoid duplicate answers.
   */
  async saveAnswer(sessionId: string, data: SaveAnswerInput) {
    // Verify session exists
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      const error = new Error(`Interview session with ID "${sessionId}" not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    // Verify session is active
    if (session.status !== SessionStatus.ACTIVE) {
      const error = new Error(`Interview session is not active (status: ${session.status})`);
      (error as any).statusCode = 400;
      throw error;
    }

    // Verify question exists and belongs to this template
    const question = await prisma.question.findFirst({
      where: {
        id: data.questionId,
        interviewTemplateId: session.interviewTemplateId,
      },
    });
    if (!question) {
      const error = new Error(`Question with ID "${data.questionId}" not found or does not belong to this session's template`);
      (error as any).statusCode = 400;
      throw error;
    }

    // Touch session updatedAt to keep it updated whenever answers are saved
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return prisma.interviewAnswer.upsert({
      where: {
        interviewSessionId_questionId: {
          interviewSessionId: sessionId,
          questionId: data.questionId,
        },
      },
      update: {
        userAnswer: data.userAnswer,
        status: data.status,
        timeSpentSeconds: data.timeSpentSeconds,
        hintUsed: data.hintUsed,
        visited: data.visited,
      },
      create: {
        interviewSessionId: sessionId,
        questionId: data.questionId,
        userAnswer: data.userAnswer,
        status: data.status ?? AnswerStatus.ANSWERED,
        timeSpentSeconds: data.timeSpentSeconds ?? 0,
        hintUsed: data.hintUsed ?? false,
        visited: data.visited ?? false,
      },
    });
  },

  /**
   * Marks the interview session as completed.
   * Updates status to COMPLETED, sets completedAt, and optionally records totalTime.
   */
  async completeSession(sessionId: string, totalTime?: number) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      const error = new Error(`Interview session with ID "${sessionId}" not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    // Verify session is active
    if (session.status !== SessionStatus.ACTIVE) {
      const error = new Error(`Interview session is not active (status: ${session.status})`);
      (error as any).statusCode = 400;
      throw error;
    }

    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        completedAt: new Date(),
        totalTime: totalTime !== undefined ? totalTime : undefined,
      },
      include: {
        answers: true,
        interviewTemplate: true,
      },
    });

    // Create a pending evaluation record synchronously
    await aiEvaluationService.createPendingEvaluation(sessionId);

    // Fire off AI evaluation asynchronously in the background
    aiEvaluationService.generateEvaluation(sessionId).catch((err) => {
      console.error(`Async AI evaluation failed for session ${sessionId}:`, err);
    });

    return updatedSession;
  },

  /**
   * Abandons an active interview session.
   * Updates status to ABANDONED and sets completedAt.
   */
  async abandonSession(sessionId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      const error = new Error(`Interview session with ID "${sessionId}" not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    if (session.status === SessionStatus.COMPLETED) {
      const error = new Error('Cannot abandon a completed session.');
      (error as any).statusCode = 400;
      throw error;
    }

    return prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.ABANDONED,
        completedAt: new Date(),
      },
      include: {
        answers: true,
        interviewTemplate: true,
      },
    });
  },
};
