import httpClient from './httpClient';

const API_URL = '/api/users';

export const userApi = {
  /**
   * Получить топ-100 пользователей
   * @returns {Promise<Array<{id: number, username: string, avatarUrl: string, points: number, authorLikes: number, reviews: number, likesGiven: number, likesReceived: number}>>}
   */
  getTop100Users: async () => {
    try {
      const response = await httpClient.get(`${API_URL}/top-100`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получить ранг пользователя в топ-100
   * @param {number} userId - ID пользователя
   * @returns {Promise<{rank: number, points: number}>}
   */
  getUserRank: async (userId) => {
    try {
      // Прямой запрос к API для получения ранга пользователя
      const response = await httpClient.get(`${API_URL}/${userId}/rank`);
      const rankData = response.data;
      
      // Проверяем, что пользователь в топ-100
      if (rankData && rankData.rank) {
        return {
          rank: rankData.rank,
          points: rankData.points,
          isInTop100: true
        };
      } else {
        return {
          rank: null,
          points: rankData?.points || 0,
          isInTop100: false
        };
      }
    } catch (error) {
      console.error('Ошибка при получении ранга пользователя:', error);
      
      // Альтернативный способ через получение всего списка
      try {
        const top100 = await userApi.getTop100Users();
        const userIndex = top100.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
          return {
            rank: userIndex + 1,
            points: top100[userIndex].points,
            isInTop100: true
          };
        }
      } catch (fallbackError) {
        console.error('Ошибка при получении ранга через запасной метод:', fallbackError);
      }
      
      return {
        rank: null,
        points: 0,
        isInTop100: false
      };
    }
  },

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
   * @returns {Promise<void>}
   */
  updateUserData: async (bio, avatarUrl) => {
    try {
      console.log('Отправляем данные для обновления профиля:', { bio, avatarUrl });
      
      const response = await httpClient.patch(`${API_URL}/data`, {
        bio,
        avatarUrl
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
      const response = await httpClient.patch(`${API_URL}/password`, {
        currentPassword: oldPassword,
        newPassword
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
   * Получение избранных релизов пользователя (алиас для getUserFavorites)
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getFavoriteReleases: async (userId, page = 0, size = 10) => {
    return userApi.getUserFavorites(userId, page, size);
  },

  /**
   * Получение отслеживаемых авторов пользователя (алиас для getUserFollowedAuthors)
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getFollowedAuthors: async (userId, page = 0, size = 10) => {
    return userApi.getUserFollowedAuthors(userId, page, size);
  },

  /**
   * Получение детальной информации о пользователе (алиас для getUserById)
   * @param {number} userId - ID пользователя
   * @returns {Promise<import('../../entities/user/model/types').User>}
   */
  getUserDetails: async (userId) => {
    return userApi.getUserById(userId);
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
  },

  /**
   * Получение привязанного автора для пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object|null>}
   */
  getLinkedAuthor: async (userId) => {
    try {
      const response = await httpClient.get(`${API_URL}/${userId}/linked-author`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Автор не найден
      }
      throw error;
    }
  },

  /**
   * Проверка статуса текущего пользователя (для отслеживания блокировки)
   * @returns {Promise<boolean>} - true если пользователь активен, false если заблокирован
   */
  checkUserStatus: async () => {
    try {
      const response = await httpClient.get(`${API_URL}/status`);
      return response.data?.isActive !== false; // Возвращаем true если активен
    } catch (error) {
      // Если получили 401/403 - пользователь заблокирован или токен недействителен
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false;
      }
      throw error;
    }
  }
}; 