import httpClient from './httpClient';

const API_URL = '/api/likes';

export const likeApi = {
  /**
   * Получение лайков отзыва
   * @param {number} reviewId - ID отзыва
   * @returns {Promise<Array>}
   */
  getLikesByReview: async (reviewId) => {
    try {
      const response = await httpClient.get(`${API_URL}/review/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение лайков авторов отзыва
   * @param {number} reviewId - ID отзыва
   * @returns {Promise<Array>}
   */
  getAuthorLikesByReview: async (reviewId) => {
    try {
      const response = await httpClient.get(`${API_URL}/review/${reviewId}/count/author`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение количества лайков отзыва
   * @param {number} reviewId - ID отзыва
   * @returns {Promise<number>}
   */
  getLikesCountByReview: async (reviewId) => {
    try {
      const response = await httpClient.get(`${API_URL}/review/${reviewId}/count`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение количества полученных лайков пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<number>}
   */
  getReceivedLikesCountByUser: async (userId) => {
    try {
      const response = await httpClient.get(`${API_URL}/user/${userId}/received`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение количества поставленных лайков пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<number>}
   */
  getGivenLikesCountByUser: async (userId) => {
    try {
      const response = await httpClient.get(`${API_URL}/user/${userId}/given`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение количества полученных лайков от авторов
   * @param {number} userId - ID пользователя
   * @returns {Promise<number>}
   */
  getReceivedAuthorLikesCountByUser: async (userId) => {
    try {
      const response = await httpClient.get(`${API_URL}/user/${userId}/received/author`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение рецензий, лайкнутых пользователем
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getLikedReviewsByUser: async (userId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/user/${userId}/reviews`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      // Обработка ошибки для отладки
      console.error('Ошибка при получении лайкнутых рецензий:', error);
      
      // Возвращаем заглушку для временного решения
      return {
        content: [],
        totalElements: 0,
        totalPages: 0
      };
    }
  },

  /**
   * Создание лайка
   * @param {number} reviewId - ID отзыва
   * @param {number} userId - ID пользователя
   * @param {string} type - Тип лайка
   * @returns {Promise<Object>}
   */
  createLike: async (reviewId, userId, type) => {
    try {
      const response = await httpClient.post(API_URL, null, {
        params: { reviewId, userId, type }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление лайка
   * @param {number} reviewId - ID отзыва
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  removeLike: async (reviewId, userId) => {
    try {
      await httpClient.delete(API_URL, {
        params: { reviewId, userId }
      });
    } catch (error) {
      throw error;
    }
  }
}; 