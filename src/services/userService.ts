import apiClient from '../api/apiClient';
import type { DbUser } from '../types';

export interface SyncUserRequest {
  firebaseUid: string;
  name: string;
  email: string;
  photoUrl: string | null;
}

export interface SyncUserResponse {
  success: boolean;
  message: string;
  data: DbUser;
}

export const userService = {
  /**
   * Synchronize the Firebase authenticated user with the PostgreSQL database.
   * Calls POST /api/users/sync
   */
  async syncUser(requestData: SyncUserRequest): Promise<DbUser> {
    const response = await apiClient.post<SyncUserResponse>('/api/users/sync', requestData);
    return response.data.data;
  },
};
