export const DIFFICULTIES = [
  { id: 'Easy', label: 'Easy Track', desc: 'Core fundamentals and direct questions.' },
  { id: 'Medium', label: 'Medium Track', desc: 'Case studies, architectural trade-offs, and behavioral scenarios.' },
  { id: 'Hard', label: 'Hard Track', desc: 'Deep technical designs, algorithms, and complex systems.' }
] as const;

export type DifficultyId = typeof DIFFICULTIES[number]['id'];
