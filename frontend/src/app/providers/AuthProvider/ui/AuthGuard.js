import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../index';
import { LoadingSpinner } from '../../../../shared/ui/LoadingSpinner';

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const { authChecked } = useAuth();
  const location = useLocation();

  // Если проверка авторизации еще не завершена, показываем загрузчик
  if (!authChecked) {
    return (
      <LoadingSpinner 
        text="Проверка авторизации..." 
        className="loading-container--center"
      />
    );
  }

  if (!isAuthenticated) {
    // Редирект на главную страницу, с сохранением первоначального маршрута
    // Авторизация будет осуществляться через модальное окно
    return <Navigate to="/" state={{ from: location, requireAuth: true }} replace />;
  }

  return children;
};

export default AuthGuard; 