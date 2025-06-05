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
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        const errorMsg = error.response.data?.error || 'Неверное имя пользователя или пароль';
        throw new Error(errorMsg);
      }
      if (error.response?.status === 403) {
        throw new Error('Аккаунт заблокирован');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
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
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  logout: async (token) => {
    try {
      await httpClient.post(`${API_URL}/logout`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Ошибка при вызове API logout:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      await httpClient.post(`${API_URL}/forgot-password?email=${encodeURIComponent(email)}`);
      return { success: true };
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      await httpClient.post(`${API_URL}/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`);
      return { success: true };
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await httpClient.get(`${API_URL}/me`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
};