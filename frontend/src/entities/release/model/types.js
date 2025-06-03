/**
 * Тип релиза
 * @readonly
 * @enum {string}
 */
export const ReleaseType = {
  SINGLE: 'SINGLE',
  EP: 'EP',
  ALBUM: 'ALBUM',
  MIXTAPE: 'MIXTAPE'
};

/**
 * Модель релиза
 * @typedef {Object} Release
 * @property {number} releaseId - ID релиза
 * @property {string} title - Название релиза
 * @property {ReleaseType} type - Тип релиза
 * @property {string} description - Описание релиза
 * @property {string} coverUrl - URL обложки релиза
 * @property {string} releaseDate - Дата релиза
 * @property {Array<Author>} authors - Авторы релиза
 * @property {Array<string>} genres - Жанры релиза
 * @property {number} likesCount - Количество лайков
 * @property {number} reviewsCount - Количество отзывов
 * @property {number} averageRating - Средний рейтинг
 * @property {boolean} isDeleted - Флаг удаления
 * @property {string} createdAt - Дата создания
 */

/**
 * Проверяет, является ли релиз в избранном
 * @param {Array} favorites - Массив избранных релизов
 * @param {number} releaseId - ID релиза
 * @returns {boolean}
 */
export const isInFavorites = (favorites, releaseId) => {
  return favorites.some(release => release.releaseId === releaseId);
}; 