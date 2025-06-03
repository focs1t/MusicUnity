import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.session);
  const location = useLocation();

  if (!isAuthenticated) {
    // Редирект на страницу входа, с сохранением первоначального маршрута
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuard; 