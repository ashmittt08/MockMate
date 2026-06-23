import type { FeedbackReport, Achievement } from '../types';

export const initialHistoricalInterviews: FeedbackReport[] = [
  {
    id: 'report_mock_1',
    role: 'Frontend',
    difficulty: 'Medium',
    type: 'Technical',
    date: '2026-06-15',
    overallScore: 82,
    accuracyScore: 85,
    communicationScore: 78,
    completenessScore: 83,
    strengths: [
      'Strong conceptual explanation of React state lifecycle and DOM paint intervals.',
      'Appropriately discussed list virtualization using react-window to optimize massive grids.'
    ],
    weaknesses: [
      'Communication lacked concise structuring; tended to repeat technical terms.',
      'Missed details on context selector optimizations to prevent unnecessary parent re-renders.'
    ],
    suggestions: [
      {
        questionId: 102,
        questionText: 'How would you optimize a slow React application that has heavy rendering loads and deep component trees?',
        userAnswer: 'I would use React.memo to cache my components and useMemo to save slow function calculations. Also, code-splitting with React.lazy is very good. And if I have a really big table, I would virtualize it.',
        modelAnswer: 'Optimizing a slow React app involves identifying and reducing unnecessary re-renders. Use React Profiler to find bottlenecks, useMemo and useCallback for reference stability, list virtualization for lists, lazy loading for route splitting, and optimize global states.',
        feedbackText: 'Great initial layout of terms. To advance your answer, explain how React context updates propagate and how state-splitting prevents global re-renders.',
        score: 82
      }
    ]
  },
  {
    id: 'report_mock_2',
    role: 'Frontend',
    difficulty: 'Easy',
    type: 'Technical',
    date: '2026-06-10',
    overallScore: 74,
    accuracyScore: 76,
    communicationScore: 70,
    completenessScore: 76,
    strengths: [
      'Correctly detailed the O(n) nature of React reconciliation.',
      'Solid identification of key props purpose.'
    ],
    weaknesses: [
      'Struggled with detailing how different component elements impact reconciliation tree pruning.',
      'Did not specify how fiber nodes manage update priorities.'
    ],
    suggestions: [
      {
        questionId: 101,
        questionText: 'Explain the concept of React Reconciliation and how the Virtual DOM works under the hood.',
        userAnswer: 'The virtual DOM is a Javascript copy of the HTML DOM. React makes changes on this copy first, then it does a diff to see what changes are needed, and puts it in the real DOM. That makes it faster.',
        modelAnswer: 'React reconciliation is the process through which React updates the DOM. When a component’s state or props change, React builds a new Virtual DOM tree, diffs it in O(n) complexity, and applies patches to the browser DOM.',
        feedbackText: 'Clear baseline explanation. You should describe key-driven diffing algorithms and explain why O(n) is used instead of traditional O(n^3) tree comparisons.',
        score: 74
      }
    ]
  }
];

export const defaultAchievements: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first practice interview session.',
    iconName: 'Award',
    isUnlocked: false
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Complete 3 or more interviews in total.',
    iconName: 'Calendar',
    isUnlocked: false
  },
  {
    id: 'top_performer',
    title: 'Top Performer',
    description: 'Earn an overall evaluation score of 85% or higher.',
    iconName: 'Zap',
    isUnlocked: false
  },
  {
    id: 'time_master',
    title: 'Time Master',
    description: 'Answer a technical question in under 2 minutes.',
    iconName: 'Clock',
    isUnlocked: false
  }
];
