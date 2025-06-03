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
   * Получить пользователя по имени пользователя
   * @param {string} username - Имя пользователя
   * @returns {Promise<import('../../entities/user/model/types').User>}
   */
  getUserByUsername: async (username) => {
    try {
      const response = await httpClient.get(`${API_URL}/username/${username}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Обновить профиль пользователя
   * @param {Object} userData - Данные пользователя для обновления
   * @returns {Promise<import('../../entities/user/model/types').User>}
   */
  updateProfile: async (userData) => {
    try {
      const response = await httpClient.put(`${API_URL}/profile`, userData);
      return response.data;
    } catch (error) {
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
   * Получение пользователей по роли
   * @param {string} role - Роль пользователя (USER, AUTHOR, MODERATOR, ADMIN)
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: import('../../entities/user/model/types').User[], totalElements: number, totalPages: number}>}
   */
  getUsersByRole: async (role, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/role/${role}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Получение заблокированных пользователей
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: import('../../entities/user/model/types').User[], totalElements: number, totalPages: number}>}
   */
  getBlockedUsers: async (page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/blocked`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Обновление данных пользователя
   * @param {string} bio - Биография пользователя
   * @param {string} avatarUrl - URL аватара
   * @returns {Promise<void>}
   */
  updateUserData: async (bio, avatarUrl) => {
    try {
      await httpClient.patch(`${API_URL}/data`, null, {
        params: { bio, avatarUrl }
      });
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
   * Разблокировка пользователя (только для администраторов)
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  unbanUser: async (userId) => {
    try {
      await httpClient.patch(`${API_URL}/${userId}/unban`);
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