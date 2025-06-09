import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../../AuthProvider';
import HomePage from '../../../../pages/HomePage';
import FollowingReleasesPage from '../../../../pages/FollowingReleasesPage';
import ProfilePage from '../../../../pages/ProfilePage';
import SettingsPage from '../../../../pages/SettingsPage';
import Top100Page from '../../../../pages/Top100Page';
import AuthorLikesPage from '../../../../pages/AuthorLikesPage';
import ReleasesPage from '../../../../pages/ReleasesPage';
import ReleasePage from '../../../../pages/ReleasePage';
import { ROUTES } from '../../../../shared/config/routes';
import ReviewsPage from '../../../../pages/ReviewsPage';
import AuthorsPage from '../../../../pages/AuthorsPage';

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
      <Route path={ROUTES.HOME} element={<PublicRoute element={<HomePage />} />} />
      
      {/* Защищенные маршруты */}
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/profile/reviews" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/profile/liked" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/profile/:userId" element={<PublicRoute element={<ProfilePage />} />} />
      <Route path="/profile/:userId/reviews" element={<PublicRoute element={<ProfilePage />} />} />
      <Route path="/profile/:userId/liked" element={<PublicRoute element={<ProfilePage />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
      <Route path="/following-releases" element={<ProtectedRoute element={<FollowingReleasesPage />} />} />
      
      {/* Общедоступные страницы */}
      <Route path={ROUTES.RELEASES} element={<PublicRoute element={<ReleasesPage />} />} />
      <Route path={ROUTES.RELEASE} element={<PublicRoute element={<ReleasePage />} />} />
      <Route path={ROUTES.AUTHORS} element={<PublicRoute element={<AuthorsPage />} />} />
      <Route path="/genres" element={<PublicRoute element={<div>Жанры</div>} />} />
      <Route path={ROUTES.ABOUT} element={<PublicRoute element={<div>О нас</div>} />} />
      <Route path={ROUTES.TOP_100} element={<PublicRoute element={<Top100Page />} />} />
      <Route path={ROUTES.FAQ} element={<PublicRoute element={<div>Часто задаваемые вопросы</div>} />} />
      <Route path={ROUTES.RATING} element={<PublicRoute element={<div>Рейтинг</div>} />} />
      <Route path={ROUTES.AUTHOR_LIKES} element={<PublicRoute element={<AuthorLikesPage />} />} />
      <Route path={ROUTES.AUTHORS_VERIFIED} element={<PublicRoute element={<div>Зарегистрированные авторы</div>} />} />
      <Route path={ROUTES.REVIEWS} element={<PublicRoute element={<ReviewsPage />} />} />
      <Route path={ROUTES.CONTACT} element={<PublicRoute element={<div>Обратная связь</div>} />} />
      
      {/* Редирект на главную при переходе на неизвестный маршрут */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter; 