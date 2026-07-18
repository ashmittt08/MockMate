import { prisma } from '../../database/prisma';
import { AIProviderFactory } from './providers/providerFactory';
import { EvaluationStatus } from '@prisma/client';

export const aiEvaluationService = {
  /**
   * Creates a baseline pending evaluation record in the database.
   * This is called synchronously when the session is completed, ensuring
   * that we can return immediately and perform LLM logic asynchronously.
   */
  async createPendingEvaluation(sessionId: string) {
    return prisma.interviewEvaluation.upsert({
      where: { interviewSessionId: sessionId },
      create: {
        interviewSessionId: sessionId,
        status: EvaluationStatus.PENDING,
        provider: process.env.AI_PROVIDER || 'mock',
        promptVersion: 'v1',
      },
      update: {
        status: EvaluationStatus.PENDING,
      },
    });
  },

  /**
   * Orchestrates the actual AI evaluation generation asynchronously.
   */
  async generateEvaluation(sessionId: string): Promise<void> {
    try {
      // 1. Move status to PROCESSING
      await prisma.interviewEvaluation.update({
        where: { interviewSessionId: sessionId },
        data: { status: EvaluationStatus.PROCESSING }
      });

      // 2. Fetch full session details including template and answers
      const session = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: {
          interviewTemplate: true,
          answers: {
            include: {
              question: true
            }
          }
        }
      });

      if (!session) {
        throw new Error(`Interview Session with ID "${sessionId}" not found.`);
      }

      // 3. Obtain provider from Factory
      const providerName = process.env.AI_PROVIDER || 'mock';
      const provider = AIProviderFactory.getProvider(providerName);

      // 4. Run evaluation
      const evaluationResult = await provider.evaluateSession({ session: session as any });

      // 5. Update Database Record with success details
      await prisma.interviewEvaluation.update({
        where: { interviewSessionId: sessionId },
        data: {
          status: EvaluationStatus.COMPLETED,
          overallScore: evaluationResult.overallScore,
          accuracyScore: evaluationResult.accuracyScore,
          communicationScore: evaluationResult.communicationScore,
          completenessScore: evaluationResult.completenessScore,
          strengths: evaluationResult.strengths,
          weaknesses: evaluationResult.weaknesses,
          suggestions: evaluationResult.suggestions as any,
          provider: providerName,
          promptVersion: 'v1',
          rawResponse: JSON.stringify(evaluationResult)
        }
      });
    } catch (err) {
      console.error(`AI Evaluation failed for session ${sessionId}:`, err);
      // Move status to FAILED in database
      try {
        await prisma.interviewEvaluation.update({
          where: { interviewSessionId: sessionId },
          data: { status: EvaluationStatus.FAILED }
        });
      } catch (dbErr) {
        console.error('Failed to mark evaluation as FAILED in database:', dbErr);
      }
    }
  },

  /**
   * Retrieves the persisted evaluation record.
   */
  async getEvaluationBySessionId(sessionId: string) {
    return prisma.interviewEvaluation.findUnique({
      where: { interviewSessionId: sessionId }
    });
  }
};
