import httpClient from './httpClient';

const API_URL = '/api/releases';

export const releaseApi = {
  /**
   * Получение релиза по ID
   * @param {number} id - ID релиза
   * @returns {Promise<Object>}
   */
  getReleaseById: async (id) => {
    try {
      const response = await httpClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение новых релизов
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getNewReleases: async (page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/new`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение релизов автора
   * @param {number} authorId - ID автора
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getReleasesByAuthor: async (authorId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/author/${authorId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Создание нового релиза (только для модераторов)
   * @param {Object} releaseData - Данные релиза
   * @returns {Promise<Object>}
   */
  createRelease: async (releaseData) => {
    try {
      const response = await httpClient.post(API_URL, releaseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Создание собственного релиза (только для авторов)
   * @param {Object} releaseData - Данные релиза
   * @returns {Promise<Object>}
   */
  createOwnRelease: async (releaseData) => {
    try {
      const response = await httpClient.post(`${API_URL}/own`, releaseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение избранных релизов
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getFavoriteReleases: async (page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/favorites`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Добавление релиза в избранное
   * @param {number} id - ID релиза
   * @returns {Promise<void>}
   */
  addToFavorites: async (id) => {
    try {
      await httpClient.post(`${API_URL}/${id}/favorite`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление релиза из избранного
   * @param {number} id - ID релиза
   * @returns {Promise<void>}
   */
  removeFromFavorites: async (id) => {
    try {
      await httpClient.delete(`${API_URL}/${id}/favorite`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение релизов от отслеживаемых авторов
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getReleasesByFollowedAuthors: async (page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/followed`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление автора из релиза (только для модераторов)
   * @param {number} releaseId - ID релиза
   * @param {number} authorId - ID автора
   * @returns {Promise<void>}
   */
  removeAuthorFromRelease: async (releaseId, authorId) => {
    try {
      await httpClient.delete(`${API_URL}/${releaseId}/authors/${authorId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Обновление ролей автора в релизе (только для модераторов)
   * @param {number} releaseId - ID релиза
   * @param {number} authorId - ID автора
   * @param {boolean} isArtist - Является ли исполнителем
   * @param {boolean} isProducer - Является ли продюсером
   * @returns {Promise<void>}
   */
  updateAuthorRoles: async (releaseId, authorId, isArtist, isProducer) => {
    try {
      await httpClient.patch(`${API_URL}/${releaseId}/authors/${authorId}/roles`, null, {
        params: { isArtist, isProducer }
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Мягкое удаление релиза (только для модераторов)
   * @param {number} id - ID релиза
   * @returns {Promise<void>}
   */
  softDeleteRelease: async (id) => {
    try {
      await httpClient.patch(`${API_URL}/${id}/delete`);
    } catch (error) {
      throw error;
    }
  }
}; 