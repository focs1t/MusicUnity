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
      console.log('Запрос лайков для рецензии:', reviewId);
      const response = await httpClient.get(`${API_URL}/review/${reviewId}`);
      console.log('Получены лайки:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка получения лайков:', error);
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
      console.error('Ошибка при получении авторских лайков:', error);
      return [];
    }
  },

  /**
   * Получение всех рецензий с авторскими лайками
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getAllReviewsWithAuthorLikes: async (page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/author-likes`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении рецензий с авторскими лайками:', error);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0
      };
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
      console.log(`Получено количество лайков для рецензии ${reviewId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении количества лайков для рецензии ${reviewId}:`, error);
      return 0;
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
      console.log(`Создаем лайк: reviewId=${reviewId}, userId=${userId}, type=${type}`);
      const response = await httpClient.post(API_URL, null, {
        params: { reviewId, userId, type }
      });
      console.log('Результат создания лайка:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании лайка:', error);
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
      console.log(`Удаляем лайк: reviewId=${reviewId}, userId=${userId}`);
      await httpClient.delete(API_URL, {
        params: { reviewId, userId }
      });
      console.log('Лайк успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении лайка:', error);
      throw error;
    }
  },

  // НЕ МЕНЯЙТЕ ЭТИ МЕТОДЫ - они используются в компонентах ReviewPage и других
  // Это обертки над createLike и removeLike с автоматическим получением userId
  addLikeToReview: async (reviewId) => {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const userId = user.userId;
    
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    return likeApi.createLike(reviewId, userId, 'REGULAR');
  },
  
  removeLikeFromReview: async (reviewId) => {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const userId = user.userId;
    
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    await likeApi.removeLike(reviewId, userId);
  }
}; 