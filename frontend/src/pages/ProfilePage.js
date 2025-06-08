import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/providers/AuthProvider';
import { userApi } from '../shared/api/user';
import { reviewApi } from '../shared/api/review';
import { likeApi } from '../shared/api/like';
import { releaseApi } from '../shared/api/release';
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

// Встроенный плейсхолдер в формате data URI для аватара
const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';

// Встроенный плейсхолдер в формате data URI для обложки релиза
const DEFAULT_COVER_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyMjIyMjIiLz48cGF0aCBkPSJNNzAgODBIMTMwVjEyMEg3MFY4MFoiIGZpbGw9IiM0NDQ0NDQiLz48cGF0aCBkPSJNNTAgMTUwSDE1MFYxNjBINTBWMTUwWiIgZmlsbD0iIzQ0NDQ0NCIvPjwvc3ZnPg==';

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

// Обновляю компонент карточки рецензии
const ReviewCard = ({ review, userDetails, isLiked, onLikeToggle, cachedAvatarUrl }) => {
  // Вспомогательная функция для вычисления totalScore внутри компонента
  const calculateReviewScore = (review) => {
    if (review.totalScore !== undefined && review.totalScore !== null) {
      return review.totalScore;
    }
    
    // Вычисляем по формуле как на бэкенде
    const baseScore = (review.rhymeImagery || 0) + 
                      (review.structureRhythm || 0) + 
                      (review.styleExecution || 0) + 
                      (review.individuality || 0);
    const vibeMultiplier = 1 + ((review.vibe || 0) / 10) * 1.5;
    return Math.round(baseScore * vibeMultiplier);
  };

  // Используем кешированный URL аватара или резервное значение
  const getAvatarUrl = () => {
    if (cachedAvatarUrl) {
      return cachedAvatarUrl;
    }
    return userDetails?.avatarUrl ? userDetails.avatarUrl : DEFAULT_AVATAR_PLACEHOLDER;
  };

  // Функция для обработки ошибок изображений
  const handleReviewImageError = (e, context = 'изображения') => {
    console.log(`Ошибка загрузки ${context}, использую встроенный placeholder`);
    console.log(`Проблемный URL: ${e.target.src}`);
    
    // Прекращаем обработку ошибок для этого элемента
    e.target.onerror = null;
    
    // Используем встроенный placeholder
    e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
  };
  
  // Функция для обработки ошибок изображений релизов
  const handleReviewReleaseImageError = (e) => {
    console.log('Ошибка загрузки обложки релиза в рецензии, использую встроенный placeholder');
    console.log(`Проблемный URL: ${e.target.src}`);
    
    // Прекращаем обработку ошибок для этого элемента
    e.target.onerror = null;
    
    // Используем встроенный placeholder
    e.target.src = DEFAULT_COVER_PLACEHOLDER;
  };

  console.log('Данные пользователя в ReviewCard:', userDetails);
  console.log('Данные релиза в ReviewCard:', review.release);

  // Получение имени пользователя с учетом разных форматов данных
  const getUserName = () => {
    if (!userDetails) return "Пользователь";
    
    // Проверяем разные возможные поля с именем пользователя
    if (userDetails.username) return userDetails.username;
    if (userDetails.name) return userDetails.name;
    if (userDetails.displayName) return userDetails.displayName;
    
    return "Пользователь";
  };
  
  // Проверка, является ли текущий пользователь автором рецензии
  const getCurrentUserId = () => {
    try {
      // Проверяем разные возможные источники данных пользователя
      const userDataStr = localStorage.getItem('userData');
      const authTokenStr = localStorage.getItem('authToken');
      const userInfoStr = localStorage.getItem('userInfo');
      
      console.log('ReviewCard - Данные авторизации в localStorage:', {
        userData: userDataStr ? 'present' : 'absent',
        authToken: authTokenStr ? 'present' : 'absent',
        userInfo: userInfoStr ? 'present' : 'absent'
      });
      
      // Пробуем извлечь ID из userData
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        console.log('userData parse result:', userData);
        if (userData && (userData.id || userData.userId)) {
          return userData.id || userData.userId;
        }
      }
      
      // Пробуем извлечь ID из userInfo, если userData не сработал
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        console.log('userInfo parse result:', userInfo);
        if (userInfo && (userInfo.id || userInfo.userId)) {
          return userInfo.id || userInfo.userId;
        }
      }
      
      // Если ничего не нашли, проверяем window.user для браузерного окружения
      if (window.user && (window.user.id || window.user.userId)) {
        return window.user.id || window.user.userId;
      }
      
      console.warn('Не удалось получить ID пользователя из localStorage');
      return 0;
    } catch (error) {
      console.error('Ошибка при получении ID пользователя:', error);
      return 0;
    }
  };
  
  const currentUserId = getCurrentUserId();
  console.log(`ProfilePage ReviewCard: рецензия ID ${review.reviewId}, автор ID ${review.userId}, текущий пользователь ID ${currentUserId}`);
  const isOwnReview = review.userId === currentUserId;

  // Проверяем данные релиза и логируем подробности
  useEffect(() => {
    if (!review.release) {
      console.warn(`ReviewCard: Отсутствуют данные релиза для рецензии ID ${review.reviewId}`);
      if (review.releaseId) {
        console.warn(`ReviewCard: Известен ID релиза: ${review.releaseId}, но нет полных данных релиза`);
      }
    } else if (!review.release.coverUrl) {
      console.warn(`ReviewCard: Отсутствует URL обложки для релиза рецензии ID ${review.reviewId}`);
      console.warn(`ReviewCard: Данные релиза:`, JSON.stringify(review.release, null, 2));
    }
  }, [review]);

  // Безопасное получение URL обложки релиза
  const getReleaseCoverUrl = () => {
    if (!review || !review.release) {
      return '/default-cover.avif';
    }
    return review.release.coverUrl ? review.release.coverUrl : '/default-cover.avif';
  };
  
  // Безопасное получение ID релиза
  const getReleaseId = () => {
    if (!review || !review.release) {
      return review.releaseId || 0; // Пытаемся использовать ID из самой рецензии, если есть
    }
    return review.release.releaseId || 0;
  };
  
  // Безопасное получение заголовка релиза
  const getReleaseTitle = () => {
    if (!review || !review.release) {
      return "Релиз";
    }
    return review.release.title || "Релиз";
  };

  return (
    <div className="review-card">
      <div className="relative">
        <div className="bg-zinc-950/70 px-2 lg:px-2 py-2 rounded-[12px] flex gap-3">
          <div className="flex items-start space-x-2 lg:space-x-3 w-full">
            <Link to={`/profile/${review.userId}`} className="relative">
              <img 
                alt={getUserName()} 
                loading="lazy" 
                width="40" 
                height="40" 
                className="shrink-0 size-[40px] lg:size-[40px] border border-white/10 rounded-full"
                src={getAvatarUrl()} 
                onError={(e) => handleReviewImageError(e, 'аватара')}
              />
            </Link>
            
            <div className="flex flex-col gap-1 items-start">
              <div className="flex items-center gap-1 md:gap-2 max-sm:flex-wrap">
                <Link to={`/profile/${review.userId}`} className="text-base lg:text-xl font-semibold leading-[18px] block items-center max-w-[170px] text-ellipsis whitespace-nowrap overflow-hidden text-white no-underline">
                  {getUserName()}
                </Link>
              </div>
              <div className="text-[12px] flex items-center space-x-1.5">
                {(userDetails?.rank || (review.user && review.user.rank)) && (
                  <div className="inline-flex items-center text-center bg-red-500 rounded-full font-semibold px-1.5">
                    ТОП-{userDetails?.rank || review.user?.rank}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 lg:gap-4">
            <div className="text-right flex flex-col h-full justify-center">
              <div className="text-[20px] lg:text-[24px] font-bold leading-[100%] lg:mt-1 !no-underline border-0 no-callout select-none text-right">
                <span className="no-callout">{calculateReviewScore(review)}</span>
              </div>
              <div className="flex gap-x-1.5 font-bold text-xs lg:text-sm justify-end">
                <div className="no-callout text-userColor" data-state="closed">{review.rhymeImagery || 0}</div>
                <div className="no-callout text-userColor" data-state="closed">{review.structureRhythm || 0}</div>
                <div className="no-callout text-userColor" data-state="closed">{review.styleExecution || 0}</div>
                <div className="no-callout text-userColor" data-state="closed">{review.individuality || 0}</div>
                <div className="no-callout text-ratingVibe" data-state="closed">{review.vibe || 0}</div>
              </div>
            </div>
            
            <Link to={`/releases/${getReleaseId()}`} className="shrink-0 size-10 lg:size-10 block" data-state="closed">
              <img 
                alt={getReleaseTitle()} 
                loading="lazy" 
                width="40" 
                height="40" 
                className="rounded-md w-full h-full object-cover"
                src={getReleaseCoverUrl()} 
                onError={(e) => handleReviewReleaseImageError(e)}
              />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="review-content-preview">
        <div className="review-title">
          {review.title || `Рецензия на ${getReleaseTitle()}`}
        </div>
        {review.content && (
          <div className="review-text">
            {review.content.substring(0, 150)}...
          </div>
        )}
      </div>
      
      <div className="review-footer">
        <div className="review-actions">
          <button 
            className={`review-like-button justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border group bg-white/5 max-lg:h-8 cursor-pointer flex items-center rounded-full gap-x-1 lg:gap-x-1.5 ${isOwnReview ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !isOwnReview && onLikeToggle(review.reviewId)}
            disabled={isOwnReview}
          >
            <div className="w-6 h-6 lg:w-6 lg:h-6 flex items-center justify-center">
              {isLiked ? 
                <FavoriteIcon style={{ color: '#FF5252', fontSize: '22px' }} /> : 
                <FavoriteBorderIcon style={{ color: '#AAAAAA', fontSize: '22px' }} />
              }
            </div>
            <span className="font-bold text-base lg:text-base">{review.likesCount !== undefined ? review.likesCount : 0}</span>
          </button>
        </div>
        
        <div className="review-links">
          <Link to={`/reviews/${review.reviewId}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground size-8 md:size-10 bg-transparent hover:bg-white/10">
            <svg viewBox="0 0 15 15" className="size-6 text-zinc-400 stroke-white fill-zinc-400">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения рецензии с проверкой данных релиза
const EnhancedReviewCard = ({ review, userDetails, isLiked, onLikeToggle, cachedAvatarUrl }) => {
  const [enhancedReview, setEnhancedReview] = useState(review);
  const [userRank, setUserRank] = useState(null);
  
  // Логирование входных данных
  useEffect(() => {
    console.log(`EnhancedReviewCard: Рецензия ID ${review.reviewId}`);
    console.log(`EnhancedReviewCard: Данные пользователя:`, JSON.stringify(userDetails, null, 2));
  }, [review, userDetails]);
  
  // Эффект для получения ранга пользователя
  useEffect(() => {
    const fetchUserRank = async () => {
      try {
        // Определяем ID пользователя для получения ранга
        const userId = review.id || review.userId || (review.user && (review.user.id || review.user.userId)) || (userDetails && (userDetails.id || userDetails.userId));
        
        if (userId) {
          console.log(`EnhancedReviewCard: Запрашиваем ранг для пользователя ID ${userId}`);
          const rankData = await userApi.getUserRank(userId);
          console.log(`EnhancedReviewCard: Получены данные о ранге:`, rankData);
          
          if (rankData && rankData.isInTop100) {
            setUserRank(rankData.rank);
          }
        }
      } catch (error) {
        console.error(`EnhancedReviewCard: Ошибка при получении ранга пользователя:`, error);
      }
    };
    
    fetchUserRank();
  }, [review, userDetails]);
  
  // Эффект для проверки и загрузки данных релиза, если они отсутствуют
  useEffect(() => {
    const loadReleaseData = async () => {
      let releaseId = review.releaseId;
      let currentRelease = review.release;
      
      // Если у рецензии есть ID релиза, но нет полных данных о релизе, или данные неполные
      if (releaseId && (!currentRelease || !currentRelease.coverUrl)) {
        console.log(`EnhancedReviewCard: Загружаем данные релиза по ID ${releaseId} для рецензии ID ${review.reviewId}`);
        try {
          // Делаем запрос к API релизов для получения полных данных
          const releaseData = await releaseApi.getReleaseById(releaseId);
          console.log(`EnhancedReviewCard: Полученные данные релиза для рецензии ID ${review.reviewId}:`, releaseData);
          
          if (releaseData) {
            setEnhancedReview(prev => ({
              ...prev,
              release: releaseData
            }));
          }
        } catch (releaseError) {
          console.error(`EnhancedReviewCard: Не удалось загрузить данные релиза для рецензии ID ${review.reviewId}:`, releaseError);
        }
      }
    };
    
    loadReleaseData();
  }, [review]);
  
  // Подготавливаем улучшенные данные пользователя
  const enhancedUserDetails = useMemo(() => {
    if (!userDetails) {
      // Если нет данных пользователя в пропсах, используем данные из рецензии
      if (review.user) {
        return {
          ...review.user,
          rank: userRank || review.user.rank
        };
      }
      return null;
    }
    
    // Добавляем ранг к данным пользователя
    return {
      ...userDetails,
      rank: userRank || userDetails.rank
    };
  }, [userDetails, review.user, userRank]);
  
  // Подготавливаем улучшенные данные рецензии
  const fullEnhancedReview = useMemo(() => {
    let updatedReview = { ...enhancedReview };
    
    // Добавляем или обновляем информацию о пользователе в рецензии
    if (updatedReview.user) {
      updatedReview.user = {
        ...updatedReview.user,
        rank: userRank || updatedReview.user.rank
      };
    } else if (enhancedUserDetails) {
      updatedReview.user = enhancedUserDetails;
    }
    
    return updatedReview;
  }, [enhancedReview, enhancedUserDetails, userRank]);
  
  // Проверяем, является ли это собственная рецензия текущего пользователя
  const currentUserData = useMemo(() => {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        return JSON.parse(userDataStr);
      }
    } catch (error) {
      console.error('EnhancedReviewCard: Ошибка при получении данных пользователя:', error);
    }
    return null;
  }, []);
  
  const isCurrentUserReview = currentUserData && 
    (fullEnhancedReview.userId === currentUserData.id || 
     fullEnhancedReview.userId === currentUserData.userId);
  
  return (
    <ReviewCard 
      review={fullEnhancedReview}
      userDetails={enhancedUserDetails}
      isLiked={isLiked}
      onLikeToggle={onLikeToggle}
      cachedAvatarUrl={cachedAvatarUrl}
    />
  );
};

// Отладочный компонент для проверки данных
const DebugInfo = ({ isVisible, data }) => {
  if (!isVisible) return null;
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 1000,
      fontSize: '12px'
    }}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Для хранения ранга пользователя
  const [userRank, setUserRank] = useState({
    rank: null,
    points: 0,
    isInTop100: false
  });
  
  // Для кеширования URL аватара
  const [avatarUrl, setAvatarUrl] = useState(() => {
    // Пытаемся получить аватар из localStorage для синхронизации с Header
    return localStorage.getItem('user_avatar_url') || null;
  });
  const [authorAvatarUrls, setAuthorAvatarUrls] = useState({});
  const [reviewAuthorAvatarUrls, setReviewAuthorAvatarUrls] = useState({});
  
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
  const [processedReleases, setProcessedReleases] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [likedReviews, setLikedReviews] = useState([]);
  const [likedReviewIds, setLikedReviewIds] = useState([]);
  
  // Группировка релизов по типам
  const [albumReleases, setAlbumReleases] = useState([]);
  const [singleReleases, setSingleReleases] = useState([]);
  const [epReleases, setEpReleases] = useState([]);
  const [mixtapeReleases, setMixtapeReleases] = useState([]);
  const [compilationReleases, setCompilationReleases] = useState([]);
  const [otherReleases, setOtherReleases] = useState([]);
  
  // Состояние для отладки
  const [showDebug, setShowDebug] = useState(false);
  const [debugData, setDebugData] = useState({});
  
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
        
        console.log('Получены данные пользователя:', userData);
        setUserDetails(userData);
        
        // Сохраняем URL аватара в кеш при первой загрузке
        if (userData?.avatarUrl) {
          setAvatarUrl(userData.avatarUrl);
          // Сохраняем в localStorage для синхронизации с Header
          localStorage.setItem('user_avatar_url', userData.avatarUrl);
        }
        
        // Получение ранга пользователя
        try {
          if (userData && userData.userId) {
            const rankData = await userApi.getUserRank(userData.userId);
            console.log('Получены данные о ранге пользователя:', rankData);
            setUserRank(rankData);
          }
        } catch (rankError) {
          console.error('Ошибка при получении ранга пользователя:', rankError);
        }
        
        // Получение статистики
        const [
          receivedLikes,
          givenLikes,
          authorLikes,
          reviewsCount,
          followedAuthorsData,
          favoritesData,
          likedReviewsData
        ] = await Promise.all([
          likeApi.getReceivedLikesCountByUser(userData.userId),
          likeApi.getGivenLikesCountByUser(userData.userId),
          likeApi.getReceivedAuthorLikesCountByUser(userData.userId),
          reviewApi.getReviewsCountByUser(userData.userId),
          userApi.getUserFollowedAuthors(userData.userId, 0, 5),
          userApi.getUserFavorites(userData.userId, 0, 5),
          likeApi.getLikedReviewsByUser(userData.userId, 0, 100)
        ]);
        
        // Получаем список ID рецензий, которые пользователь лайкнул
        if (likedReviewsData && likedReviewsData.content) {
          const reviewIds = likedReviewsData.content.map(review => review.reviewId);
          setLikedReviewIds(reviewIds);
        }
        
        // Обновление статистики
        setStats({
          receivedLikes,
          givenLikes,
          receivedAuthorLikes: authorLikes,
          totalReviews: reviewsCount,
          followedAuthors: followedAuthorsData.totalElements || 0,
          favorites: favoritesData.totalElements || 0
        });
        
        // Детальное логирование данных
        console.log('Авторы (оригинальные данные):', followedAuthorsData);
        console.log('Релизы (оригинальные данные):', favoritesData);
        
        // Обработка и нормализация данных авторов
        let processedAuthors = [];
        let newAuthorAvatarUrls = {};
        
        if (followedAuthorsData && followedAuthorsData.content) {
          processedAuthors = followedAuthorsData.content.map(author => {
            console.log('Обрабатываем автора:', author);
            
            // Сохраняем URL аватара автора в кеш
            if (author.authorId && author.avatarUrl) {
              // Обрабатываем URL аватара перед сохранением
              try {
                // Пытаемся декодировать URL, если он содержит закодированные символы
                let processedUrl = safeDecodeUrl(author.avatarUrl);
                
                // Проверяем является ли строка URL валидным URL
                new URL(processedUrl);
                
                // Обрезаем URL, если он содержит параметры запроса
                if (processedUrl.includes('?')) {
                  processedUrl = processedUrl.split('?')[0];
                  console.log(`URL аватара для автора ${author.name} слишком длинный, используем базовый URL:`, processedUrl);
                }
                
                newAuthorAvatarUrls[author.authorId] = processedUrl;
              } catch (e) {
                console.error(`Некорректный URL аватара для автора ${author.name || author.authorId}:`, author.avatarUrl);
                newAuthorAvatarUrls[author.authorId] = DEFAULT_AVATAR_PLACEHOLDER;
              }
            }
            
            // Проверяем, что автор имеет все необходимые поля
            return {
              authorId: author.authorId || 0,
              name: author.name || author.authorName || "Неизвестный автор",
              avatarUrl: author.avatarUrl || null,
              isArtist: author.isArtist || false,
              isProducer: author.isProducer || false
            };
          });
          
          // Обновляем кеш URL аватаров авторов
          setAuthorAvatarUrls(prev => ({...prev, ...newAuthorAvatarUrls}));
        }
        
        // Обработка и нормализация данных релизов
        let processedReleasesData = [];
        if (favoritesData && favoritesData.content) {
          processedReleasesData = favoritesData.content.map(release => {
            console.log('Обрабатываем релиз:', release);
            
            // Определяем тип релиза, учитывая разные форматы данных
            let releaseType = 'UNKNOWN';
            if (release.releaseType) {
              releaseType = release.releaseType;
            } else if (release.type) {
              releaseType = release.type;
            } else if (typeof release.isSingle !== 'undefined') {
              releaseType = release.isSingle ? 'SINGLE' : 'ALBUM';
            }
            
            // Нормализуем тип релиза к верхнему регистру для единообразия
            releaseType = typeof releaseType === 'string' ? releaseType.toUpperCase() : 'UNKNOWN';
            
            console.log(`Определен тип релиза "${release.title}": ${releaseType}`);
            
            // Проверяем, что релиз имеет все необходимые поля
            return {
              releaseId: release.releaseId || 0,
              title: release.title || "Неизвестный релиз",
              coverUrl: release.coverUrl || null,
              releaseDate: release.releaseDate || null,
              authors: release.authors || [],
              releaseType: releaseType
            };
          });
        }
        
        console.log('Авторы (обработанные):', processedAuthors);
        console.log('Релизы (обработанные):', processedReleasesData);
        
        // Дополнительно группируем релизы по типам
        const albums = processedReleasesData.filter(r => r.releaseType === 'ALBUM');
        const singlesAndEps = processedReleasesData.filter(r => r.releaseType === 'SINGLE' || r.releaseType === 'EP');
        const unknownReleases = processedReleasesData.filter(r => 
          !['ALBUM', 'SINGLE', 'EP'].includes(r.releaseType)
        );
        
        console.log('Разбивка релизов по типам:');
        console.log('Альбомы:', albums.length);
        console.log('Синглы и EP:', singlesAndEps.length);
        console.log('Неизвестные:', unknownReleases.length);
        
        setFollowedAuthors(processedAuthors);
        setFavoriteReleases(favoritesData.content || []);
        setProcessedReleases(processedReleasesData);
        setAlbumReleases(albums);
        setSingleReleases(singlesAndEps);
        setEpReleases([]);  // Больше не используем отдельно
        setOtherReleases(unknownReleases);
        setTotalPages(Math.max(
          followedAuthorsData.totalPages || 1,
          favoritesData.totalPages || 1
        ));
        
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
          console.log('Полученные рецензии пользователя:', JSON.stringify(userReviewsData.content, null, 2));
          
          // Проверяем наличие totalScore и likesCount
          userReviewsData.content.forEach(review => {
            console.log(`Рецензия ID ${review.reviewId}: totalScore=${review.totalScore}, likesCount=${review.likesCount}`);
            // Добавляем проверку данных релиза
            if (review.release) {
              console.log(`Релиз для рецензии ID ${review.reviewId}:`, JSON.stringify(review.release, null, 2));
            } else {
              console.warn(`Релиз для рецензии ID ${review.reviewId} отсутствует!`);
            }
          });
          
          // Обновляем данные лайков для каждой рецензии и проверяем/дополняем данные релиза
          const updatedReviews = await Promise.all(
            userReviewsData.content.map(async (review) => {
              try {
                const likesCount = await likeApi.getLikesCountByReview(review.reviewId);
                
                // Проверяем и исправляем данные релиза, если они отсутствуют или неполные
                let updatedRelease = review.release;
                let releaseId = review.releaseId;
                
                // Если у рецензии есть поле releaseId, но нет полных данных о релизе, или данные неполные
                if (releaseId && (!updatedRelease || !updatedRelease.coverUrl)) {
                  console.log(`Загружаем данные релиза по ID ${releaseId} для рецензии ID ${review.reviewId}`);
                  try {
                    // Делаем запрос к API релизов для получения полных данных
                    const releaseData = await releaseApi.getReleaseById(releaseId);
                    console.log(`Полученные данные релиза для рецензии ID ${review.reviewId}:`, releaseData);
                    
                    if (releaseData) {
                      updatedRelease = releaseData;
                    }
                  } catch (releaseError) {
                    console.error(`Не удалось загрузить данные релиза для рецензии ID ${review.reviewId}:`, releaseError);
                  }
                }
                
                return { 
                  ...review, 
                  likesCount,
                  release: updatedRelease
                };
              } catch (error) {
                console.error(`Ошибка при обновлении данных для рецензии ID ${review.reviewId}:`, error);
                return review;
              }
            })
          );
          
          setUserReviews(updatedReviews);
          setTotalPages(userReviewsData.totalPages);
        } else if (tabValue === 2) {
          try {
            // Загружаем лайкнутые рецензии с бэкенда
            const userLikedReviews = await likeApi.getLikedReviewsByUser(userDetails.userId, page - 1, 5);
            console.log('Полученные лайкнутые рецензии:', JSON.stringify(userLikedReviews.content, null, 2));
            
            // Кеширование аватаров авторов рецензий
            let newReviewAuthorAvatarUrls = {...reviewAuthorAvatarUrls};
            
            // Проверяем наличие totalScore и likesCount
            if (userLikedReviews.content && userLikedReviews.content.length > 0) {
              userLikedReviews.content.forEach(review => {
                console.log(`Лайкнутая рецензия ID ${review.reviewId}: totalScore=${review.totalScore}, likesCount=${review.likesCount}`);
                
                // Детальный вывод данных пользователя для отладки
                console.log(`Данные пользователя для рецензии ID ${review.reviewId}:`, JSON.stringify(review.user, null, 2));
                
                // Кешируем аватар автора рецензии, если он есть
                if (review.user && review.user.userId && review.user.avatarUrl) {
                  newReviewAuthorAvatarUrls[review.user.userId] = review.user.avatarUrl;
                }
                
                // Добавляем проверку данных релиза
                if (review.release) {
                  console.log(`Релиз для лайкнутой рецензии ID ${review.reviewId}:`, JSON.stringify(review.release, null, 2));
                } else {
                  console.warn(`Релиз для лайкнутой рецензии ID ${review.reviewId} отсутствует!`);
                }
              });
              
              // Обновляем кеш аватаров авторов рецензий
              setReviewAuthorAvatarUrls(newReviewAuthorAvatarUrls);
              
              // Обновляем данные лайков для каждой рецензии и проверяем данные релиза
              const updatedLikedReviews = await Promise.all(
                userLikedReviews.content.map(async (review) => {
                  try {
                    const likesCount = await likeApi.getLikesCountByReview(review.reviewId);
                    
                    // Проверяем и исправляем данные релиза, если они отсутствуют или неполные
                    let updatedRelease = review.release;
                    let releaseId = review.releaseId;
                    
                    // Проверяем и нормализуем данные пользователя
                    let updatedUser = review.user;
                    
                    // Если данные пользователя отсутствуют или неполные, используем данные из ответа API
                    if (!updatedUser || !updatedUser.username) {
                      console.log(`Дополняем данные пользователя для рецензии ID ${review.reviewId}`);
                      
                      // Попытка получить данные пользователя из API, если их нет
                      if (review.userId) {
                        try {
                          const userData = await userApi.getUserById(review.userId);
                          console.log(`Полученные данные пользователя для рецензии ID ${review.reviewId}:`, userData);
                          
                          if (userData) {
                            updatedUser = userData;
                          }
                        } catch (userError) {
                          console.error(`Не удалось загрузить данные пользователя для рецензии ID ${review.reviewId}:`, userError);
                        }
                      }
                    }
                    
                    // Если у рецензии есть поле releaseId, но нет полных данных о релизе, или данные неполные
                    if (releaseId && (!updatedRelease || !updatedRelease.coverUrl)) {
                      console.log(`Загружаем данные релиза по ID ${releaseId} для лайкнутой рецензии ID ${review.reviewId}`);
                      try {
                        // Делаем запрос к API релизов для получения полных данных
                        const releaseData = await releaseApi.getReleaseById(releaseId);
                        console.log(`Полученные данные релиза для лайкнутой рецензии ID ${review.reviewId}:`, releaseData);
                        
                        if (releaseData) {
                          updatedRelease = releaseData;
                        }
                      } catch (releaseError) {
                        console.error(`Не удалось загрузить данные релиза для лайкнутой рецензии ID ${review.reviewId}:`, releaseError);
                      }
                    }
                    
                    return { 
                      ...review, 
                      likesCount,
                      release: updatedRelease,
                      user: updatedUser
                    };
                  } catch (error) {
                    console.error(`Ошибка при обновлении данных для лайкнутой рецензии ID ${review.reviewId}:`, error);
                    return review;
                  }
                })
              );
              
              setLikedReviews(updatedLikedReviews);
            } else {
              setLikedReviews([]);
            }
            
            setTotalPages(userLikedReviews.totalPages || 0);
          } catch (error) {
            console.error('Ошибка при загрузке лайкнутых рецензий:', error);
            setLikedReviews([]);
            setTotalPages(0);
          }
        } else if (tabValue === 0) {
          // Дополнительная загрузка авторов и релизов для вкладки "Предпочтения"
          try {
            console.log('Загружаем данные для вкладки Предпочтения...');
            
            // Получаем отслеживаемых авторов
            const followedAuthorsData = await userApi.getUserFollowedAuthors(userDetails.userId, 0, 10);
            console.log('Ответ сервера для авторов:', followedAuthorsData);
            
            if (followedAuthorsData && followedAuthorsData.content) {
              console.log('Количество авторов:', followedAuthorsData.content.length);
              
              // Проверяем каждого автора на наличие необходимых полей
              const validAuthors = followedAuthorsData.content.map(author => {
                console.log('Автор:', author);
                return {
                  authorId: author.authorId || 0,
                  name: author.name || author.authorName || "Неизвестный автор",
                  avatarUrl: author.avatarUrl || null,
                  isArtist: author.isArtist || false,
                  isProducer: author.isProducer || false
                };
              });
              
              console.log('Обработанные авторы:', validAuthors);
              setFollowedAuthors(validAuthors);
            }
            
            // Получаем избранные релизы
            const favoritesData = await userApi.getUserFavorites(userDetails.userId, 0, 10);
            console.log('Ответ сервера для релизов:', favoritesData);
            
            if (favoritesData && favoritesData.content) {
              console.log('Количество релизов:', favoritesData.content.length);
              
              // Проверяем каждый релиз на наличие необходимых полей
              const validReleases = favoritesData.content.map(release => {
                console.log('Релиз:', release);
                return {
                  releaseId: release.releaseId || 0,
                  title: release.title || "Неизвестный релиз",
                  coverUrl: release.coverUrl || null,
                  releaseDate: release.releaseDate || null,
                  authors: release.authors || []
                };
              });
              
              console.log('Обработанные релизы:', validReleases);
              setFavoriteReleases(validReleases);
            }
          } catch (error) {
            console.error('Ошибка при загрузке данных предпочтений:', error);
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
  
  // Проверка лайкнута ли отзыв текущим пользователем
  const isReviewLiked = (reviewId) => {
    return likedReviewIds.includes(reviewId);
  };
  
  // Получение текущего ID пользователя из localStorage
  const getCurrentUserId = () => {
    try {
      // Проверяем разные возможные источники данных пользователя
      const userDataStr = localStorage.getItem('userData');
      const authTokenStr = localStorage.getItem('authToken');
      const userInfoStr = localStorage.getItem('userInfo');
      
      console.log('ProfilePage - Данные авторизации в localStorage:', {
        userData: userDataStr ? 'present' : 'absent',
        authToken: authTokenStr ? 'present' : 'absent',
        userInfo: userInfoStr ? 'present' : 'absent'
      });
      
      // Пробуем извлечь ID из userData
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        console.log('userData parse result:', userData);
        if (userData && (userData.id || userData.userId)) {
          return userData.id || userData.userId;
        }
      }
      
      // Пробуем извлечь ID из userInfo, если userData не сработал
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        console.log('userInfo parse result:', userInfo);
        if (userInfo && (userInfo.id || userInfo.userId)) {
          return userInfo.id || userInfo.userId;
        }
      }
      
      // Если ничего не нашли, проверяем window.user для браузерного окружения
      if (window.user && (window.user.id || window.user.userId)) {
        return window.user.id || window.user.userId;
      }
      
      console.warn('Не удалось получить ID пользователя из localStorage');
      return 0;
    } catch (error) {
      console.error('Ошибка при получении ID пользователя:', error);
      return 0;
    }
  };
  
  // Функция для лайка/анлайка рецензии
  const handleLikeToggle = async (reviewId) => {
    if (!authUser) {
      // Если пользователь не авторизован, перенаправляем на страницу логина
      navigate('/login');
      return;
    }
    
    // Получаем актуальный ID пользователя
    const userId = getCurrentUserId();
    console.log('ProfilePage handleLikeToggle: userId =', userId);
    
    if (!userId) {
      console.warn('Пользователь не авторизован (не найден ID)');
      return;
    }
    
    // Проверяем, что пользователь не лайкает свою собственную рецензию
    const review = userReviews.find(r => r.reviewId === reviewId) || 
                  likedReviews.find(r => r.reviewId === reviewId);
    
    if (!review) {
      console.error(`Рецензия с ID ${reviewId} не найдена`);
      return;
    }
    
    if (review.userId === userId) {
      console.warn('Нельзя лайкать собственные рецензии');
      return;
    }
    
    try {
      if (isReviewLiked(reviewId)) {
        // Оптимистично обновляем UI перед запросом к серверу
        setLikedReviewIds(prevIds => prevIds.filter(id => id !== reviewId));
        
        // Уменьшаем счетчик лайков во всех вкладках
        setUserReviews(prevReviews => 
          prevReviews.map(r => 
            r.reviewId === reviewId 
              ? { ...r, likesCount: Math.max(0, (r.likesCount || 0) - 1) } 
              : r
          )
        );
        
        setLikedReviews(prevReviews => 
          prevReviews.map(r => 
            r.reviewId === reviewId 
              ? { ...r, likesCount: Math.max(0, (r.likesCount || 0) - 1) } 
              : r
          )
        );
        
        // Удаляем лайк в бэкенде
        await likeApi.removeLike(reviewId, userId);
        
        // Получаем актуальное количество лайков с сервера
        const updatedLikesCount = await likeApi.getLikesCountByReview(reviewId);
        
        // Обновляем точное количество лайков после получения от сервера
        setUserReviews(prevReviews => 
          prevReviews.map(r => 
            r.reviewId === reviewId 
              ? { ...r, likesCount: updatedLikesCount } 
              : r
          )
        );
        
        setLikedReviews(prevReviews => 
          prevReviews.map(r => 
            r.reviewId === reviewId 
              ? { ...r, likesCount: updatedLikesCount } 
              : r
          )
        );
      } else {
        // Оптимистично обновляем UI перед запросом к серверу
        setLikedReviewIds(prevIds => [...prevIds, reviewId]);
        
        // Увеличиваем счетчик лайков во всех вкладках
        setUserReviews(prevReviews => 
          prevReviews.map(r => 
            r.reviewId === reviewId 
              ? { ...r, likesCount: (r.likesCount || 0) + 1 } 
              : r
          )
        );
        
        setLikedReviews(prevReviews => 
          prevReviews.map(r => 
            r.reviewId === reviewId 
              ? { ...r, likesCount: (r.likesCount || 0) + 1 } 
              : r
          )
        );
        
        // Добавляем лайк в бэкенде
        await likeApi.createLike(reviewId, userId, 'REGULAR');
        
        // Получаем актуальное количество лайков с сервера
        const updatedLikesCount = await likeApi.getLikesCountByReview(reviewId);
        
        // Обновляем точное количество лайков после получения от сервера
        setUserReviews(prevReviews => 
          prevReviews.map(r => 
            r.reviewId === reviewId 
              ? { ...r, likesCount: updatedLikesCount } 
              : r
          )
        );
        
        setLikedReviews(prevReviews => 
          prevReviews.map(r => 
            r.reviewId === reviewId 
              ? { ...r, likesCount: updatedLikesCount } 
              : r
          )
        );
      }
    } catch (error) {
      console.error('Ошибка при обновлении лайка:', error);
      
      // В случае ошибки возвращаем предыдущее состояние
      try {
        // Получаем актуальные данные с сервера
        const [updatedLikesCount, userLikedReviews] = await Promise.all([
          likeApi.getLikesCountByReview(reviewId),
          likeApi.getLikedReviewsByUser(userId)
        ]);
        
        // Обновляем состояние на основе свежих данных с сервера
        const actualLikedIds = new Set(
          userLikedReviews.content
            .map(r => r.reviewId || r.id || 0)
            .filter(id => id > 0)
        );
        
        setLikedReviewIds([...actualLikedIds]);
        
        // Обновляем количество лайков в обоих списках рецензий
        setUserReviews(prevReviews => 
          prevReviews.map(r => 
            r.reviewId === reviewId 
              ? { ...r, likesCount: updatedLikesCount } 
              : r
          )
        );
        
        setLikedReviews(prevReviews => 
          prevReviews.map(r => 
            r.reviewId === reviewId 
              ? { ...r, likesCount: updatedLikesCount } 
              : r
          )
        );
      } catch (recoveryError) {
        console.error('Ошибка при восстановлении состояния:', recoveryError);
      }
    }
  };
  
  // Получение URL аватара из кеша или данных пользователя
  const getCachedAvatarUrl = () => {
    // Проверяем сначала локальное состояние
    if (avatarUrl) return avatarUrl;
    
    // Затем данные пользователя
    if (userDetails?.avatarUrl) return userDetails.avatarUrl;
    
    // Затем localStorage (на случай, если Header обновил аватар)
    const localStorageAvatar = localStorage.getItem('user_avatar_url');
    if (localStorageAvatar) return localStorageAvatar;
    
    // И наконец, возвращаем встроенный placeholder вместо локального файла
    return DEFAULT_AVATAR_PLACEHOLDER;
  };
  
  // Функция для безопасного декодирования URL
  const safeDecodeUrl = (url) => {
    if (!url) return null;
    
    try {
      // Проверяем, содержит ли URL закодированные символы
      if (url.includes('%')) {
        // Пытаемся декодировать URL
        const decodedUrl = decodeURIComponent(url);
        console.log('Декодированный URL:', decodedUrl);
        return decodedUrl;
      }
      return url;
    } catch (e) {
      console.error('Ошибка при декодировании URL:', e);
      return url;
    }
  };
  
  // Получение URL аватара автора из кеша или данных автора
  const getCachedAuthorAvatarUrl = (author) => {
    // Проверяем кеш
    if (author.authorId && authorAvatarUrls[author.authorId]) {
      return authorAvatarUrls[author.authorId];
    }
    
    // Проверяем URL в данных автора
    if (author.avatarUrl) {
      // Пытаемся декодировать URL, если он содержит закодированные символы
      let processedUrl = safeDecodeUrl(author.avatarUrl);
      
      try {
        // Проверяем является ли строка URL валидным URL
        new URL(processedUrl);
        
        // Обрезаем URL, если он содержит параметры запроса
        if (processedUrl.includes('?')) {
          processedUrl = processedUrl.split('?')[0];
          console.log(`URL аватара для автора ${author.name} слишком длинный, используем базовый URL:`, processedUrl);
        }
        
        return processedUrl;
      } catch (e) {
        console.error(`Некорректный URL аватара для автора ${author.name || author.authorId}:`, author.avatarUrl);
        return DEFAULT_AVATAR_PLACEHOLDER;
      }
    }
    
    // Если нет URL, возвращаем placeholder
    return DEFAULT_AVATAR_PLACEHOLDER;
  };
  
  // Получение URL аватара автора рецензии из кеша или данных пользователя
  const getCachedReviewAuthorAvatarUrl = (user) => {
    if (user && user.userId && reviewAuthorAvatarUrls[user.userId]) {
      return reviewAuthorAvatarUrls[user.userId];
    }
    return user?.avatarUrl ? user.avatarUrl : DEFAULT_AVATAR_PLACEHOLDER;
  };
  
  // Функция для обработки ошибок изображений авторов
  const handleAuthorImageError = (e, author) => {
    console.log(`Ошибка загрузки изображения для автора ${author?.name || 'неизвестного'}, использую встроенный placeholder`);
    console.log(`Проблемный URL: ${e.target.src}`);
    
    // Прекращаем обработку ошибок для этого элемента
    e.target.onerror = null;
    
    // Используем встроенный placeholder
    e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
    
    // Если у нас есть ID автора, обновляем кеш, чтобы избежать повторных ошибок
    if (author && author.authorId) {
      setAuthorAvatarUrls(prev => ({
        ...prev,
        [author.authorId]: DEFAULT_AVATAR_PLACEHOLDER
      }));
    }
  };

  // Обработчик для переключения отладочной информации (можно вызвать Alt+D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'd') {
        setShowDebug(prev => !prev);
        setDebugData({
          releasesData: processedReleases,
          releasesByType: {
            albums: albumReleases,
            singlesAndEps: singleReleases,
            unknown: otherReleases
          }
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processedReleases, albumReleases, singleReleases, otherReleases]);
  
  // Функция для обработки ошибок загрузки изображений профиля
  const handleProfileImageError = (e, context = 'изображения профиля') => {
    console.log(`Ошибка загрузки ${context}, использую встроенный placeholder`);
    console.log(`Проблемный URL: ${e.target.src}`);
    
    // Прекращаем обработку ошибок для этого элемента
    e.target.onerror = null;
    
    // Используем встроенный placeholder
    e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
  };
  
  // Функция для обработки ошибок изображений релизов
  const handleReleaseImageError = (e) => {
    console.log('Ошибка загрузки обложки релиза, использую встроенный placeholder');
    console.log(`Проблемный URL: ${e.target.src}`);
    
    // Прекращаем обработку ошибок для этого элемента
    e.target.onerror = null;
    
    // Используем встроенный placeholder
    e.target.src = DEFAULT_COVER_PLACEHOLDER;
  };
  
  // Функция для отображения релизов по категории
  const renderReleaseCategory = (releases, emptyMessage) => {
    if (releases.length === 0) {
      return <div className="no-items">{emptyMessage}</div>;
    }
    
    return releases.map((release) => {
      console.log('Отображение релиза:', release);
      let altText = "Релиз";
      switch(release.releaseType) {
        case 'ALBUM': altText = "Альбом"; break;
        case 'SINGLE': altText = "Сингл"; break;
        case 'EP': altText = "EP"; break;
        default: altText = "Релиз";
      }
      
      return (
        <div key={release.releaseId} className="album-item">
          <Link className="album-link" to={`/releases/${release.releaseId}`}>
            <img 
              alt={release.title || altText} 
              loading="lazy" 
              className="album-image equal-size" 
              src={release.coverUrl ? release.coverUrl : DEFAULT_COVER_PLACEHOLDER} 
              onError={(e) => handleReleaseImageError(e)}
            />
          </Link>
          <Link className="album-name text-white no-underline" to={`/releases/${release.releaseId}`}>
            {release.title || altText}
          </Link>
        </div>
      );
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
                    alt={userDetails?.username || "Пользователь"} 
                    loading="lazy" 
                    width="130" 
                    height="130" 
                    className="profile-avatar" 
                    src={getCachedAvatarUrl()}
                    onError={(e) => handleProfileImageError(e, 'аватара')}
                  />
                </div>
                <h1 className="profile-username">{userDetails?.username || "Пользователь"}</h1>
                <div className="profile-date">Дата регистрации: {formatDate(userDetails?.createdAt) || "Нет данных"}</div>
                
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
                    <div>
                      <div className="points-container">
                        <div className="points-badge">{userRank.points || 0}</div>
                        <div className="points-text">баллов сообщества</div>
                      </div>
                      <div className="rank-container">
                        {userRank.isInTop100 ? (
                          <>
                            <div className="rank-badge">ТОП {userRank.rank}</div>
                            <div className="rank-link"><Link to="/top-100" style={{color: 'white', textDecoration: 'none'}}>в ТОП-100</Link></div>
                          </>
                        ) : (
                          <div className="rank-link"><Link to="/top-100" style={{color: 'white', textDecoration: 'none'}}>Рейтинг пользователей</Link></div>
                        )}
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
                            followedAuthors.map((author) => {
                              console.log('Отображение автора:', author);
                              
                              // Валидация URL аватарки перед отображением
                              const processedAvatarUrl = getCachedAuthorAvatarUrl(author);
                              console.log(`Подготовленный URL аватарки для ${author.name}:`, processedAvatarUrl);
                              
                              return (
                                <div key={author.authorId} className="artist-item">
                                  <Link className="artist-link" to={`/authors/${author.authorId}`}>
                                    <img 
                                      alt={author.name || "Автор"} 
                                      loading="lazy" 
                                      className="artist-image equal-size" 
                                      src={processedAvatarUrl} 
                                      onError={(e) => handleAuthorImageError(e, author)}
                                    />
                                  </Link>
                                  <Link className="artist-name text-white no-underline" to={`/authors/${author.authorId}`}>
                                    {author.name || "Автор"}
                                  </Link>
                                </div>
                              );
                            })
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
                          {renderReleaseCategory(albumReleases, "Нет избранных альбомов")}
                        </div>
                      </div>
                      
                      {/* Синглы и EP */}
                      <div className="category-block">
                        <div className="category-header">
                          <Link to="/singles" className="category-title">
                            <MusicNoteIcon className="category-icon" />
                            Синглы и EP
                          </Link>
                        </div>
                        
                        <div className="items-grid">
                          {renderReleaseCategory(singleReleases, "Нет избранных синглов и EP")}
                        </div>
                      </div>
                      
                      {/* Неизвестные релизы (только если есть) */}
                      {otherReleases.length > 0 && (
                        <div className="category-block">
                          <div className="category-header">
                            <Link to="/releases" className="category-title">
                              <LibraryMusicIcon className="category-icon" />
                              Другие релизы
                            </Link>
                          </div>
                          
                          <div className="items-grid">
                            {renderReleaseCategory(otherReleases, "Нет других релизов")}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </TabPanel>
                
                {/* Рецензии и оценки */}
                <TabPanel value={tabValue} index={1}>
                  <div className="reviews-container">
                    <div className="reviews-list">
                      {userReviews && userReviews.length > 0 ? (
                        userReviews.map((review) => (
                          <EnhancedReviewCard 
                            key={review.reviewId}
                            review={review}
                            userDetails={userDetails}
                            isLiked={isReviewLiked(review.reviewId)}
                            onLikeToggle={handleLikeToggle}
                            cachedAvatarUrl={getCachedAvatarUrl()}
                          />
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
                          <EnhancedReviewCard
                            key={review.reviewId}
                            review={review}
                            userDetails={review.user}
                            isLiked={true}
                            onLikeToggle={handleLikeToggle}
                            cachedAvatarUrl={getCachedReviewAuthorAvatarUrl(review.user)}
                          />
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
      
      {/* Отладочная информация (Alt+D для отображения) */}
      <DebugInfo isVisible={showDebug} data={debugData} />
    </div>
  );
};

export default ProfilePage; 