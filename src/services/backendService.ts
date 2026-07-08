import apiClient from '../api/apiClient';
import type { HealthCheckResponse } from '../types';

export const backendService = {
  /**
   * Checks the health status of the backend API.
   * Calls GET /api/health
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    const response = await apiClient.get<HealthCheckResponse>('/api/health');
    return response.data;
  },
};
