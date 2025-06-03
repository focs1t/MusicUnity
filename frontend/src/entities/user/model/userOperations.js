import { userApi } from '../../../shared/api/user';
import {
  startLoading,
  loadCurrentUserSuccess,
  loadProfileSuccess,
  requestFailure,
  updateProfileSuccess
} from './userStore';

/**
 * Загрузка текущего пользователя
 * @returns {Function} Thunk функция
 */
export const fetchCurrentUser = () => async (dispatch) => {
  try {
    dispatch(startLoading());
    const userData = await userApi.getCurrentUser();
    dispatch(loadCurrentUserSuccess(userData));
    return userData;
  } catch (error) {
    dispatch(requestFailure(error.message || 'Ошибка при загрузке пользователя'));
    throw error;
  }
};

/**
 * Загрузка пользователя по ID
 * @param {number} userId - ID пользователя
 * @returns {Function} Thunk функция
 */
export const fetchUserById = (userId) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const userData = await userApi.getUserById(userId);
    dispatch(loadProfileSuccess(userData));
    return userData;
  } catch (error) {
    dispatch(requestFailure(error.message || 'Ошибка при загрузке пользователя'));
    throw error;
  }
};

/**
 * Загрузка пользователя по имени пользователя
 * @param {string} username - Имя пользователя
 * @returns {Function} Thunk функция
 */
export const fetchUserByUsername = (username) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const userData = await userApi.getUserByUsername(username);
    dispatch(loadProfileSuccess(userData));
    return userData;
  } catch (error) {
    dispatch(requestFailure(error.message || 'Ошибка при загрузке пользователя'));
    throw error;
  }
};

/**
 * Обновление профиля пользователя
 * @param {Object} userData - Данные для обновления
 * @returns {Function} Thunk функция
 */
export const updateUserProfile = (userData) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const updatedUser = await userApi.updateProfile(userData);
    dispatch(updateProfileSuccess(updatedUser));
    return updatedUser;
  } catch (error) {
    dispatch(requestFailure(error.message || 'Ошибка при обновлении профиля'));
    throw error;
  }
};

/**
 * Изменение пароля пользователя
 * @param {string} oldPassword - Старый пароль
 * @param {string} newPassword - Новый пароль
 * @returns {Function} Thunk функция
 */
export const changeUserPassword = (oldPassword, newPassword) => async (dispatch) => {
  try {
    dispatch(startLoading());
    const result = await userApi.changePassword(oldPassword, newPassword);
    return result;
  } catch (error) {
    dispatch(requestFailure(error.message || 'Ошибка при смене пароля'));
    throw error;
  }
};

/**
 * Поиск пользователей
 * @param {string} username - Часть имени пользователя
 * @param {number} page - Номер страницы
 * @param {number} size - Размер страницы
 * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
 */
export const searchUsers = async (username, page = 0, size = 10) => {
  try {
    const response = await userApi.searchUsers(username, page, size);
    return response;
  } catch (error) {
    throw error;
  }
}; 