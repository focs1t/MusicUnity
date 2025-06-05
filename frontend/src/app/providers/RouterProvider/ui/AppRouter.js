import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../../AuthProvider';
import HomePage from '../../../../pages/HomePage';
import FollowingReleasesPage from '../../../../pages/FollowingReleasesPage';
import ProfilePage from '../../../../pages/ProfilePage';
import SettingsPage from '../../../../pages/SettingsPage';

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
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/profile/reviews" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/profile/liked" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
      <Route path="/following-releases" element={<ProtectedRoute element={<FollowingReleasesPage />} />} />
      
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