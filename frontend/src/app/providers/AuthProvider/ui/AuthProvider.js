import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authModel } from '../../../../entities/auth';
import { userApi } from '../../../../shared/api/user';

// Создаем селекторы для authModel
const selectIsAuth = (state) => state.auth.isAuthenticated;
const selectUserData = (state) => state.auth.user;
const selectAuthLoading = (state) => state.auth.loading;
const selectAuthError = (state) => state.auth.error;

// Создаем контекст для авторизации
export const AuthContext = createContext(null);

// Хук для использования контекста авторизации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Получаем данные о пользователе и статусе авторизации из redux
  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(selectUserData);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  // Локальное состояние для отслеживания проверки авторизации
  const [authChecked, setAuthChecked] = useState(false);
  
  // Функция для выхода из системы
  const logout = () => {
    console.log('AuthProvider: Выполняем выход из системы');
    dispatch(authModel.logout());
  };
  
  // Функция для входа в систему
  const login = async (username, password, rememberMe) => {
    try {
      const result = await dispatch(authModel.login(username, password, rememberMe));
      if (result.meta.requestStatus === 'fulfilled') {
        // Проверяем, есть ли сохраненный путь для перенаправления
        const redirectPath = localStorage.getItem('redirectAfterAuth');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterAuth');
          navigate(redirectPath);
        }
      }
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  // Функция для регистрации
  const register = async (username, email, password) => {
    try {
      const result = await dispatch(authModel.register(username, email, password));
      if (result.meta.requestStatus === 'fulfilled') {
        // Проверяем, есть ли сохраненный путь для перенаправления
        const redirectPath = localStorage.getItem('redirectAfterAuth');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterAuth');
          navigate(redirectPath);
        }
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Эффект для проверки авторизации при монтировании компонента
  useEffect(() => {
    // Проверяем флаг выхода в хранилище
    const isLoggedOut = localStorage.getItem('logged_out') === 'true' || 
                       sessionStorage.getItem('logged_out') === 'true';
    
    const checkAuthentication = async () => {
      // Если обнаружен флаг выхода - сессия закрыта, не пытаемся восстановить
      if (isLoggedOut) {
        console.log('AuthProvider: Обнаружен флаг выхода, сессия закрыта');
        
        // Очищаем все возможные данные авторизации
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        // Устанавливаем состояние для продолжения отрисовки
        setAuthChecked(true);
        return;
      }
      
      // Проверяем токены напрямую
      const hasToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!hasToken) {
        console.log('AuthProvider: Токены не найдены, пользователь не авторизован');
        setAuthChecked(true);
        return;
      }
      
      // Токен есть, проверяем его валидность через checkAuth
      console.log('AuthProvider: Токен найден, проверяем авторизацию');
      await dispatch(authModel.checkAuth());
      setAuthChecked(true);
    };
    
    checkAuthentication();
  }, [dispatch]);

  // Обработчик принудительного выхода из системы
  useEffect(() => {
    const handleForceLogout = (event) => {
      console.log('AuthProvider: Получено событие принудительного выхода:', event.detail);
      
      // Выполняем выход из системы
      dispatch(authModel.logout());
      
      // Показываем уведомление пользователю
      if (event.detail?.message) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #f44336;
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10000;
          max-width: 400px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        notification.textContent = event.detail.message;
        document.body.appendChild(notification);
        
        // Убираем уведомление через 5 секунд
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 5000);
      }
      
      // Перенаправляем на главную страницу
      navigate('/');
    };

    // Добавляем обработчик события
    window.addEventListener('forceLogout', handleForceLogout);

    // Очищаем обработчик при размонтировании
    return () => {
      window.removeEventListener('forceLogout', handleForceLogout);
    };
  }, [dispatch, navigate]);

  // Периодическая проверка статуса пользователя (каждые 30 секунд)
  useEffect(() => {
    let statusCheckInterval;

    if (isAuth && user) {
      console.log('AuthProvider: Запуск периодической проверки статуса пользователя');
      
      const checkUserStatus = async () => {
        try {
          const isActive = await userApi.checkUserStatus();
          
          if (!isActive) {
            console.log('AuthProvider: Пользователь заблокирован, принудительный выход');
            
            // Создаем событие принудительного выхода
            const logoutEvent = new CustomEvent('forceLogout', {
              detail: { 
                reason: 'blocked',
                message: 'Ваш аккаунт был заблокирован.'
              }
            });
            window.dispatchEvent(logoutEvent);
          }
        } catch (error) {
          console.error('AuthProvider: Ошибка при проверке статуса пользователя:', error);
          
          // Если получили 401/403 - возможно пользователь заблокирован
          if (error.response?.status === 401 || error.response?.status === 403) {
            const logoutEvent = new CustomEvent('forceLogout', {
              detail: { 
                reason: 'unauthorized',
                message: 'Ваша сессия недействительна. Возможно, ваш аккаунт был заблокирован.'
              }
            });
            window.dispatchEvent(logoutEvent);
          }
        }
      };

      // Проверяем статус каждые 30 секунд
      statusCheckInterval = setInterval(checkUserStatus, 30000);
    }

    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        console.log('AuthProvider: Остановка периодической проверки статуса');
      }
    };
  }, [isAuth, user]);

  // Предоставляем контекст авторизации для всех дочерних компонентов
  return (
    <AuthContext.Provider 
      value={{ 
        isAuth, 
        user, 
        loading, 
        error,
        authChecked,
        logout,
        login,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 