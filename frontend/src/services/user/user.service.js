import api from '../../api/instance';
import { USER_ENDPOINTS } from '../../api/endpoints';

/**
 * Сервис для работы с пользователями
 */
export const userService = {
  /**
   * Получение пользователя по ID
   * @param {number} id - ID пользователя
   * @returns {Promise<UserDTO>} Данные пользователя
   */
  getUserById: (id) => 
    api.get(USER_ENDPOINTS.GET_BY_ID(id))
      .then(response => response.data),

  /**
   * Поиск пользователя по имени пользователя
   * @param {string} username - Имя пользователя
   * @returns {Promise<UserDTO>} Данные пользователя
   */
  findByUsername: (username) => 
    api.get(USER_ENDPOINTS.FIND_BY_USERNAME(username))
      .then(response => response.data),

  /**
   * Поиск пользователей по имени пользователя
   * @param {string} username - Имя пользователя для поиска
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<UserDTO>>} Страница с пользователями
   */
  searchUsers: (username, page = 0, size = 10) => 
    api.get(USER_ENDPOINTS.SEARCH, { params: { username, page, size } })
      .then(response => response.data),

  /**
   * Поиск пользователей по роли
   * @param {string} role - Роль пользователя
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<UserDTO>>} Страница с пользователями
   */
  findByRights: (role, page = 0, size = 10) =>
    api.get(USER_ENDPOINTS.FIND_BY_ROLE(role), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение заблокированных пользователей
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<UserDTO>>} Страница с пользователями
   */
  findBlockedUsers: (page = 0, size = 10) =>
    api.get(USER_ENDPOINTS.BLOCKED, { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение избранных релизов пользователя
   * @param {number} userId - ID пользователя
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReleaseDTO>>} Страница с релизами
   */
  getFavoriteReleases: (userId, page = 0, size = 10) =>
    api.get(USER_ENDPOINTS.FAVORITES(userId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение отслеживаемых авторов
   * @param {number} userId - ID пользователя
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<AuthorDTO>>} Страница с авторами
   */
  getFollowedAuthors: (userId, page = 0, size = 10) =>
    api.get(USER_ENDPOINTS.FOLLOWED_AUTHORS(userId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение релизов от отслеживаемых авторов
   * @param {number} userId - ID пользователя
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReleaseDTO>>} Страница с релизами
   */
  getReleasesFromFollowedAuthors: (userId, page = 0, size = 10) =>
    api.get(USER_ENDPOINTS.FOLLOWED_AUTHORS_RELEASES(userId), { params: { page, size } })
      .then(response => response.data)
}; 