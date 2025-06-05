import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../../AuthProvider';
import HomePage from '../../../../pages/HomePage';

// Компонент для публичных маршрутов
const PublicRoute = ({ element }) => {
  return element;
};

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ element }) => {
  return <AuthGuard>{element}</AuthGuard>;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<PublicRoute element={<HomePage />} />} />
      
      {/* Защищенные маршруты */}
      <Route path="/profile" element={<ProtectedRoute element={<div>Моя страница (защищена)</div>} />} />
      <Route path="/favorites" element={<ProtectedRoute element={<div>Мне понравилось (защищена)</div>} />} />
      <Route path="/settings" element={<ProtectedRoute element={<div>Настройки (защищена)</div>} />} />
      <Route path="/new-releases" element={<ProtectedRoute element={<div>Новые релизы (защищена)</div>} />} />
      
      {/* Общедоступные страницы */}
      <Route path="/releases" element={<PublicRoute element={<div>Релизы</div>} />} />
      <Route path="/authors" element={<PublicRoute element={<div>Исполнители</div>} />} />
      <Route path="/genres" element={<PublicRoute element={<div>Жанры</div>} />} />
      <Route path="/about" element={<PublicRoute element={<div>О нас</div>} />} />
      
      {/* Редирект на главную при переходе на неизвестный маршрут */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter; 