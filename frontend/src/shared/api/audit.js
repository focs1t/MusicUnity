import httpClient from './httpClient';

const API_URL = '/api/audit';

export const auditApi = {
  /**
   * Получение записей аудита по ID модератора (только для администраторов)
   * @param {number} moderatorId - ID модератора
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getAuditLogsByModerator: async (moderatorId, page = 0, size = 10) => {
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
   * Получение записей аудита по ID цели (только для администраторов)
   * @param {number} targetId - ID цели
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getAuditLogsByTargetId: async (targetId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/target/${targetId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение записей аудита по типу действия (только для администраторов)
   * @param {string} actionType - Тип действия
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getAuditLogsByActionType: async (actionType, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/action/${actionType}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение записей аудита (только для администраторов)
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getAuditLogs: async (page = 0, size = 10) => {
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
   * Получение записи аудита по ID (только для администраторов)
   * @param {number} id - ID записи аудита
   * @returns {Promise<Object>}
   */
  getAuditLogById: async (id) => {
    try {
      const response = await httpClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 