import httpClient from './httpClient';

const API_URL = '/api/auth';

export const authApi = {
  login: async (username, password) => {
    try {
      const response = await httpClient.post(`${API_URL}/login`, {
        username,
        password
      });
      
      // Проверяем наличие токена в ответе
      if (!response.data || !response.data.token) {
        throw new Error('Неверное имя пользователя или пароль');
      }
      
      return response.data;
    } catch (error) {
      // Если сервер вернул ошибку с сообщением, используем его
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // Если сервер вернул 401, значит неверные учетные данные
      if (error.response?.status === 401) {
        throw new Error('Неверное имя пользователя или пароль');
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
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
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
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
}; 