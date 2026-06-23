import type { User } from '../types';

export const createDummyUser = (email: string, interviewsCount: number): User => ({
  name: 'Sarah Connor',
  email: email,
  targetRole: 'Frontend Engineer',
  bio: 'Passionate UI Architect focusing on scalable state architectures, performance, and CSS variables.',
  joinedDate: '2026-06-01',
  interviewsCompleted: interviewsCount
});

export const createNewUser = (name: string, email: string): User => ({
  name: name,
  email: email,
  targetRole: 'Software Engineer',
  bio: 'Eager developer practicing core technical and behavioral rounds to secure a dream role.',
  joinedDate: new Date().toISOString().split('T')[0],
  interviewsCompleted: 0
});
