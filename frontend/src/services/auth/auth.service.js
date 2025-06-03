import api from '../../api/instance';
import { AUTH_ENDPOINTS } from '../../api/endpoints';

/**
 * Сервис аутентификации
 */
export const authService = {
  /**
   * Авторизация пользователя
   * @param {string} username - Имя пользователя
   * @param {string} password - Пароль
   * @returns {Promise<AuthResponse>} Ответ с токеном и данными пользователя
   */
  login: async (username, password) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Регистрация нового пользователя
   * @param {RegisterRequest} registerData - Данные для регистрации
   * @returns {Promise<AuthResponse>} Ответ с токеном и данными пользователя
   */
  register: async (registerData) => {
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, registerData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Выход из системы
   */
  logout: () => {
    localStorage.removeItem('token');
  }
}; 