import httpClient from './httpClient';

const API_URL = '/api/genres';

export const genreApi = {
  /**
   * Получение всех жанров
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getAllGenres: async (page = 0, size = 10) => {
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
   * Получение жанра по ID
   * @param {number} id - ID жанра
   * @returns {Promise<Object>}
   */
  getGenreById: async (id) => {
    try {
      const response = await httpClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Создание нового жанра (только для модераторов)
   * @param {string} name - Название жанра
   * @returns {Promise<Object>}
   */
  createGenre: async (name) => {
    try {
      const response = await httpClient.post(API_URL, null, {
        params: { name }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Удаление жанра (только для модераторов)
   * @param {number} id - ID жанра
   * @returns {Promise<void>}
   */
  deleteGenre: async (id) => {
    try {
      await httpClient.delete(`${API_URL}/${id}`);
    } catch (error) {
      throw error;
    }
  }
}; 