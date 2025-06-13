import { userApi } from '../../../shared/api/user';
import { 
  startLoading,
  loadCurrentUserSuccess,
  loadProfileSuccess,
  requestFailure,
  updateProfileSuccess
} from './userStore';

// Получить текущего пользователя
export const fetchCurrentUser = () => async (dispatch) => {
  dispatch(startLoading());
  try {
    const user = await userApi.getCurrentUser();
    dispatch(loadCurrentUserSuccess(user));
    return user;
  } catch (error) {
    dispatch(requestFailure(error.message));
    throw error;
  }
};

// Получить пользователя по ID
export const fetchUserById = (userId) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const user = await userApi.getUserById(userId);
    dispatch(loadProfileSuccess(user));
    return user;
  } catch (error) {
    dispatch(requestFailure(error.message));
    throw error;
  }
};

// Получить пользователя по имени пользователя
export const fetchUserByUsername = (username) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const user = await userApi.getUserByUsername(username);
    dispatch(loadProfileSuccess(user));
    return user;
  } catch (error) {
    dispatch(requestFailure(error.message));
    throw error;
  }
};

// Обновить профиль пользователя
export const updateUserProfile = (profileData) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const updatedUser = await userApi.updateUserData(
      profileData.bio,
      profileData.avatarUrl
    );
    dispatch(updateProfileSuccess(updatedUser));
    return updatedUser;
  } catch (error) {
    dispatch(requestFailure(error.message));
    throw error;
  }
};

// Изменить пароль пользователя
export const changeUserPassword = (passwordData) => async (dispatch) => {
  dispatch(startLoading());
  try {
    await userApi.changePassword(passwordData.oldPassword, passwordData.newPassword);
    return { success: true };
  } catch (error) {
    dispatch(requestFailure(error.message));
    throw error;
  }
}; 