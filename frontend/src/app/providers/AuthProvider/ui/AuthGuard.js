import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Редирект на главную страницу, с сохранением первоначального маршрута
    // Авторизация будет осуществляться через модальное окно
    return <Navigate to="/" state={{ from: location, requireAuth: true }} replace />;
  }

  return children;
};

export default AuthGuard; 