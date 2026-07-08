import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * Reusable Axios client instance configured with the base API URL.
 */
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default apiClient;
