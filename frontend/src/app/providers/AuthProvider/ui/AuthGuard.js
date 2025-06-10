import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../index';

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const { authChecked } = useAuth();
  const location = useLocation();

  // Если проверка авторизации еще не завершена, показываем загрузчик
  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        color: '#fff'
      }}>
        Загрузка...
      </div>
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