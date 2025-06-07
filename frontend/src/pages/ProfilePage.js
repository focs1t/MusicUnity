import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/providers/AuthProvider';
import { userApi } from '../shared/api/user';
import { reviewApi } from '../shared/api/review';
import { likeApi } from '../shared/api/like';
import TelegramIcon from '@mui/icons-material/Telegram';
import VkIcon from '@mui/icons-material/Facebook'; // Используем Facebook как заменитель VK
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatIcon from '@mui/icons-material/Chat';
import './ProfilePage.css';

// Компонент для TabPanel (содержимое вкладки)
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="py-3">
          {children}
        </div>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Определение активной вкладки на основе URL
  const getTabValueFromPath = () => {
    const path = location.pathname;
    if (path.includes('/profile/reviews')) return 1;
    if (path.includes('/profile/liked')) return 2;
    return 0; // По умолчанию - Предпочтения
  };
  
  const [tabValue, setTabValue] = useState(getTabValueFromPath());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewFilter, setReviewFilter] = useState('all'); // all или author_liked
  
  // Статистика пользователя
  const [stats, setStats] = useState({
    receivedLikes: 0,
    givenLikes: 0,
    receivedAuthorLikes: 0,
    totalReviews: 0,
    followedAuthors: 0,
    favorites: 0
  });
  
  // Данные для вкладок
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [favoriteReleases, setFavoriteReleases] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [likedReviews, setLikedReviews] = useState([]);
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Получение подробных данных о пользователе
        let userData;
        if (authUser?.id) {
          userData = await userApi.getUserById(authUser.id);
        } else {
          userData = await userApi.getCurrentUser();
        }
        setUserDetails(userData);
        
        // Получение статистики
        const [
          receivedLikes,
          givenLikes,
          authorLikes,
          reviewsCount,
          followedAuthorsData,
          favoritesData
        ] = await Promise.all([
          likeApi.getReceivedLikesCountByUser(userData.userId),
          likeApi.getGivenLikesCountByUser(userData.userId),
          likeApi.getReceivedAuthorLikesCountByUser(userData.userId),
          reviewApi.getReviewsCountByUser(userData.userId),
          userApi.getUserFollowedAuthors(userData.userId, 0, 5),
          userApi.getUserFavorites(userData.userId, 0, 5)
        ]);
        
        // Обновление статистики
        setStats({
          receivedLikes,
          givenLikes,
          receivedAuthorLikes: authorLikes,
          totalReviews: reviewsCount,
          followedAuthors: followedAuthorsData.totalElements,
          favorites: favoritesData.totalElements
        });
        
        // Загрузка данных
        setFollowedAuthors(followedAuthorsData.content);
        setFavoriteReleases(favoritesData.content);
        setTotalPages(Math.max(followedAuthorsData.totalPages, favoritesData.totalPages));
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке данных пользователя:', err);
        setError('Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [authUser]);

  // Отдельный эффект для загрузки данных вкладок
  useEffect(() => {
    const fetchTabData = async () => {
      if (!userDetails) return;
      
      try {
        if (tabValue === 1) {
          // Для рецензий используем фильтр
          const userReviewsData = await reviewApi.getReviewsByUser(
            userDetails.userId, 
            page - 1, 
            5, 
            reviewFilter === 'author_liked' ? true : null
          );
          setUserReviews(userReviewsData.content);
          setTotalPages(userReviewsData.totalPages);
        } else if (tabValue === 2) {
          try {
            // Загружаем лайкнутые рецензии с бэкенда
            const userLikedReviews = await likeApi.getLikedReviewsByUser(userDetails.userId, page - 1, 5);
            setLikedReviews(userLikedReviews.content || []);
            setTotalPages(userLikedReviews.totalPages || 0);
          } catch (error) {
            console.error('Ошибка при загрузке лайкнутых рецензий:', error);
            setLikedReviews([]);
            setTotalPages(0);
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных для вкладки:', err);
      }
    };
    
    fetchTabData();
  }, [userDetails, tabValue, page, reviewFilter]);

  // Обработчик изменения вкладки
  const handleTabChange = (newValue) => {
    setPage(1); // Сбрасываем страницу при смене вкладки
    setTabValue(newValue);
    setReviewFilter('all'); // Сбрасываем фильтр рецензий при смене вкладки
    
    // Обновляем URL в соответствии с выбранной вкладкой
    if (newValue === 0) {
      navigate('/profile');
    } else if (newValue === 1) {
      navigate('/profile/reviews');
    } else if (newValue === 2) {
      navigate('/profile/liked');
    }
  };
  
  // Обработчик изменения фильтра рецензий
  const handleReviewFilterChange = (filter) => {
    setPage(1); // Сбрасываем страницу при смене фильтра
    setReviewFilter(filter);
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (value) => {
    setPage(value);
  };
  
  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="site-content">
      <main>
        <div className="container">
          <div className="grid">
            {/* Левая колонка: профиль и статистика */}
            <div className="left-column">
              {/* Профиль пользователя */}
              <div className="profile-card">
                <div className="relative">
                  <img 
                    alt="user avatar" 
                    loading="lazy" 
                    width="130" 
                    height="130" 
                    className="profile-avatar" 
                    src={userDetails?.avatarUrl || '/default-avatar.jpg'}
                  />
                </div>
                <h1 className="profile-username">{userDetails?.username}</h1>
                <div className="profile-date">Дата регистрации: {formatDate(userDetails?.createdAt)}</div>
                
                <div className="social-links">
                  {userDetails?.telegramChatId && (
                    <button className="social-button">
                      <a target="_blank" href={`https://t.me/${userDetails.telegramChatId}`} rel="noopener noreferrer">
                        <TelegramIcon />
                      </a>
                    </button>
                  )}
                  
                  {userDetails?.vkId && (
                    <button className="social-button">
                      <a target="_blank" href={`https://vk.com/${userDetails.vkId}`} rel="noopener noreferrer">
                        <VkIcon />
                      </a>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Статистика пользователя */}
              <div className="stats-card">
                <div className="relative">
                  <div className="gold-badge">
                    <img 
                      alt="user avatar" 
                      loading="lazy" 
                      width="73" 
                      height="73" 
                      src="/gold_heart_3.png"
                    />
                    <div>
                      <div className="gold-level">Золотой уровень</div>
                      <div className="points-container">
                        <div className="points-badge">24201</div>
                        <div className="points-text">баллов сообщества</div>
                      </div>
                      <div className="rank-container">
                        <div className="rank-badge">ТОП 82</div>
                        <div className="rank-link"><Link to="/top-90">в ТОП-90</Link></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="divider"></div>
                
                {/* Блок рецензий */}
                <div>
                  <div className="stats-row">
                    <div className="stats-label">
                      <ChatIcon className="stats-icon" />
                      <span className="font-semibold">Рецензий</span>
                    </div>
                    <div className="stats-value">{stats.totalReviews}</div>
                  </div>
                </div>
                
                <div className="divider"></div>
                
                {/* Блок лайков */}
                <div>
                  <div className="stats-row">
                    <div className="stats-label">
                      <FavoriteIcon className="stats-icon heart-full" />
                      <span className="font-semibold">Получено лайков</span>
                    </div>
                    <div className="stats-value">{stats.receivedLikes}</div>
                  </div>
                  
                  <div className="stats-row">
                    <div className="stats-label">
                      <FavoriteBorderIcon className="stats-icon heart-outline" />
                      <span className="font-semibold">Поставлено лайков</span>
                    </div>
                    <div className="stats-value">{stats.givenLikes}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Правая колонка: вкладки с контентом */}
            <div className="right-column">
              <div className="tabs-container">
                {/* Основные вкладки */}
                <div className="main-tabs">
                  <a 
                    className={`tab-link ${tabValue === 0 ? 'active' : ''}`}
                    onClick={() => handleTabChange(0)}
                    href="#"
                  >
                    Предпочтения
                  </a>
                  <a 
                    className={`tab-link ${tabValue === 1 ? 'active' : ''}`}
                    onClick={() => handleTabChange(1)}
                    href="#"
                  >
                    Рецензии и оценки
                  </a>
                  <a 
                    className={`tab-link ${tabValue === 2 ? 'active' : ''}`}
                    onClick={() => handleTabChange(2)}
                    href="#"
                  >
                    Понравилось
                  </a>
                </div>
                
                {/* Подвкладки для фильтрации рецензий (отображаются только на вкладке рецензий) */}
                {tabValue === 1 && (
                  <div className="sub-tabs">
                    <a 
                      className={`tab-link ${reviewFilter === 'all' ? 'active' : ''}`}
                      onClick={() => handleReviewFilterChange('all')}
                      href="#"
                    >
                      Все рецензии
                    </a>
                    <a 
                      className={`tab-link ${reviewFilter === 'author_liked' ? 'active' : ''}`}
                      onClick={() => handleReviewFilterChange('author_liked')}
                      href="#"
                    >
                      Рецензии с авторскими лайками
                    </a>
                  </div>
                )}
                
                {/* Предпочтения: отслеживаемые авторы и избранные релизы */}
                <TabPanel value={tabValue} index={0}>
                  <section className="content-section">
                    <div className="content-grid">
                      {/* Авторы (объединенные артисты и продюсеры) */}
                      <div className="category-block">
                        <div className="category-header">
                          <Link to="/authors" className="category-title">
                            <PersonIcon className="category-icon" />
                            Авторы
                          </Link>
                        </div>
                        
                        <div className="items-grid">
                          {followedAuthors.length > 0 ? (
                            followedAuthors.map((author) => (
                              <div key={author.authorId} className="artist-item">
                                <Link className="artist-link" to={`/authors/${author.authorId}`}>
                                  <img 
                                    alt={author.name} 
                                    loading="lazy" 
                                    className="artist-image" 
                                    src={author.avatarUrl || '/default-author.jpg'}
                                  />
                                </Link>
                                <Link className="artist-name" to={`/authors/${author.authorId}`}>
                                  {author.name}
                                </Link>
                              </div>
                            ))
                          ) : (
                            <div className="no-items">Нет отслеживаемых авторов</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Альбомы */}
                      <div className="category-block">
                        <div className="category-header">
                          <Link to="/albums" className="category-title">
                            <AlbumIcon className="category-icon" />
                            Альбомы
                          </Link>
                        </div>
                        
                        <div className="items-grid">
                          {favoriteReleases.length > 0 ? (
                            favoriteReleases.map((release) => (
                              <div key={release.releaseId} className="album-item">
                                <Link className="album-link" to={`/releases/${release.releaseId}`}>
                                  <img 
                                    alt={release.title} 
                                    loading="lazy" 
                                    className="album-image" 
                                    src={release.coverUrl || '/default-cover.jpg'}
                                  />
                                </Link>
                                <Link className="album-name" to={`/releases/${release.releaseId}`}>
                                  {release.title}
                                </Link>
                              </div>
                            ))
                          ) : (
                            <div className="no-items">Нет избранных альбомов</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Треки */}
                      <div className="category-block">
                        <div className="category-header">
                          <Link to="/tracks" className="category-title">
                            <MusicNoteIcon className="category-icon" />
                            Треки
                          </Link>
                        </div>
                        
                        <div className="items-grid">
                          <div className="no-items">Нет избранных треков</div>
                        </div>
                      </div>
                    </div>
                  </section>
                </TabPanel>
                
                {/* Рецензии и оценки */}
                <TabPanel value={tabValue} index={1}>
                  <div className="reviews-container">
                    <div className="reviews-list">
                      {userReviews && userReviews.length > 0 ? (
                        userReviews.map((review) => (
                          <div key={review.reviewId} className="review-card">
                            <div className="review-header">
                              <div className="review-user-info">
                                <Link to={`/profile`} className="review-user-avatar">
                                  <img 
                                    alt={userDetails.username} 
                                    src={userDetails.avatarUrl || '/default-avatar.jpg'} 
                                  />
                                  <img 
                                    alt="Уровень" 
                                    className="review-user-level" 
                                    src="/gold_heart_3.png" 
                                  />
                                </Link>
                                
                                <div className="review-user-details">
                                  <Link to={`/profile`} className="review-username">
                                    {userDetails.username}
                                  </Link>
                                  <div className="review-user-rank">
                                    <div className="review-rank-badge">ТОП-82</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="review-meta">
                                <div className="review-rating">
                                  <span className="review-rating-value">{review.rating || 0}</span>
                                </div>
                                
                                <Link to={`/releases/${review.release?.releaseId}`} className="review-album-cover">
                                  <img 
                                    alt={review.release?.title} 
                                    src={review.release?.coverUrl || '/default-cover.jpg'} 
                                  />
                                </Link>
                              </div>
                            </div>
                            
                            <div className="review-content-preview">
                              <div className="review-title">
                                {review.title || `Рецензия на ${review.release?.title}`}
                              </div>
                              {review.content && (
                                <div className="review-text">
                                  {review.content.substring(0, 150)}...
                                </div>
                              )}
                            </div>
                            
                            <div className="review-footer">
                              <div className="review-actions">
                                <button className="review-like-button">
                                  <div className="review-like-icon">
                                    <img src="/hearts/heart24.png" alt="Like" />
                                  </div>
                                  <span className="review-likes-count">{review.likesCount || 0}</span>
                                </button>
                              </div>
                              <div className="review-links">
                                <Link to={`/reviews/${review.reviewId}`} className="review-permalink">
                                  <svg viewBox="0 0 15 15" className="review-link-icon">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path>
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-reviews">
                          {reviewFilter === 'all' 
                            ? 'У вас пока нет рецензий.' 
                            : 'У вас нет рецензий с авторскими лайками.'}
                        </div>
                      )}
                    </div>
                    
                    {totalPages > 1 && (
                      <nav className="pagination">
                        <ul className="pagination-list">
                          {Array.from({ length: totalPages }, (_, i) => (
                            <li key={i + 1} className="pagination-item">
                              <a
                                className={`pagination-link ${page === i + 1 ? 'active' : ''}`}
                                onClick={() => handlePageChange(i + 1)}
                                href="#"
                              >
                                {i + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}
                  </div>
                </TabPanel>
                
                {/* Понравилось */}
                <TabPanel value={tabValue} index={2}>
                  <div className="reviews-container">
                    <div className="reviews-list">
                      {likedReviews && likedReviews.length > 0 ? (
                        likedReviews.map((review) => (
                          <div key={review.reviewId} className="review-card">
                            <div className="review-header">
                              <div className="review-user-info">
                                <Link to={`/profile/${review.user?.userId}`} className="review-user-avatar">
                                  <img 
                                    alt={review.user?.username} 
                                    src={review.user?.avatarUrl || '/default-avatar.jpg'} 
                                  />
                                </Link>
                                
                                <div className="review-user-details">
                                  <Link to={`/profile/${review.user?.userId}`} className="review-username">
                                    {review.user?.username}
                                  </Link>
                                </div>
                              </div>
                              
                              <div className="review-meta">
                                <div className="review-rating">
                                  <span className="review-rating-value">{review.rating || 0}</span>
                                </div>
                                
                                <Link to={`/releases/${review.release?.releaseId}`} className="review-album-cover">
                                  <img 
                                    alt={review.release?.title} 
                                    src={review.release?.coverUrl || '/default-cover.jpg'} 
                                  />
                                </Link>
                              </div>
                            </div>
                            
                            <div className="review-content-preview">
                              <div className="review-title">
                                {review.title || `Рецензия на ${review.release?.title}`}
                              </div>
                              {review.content && (
                                <div className="review-text">
                                  {review.content.substring(0, 150)}...
                                </div>
                              )}
                            </div>
                            
                            <div className="review-footer">
                              <div className="review-actions">
                                <button className="review-like-button active">
                                  <div className="review-like-icon">
                                    <img src="/hearts/heart24.png" alt="Like" />
                                  </div>
                                  <span className="review-likes-count">{review.likesCount || 0}</span>
                                </button>
                              </div>
                              <div className="review-links">
                                <Link to={`/reviews/${review.reviewId}`} className="review-permalink">
                                  <svg viewBox="0 0 15 15" className="review-link-icon">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path>
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-reviews">
                          У вас нет понравившихся рецензий.
                        </div>
                      )}
                    </div>
                    
                    {totalPages > 1 && (
                      <nav className="pagination">
                        <ul className="pagination-list">
                          {Array.from({ length: totalPages }, (_, i) => (
                            <li key={i + 1} className="pagination-item">
                              <a
                                className={`pagination-link ${page === i + 1 ? 'active' : ''}`}
                                onClick={() => handlePageChange(i + 1)}
                                href="#"
                              >
                                {i + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}
                  </div>
                </TabPanel>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 