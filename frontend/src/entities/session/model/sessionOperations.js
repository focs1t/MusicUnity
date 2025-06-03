import { authApi } from '../../../shared/api/auth';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  registerStart, 
  registerSuccess, 
  registerFailure, 
  logout as logoutAction 
} from './sessionStore';
import { jwtDecode } from 'jwt-decode';

// Функция для расшифровки токена и получения информации о пользователе
const getUserFromToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Ошибка при расшифровке токена:', error);
    return null;
  }
};

// Функция для сохранения токена в localStorage
const saveAuthData = (token) => {
  localStorage.setItem('token', token);
  const user = getUserFromToken(token);
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  return user;
};

// Операция входа в систему
export const login = (username, password) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const response = await authApi.login(username, password);
    const { token } = response;
    const user = saveAuthData(token);
    dispatch(loginSuccess({ token, user }));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Ошибка при входе в систему';
    dispatch(loginFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Операция регистрации
export const register = (username, email, password) => async (dispatch) => {
  dispatch(registerStart());
  try {
    const response = await authApi.register(username, email, password);
    const { token } = response;
    const user = saveAuthData(token);
    dispatch(registerSuccess({ token, user }));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Ошибка при регистрации';
    dispatch(registerFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Операция выхода из системы
export const logout = () => async (dispatch, getState) => {
  const { session } = getState();
  const token = session.token;
  
  // Удаление токена из localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Если есть токен, отправляем запрос на сервер для инвалидации
  if (token) {
    try {
      await authApi.logout(token);
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  }
  
  dispatch(logoutAction());
};

// Операция проверки авторизации
export const checkAuth = () => (dispatch) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Проверка валидности токена (например, не истек ли срок действия)
      const user = getUserFromToken(token);
      if (user) {
        dispatch(loginSuccess({ token, user }));
        return true;
      }
    } catch (error) {
      console.error('Ошибка при проверке авторизации:', error);
    }
  }
  return false;
};

// Операция запроса сброса пароля
export const forgotPassword = (email) => async () => {
  try {
    await authApi.forgotPassword(email);
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Ошибка при запросе сброса пароля';
    return { success: false, error: errorMessage };
  }
};

// Операция сброса пароля
export const resetPassword = (token, newPassword) => async () => {
  try {
    await authApi.resetPassword(token, newPassword);
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Ошибка при сбросе пароля';
    return { success: false, error: errorMessage };
  }
}; 