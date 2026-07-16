export interface Question {
  id: string;
  text: string;
  type: string;
  category: string;
  tips: string[];
  order: number;
  modelAnswer?: string;
}
