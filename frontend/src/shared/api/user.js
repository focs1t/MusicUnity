import httpClient from './httpClient';

const API_URL = '/api/users';

export const userApi = {
  /**
   * Получить текущего пользователя
   * @returns {Promise<import('../../entities/user/model/types').User>}
   */
  getCurrentUser: async () => {
    try {
      const response = await httpClient.get(`${API_URL}/current`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получить пользователя по ID
   * @param {number} userId - ID пользователя
   * @returns {Promise<import('../../entities/user/model/types').User>}
   */
  getUserById: async (userId) => {
    try {
      const response = await httpClient.get(`${API_URL}/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Обновление данных пользователя
   * @param {string} bio - Биография пользователя
   * @param {string} avatarUrl - URL аватара
   * @param {string} telegramChatId - Telegram ID пользователя
   * @returns {Promise<void>}
   */
  updateUserData: async (bio, avatarUrl, telegramChatId) => {
    try {
      console.log('Отправляем данные для обновления профиля:', { bio, avatarUrl, telegramChatId });
      
      const response = await httpClient.patch(`${API_URL}/data`, null, {
        params: { bio, avatarUrl, telegramChatId }
      });
      
      console.log('Ответ после обновления профиля:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);
      if (error.response) {
        console.error('Статус ответа:', error.response.status);
        console.error('Данные ответа:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Поиск пользователей по имени пользователя
   * @param {string} username - Часть имени пользователя для поиска
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: import('../../entities/user/model/types').User[], totalElements: number, totalPages: number}>}
   */
  searchUsers: async (username, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/search`, {
        params: {
          username,
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Изменить пароль пользователя
   * @param {string} oldPassword - Старый пароль
   * @param {string} newPassword - Новый пароль
   * @returns {Promise<{success: boolean}>}
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await httpClient.patch(`${API_URL}/password`, null, {
        params: {
          currentPassword: oldPassword,
          newPassword
        }
      });
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Блокировка пользователя (только для модераторов)
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  banUser: async (userId) => {
    try {
      await httpClient.patch(`${API_URL}/${userId}/ban`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Получение избранных релизов пользователя
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getUserFavorites: async (userId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/${userId}/favorites`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Получение отслеживаемых авторов пользователя
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getUserFollowedAuthors: async (userId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/${userId}/followed-authors`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Получение релизов от отслеживаемых авторов пользователя
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getUserFollowedAuthorsReleases: async (userId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/${userId}/followed-authors/releases`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 