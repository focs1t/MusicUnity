import httpClient from './httpClient';

const API_URL = '/api/reports';

export const reportApi = {
  /**
   * Получение всех жалоб (только для модераторов)
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getAllReports: async (page = 0, size = 10) => {
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
   * Получение жалобы по ID (только для модераторов)
   * @param {number} id - ID жалобы
   * @returns {Promise<Object>}
   */
  getReportById: async (id) => {
    try {
      const response = await httpClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Создание жалобы
   * @param {number} reviewId - ID отзыва
   * @param {number} userId - ID пользователя
   * @param {string} reason - Причина жалобы
   * @returns {Promise<Object>}
   */
  createReport: async (reviewId, userId, reason) => {
    try {
      const response = await httpClient.post(API_URL, null, {
        params: { reviewId, userId, reason }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление отзыва по жалобе (только для модераторов)
   * @param {number} reportId - ID жалобы
   * @param {number} moderatorId - ID модератора
   * @returns {Promise<Object>}
   */
  deleteReview: async (reportId, moderatorId) => {
    try {
      const response = await httpClient.patch(`${API_URL}/${reportId}/delete-review`, null, {
        params: { moderatorId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Блокировка пользователя по жалобе (только для модераторов)
   * @param {number} reportId - ID жалобы
   * @param {number} moderatorId - ID модератора
   * @returns {Promise<Object>}
   */
  banUser: async (reportId, moderatorId) => {
    try {
      const response = await httpClient.patch(`${API_URL}/${reportId}/ban-user`, null, {
        params: { moderatorId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Отклонение жалобы (только для модераторов)
   * @param {number} reportId - ID жалобы
   * @param {number} moderatorId - ID модератора
   * @returns {Promise<Object>}
   */
  rejectReport: async (reportId, moderatorId) => {
    try {
      const response = await httpClient.patch(`${API_URL}/${reportId}/reject`, null, {
        params: { moderatorId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Очистка обработанных жалоб (только для модераторов)
   * @returns {Promise<void>}
   */
  clearResolvedReports: async () => {
    try {
      await httpClient.delete(`${API_URL}/resolved`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение ожидающих жалоб (только для модераторов)
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getPendingReports: async (page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/pending`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение жалоб по модератору (только для модераторов)
   * @param {number} moderatorId - ID модератора
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getByModerator: async (moderatorId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/moderator/${moderatorId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение жалоб по пользователю (только для модераторов)
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getByUser: async (userId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/user/${userId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение жалоб по промежутку дат (только для модераторов)
   * @param {string} start - Начальная дата
   * @param {string} end - Конечная дата
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getByDateRange: async (start, end, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/date/from${start}to/${end}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 