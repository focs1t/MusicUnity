import api from '../../api/instance';
import { RELEASE_ENDPOINTS } from '../../api/endpoints';

/**
 * Сервис для работы с релизами
 */
export const releaseService = {
  /**
   * Получение релиза по ID
   * @param {number} id - ID релиза
   * @returns {Promise<ReleaseDTO>} Данные релиза
   */
  getById: (id) =>
    api.get(RELEASE_ENDPOINTS.GET_BY_ID(id))
      .then(response => response.data),

  /**
   * Поиск релизов
   * @param {string} query - Поисковый запрос
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReleaseDTO>>} Страница с релизами
   */
  search: (query, page = 0, size = 10) =>
    api.get(RELEASE_ENDPOINTS.SEARCH, { params: { query, page, size } })
      .then(response => response.data),

  /**
   * Создание нового релиза
   * @param {ReleaseDTO} releaseData - Данные релиза
   * @returns {Promise<ReleaseDTO>} Созданный релиз
   */
  create: (releaseData) =>
    api.post(RELEASE_ENDPOINTS.CREATE, releaseData)
      .then(response => response.data),

  /**
   * Обновление релиза
   * @param {number} id - ID релиза
   * @param {ReleaseDTO} releaseData - Данные релиза
   * @returns {Promise<ReleaseDTO>} Обновленный релиз
   */
  update: (id, releaseData) =>
    api.put(RELEASE_ENDPOINTS.UPDATE(id), releaseData)
      .then(response => response.data),

  /**
   * Удаление релиза
   * @param {number} id - ID релиза
   * @returns {Promise<void>}
   */
  delete: (id) =>
    api.delete(RELEASE_ENDPOINTS.DELETE(id)),

  /**
   * Получение релизов автора
   * @param {number} authorId - ID автора
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReleaseDTO>>} Страница с релизами
   */
  getByAuthor: (authorId, page = 0, size = 10) =>
    api.get(RELEASE_ENDPOINTS.GET_BY_AUTHOR(authorId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение релизов по жанру
   * @param {number} genreId - ID жанра
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReleaseDTO>>} Страница с релизами
   */
  getByGenre: (genreId, page = 0, size = 10) =>
    api.get(RELEASE_ENDPOINTS.GET_BY_GENRE(genreId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение популярных релизов
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReleaseDTO>>} Страница с релизами
   */
  getPopular: (page = 0, size = 10) =>
    api.get(RELEASE_ENDPOINTS.GET_POPULAR, { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение последних релизов
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReleaseDTO>>} Страница с релизами
   */
  getLatest: (page = 0, size = 10) =>
    api.get(RELEASE_ENDPOINTS.GET_LATEST, { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение рекомендованных релизов
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReleaseDTO>>} Страница с релизами
   */
  getRecommended: (page = 0, size = 10) =>
    api.get(RELEASE_ENDPOINTS.GET_RECOMMENDED, { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение отзывов о релизе
   * @param {number} releaseId - ID релиза
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReviewDTO>>} Страница с отзывами
   */
  getReviews: (releaseId, page = 0, size = 10) =>
    api.get(RELEASE_ENDPOINTS.GET_REVIEWS(releaseId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Добавление отзыва к релизу
   * @param {number} releaseId - ID релиза
   * @param {ReviewDTO} reviewData - Данные отзыва
   * @returns {Promise<ReviewDTO>} Созданный отзыв
   */
  addReview: (releaseId, reviewData) =>
    api.post(RELEASE_ENDPOINTS.ADD_REVIEW(releaseId), reviewData)
      .then(response => response.data),

  /**
   * Переключение лайка релиза
   * @param {number} releaseId - ID релиза
   * @returns {Promise<void>}
   */
  toggleLike: (releaseId) =>
    api.post(RELEASE_ENDPOINTS.TOGGLE_LIKE(releaseId)),

  /**
   * Добавление релиза в избранное
   * @param {number} releaseId - ID релиза
   * @returns {Promise<void>}
   */
  addToFavorites: (releaseId) =>
    api.post(RELEASE_ENDPOINTS.ADD_TO_FAVORITES(releaseId))
}; 