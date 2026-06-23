export interface Question {
  id: number;
  text: string;
  role: 'Frontend' | 'Backend' | 'Product Manager' | 'Data Scientist';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Technical' | 'Behavioral';
  category: string;
  modelAnswer: string;
  tips: string[];
}
