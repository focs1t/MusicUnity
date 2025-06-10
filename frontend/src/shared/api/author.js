import httpClient from './httpClient';

const API_URL = '/api/authors';

export const authorApi = {
  /**
   * Получение всех авторов
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getAllAuthors: async (page = 0, size = 10) => {
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
   * Поиск авторов по имени
   * @param {string} name - Имя автора для поиска
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  searchAuthors: async (name, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/search`, {
        params: { name, page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение автора по ID
   * @param {number} id - ID автора
   * @returns {Promise<Object>}
   */
  getAuthorById: async (id) => {
    try {
      const response = await httpClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Обновление данных автора (только для модераторов)
   * @param {number} id - ID автора
   * @param {Object} updatedAuthor - Обновленные данные автора
   * @returns {Promise<Object>}
   */
  updateAuthor: async (id, updatedAuthor) => {
    try {
      const response = await httpClient.patch(`${API_URL}/${id}`, updatedAuthor);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Создание нового автора (только для модераторов)
   * @param {string} authorName - Имя автора
   * @param {boolean} isArtist - Является ли исполнителем
   * @param {boolean} isProducer - Является ли продюсером
   * @returns {Promise<Object>}
   */
  createAuthor: async (authorName, isArtist, isProducer) => {
    try {
      const response = await httpClient.post(API_URL, null, {
        params: { authorName, isArtist, isProducer }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение отслеживаемых авторов
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getFollowedAuthors: async (userId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/followed`, {
        params: { userId, page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение исполнителей
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getArtists: async (page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/artists`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение продюсеров
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getProducers: async (page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/producers`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Подписка на автора
   * @param {number} authorId - ID автора
   * @returns {Promise<void>}
   */
  followAuthor: async (authorId) => {
    try {
      await httpClient.post(`${API_URL}/${authorId}/follow`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Отписка от автора
   * @param {number} authorId - ID автора
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  unfollowAuthor: async (authorId, userId) => {
    try {
      await httpClient.delete(`${API_URL}/${authorId}/follow`, {
        params: { userId }
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Проверка подписки на автора
   * @param {number} authorId - ID автора
   * @returns {Promise<boolean>}
   */
  checkFollowStatus: async (authorId) => {
    try {
      const response = await httpClient.get(`${API_URL}/${authorId}/follow-status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Мягкое удаление автора (только для модераторов)
   * @param {number} id - ID автора
   * @returns {Promise<void>}
   */
  softDeleteAuthor: async (id) => {
    try {
      await httpClient.patch(`${API_URL}/${id}/delete`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Обновление ролей автора в релизе
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
  }
}; 