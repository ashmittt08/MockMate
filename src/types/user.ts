export interface User {
  name: string;
  email: string;
  targetRole: string;
  bio: string;
  joinedDate: string;
  interviewsCompleted: number;
}

export interface DbUser {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

