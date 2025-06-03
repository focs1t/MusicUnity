import httpClient from './httpClient';

const API_URL = '/api/auth';

export const authApi = {
  login: async (username, password) => {
    try {
      const response = await httpClient.post(`${API_URL}/login`, {
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await httpClient.post(`${API_URL}/register`, {
        username,
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async (token) => {
    try {
      await httpClient.post(`${API_URL}/logout`, { token });
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  },

  forgotPassword: async (email) => {
    try {
      await httpClient.post(`${API_URL}/forgot-password?email=${email}`);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      await httpClient.post(`${API_URL}/reset-password`, null, {
        params: {
          token,
          newPassword
        }
      });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}; 