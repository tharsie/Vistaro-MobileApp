import axios from 'axios';
import { getAuthItem, deleteAuthItem } from '../utils/authStorage';

const BASE_URL = 'https://api.vistaro.co.uk';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthItem('vistaro_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {
    // Secure store unavailable — proceed without token
  }
  return config;
});

// 401 handler — clear storage & let the AuthContext listener react
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await deleteAuthItem('vistaro_token');
      await deleteAuthItem('vistaro_user');
      // AuthContext will detect null token on next check / event
    }
    return Promise.reject(error);
  },
);

export default apiClient;
