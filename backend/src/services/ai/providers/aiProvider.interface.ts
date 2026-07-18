import { InterviewSession, Question, InterviewAnswer } from '@prisma/client';

export interface EvaluationRequest {
  session: InterviewSession & {
    interviewTemplate: {
      id: string;
      title: string;
      role: string;
      difficulty: string;
      duration: number;
    };
    answers: (InterviewAnswer & {
      question: Question;
    })[];
  };
}

export interface EvaluationResponse {
  overallScore: number;
  accuracyScore: number;
  communicationScore: number;
  completenessScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: {
    questionId: string;
    questionText: string;
    userAnswer: string;
    modelAnswer: string;
    feedbackText: string;
    score: number;
  }[];
}

export interface IAIProvider {
  evaluateSession(request: EvaluationRequest): Promise<EvaluationResponse>;
}
