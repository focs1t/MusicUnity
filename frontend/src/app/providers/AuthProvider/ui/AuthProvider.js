import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authModel } from '../../../../entities/auth';

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
  const login = (username, password, rememberMe) => {
    return dispatch(authModel.login(username, password, rememberMe));
  };
  
  // Функция для регистрации
  const register = (username, email, password) => {
    return dispatch(authModel.register(username, email, password));
  };

  useEffect(() => {
    // Строгая проверка наличия флага выхода 
    const isLoggedOut = localStorage.getItem('logged_out') === 'true' || 
                        sessionStorage.getItem('logged_out') === 'true';
    
    console.log('AuthProvider: Инициализация, проверка состояния авторизации', 
                'isLoggedOut:', isLoggedOut);
    
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