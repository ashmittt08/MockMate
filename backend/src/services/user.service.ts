import { prisma } from '../database/prisma';

export interface SyncUserData {
  firebaseUid: string;
  name: string;
  email: string;
  photoUrl?: string | null;
}

export const userService = {
  /**
   * Synchronize a Firebase authenticated user with the PostgreSQL database.
   * Matches by firebaseUid. Updates fields if changed, otherwise creates user.
   */
  async syncUser(data: SyncUserData) {
    return prisma.user.upsert({
      where: {
        firebaseUid: data.firebaseUid,
      },
      update: {
        name: data.name,
        email: data.email,
        photoUrl: data.photoUrl,
      },
      create: {
        firebaseUid: data.firebaseUid,
        name: data.name,
        email: data.email,
        photoUrl: data.photoUrl,
      },
    });
  },
};
