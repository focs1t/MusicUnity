/**
 * Тип лайка
 * @readonly
 * @enum {string}
 */
export const LikeType = {
  LIKE: 'LIKE',
  DISLIKE: 'DISLIKE'
};

/**
 * Модель лайка
 * @typedef {Object} Like
 * @property {number} likeId - ID лайка
 * @property {number} userId - ID пользователя
 * @property {number} reviewId - ID отзыва
 * @property {LikeType} type - Тип лайка
 * @property {string} createdAt - Дата создания
 */ 