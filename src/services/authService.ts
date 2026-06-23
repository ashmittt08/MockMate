import { signInWithPopup, signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export const authService = {
  loginWithGoogle: async (): Promise<FirebaseUser> => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  getCurrentUser: (): FirebaseUser | null => {
    return auth.currentUser;
  }
};
