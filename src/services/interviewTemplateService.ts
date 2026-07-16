import apiClient from '../api/apiClient';
import type { InterviewTemplate, Question } from '../types';

const MOCK_TEMPLATES: InterviewTemplate[] = [
  {
    id: "template_frontend_easy",
    title: "Frontend Developer - Easy",
    role: "Frontend",
    difficulty: "Easy",
    duration: 30,
    description: "Beginner-friendly template covering foundational HTML, CSS, JavaScript, and basic DOM manipulation.",
    questionCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "template_frontend_hard",
    title: "Frontend Developer - Hard",
    role: "Frontend",
    difficulty: "Hard",
    duration: 60,
    description: "Advanced frontend concepts including browser rendering paths, performance profiling, advanced React patterns, and security.",
    questionCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "template_backend_easy",
    title: "Backend Developer - Easy",
    role: "Backend",
    difficulty: "Easy",
    duration: 30,
    description: "Fundamental backend development concepts including basic routing, HTTP methods, server responses, and basic SQL operations.",
    questionCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "template_backend_hard",
    title: "Backend Developer - Hard",
    role: "Backend",
    difficulty: "Hard",
    duration: 60,
    description: "Complex backend architectures, distributed systems, caching strategies, and database optimization techniques.",
    questionCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_QUESTIONS: Record<string, Question[]> = {
  "template_frontend_easy": [
    {
      id: "fe_easy_q1",
      text: "What does HTML stand for and what is its purpose?",
      type: "Conceptual",
      category: "Conceptual",
      tips: [
        "Focus on key HTML concepts.",
        "Mention structural semantic tags.",
        "Briefly mention accessibility."
      ],
      order: 1,
      modelAnswer: "HyperText Markup Language, used to structure web pages and their content."
    },
    {
      id: "fe_easy_q2",
      text: "What is the difference between let and const in JavaScript?",
      type: "JavaScript",
      category: "JavaScript",
      tips: [
        "Mention block scoping.",
        "Talk about reassignment constraints.",
        "Clarify that const objects are mutable."
      ],
      order: 2,
      modelAnswer: "let allows reassigning values, whereas const defines variables that cannot be reassigned after declaration."
    },
    {
      id: "fe_easy_q3",
      text: "Explain the difference between inline and block-level HTML elements.",
      type: "HTML",
      category: "HTML",
      tips: [
        "Mention default display properties.",
        "Describe layout behavior and line breaks.",
        "Give examples of both types."
      ],
      order: 3,
      modelAnswer: "Block-level elements start on a new line and take up the full width (e.g., div, p), while inline elements only take up as much space as necessary (e.g., span, strong)."
    }
  ]
};

export const interviewTemplateService = {
  async getInterviewTemplates(): Promise<InterviewTemplate[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: InterviewTemplate[] }>('/api/interview-templates');
      return response.data.data;
    } catch (error) {
      console.warn("Backend down. Falling back to local mock templates.", error);
      return MOCK_TEMPLATES;
    }
  },

  async getInterviewTemplate(id: string): Promise<InterviewTemplate> {
    try {
      const response = await apiClient.get<{ success: boolean; data: InterviewTemplate }>(`/api/interview-templates/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn("Backend down. Falling back to local mock template lookup.", error);
      const found = MOCK_TEMPLATES.find((t) => t.id === id);
      if (!found) throw new Error("Template not found in mock fallbacks.");
      return found;
    }
  },

  async getInterviewQuestions(id: string): Promise<Question[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>(`/api/interview-templates/${id}/questions`);
      return response.data.data.map((q) => ({
        id: q.id,
        text: q.question,
        type: q.type,
        category: q.type,
        tips: [
          "Focus on key concepts and define important terminology.",
          "Provide a real-world scenario or project where you implemented this approach.",
          "Discuss any trade-offs, advantages, or limitations associated with this choice."
        ],
        order: q.order,
        modelAnswer: q.expectedAnswer
      }));
    } catch (error) {
      console.warn("Backend down. Falling back to local mock questions lookup.", error);
      const questions = MOCK_QUESTIONS[id] || MOCK_QUESTIONS["template_frontend_easy"];
      return questions;
    }
  }
};

export default interviewTemplateService;
