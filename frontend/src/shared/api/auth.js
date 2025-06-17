import httpClient from './httpClient';

const API_URL = '/api/auth';

export const authApi = {
  login: async (username, password) => {
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      
      const response = await httpClient.post(`${API_URL}/login`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      // Сохраняем токен и информацию о пользователе
      if (response.data && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        
        // Получаем информацию о пользователе из токена
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          const user = {
            userId: payload.id,
            username: payload.sub,
            email: payload.email,
            role: payload.role
          };
          
          localStorage.setItem('user', JSON.stringify(user));
          console.log('Пользователь успешно авторизован:', user);
        } catch (e) {
          console.error('Ошибка при декодировании токена:', e);
        }
      }
      
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