import api from '../../api/instance';
import { AUTHOR_ENDPOINTS } from '../../api/endpoints';

/**
 * Сервис для работы с авторами
 */
export const authorService = {
  /**
   * Получение автора по ID
   * @param {number} id - ID автора
   * @returns {Promise<AuthorDTO>} Данные автора
   */
  getById: (id) =>
    api.get(AUTHOR_ENDPOINTS.GET_BY_ID(id))
      .then(response => response.data),

  /**
   * Поиск авторов
   * @param {string} query - Поисковый запрос
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<AuthorDTO>>} Страница с авторами
   */
  search: (query, page = 0, size = 10) =>
    api.get(AUTHOR_ENDPOINTS.SEARCH, { params: { query, page, size } })
      .then(response => response.data),

  /**
   * Создание нового автора
   * @param {AuthorDTO} authorData - Данные автора
   * @returns {Promise<AuthorDTO>} Созданный автор
   */
  create: (authorData) =>
    api.post(AUTHOR_ENDPOINTS.CREATE, authorData)
      .then(response => response.data),

  /**
   * Обновление автора
   * @param {number} id - ID автора
   * @param {AuthorDTO} authorData - Данные автора
   * @returns {Promise<AuthorDTO>} Обновленный автор
   */
  update: (id, authorData) =>
    api.put(AUTHOR_ENDPOINTS.UPDATE(id), authorData)
      .then(response => response.data),

  /**
   * Удаление автора
   * @param {number} id - ID автора
   * @returns {Promise<void>}
   */
  delete: (id) =>
    api.delete(AUTHOR_ENDPOINTS.DELETE(id)),

  /**
   * Получение релизов автора
   * @param {number} authorId - ID автора
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReleaseDTO>>} Страница с релизами
   */
  getReleases: (authorId, page = 0, size = 10) =>
    api.get(AUTHOR_ENDPOINTS.GET_RELEASES(authorId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение популярных авторов
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<AuthorDTO>>} Страница с авторами
   */
  getPopular: (page = 0, size = 10) =>
    api.get(AUTHOR_ENDPOINTS.GET_POPULAR, { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение новых авторов
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<AuthorDTO>>} Страница с авторами
   */
  getLatest: (page = 0, size = 10) =>
    api.get(AUTHOR_ENDPOINTS.GET_LATEST, { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение рекомендованных авторов
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<AuthorDTO>>} Страница с авторами
   */
  getRecommended: (page = 0, size = 10) =>
    api.get(AUTHOR_ENDPOINTS.GET_RECOMMENDED, { params: { page, size } })
      .then(response => response.data),

  /**
   * Переключение подписки на автора
   * @param {number} authorId - ID автора
   * @returns {Promise<void>}
   */
  toggleFollow: (authorId) =>
    api.post(AUTHOR_ENDPOINTS.TOGGLE_FOLLOW(authorId)),

  /**
   * Получение подписчиков автора
   * @param {number} authorId - ID автора
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<UserDTO>>} Страница с пользователями
   */
  getFollowers: (authorId, page = 0, size = 10) =>
    api.get(AUTHOR_ENDPOINTS.GET_FOLLOWERS(authorId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение статистики автора
   * @param {number} authorId - ID автора
   * @returns {Promise<AuthorStatisticsDTO>} Статистика автора
   */
  getStatistics: (authorId) =>
    api.get(AUTHOR_ENDPOINTS.GET_STATISTICS(authorId))
      .then(response => response.data)
}; 