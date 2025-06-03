import api from '../../api/instance';
import { GENRE_ENDPOINTS } from '../../api/endpoints';

/**
 * Сервис для работы с жанрами
 */
export const genreService = {
  /**
   * Получение жанра по ID
   * @param {number} id - ID жанра
   * @returns {Promise<GenreDTO>} Данные жанра
   */
  getById: (id) =>
    api.get(GENRE_ENDPOINTS.GET_BY_ID(id))
      .then(response => response.data),

  /**
   * Получение всех жанров
   * @returns {Promise<GenreDTO[]>} Список жанров
   */
  getAll: () =>
    api.get(GENRE_ENDPOINTS.GET_ALL)
      .then(response => response.data),

  /**
   * Создание нового жанра
   * @param {GenreDTO} genreData - Данные жанра
   * @returns {Promise<GenreDTO>} Созданный жанр
   */
  create: (genreData) =>
    api.post(GENRE_ENDPOINTS.CREATE, genreData)
      .then(response => response.data),

  /**
   * Обновление жанра
   * @param {number} id - ID жанра
   * @param {GenreDTO} genreData - Данные жанра
   * @returns {Promise<GenreDTO>} Обновленный жанр
   */
  update: (id, genreData) =>
    api.put(GENRE_ENDPOINTS.UPDATE(id), genreData)
      .then(response => response.data),

  /**
   * Удаление жанра
   * @param {number} id - ID жанра
   * @returns {Promise<void>}
   */
  delete: (id) =>
    api.delete(GENRE_ENDPOINTS.DELETE(id)),

  /**
   * Получение релизов жанра
   * @param {number} genreId - ID жанра
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReleaseDTO>>} Страница с релизами
   */
  getReleases: (genreId, page = 0, size = 10) =>
    api.get(GENRE_ENDPOINTS.GET_RELEASES(genreId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение популярных жанров
   * @param {number} [limit=10] - Количество жанров
   * @returns {Promise<GenreDTO[]>} Список популярных жанров
   */
  getPopular: (limit = 10) =>
    api.get(GENRE_ENDPOINTS.GET_POPULAR, { params: { limit } })
      .then(response => response.data),

  /**
   * Получение статистики жанра
   * @param {number} genreId - ID жанра
   * @returns {Promise<GenreStatisticsDTO>} Статистика жанра
   */
  getStatistics: (genreId) =>
    api.get(GENRE_ENDPOINTS.GET_STATISTICS(genreId))
      .then(response => response.data)
}; 