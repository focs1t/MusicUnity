/**
 * Роль пользователя
 * @readonly
 * @enum {string}
 */
export const UserRole = {
  USER: 'USER',
  AUTHOR: 'AUTHOR',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN'
};

/**
 * Модель пользователя
 * @typedef {Object} User
 * @property {number} userId - ID пользователя
 * @property {string} username - Имя пользователя
 * @property {string} email - Электронная почта
 * @property {string} bio - Биография пользователя
 * @property {string} avatarUrl - URL аватара
 * @property {UserRole} role - Роль пользователя
 * @property {boolean} isBlocked - Флаг блокировки
 * @property {number} favoritesCount - Количество избранных релизов
 * @property {number} followedAuthorsCount - Количество отслеживаемых авторов
 * @property {number} reviewsCount - Количество отзывов
 * @property {string} createdAt - Дата регистрации
 */ 