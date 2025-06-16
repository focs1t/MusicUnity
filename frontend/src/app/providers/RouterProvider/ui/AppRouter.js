import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../../AuthProvider';
import HomePage from '../../../../pages/HomePage';
import FollowingReleasesPage from '../../../../pages/FollowingReleasesPage';
import ProfilePage from '../../../../pages/ProfilePage';
import SettingsPage from '../../../../pages/SettingsPage';
import Top100Page from '../../../../pages/Top100Page';
import ReleasesPage from '../../../../pages/ReleasesPage';
import ReleasePage from '../../../../pages/ReleasePage';
import CreateReleasePage from '../../../../pages/CreateReleasePage';
import RatingPage from '../../../../pages/RatingPage';
import { ROUTES } from '../../../../shared/config/routes';
import ReviewsPage from '../../../../pages/ReviewsPage';
import ReviewPage from '../../../../pages/ReviewPage';
import AuthorLikesPage from '../../../../pages/AuthorLikesPage';
import AuthorsPage from '../../../../pages/AuthorsPage';
import AuthorPage from '../../../../pages/AuthorPage';
import VerifiedAuthorsPage from '../../../../pages/VerifiedAuthorsPage';
import ProfileAuthorsPage from '../../../../pages/ProfileAuthorsPage';
import ProfileAlbumsPage from '../../../../pages/ProfileAlbumsPage';
import ProfileSinglesPage from '../../../../pages/ProfileSinglesPage';
// Страницы для модератора
import ModeratorCreateReleasePage from '../../../../pages/ModeratorCreateReleasePage';
import ModeratorReportsPage from '../../../../pages/ModeratorReportsPage';
// Страница поиска
import SearchPage from '../../../../pages/SearchPage';
// Страницы для пользовательского соглашения и политики обработки персональных данных
import UserAgreementPage from '../../../../pages/UserAgreementPage';
import PrivacyPolicyPage from '../../../../pages/PrivacyPolicyPage';
// Новые страницы
import AboutPage from '../../../../pages/AboutPage';
import ContactPage from '../../../../pages/ContactPage';
import FAQPage from '../../../../pages/FAQPage';
import { useSelector } from 'react-redux';
import { Navigate as ReactNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

// Компонент для публичных маршрутов
const PublicRoute = ({ element }) => {
  return element;
};

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ element }) => {
  return <AuthGuard>{element}</AuthGuard>;
};

// Компонент для маршрутов, требующих роли модератора
const ModeratorRoute = ({ element }) => {
  const { user, isAuthenticated, authChecked } = useSelector(state => state.auth);
  const location = useLocation();
  const [userDetails, setUserDetails] = useState(null);

  // Загрузка полных данных пользователя
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        if (isAuthenticated && user) {
          const userApi = (await import('../../../../shared/api/user')).userApi;
          const userData = await userApi.getCurrentUser();
          console.log('ModeratorRoute: Загружены данные пользователя', userData);
          setUserDetails(userData);
        }
      } catch (error) {
        console.error('ModeratorRoute: Ошибка при получении данных пользователя', error);
      }
    };

    getUserDetails();
  }, [isAuthenticated, user]);

  // Ждем, пока не закончится проверка аутентификации
  if (!authChecked) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#09090b',
        color: 'white'
      }}>
        <CircularProgress color="inherit" size={40} />
        <Typography sx={{ mt: 2 }}>Проверка авторизации...</Typography>
      </Box>
    );
  }

  // Проверяем, авторизован ли пользователь
  if (!isAuthenticated || !user) {
    // Сохраняем текущий путь для перенаправления после авторизации
    localStorage.setItem('redirectAfterAuth', location.pathname);
    return <ReactNavigate to="/" state={{ from: location, requireAuth: true }} replace />;
  }

  // Ждем загрузки данных пользователя
  if (!userDetails) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#09090b',
        color: 'white'
      }}>
        <CircularProgress color="inherit" size={40} />
        <Typography sx={{ mt: 2 }}>Загрузка данных...</Typography>
      </Box>
    );
  }

  console.log('ModeratorRoute: проверка прав доступа', { 
    user, 
    userDetails,
    userRights: userDetails?.rights 
  });

  // Проверяем права модератора
  if (userDetails.rights !== 'MODERATOR' && userDetails.rights !== 'ADMIN') {
    console.log('ModeratorRoute: недостаточно прав для доступа к странице модератора');
    return <ReactNavigate to="/" replace />;
  }

  // Пользователь аутентифицирован и имеет права модератора
  console.log('ModeratorRoute: доступ к странице модератора разрешен');
  return element;
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
      <Route path="/profile/:userId/authors" element={<PublicRoute element={<ProfileAuthorsPage />} />} />
      <Route path="/profile/:userId/albums" element={<PublicRoute element={<ProfileAlbumsPage />} />} />
      <Route path="/profile/:userId/singles" element={<PublicRoute element={<ProfileSinglesPage />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
      <Route path="/following-releases" element={<ProtectedRoute element={<FollowingReleasesPage />} />} />
      <Route path={ROUTES.CREATE_RELEASE} element={<ProtectedRoute element={<CreateReleasePage />} />} />
      
      {/* Роуты для модератора */}
      <Route path={ROUTES.MODERATOR_CREATE_RELEASE} element={<ModeratorRoute element={<ModeratorCreateReleasePage />} />} />
      <Route path={ROUTES.MODERATOR_REPORTS} element={<ModeratorRoute element={<ModeratorReportsPage />} />} />
      
      {/* Общедоступные страницы */}
      <Route path={ROUTES.RELEASES} element={<PublicRoute element={<ReleasesPage />} />} />
      <Route path={ROUTES.RELEASE} element={<PublicRoute element={<ReleasePage />} />} />
      <Route path={ROUTES.AUTHORS} element={<PublicRoute element={<AuthorsPage />} />} />
      <Route path={ROUTES.AUTHOR} element={<PublicRoute element={<AuthorPage />} />} />
      <Route path="/genres" element={<PublicRoute element={<div>Жанры</div>} />} />
      <Route path={ROUTES.ABOUT} element={<PublicRoute element={<AboutPage />} />} />
      <Route path={ROUTES.TOP_100} element={<PublicRoute element={<Top100Page />} />} />
      <Route path={ROUTES.FAQ} element={<PublicRoute element={<FAQPage />} />} />
      <Route path={ROUTES.RATING} element={<PublicRoute element={<RatingPage />} />} />
      <Route path={ROUTES.AUTHOR_LIKES} element={<PublicRoute element={<AuthorLikesPage />} />} />
      <Route path={ROUTES.AUTHORS_VERIFIED} element={<PublicRoute element={<VerifiedAuthorsPage />} />} />
      <Route path={ROUTES.REVIEWS} element={<PublicRoute element={<ReviewsPage />} />} />
      <Route path={ROUTES.REVIEW} element={<PublicRoute element={<ReviewPage />} />} />
      <Route path={ROUTES.CONTACT} element={<PublicRoute element={<ContactPage />} />} />
      
      {/* Поиск */}
      <Route path="/search" element={<PublicRoute element={<SearchPage />} />} />
      
      {/* Маршруты для пользовательского соглашения и политики обработки персональных данных */}
      <Route path={ROUTES.USER_AGREEMENT} element={<PublicRoute element={<UserAgreementPage />} />} />
      <Route path={ROUTES.PRIVACY_POLICY} element={<PublicRoute element={<PrivacyPolicyPage />} />} />
      
      {/* Редирект на главную при переходе на неизвестный маршрут */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter; 