import httpClient from './httpClient';

const API_URL = '/api/reviews';

export const reviewApi = {
  /**
   * Получение отзыва по ID
   * @param {number} id - ID отзыва
   * @returns {Promise<Object>}
   */
  getReviewById: async (id) => {
    try {
      const response = await httpClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Создание простой оценки
   * @param {number} userId - ID пользователя
   * @param {number} releaseId - ID релиза
   * @param {number} rhymeImagery - Оценка рифмы и образности
   * @param {number} structureRhythm - Оценка структуры и ритма
   * @param {number} styleExecution - Оценка стиля и исполнения
   * @param {number} individuality - Оценка индивидуальности
   * @param {number} vibe - Оценка вайба
   * @returns {Promise<Object>}
   */
  createSimpleReview: async (userId, releaseId, rhymeImagery, structureRhythm, styleExecution, individuality, vibe) => {
    try {
      const response = await httpClient.post(`${API_URL}/simple`, null, {
        params: {
          userId,
          releaseId,
          rhymeImagery,
          structureRhythm,
          styleExecution,
          individuality,
          vibe
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Создание полной рецензии
   * @param {number} userId - ID пользователя
   * @param {number} releaseId - ID релиза
   * @param {string} title - Заголовок рецензии
   * @param {string} content - Содержание рецензии
   * @param {number} rhymeImagery - Оценка рифмы и образности
   * @param {number} structureRhythm - Оценка структуры и ритма
   * @param {number} styleExecution - Оценка стиля и исполнения
   * @param {number} individuality - Оценка индивидуальности
   * @param {number} vibe - Оценка вайба
   * @returns {Promise<Object>}
   */
  createFullReview: async (userId, releaseId, title, content, rhymeImagery, structureRhythm, styleExecution, individuality, vibe) => {
    try {
      const response = await httpClient.post(`${API_URL}/full`, null, {
        params: {
          userId,
          releaseId,
          title,
          content,
          rhymeImagery,
          structureRhythm,
          styleExecution,
          individuality,
          vibe
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение отзывов на релиз
   * @param {number} releaseId - ID релиза
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getReviewsByRelease: async (releaseId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/release/${releaseId}/reviews`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение отзывов пользователя
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getReviewsByUser: async (userId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/user/${userId}/reviews`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение всех отзывов
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getAllReviews: async (page = 0, size = 10) => {
    try {
      const response = await httpClient.get(API_URL, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение количества отзывов пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<number>}
   */
  getReviewsCountByUser: async (userId) => {
    try {
      const response = await httpClient.get(`${API_URL}/user/${userId}/count`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение количества отзывов на релиз
   * @param {number} releaseId - ID релиза
   * @returns {Promise<number>}
   */
  getReviewsCountByRelease: async (releaseId) => {
    try {
      const response = await httpClient.get(`${API_URL}/release/${releaseId}/count`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Мягкое удаление отзыва (только для модераторов)
   * @param {number} id - ID отзыва
   * @returns {Promise<void>}
   */
  softDeleteReview: async (id) => {
    try {
      await httpClient.patch(`${API_URL}/${id}/delete`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Жесткое удаление отзыва (только для администраторов)
   * @param {number} id - ID отзыва
   * @returns {Promise<void>}
   */
  hardDeleteReview: async (id) => {
    try {
      await httpClient.delete(`${API_URL}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Восстановление удаленного отзыва (только для администраторов)
   * @param {number} id - ID отзыва
   * @returns {Promise<void>}
   */
  restoreReview: async (id) => {
    try {
      await httpClient.patch(`${API_URL}/${id}/restore`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение списка удаленных отзывов (только для администраторов)
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getDeletedReviews: async (page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/deleted`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 