import type { User } from '../types';
import { createDummyUser, createNewUser } from '../data/mockUsers';

export const authService = {
  login: async (email: string, interviewsCompleted: number): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(createDummyUser(email, interviewsCompleted));
      }, 800);
    });
  },

  signup: async (name: string, email: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(createNewUser(name, email));
      }, 800);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }
};
