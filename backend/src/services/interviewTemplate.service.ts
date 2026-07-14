import { prisma } from '../database/prisma';

export const interviewTemplateService = {
  /**
   * Retrieves all interview templates ordered by role and difficulty (ascending).
   * Includes the count of questions.
   */
  async getAllTemplates() {
    const templates = await prisma.interviewTemplate.findMany({
      orderBy: [
        { role: 'asc' },
        { difficulty: 'asc' }
      ],
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    return templates.map(t => ({
      id: t.id,
      title: t.title,
      role: t.role,
      difficulty: t.difficulty,
      duration: t.duration,
      description: t.description,
      questionCount: t._count.questions,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));
  },

  /**
   * Retrieves a single interview template by ID, including its question count.
   */
  async getTemplateById(id: string) {
    const template = await prisma.interviewTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    if (!template) return null;

    return {
      id: template.id,
      title: template.title,
      role: template.role,
      difficulty: template.difficulty,
      duration: template.duration,
      description: template.description,
      questionCount: template._count.questions,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
  },

  /**
   * Retrieves all questions for a specific template, ordered by 'order',
   * selecting only the fields required by the UI (excluding expectedAnswer).
   */
  async getQuestionsByTemplateId(templateId: string) {
    return prisma.question.findMany({
      where: { interviewTemplateId: templateId },
      select: {
        id: true,
        question: true,
        type: true,
        order: true
      },
      orderBy: {
        order: 'asc'
      }
    });
  }
};
