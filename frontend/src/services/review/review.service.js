import api from '../../api/instance';
import { REVIEW_ENDPOINTS } from '../../api/endpoints';

/**
 * Сервис для работы с отзывами
 */
export const reviewService = {
  /**
   * Получение отзыва по ID
   * @param {number} id - ID отзыва
   * @returns {Promise<ReviewDTO>} Данные отзыва
   */
  getById: (id) =>
    api.get(REVIEW_ENDPOINTS.GET_BY_ID(id))
      .then(response => response.data),

  /**
   * Создание нового отзыва
   * @param {ReviewDTO} reviewData - Данные отзыва
   * @returns {Promise<ReviewDTO>} Созданный отзыв
   */
  create: (reviewData) =>
    api.post(REVIEW_ENDPOINTS.CREATE, reviewData)
      .then(response => response.data),

  /**
   * Обновление отзыва
   * @param {number} id - ID отзыва
   * @param {ReviewDTO} reviewData - Данные отзыва
   * @returns {Promise<ReviewDTO>} Обновленный отзыв
   */
  update: (id, reviewData) =>
    api.put(REVIEW_ENDPOINTS.UPDATE(id), reviewData)
      .then(response => response.data),

  /**
   * Удаление отзыва
   * @param {number} id - ID отзыва
   * @returns {Promise<void>}
   */
  delete: (id) =>
    api.delete(REVIEW_ENDPOINTS.DELETE(id)),

  /**
   * Получение отзывов пользователя
   * @param {number} userId - ID пользователя
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReviewDTO>>} Страница с отзывами
   */
  getByUser: (userId, page = 0, size = 10) =>
    api.get(REVIEW_ENDPOINTS.GET_BY_USER(userId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение отзывов о релизе
   * @param {number} releaseId - ID релиза
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReviewDTO>>} Страница с отзывами
   */
  getByRelease: (releaseId, page = 0, size = 10) =>
    api.get(REVIEW_ENDPOINTS.GET_BY_RELEASE(releaseId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Переключение лайка отзыва
   * @param {number} reviewId - ID отзыва
   * @returns {Promise<void>}
   */
  toggleLike: (reviewId) =>
    api.post(REVIEW_ENDPOINTS.TOGGLE_LIKE(reviewId)),

  /**
   * Получение лайков отзыва
   * @param {number} reviewId - ID отзыва
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<UserDTO>>} Страница с пользователями
   */
  getLikes: (reviewId, page = 0, size = 10) =>
    api.get(REVIEW_ENDPOINTS.GET_LIKES(reviewId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Отправка жалобы на отзыв
   * @param {number} reviewId - ID отзыва
   * @param {ReportDTO} reportData - Данные жалобы
   * @returns {Promise<void>}
   */
  report: (reviewId, reportData) =>
    api.post(REVIEW_ENDPOINTS.REPORT(reviewId), reportData)
}; 