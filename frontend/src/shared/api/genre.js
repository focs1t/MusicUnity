import httpClient from './httpClient';

const API_URL = '/api/genres';

export const genreApi = {
  /**
   * Получение всех жанров без пагинации
   * @returns {Promise<Array>}
   */
  getAllGenres: async () => {
    try {
      // Получаем все жанры с большим размером страницы
      const response = await httpClient.get(API_URL, {
        params: { size: 1000 }
      });
      return response.data.content || response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение жанров с пагинацией
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<Object>}
   */
  getGenresPaginated: async (page = 0, size = 10) => {
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
  }
}; 