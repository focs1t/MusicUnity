import { authApi } from '../../../shared/api/auth';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  registerStart, 
  registerSuccess, 
  registerFailure, 
  logout as logoutAction 
} from './authStore';
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
  try {
    if (!token || typeof token !== 'string') {
      console.error('Invalid token: token is empty or not a string');
      return null;
    }

    // Убираем префикс Bearer если он есть
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

    // Проверяем формат JWT
    if (!cleanToken.includes('.')) {
      console.error('Invalid token format: not a valid JWT');
      return null;
    }

    // Сохраняем токен
    localStorage.setItem('token', cleanToken);

    // Декодируем и сохраняем информацию о пользователе
    const user = getUserFromToken(cleanToken);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } else {
      console.error('Failed to decode token');
      localStorage.removeItem('token');
      return null;
    }
  } catch (error) {
    console.error('Error saving auth data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

// Операция входа в систему
export const login = (username, password) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const response = await authApi.login(username, password);
    console.log('Login response:', response);

    // Проверяем наличие токена в ответе
    if (!response?.token) {
      throw new Error('Неверное имя пользователя или пароль');
    }

    const token = response.token;
    if (!token.includes('.')) {
      throw new Error('Неверный формат токена');
    }

    const user = saveAuthData(token);
    if (!user) {
      throw new Error('Ошибка при обработке токена');
    }

    dispatch(loginSuccess({ token, user }));
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Ошибка при входе в систему';

    if (error.response) {
      // Обработка ошибок от сервера
      if (error.response.status === 401) {
        errorMessage = 'Неверное имя пользователя или пароль';
      } else if (error.response.status === 403) {
        errorMessage = 'Доступ запрещен';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

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
  const { auth } = getState();
  const token = auth.token;
  
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