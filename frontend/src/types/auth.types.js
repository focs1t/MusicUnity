/**
 * @typedef {Object} AuthResponse
 * @property {string} token - JWT токен
 * @property {UserDTO} user - Данные пользователя
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} username - Имя пользователя
 * @property {string} email - Email пользователя
 * @property {string} password - Пароль
 * @property {string} [firstName] - Имя
 * @property {string} [lastName] - Фамилия
 */

/**
 * @typedef {Object} UserDTO
 * @property {number} id - ID пользователя
 * @property {string} username - Имя пользователя
 * @property {string} email - Email пользователя
 * @property {string} [firstName] - Имя
 * @property {string} [lastName] - Фамилия
 * @property {string} role - Роль пользователя
 * @property {string} status - Статус пользователя
 * @property {string} [avatarUrl] - URL аватара
 * @property {Date} createdAt - Дата создания
 * @property {Date} updatedAt - Дата обновления
 */ 