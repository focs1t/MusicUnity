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
    const decoded = jwtDecode(token);
    
    // Расширенная проверка токена
    if (!decoded || !decoded.sub) {
      console.error('Токен не содержит обязательного поля sub');
      return null;
    }
    
    // Если в токене нет поля username, используем sub в качестве username
    if (!decoded.username) {
      decoded.username = decoded.sub;
    }
    
    return decoded;
  } catch (error) {
    console.error('Ошибка при расшифровке токена:', error);
    return null;
  }
};

// Функция для сохранения токена в localStorage/sessionStorage в зависимости от rememberMe
const saveAuthData = (token, rememberMe = false) => {
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

    // Декодируем информацию о пользователе
    const user = getUserFromToken(cleanToken);
    if (!user) {
      console.error('Failed to decode token');
      return null;
    }

    // Сохраняем флаг "Запомнить меня"
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');

    // Если "Запомнить меня" выбрано, используем localStorage (постоянное хранилище)
    // В противном случае используем sessionStorage (временное, до закрытия браузера)
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Сохраняем токен и информацию о пользователе
    storage.setItem('token', cleanToken);
    storage.setItem('user', JSON.stringify(user));
    
    console.log(`Auth data saved to ${rememberMe ? 'localStorage' : 'sessionStorage'}`);
    
    return user;
  } catch (error) {
    console.error('Error saving auth data:', error);
    clearAuthData();
    return null;
  }
};

// Функция для полной очистки данных авторизации
const clearAuthData = () => {
  try {
    console.log('Начинаем полную очистку данных авторизации...');
    
    // Очистка localStorage
    const localStorageKeys = ['token', 'user', 'rememberMe'];
    localStorageKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Ошибка при удалении ${key} из localStorage:`, e);
      }
    });
    
    // Очистка sessionStorage
    const sessionStorageKeys = ['token', 'user'];
    sessionStorageKeys.forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        console.error(`Ошибка при удалении ${key} из sessionStorage:`, e);
      }
    });
    
    // Очистка всех возможных кук, связанных с авторизацией
    try {
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (e) {
      console.error('Ошибка при очистке cookies:', e);
    }
    
    // Проверяем очистку
    const remainingLocal = localStorageKeys.filter(key => localStorage.getItem(key) !== null);
    const remainingSession = sessionStorageKeys.filter(key => sessionStorage.getItem(key) !== null);
    
    if (remainingLocal.length > 0 || remainingSession.length > 0) {
      console.warn('Не все данные были очищены:', {
        localStorage: remainingLocal,
        sessionStorage: remainingSession
      });
      
      // Повторная попытка очистки
      remainingLocal.forEach(key => localStorage.removeItem(key));
      remainingSession.forEach(key => sessionStorage.removeItem(key));
    }
    
    console.log('Данные авторизации полностью очищены');
  } catch (error) {
    console.error('Ошибка при очистке данных авторизации:', error);
    
    // Принудительная очистка в случае ошибки
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } catch (e) {
      console.error('Критическая ошибка при очистке хранилищ:', e);
    }
  }
};

// Функция для получения токена из хранилища с учетом rememberMe
const getStoredToken = () => {
  // Сначала проверяем localStorage
  let token = localStorage.getItem('token');
  let rememberMe = localStorage.getItem('rememberMe') === 'true';
  
  // Если в localStorage нет токена или rememberMe=false, проверяем sessionStorage
  if (!token || !rememberMe) {
    const sessionToken = sessionStorage.getItem('token');
    if (sessionToken) {
      token = sessionToken;
      rememberMe = false;
    }
  }
  
  return { token, rememberMe };
};

// Операция входа в систему
export const login = (username, password, rememberMe = false) => async (dispatch) => {
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

    // Удаляем флаг выхода, если он был установлен ранее
    localStorage.removeItem('logged_out');
    sessionStorage.removeItem('logged_out');
    
    // Сохраняем токен с учетом флага rememberMe
    const user = saveAuthData(token, rememberMe);
    if (!user) {
      throw new Error('Ошибка при обработке токена');
    }

    dispatch(loginSuccess({ token, user }));
    
    // Обновляем страницу ТОЛЬКО при успешном входе
    window.location.reload();
    
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
    
    // Обновляем страницу ТОЛЬКО при успешной регистрации
    window.location.reload();
    
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Ошибка при регистрации';
    dispatch(registerFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Операция выхода из системы
export const logout = () => (dispatch) => {
  console.log("Начинаем процедуру выхода из системы...");
  
  try {
    // Сначала диспатчим действие logout для обновления Redux
    dispatch(logoutAction());
    
    // Проверяем наличие токенов
    const tokenFromLocalStorage = localStorage.getItem('token');
    const tokenFromSessionStorage = sessionStorage.getItem('token');
    const token = tokenFromLocalStorage || tokenFromSessionStorage;
    
    if (token) {
      // Отправляем запрос на logout без await, чтобы не блокировать выполнение
      authApi.logout(token)
        .then(() => console.log("API logout успешно выполнен"))
        .catch(err => console.error("Ошибка при API logout:", err));
    }
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error);
  }
  
  // Не выполняем перезагрузку страницы - это будет делать компонент
  return { success: true };
};

// Операция проверки авторизации
export const checkAuth = () => (dispatch) => {
  console.log('Проверка состояния авторизации...');
  
  try {
    // Первая проверка - если установлен флаг выхода
    if (localStorage.getItem('logged_out') === 'true' || sessionStorage.getItem('logged_out') === 'true') {
      console.log('Обнаружен флаг выхода из системы, сессия закрыта');
      
      // Убедимся, что все хранилища очищены
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      return false;
    }
    
    // Проверяем токены в хранилищах
    const tokenFromLocalStorage = localStorage.getItem('token');
    const tokenFromSessionStorage = sessionStorage.getItem('token');
    
    console.log('Проверка токенов напрямую:', 
      'localStorage:', !!tokenFromLocalStorage, 
      'sessionStorage:', !!tokenFromSessionStorage);
    
    const token = tokenFromLocalStorage || tokenFromSessionStorage;
    
    if (!token) {
      console.log('Токены не найдены');
      return false;
    }
    
    // Проверяем валидность токена
    const user = getUserFromToken(token);
    
    if (!user) {
      console.log('Токен недействителен, очистка данных');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return false;
    }
    
    // Проверяем срок действия токена
    const currentTime = Date.now() / 1000;
    if (user.exp && user.exp < currentTime) {
      console.log('Срок действия токена истек');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return false;
    }
    
    console.log('Токен действителен, пользователь:', user.username || user.sub);
    dispatch(loginSuccess({ token, user }));
    return true;
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error);
    // При ошибке очищаем всё
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return false;
  }
};

// Операция восстановления пароля
export const forgotPassword = (email) => async (dispatch) => {
  try {
    // Вызываем API для отправки запроса на восстановление пароля
    await authApi.forgotPassword(email);
    return { success: true };
  } catch (error) {
    console.error('Forgot password error:', error);
    let errorMessage = 'Ошибка при восстановлении пароля';

    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'Пользователь с таким email не найден';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

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