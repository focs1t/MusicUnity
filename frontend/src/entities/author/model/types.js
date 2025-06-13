/**
 * Модель автора
 * @typedef {Object} Author
 * @property {number} authorId - ID автора
 * @property {string} authorName - Имя автора
 * @property {boolean} isArtist - Является ли исполнителем
 * @property {boolean} isProducer - Является ли продюсером
 * @property {string} bio - Биография автора
 * @property {string} avatarUrl - URL аватара автора
 * @property {number} followers - Количество подписчиков
 * @property {number} releasesCount - Количество релизов
 * @property {boolean} isDeleted - Флаг удаления
 * @property {string} createdAt - Дата создания
 */

/**
 * Проверяет, является ли пользователь подписанным на автора
 * @param {Array} followedAuthors - Массив отслеживаемых авторов
 * @param {number} authorId - ID автора
 * @returns {boolean}
 */
export const isFollowingAuthor = (followedAuthors, authorId) => {
  return followedAuthors.some(author => author.authorId === authorId);
}; 