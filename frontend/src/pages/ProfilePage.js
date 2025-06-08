import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
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
import './ReviewsPage.css'; // Импорт CSS с анимациями для всплывающих сообщений

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
const ReviewCard = ({ review, userDetails, isLiked, onLikeToggle, cachedAvatarUrl, getCurrentUserIdFunc, getReviewLikesCount }) => {
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
  const currentUserId = getCurrentUserIdFunc(); // Используем переданную функцию
  console.log(`ProfilePage ReviewCard: рецензия ID ${review.reviewId}, автор ID ${review.userId}, текущий пользователь ID ${currentUserId}`);
  const isOwnReview = review.userId === currentUserId;
  console.log(`Является ли рецензия собственной: ${isOwnReview}`);
  
  // Состояние для отображения сообщения
  const [showMessage, setShowMessage] = useState(false);
  
  // Обработчик клика по кнопке лайка для собственной рецензии
  const handleOwnReviewLikeClick = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000); // Скрываем сообщение через 2 секунды
  };

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
      return DEFAULT_COVER_PLACEHOLDER;
    }
    return review.release.coverUrl ? review.release.coverUrl : DEFAULT_COVER_PLACEHOLDER;
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
    <div className="review-card" data-review-id={review.reviewId}>
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
            className="review-like-button justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border group bg-white/5 max-lg:h-8 cursor-pointer flex items-center rounded-full gap-x-1 lg:gap-x-1.5"
            onClick={() => isOwnReview ? handleOwnReviewLikeClick() : onLikeToggle(review.reviewId)}
            data-review-id={review.reviewId}
          >
            <div className="w-6 h-6 lg:w-6 lg:h-6 flex items-center justify-center like-icon">
              {isLiked ? 
                <FavoriteIcon style={{ color: '#FF5252', fontSize: '22px' }} /> : 
                <FavoriteBorderIcon style={{ color: '#AAAAAA', fontSize: '22px' }} />
              }
            </div>
            <span className="font-bold text-base lg:text-base like-count">
              {getReviewLikesCount(review)}
            </span>
          </button>
          
          {/* Всплывающее сообщение */}
          {showMessage && (
            <div className="tooltip-message">Нельзя лайкать свои рецензии</div>
          )}
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
const EnhancedReviewCard = ({ review, userDetails, isLiked, onLikeToggle, cachedAvatarUrl, getCurrentUserIdFunc, getReviewLikesCount }) => {
  const [enhancedReview, setEnhancedReview] = useState(review);
  const [userRank, setUserRank] = useState(null);
  
  // Отслеживаем локальное состояние лайка, чтобы обеспечить правильное отображение
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  
  // Обновляем локальное состояние при изменении входящего isLiked
  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);
  
  // Кастомный обработчик лайка, который сначала обновляет локальное состояние
  const handleLikeToggle = (reviewId) => {
    // Сразу обновляем локальное состояние
    setLocalIsLiked(!localIsLiked);
    // Вызываем родительский обработчик
    onLikeToggle(reviewId);
  };
  
  // Определяем реальный статус лайка, учитывая как стандартный isLiked, так и свойство isLikedByCurrentUser
  // которое мы добавили для рецензий при просмотре чужого профиля
  const actualIsLiked = useMemo(() => {
    // Используем локальное состояние как более приоритетное
    return localIsLiked;
  }, [localIsLiked]);
  
  // Логирование входных данных
  useEffect(() => {
    console.log(`EnhancedReviewCard: Рецензия ID ${review.reviewId}`);
    console.log(`EnhancedReviewCard: Данные пользователя:`, JSON.stringify(userDetails, null, 2));
    console.log(`EnhancedReviewCard: Статус лайка:`, actualIsLiked);
  }, [review, userDetails, actualIsLiked]);
  
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
  const currentUserId = useMemo(() => {
    // Используем переданную функцию getCurrentUserIdFunc
    return getCurrentUserIdFunc();
  }, [getCurrentUserIdFunc]);
  
  const isCurrentUserReview = fullEnhancedReview.userId === currentUserId;
  
  // Для непосредственного доступа к счетчику лайков в DOM
  const likeCountRef = useRef(null);
  
  // Эффект для обновления DOM когда изменяется количество лайков
  useEffect(() => {
    if (likeCountRef.current && review.likesCount !== undefined) {
      likeCountRef.current.textContent = review.likesCount;
    }
  }, [review.likesCount]);
  
  return (
    <ReviewCard 
      review={fullEnhancedReview}
      userDetails={enhancedUserDetails}
      isLiked={actualIsLiked}
      onLikeToggle={handleLikeToggle}
      cachedAvatarUrl={cachedAvatarUrl}
      getCurrentUserIdFunc={getCurrentUserIdFunc}
      getReviewLikesCount={getReviewLikesCount}
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
  const { userId: profileUserId } = useParams(); // Получаем userId из URL параметров
  
  // Определяем, смотрим ли мы свой профиль или чужой
  const isOwnProfile = useMemo(() => {
    // Если нет параметра userId в URL, то это свой профиль
    if (!profileUserId) return true;
    
    // Если есть параметр userId, сравниваем с текущим пользователем
    if (authUser) {
      return String(authUser.id) === String(profileUserId) || 
             String(authUser.userId) === String(profileUserId);
    }
    
    return false;
  }, [authUser, profileUserId]);
  
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
    // Учитываем как обычные пути, так и пути с userId
    if (path.includes('/reviews')) return 1;
    if (path.includes('/liked')) return 2;
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
    extendedReviews: 0,  // Новое поле для расширенных рецензий
    simpleReviews: 0,    // Новое поле для простых рецензий
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
  
  // Добавим глобальное состояние для отслеживания лайкнутых рецензий и их счетчиков
  const [likeStates, setLikeStates] = useState({});
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Получение подробных данных о пользователе
        let userData;
        if (profileUserId) {
          // Если мы смотрим профиль другого пользователя
          userData = await userApi.getUserById(profileUserId);
        } else if (authUser?.id) {
          // Если есть данные текущего пользователя
          userData = await userApi.getUserById(authUser.id);
        } else {
          // Иначе запрашиваем текущего пользователя
          userData = await userApi.getCurrentUser();
        }
        
        console.log('Получены данные пользователя:', userData);
        setUserDetails(userData);
        
        // Сбрасываем страницу и фильтры при смене пользователя
        setPage(1);
        setTabValue(getTabValueFromPath());
        setReviewFilter('all');
        
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
          extendedReviewsCount,
          simpleReviewsCount,
          followedAuthorsData,
          favoritesData,
          likedReviewsData
        ] = await Promise.all([
          likeApi.getReceivedLikesCountByUser(userData.userId),
          likeApi.getGivenLikesCountByUser(userData.userId),
          likeApi.getReceivedAuthorLikesCountByUser(userData.userId),
          reviewApi.getReviewsCountByUser(userData.userId),
          reviewApi.getExtendedReviewsCountByUser(userData.userId),
          reviewApi.getSimpleReviewsCountByUser(userData.userId),
          userApi.getUserFollowedAuthors(userData.userId, 0, 5),
          userApi.getUserFavorites(userData.userId, 0, 5),
          likeApi.getLikedReviewsByUser(userData.userId, 0, 100)
        ]);
        
        // Обновление статистики
        setStats({
          receivedLikes,
          givenLikes,
          receivedAuthorLikes: authorLikes,
          totalReviews: reviewsCount,
          extendedReviews: extendedReviewsCount,
          simpleReviews: simpleReviewsCount,
          followedAuthors: followedAuthorsData.totalElements || 0,
          favorites: favoritesData.totalElements || 0
        });
        
        // Получаем список ID рецензий, которые пользователь лайкнул
        if (likedReviewsData && likedReviewsData.content) {
          const reviewIds = likedReviewsData.content.map(review => review.reviewId || review.id);
          console.log('Получены ID лайкнутых рецензий:', reviewIds);
          setLikedReviewIds(reviewIds.filter(id => id)); // Отфильтровываем undefined и null
          
          // Загружаем также полные данные о лайкнутых рецензиях для вкладки "Понравилось"
          if (likedReviewsData.content.length > 0) {
            const updatedLikedReviews = await Promise.all(
              likedReviewsData.content.slice(0, 5).map(async (review) => {
                try {
                  const likesCount = await likeApi.getLikesCountByReview(review.reviewId);
                  
                  // Проверяем и дополняем данные пользователя, если они отсутствуют или неполные
                  let updatedUser = review.user;
                  if (!updatedUser || !updatedUser.username) {
                    if (review.userId) {
                      try {
                        const userData = await userApi.getUserById(review.userId);
                        if (userData) {
                          updatedUser = userData;
                        }
                      } catch (userError) {
                        console.error(`Не удалось загрузить данные пользователя для рецензии ID ${review.reviewId}:`, userError);
                      }
                    }
                  }
                  
                  // Проверяем и дополняем данные релиза, если они отсутствуют или неполные
                  let updatedRelease = review.release;
                  if (!updatedRelease || !updatedRelease.coverUrl) {
                    if (review.releaseId) {
                      try {
                        const releaseData = await releaseApi.getReleaseById(review.releaseId);
                        if (releaseData) {
                          updatedRelease = releaseData;
                        }
                      } catch (releaseError) {
                        console.error(`Не удалось загрузить данные релиза для рецензии ID ${review.reviewId}:`, releaseError);
                      }
                    }
                  }
                  
                  return {
                    ...review,
                    likesCount,
                    user: updatedUser,
                    release: updatedRelease
                  };
                } catch (error) {
                  console.error(`Ошибка при обновлении данных для лайкнутой рецензии ID ${review.reviewId}:`, error);
                  return review;
                }
              })
            );
            
            setLikedReviews(updatedLikedReviews);
          }
        } else {
          setLikedReviewIds([]);
          setLikedReviews([]);
        }
        
        // Второй вызов setStats удален, чтобы не перезаписывать значения полей extendedReviews и simpleReviews
        
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
        
        // Всегда получаем лайкнутые рецензии текущего пользователя для отображения статуса лайков
        // даже когда просматриваем чужой профиль
        try {
          // Определяем ID текущего пользователя
          const currentUserId = getCurrentUserId();
          if (currentUserId) {
            const currentUserLikedReviews = await likeApi.getLikedReviewsByUser(currentUserId, 0, 100);
            if (currentUserLikedReviews && currentUserLikedReviews.content) {
              const likedIds = currentUserLikedReviews.content
                .map(review => review.reviewId || review.id)
                .filter(id => id);
                
              console.log('Лайкнутые рецензии текущего пользователя:', likedIds);
              setLikedReviewIds(likedIds);
            }
          }
        } catch (likedError) {
          console.error('Ошибка при получении лайкнутых рецензий текущего пользователя:', likedError);
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных пользователя:', err);
        setError('Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [authUser, profileUserId, location.pathname]); // Добавляем location.pathname для обновления при изменении пути
  
  // Отдельный эффект для загрузки данных вкладок
  useEffect(() => {
    const fetchTabData = async () => {
      if (!userDetails) return;
      
      try {
        if (tabValue === 1) {
          // Для рецензий используем фильтр только если это собственный профиль
          // Для чужого профиля всегда показываем все рецензии
          const userReviewsData = await reviewApi.getReviewsByUser(
            userDetails.userId, 
            page - 1, 
            5, 
            isOwnProfile && reviewFilter === 'author_liked' ? true : null
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
                
                // Для чужого профиля проверяем, лайкнул ли текущий пользователь эту рецензию
                let isLikedByCurrentUser = false;
                if (!isOwnProfile) {
                  isLikedByCurrentUser = likedReviewIds.includes(review.reviewId);
                  console.log(`Рецензия ${review.reviewId} лайкнута текущим пользователем: ${isLikedByCurrentUser}`);
                }
                
                return { 
                  ...review, 
                  likesCount,
                  release: updatedRelease,
                  isLikedByCurrentUser
                };
              } catch (error) {
                console.error(`Ошибка при обновлении данных для рецензии ID ${review.reviewId}:`, error);
                return review;
              }
            })
          );
          
          setUserReviews(updatedReviews);
          setTotalPages(userReviewsData.totalPages || 1);
        } else if (tabValue === 2) {
          try {
            // Загружаем лайкнутые рецензии с бэкенда
            // Для чужого профиля некоторые данные могут быть недоступны
            let userLikedReviews;
            
            try {
              userLikedReviews = await likeApi.getLikedReviewsByUser(userDetails.userId, page - 1, 5);
            } catch (apiError) {
              console.error('Ошибка при загрузке лайкнутых рецензий:', apiError);
              // В случае ошибки, например из-за ограничений доступа, показываем пустой список
              userLikedReviews = { content: [], totalPages: 0, totalElements: 0 };
            }
            
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
                    
                    // При просмотре своего профиля или чужого профиля с лайкнутыми рецензиями
                    // всегда устанавливаем статус лайка как true
                    // При просмотре своих лайкнутых рецензий, они по определению лайкнуты текущим пользователем
                    // При просмотре чужих лайкнутых рецензий, статус лайка зависит от текущего пользователя
                    
                    // Сначала проверяем, чей профиль просматриваем
                    let isCurrentUserLiked = true; // По умолчанию считаем, что лайкнуто
                    
                    // Если смотрим чужой профиль, проверяем, лайкнул ли текущий пользователь эту рецензию
                    if (!isOwnProfile) {
                      const currentUserId = getCurrentUserId();
                      // Проверка, совпадает ли автор рецензии с текущим пользователем
                      const isCurrentUserAuthor = review.userId === currentUserId;
                      
                      if (isCurrentUserAuthor) {
                        // Если это рецензия текущего пользователя, то он не может ее лайкнуть
                        isCurrentUserLiked = false;
                      } else {
                        // Проверяем, есть ли эта рецензия в списке лайкнутых текущим пользователем
                        isCurrentUserLiked = likedReviewIds.includes(review.reviewId);
                      }
                    }
                    
                    return { 
                      ...review, 
                      likesCount,
                      release: updatedRelease,
                      user: updatedUser,
                      isLikedByCurrentUser: isCurrentUserLiked
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
            let followedAuthorsData;
            
            try {
              followedAuthorsData = await userApi.getUserFollowedAuthors(userDetails.userId, 0, 10);
            } catch (apiError) {
              console.error('Ошибка при загрузке отслеживаемых авторов:', apiError);
              // В случае ошибки, например из-за ограничений доступа, показываем пустой список
              followedAuthorsData = { content: [], totalPages: 0, totalElements: 0 };
            }
            
            // ... existing code ...
            
            // Получаем избранные релизы
            let favoritesData;
            
            try {
              favoritesData = await userApi.getUserFavorites(userDetails.userId, 0, 10);
            } catch (apiError) {
              console.error('Ошибка при загрузке избранных релизов:', apiError);
              // В случае ошибки, например из-за ограничений доступа, показываем пустой список
              favoritesData = { content: [], totalPages: 0, totalElements: 0 };
            }
            
            // ... existing code ...
          } catch (error) {
            console.error('Ошибка при загрузке данных предпочтений:', error);
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных для вкладки:', err);
      }
    };
    
    fetchTabData();
  }, [userDetails, tabValue, page, reviewFilter, isOwnProfile, likedReviewIds]); // Добавляем likedReviewIds в зависимости

  // Обработчик изменения вкладки
  const handleTabChange = (newValue) => {
    setPage(1); // Сбрасываем страницу при смене вкладки
    setTabValue(newValue);
    setReviewFilter('all'); // Сбрасываем фильтр рецензий при смене вкладки
    
    // Обновляем URL в соответствии с выбранной вкладкой
    // Учитываем, смотрим ли мы свой профиль или чужой
    if (profileUserId) {
      if (newValue === 0) {
        navigate(`/profile/${profileUserId}`);
      } else if (newValue === 1) {
        navigate(`/profile/${profileUserId}/reviews`);
      } else if (newValue === 2) {
        navigate(`/profile/${profileUserId}/liked`);
      }
    } else {
      if (newValue === 0) {
        navigate('/profile');
      } else if (newValue === 1) {
        navigate('/profile/reviews');
      } else if (newValue === 2) {
        navigate('/profile/liked');
      }
    }
  };
  
  // Обработчик изменения фильтра рецензий
  const handleReviewFilterChange = (filter) => {
    setPage(1); // Сбрасываем страницу при смене фильтра
    setReviewFilter(filter);
    
    // Принудительное обновление данных при смене фильтра
    if (userDetails) {
      fetchReviewsData(userDetails.userId, filter);
    }
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
    // Проверяем сначала глобальное состояние лайков
    if (likeStates[reviewId]) {
      return likeStates[reviewId].isLiked;
    }
    
    // Затем проверяем массив лайкнутых ID
    if (!reviewId) {
      console.warn('isReviewLiked вызван с пустым reviewId');
      return false;
    }
    
    if (!likedReviewIds || !likedReviewIds.length) {
      console.log(`Проверка лайка для рецензии ${reviewId}: нет лайкнутых рецензий`);
      return false;
    }
    
    const isLiked = likedReviewIds.includes(reviewId);
    console.log(`Проверка лайка для рецензии ${reviewId}, результат:`, isLiked);
    return isLiked;
  };
  
  // Получение текущего ID пользователя из разных источников данных
  const getCurrentUserId = () => {
    try {
      // Проверяем, есть ли кешированный ID
      const cachedUserId = localStorage.getItem('cached_user_id');
      if (cachedUserId && !isNaN(parseInt(cachedUserId, 10))) {
        console.log('Использую кешированный ID пользователя:', cachedUserId);
        return parseInt(cachedUserId, 10);
      }
      
      // Добавляем отладочную информацию обо всех ключах в localStorage
      const allKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const isJson = value && (value.startsWith('{') || value.startsWith('['));
        allKeys.push({
          key,
          hasValue: !!value,
          length: value ? value.length : 0,
          isJson,
          preview: isJson ? value.substring(0, 50) + '...' : (value ? value.substring(0, 50) + '...' : '')
        });
      }
      console.log('ProfilePage - Все ключи в localStorage:', allKeys);
      
      // Проверяем разные возможные источники данных пользователя
      const userDataStr = localStorage.getItem('userData');
      const authTokenStr = localStorage.getItem('authToken');
      const userInfoStr = localStorage.getItem('userInfo');
      const tokenStr = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('Данные авторизации в localStorage:', {
        userData: userDataStr ? 'present' : 'absent',
        authToken: authTokenStr ? 'present' : 'absent',
        userInfo: userInfoStr ? 'present' : 'absent',
        token: tokenStr ? 'present' : 'absent',
        user: userStr ? 'present' : 'absent'
      });
      
      let userId = null;
      
      // Пытаемся получить данные из всех возможных ключей
      const possibleUserKeys = ['userData', 'user', 'userInfo', 'currentUser', 'auth', 'authUser'];
      for (const key of possibleUserKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const data = JSON.parse(value);
            console.log(`Найдены данные пользователя в ключе "${key}":`, data);
            if (data && (data.id || data.userId || data.user_id)) {
              userId = data.id || data.userId || data.user_id;
              console.log(`Найден ID пользователя в ключе "${key}": ${userId}`);
              // Сохраняем в кеш
              localStorage.setItem('cached_user_id', userId);
              return userId;
            }
          } catch (parseError) {
            console.log(`Не удалось распарсить JSON из ключа "${key}":`, parseError);
          }
        }
      }
      
      // Проверяем сессионное хранилище
      const sessionUserStr = sessionStorage.getItem('user');
      if (sessionUserStr) {
        try {
          const sessionUser = JSON.parse(sessionUserStr);
          console.log('Данные пользователя из sessionStorage:', sessionUser);
          if (sessionUser && (sessionUser.id || sessionUser.userId)) {
            userId = sessionUser.id || sessionUser.userId;
            console.log(`Найден ID пользователя в sessionStorage: ${userId}`);
            // Сохраняем в кеш
            localStorage.setItem('cached_user_id', userId);
            return userId;
          }
        } catch (error) {
          console.log('Ошибка при парсинге данных из sessionStorage:', error);
        }
      }
      
      // Пробуем получить ID из кук
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (['userId', 'user_id', 'authUserId'].includes(name) && value) {
          console.log(`Найден ID пользователя в куке ${name}:`, value);
          userId = parseInt(value, 10);
          // Сохраняем в кеш
          localStorage.setItem('cached_user_id', userId);
          return userId;
        }
      }
      
      // Проверяем глобальные переменные
      if (window.user && (window.user.id || window.user.userId)) {
        userId = window.user.id || window.user.userId;
        console.log(`Найден ID пользователя в window.user: ${userId}`);
        // Сохраняем в кеш
        localStorage.setItem('cached_user_id', userId);
        return userId;
      }
      
      // Проверяем, может быть ID передается в URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlUserId = urlParams.get('userId') || urlParams.get('user_id');
      if (urlUserId) {
        console.log('ID пользователя найден в параметрах URL:', urlUserId);
        userId = parseInt(urlUserId, 10);
        // Сохраняем в кеш
        localStorage.setItem('cached_user_id', userId);
        return userId;
      }
      
      console.warn('Не удалось получить ID пользователя из доступных источников');
      
      // Для отладки: используем временный хардкодированный ID пользователя
      console.log('ВНИМАНИЕ: Возвращаем временный ID пользователя для отладки!');
      const debugUserId = 1; // Временное решение для тестирования
      // Сохраняем в кеш
      localStorage.setItem('cached_user_id', debugUserId);
      return debugUserId;
    } catch (error) {
      console.error('Ошибка при получении ID пользователя:', error);
      // Даже при ошибке возвращаем временный ID для отладки
      const debugUserId = 1;
      localStorage.setItem('cached_user_id', debugUserId);
      return debugUserId;
    }
  };
  
  // Функция для лайка/анлайка рецензии
  const handleLikeToggle = async (reviewId) => {
    // Получаем актуальный ID пользователя
    const userId = getCurrentUserId();
    console.log('ProfilePage handleLikeToggle: userId =', userId, 'reviewId =', reviewId);
    
    if (!userId || userId <= 0) {
      console.warn('Пользователь не авторизован или ID <= 0');
      return;
    }
    
    // Находим рецензию в массиве
    let review = userReviews.find(r => r.reviewId === reviewId);
    if (!review) {
      review = likedReviews.find(r => r.reviewId === reviewId);
    }
    
    if (!review) {
      console.error(`Рецензия с ID ${reviewId} не найдена`);
      return;
    }
    
    // Проверяем, что пользователь не лайкает свою собственную рецензию
    const reviewUserId = review.userId || (review.user && review.user.userId) || 0;
    console.log(`Проверяем владельца рецензии: reviewUserId=${reviewUserId}, currentUserId=${userId}`);
    
    if (reviewUserId === userId) {
      console.warn('Нельзя лайкать собственные рецензии');
      return;
    }
    
    try {
      const isLiked = likedReviewIds.includes(reviewId);
      console.log(`Текущее состояние лайка для рецензии ${reviewId}: ${isLiked ? 'лайкнута' : 'не лайкнута'}`);
      
      // Мгновенно обновляем глобальное состояние лайка
      if (isLiked) {
        // Убираем лайк
        setLikedReviewIds(prev => prev.filter(id => id !== reviewId));
        
        // Обновляем счетчик лайков в глобальном состоянии
        const newCount = Math.max(0, (review.likesCount || 0) - 1);
        setLikeStates(prev => ({
          ...prev,
          [reviewId]: { isLiked: false, count: newCount }
        }));
        
        // Запрос к API на удаление лайка
        try {
          await likeApi.removeLike(reviewId, userId);
          console.log(`Лайк удален: reviewId=${reviewId}, userId=${userId}`);
          
          // Обновляем данные в состоянии приложения
          setUserReviews(prevReviews => 
            prevReviews.map(r => 
              r.reviewId === reviewId 
                ? {...r, likesCount: newCount, isLikedByCurrentUser: false} 
                : r
            )
          );
          
          setLikedReviews(prevReviews => 
            prevReviews.map(r => 
              r.reviewId === reviewId 
                ? {...r, likesCount: newCount, isLikedByCurrentUser: false} 
                : r
            )
          );
          
          // Обновляем счетчик лайков с сервера
          const serverCount = await likeApi.getLikesCountByReview(reviewId);
          if (serverCount !== newCount) {
            setLikeStates(prev => ({
              ...prev,
              [reviewId]: { ...prev[reviewId], count: serverCount }
            }));
            
            setUserReviews(prevReviews => 
              prevReviews.map(r => 
                r.reviewId === reviewId 
                  ? {...r, likesCount: serverCount, isLikedByCurrentUser: false} 
                  : r
              )
            );
            
            setLikedReviews(prevReviews => 
              prevReviews.map(r => 
                r.reviewId === reviewId 
                  ? {...r, likesCount: serverCount, isLikedByCurrentUser: false} 
                  : r
              )
            );
          }
        } catch (error) {
          console.error('Ошибка при удалении лайка:', error);
          
          // Восстанавливаем состояние при ошибке
          setLikedReviewIds(prev => [...prev, reviewId]);
          setLikeStates(prev => ({
            ...prev,
            [reviewId]: { isLiked: true, count: review.likesCount || 0 }
          }));
        }
      } else {
        // Добавляем лайк
        setLikedReviewIds(prev => [...prev, reviewId]);
        
        // Обновляем счетчик лайков в глобальном состоянии
        const newCount = (review.likesCount || 0) + 1;
        setLikeStates(prev => ({
          ...prev,
          [reviewId]: { isLiked: true, count: newCount }
        }));
        
        // Запрос к API на добавление лайка
        try {
          await likeApi.createLike(reviewId, userId, 'REGULAR');
          console.log(`Лайк добавлен: reviewId=${reviewId}, userId=${userId}`);
          
          // Обновляем данные в состоянии приложения
          setUserReviews(prevReviews => 
            prevReviews.map(r => 
              r.reviewId === reviewId 
                ? {...r, likesCount: newCount, isLikedByCurrentUser: true} 
                : r
            )
          );
          
          setLikedReviews(prevReviews => 
            prevReviews.map(r => 
              r.reviewId === reviewId 
                ? {...r, likesCount: newCount, isLikedByCurrentUser: true} 
                : r
            )
          );
          
          // Обновляем счетчик лайков с сервера
          const serverCount = await likeApi.getLikesCountByReview(reviewId);
          if (serverCount !== newCount) {
            setLikeStates(prev => ({
              ...prev,
              [reviewId]: { ...prev[reviewId], count: serverCount }
            }));
            
            setUserReviews(prevReviews => 
              prevReviews.map(r => 
                r.reviewId === reviewId 
                  ? {...r, likesCount: serverCount, isLikedByCurrentUser: true} 
                  : r
              )
            );
            
            setLikedReviews(prevReviews => 
              prevReviews.map(r => 
                r.reviewId === reviewId 
                  ? {...r, likesCount: serverCount, isLikedByCurrentUser: true} 
                  : r
              )
            );
          }
        } catch (error) {
          console.error('Ошибка при добавлении лайка:', error);
          
          // Восстанавливаем состояние при ошибке
          setLikedReviewIds(prev => prev.filter(id => id !== reviewId));
          setLikeStates(prev => ({
            ...prev,
            [reviewId]: { isLiked: false, count: review.likesCount || 0 }
          }));
        }
      }
      
      // Обновляем данные через небольшой промежуток времени
      setTimeout(() => {
        if (userDetails) {
          if (tabValue === 1) {
            fetchReviewsData(userDetails.userId, reviewFilter);
          } else if (tabValue === 2) {
            fetchLikedReviewsData(userDetails.userId);
          }
        }
      }, 300);
      
    } catch (error) {
      console.error(`Ошибка при переключении лайка для рецензии ${reviewId}:`, error);
    }
  };
  
  // Вспомогательная функция для загрузки рецензий
  const fetchReviewsData = async (userId, filter) => {
    try {
      const userReviewsData = await reviewApi.getReviewsByUser(
        userId, 
        page - 1, 
        5, 
        filter === 'author_liked' ? true : null
      );
      
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
              try {
                // Делаем запрос к API релизов для получения полных данных
                const releaseData = await releaseApi.getReleaseById(releaseId);
                
                if (releaseData) {
                  updatedRelease = releaseData;
                }
              } catch (releaseError) {
                console.error(`Не удалось загрузить данные релиза для рецензии ID ${review.reviewId}:`, releaseError);
              }
            }
            
            // Для чужого профиля проверяем, лайкнул ли текущий пользователь эту рецензию
            let isLikedByCurrentUser = false;
            if (!isOwnProfile) {
              isLikedByCurrentUser = likedReviewIds.includes(review.reviewId);
            }
            
            return { 
              ...review, 
              likesCount,
              release: updatedRelease,
              isLikedByCurrentUser
            };
          } catch (error) {
            console.error(`Ошибка при обновлении данных для рецензии ID ${review.reviewId}:`, error);
            return review;
          }
        })
      );
      
      setUserReviews(updatedReviews);
      setTotalPages(userReviewsData.totalPages || 1);
    } catch (error) {
      console.error('Ошибка при загрузке рецензий:', error);
    }
  };
  
  // Вспомогательная функция для загрузки лайкнутых рецензий
  const fetchLikedReviewsData = async (userId) => {
    try {
      let userLikedReviews;
      
      try {
        userLikedReviews = await likeApi.getLikedReviewsByUser(userId, page - 1, 5);
      } catch (apiError) {
        console.error('Ошибка при загрузке лайкнутых рецензий:', apiError);
        userLikedReviews = { content: [], totalPages: 0, totalElements: 0 };
      }
      
      if (userLikedReviews.content && userLikedReviews.content.length > 0) {
        // Обновляем данные лайков для каждой рецензии
        const updatedLikedReviews = await Promise.all(
          userLikedReviews.content.map(async (review) => {
            try {
              const likesCount = await likeApi.getLikesCountByReview(review.reviewId);
              
              // Дополняем данные релиза и пользователя
              let updatedRelease = review.release;
              let updatedUser = review.user;
              
              // Обновляем данные релиза если нужно
              if (review.releaseId && (!updatedRelease || !updatedRelease.coverUrl)) {
                try {
                  const releaseData = await releaseApi.getReleaseById(review.releaseId);
                  if (releaseData) {
                    updatedRelease = releaseData;
                  }
                } catch (error) {
                  console.error(`Не удалось загрузить данные релиза для рецензии ID ${review.reviewId}:`, error);
                }
              }
              
              // Обновляем данные пользователя если нужно
              if (!updatedUser || !updatedUser.username) {
                if (review.userId) {
                  try {
                    const userData = await userApi.getUserById(review.userId);
                    if (userData) {
                      updatedUser = userData;
                    }
                  } catch (error) {
                    console.error(`Не удалось загрузить данные пользователя для рецензии ID ${review.reviewId}:`, error);
                  }
                }
              }
              
              // Для просмотра чужого профиля проверяем статус лайка
              let isCurrentUserLiked = true; // По умолчанию для вкладки "Понравилось"
              
              if (!isOwnProfile) {
                const currentUserId = getCurrentUserId();
                const isCurrentUserAuthor = review.userId === currentUserId;
                
                if (isCurrentUserAuthor) {
                  isCurrentUserLiked = false;
                } else {
                  isCurrentUserLiked = likedReviewIds.includes(review.reviewId);
                }
              }
              
              return {
                ...review,
                likesCount,
                release: updatedRelease,
                user: updatedUser,
                isLikedByCurrentUser: isCurrentUserLiked
              };
            } catch (error) {
              console.error(`Ошибка при обновлении данных для лайкнутой рецензии ID ${review.reviewId}:`, error);
              return review;
            }
          })
        );
        
        setLikedReviews(updatedLikedReviews);
        setTotalPages(userLikedReviews.totalPages || 0);
      } else {
        setLikedReviews([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Ошибка при загрузке лайкнутых рецензий:', error);
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
  
  // JSX разметка для подвкладок рецензий
  const renderReviewSubTabs = () => {
    return (
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
    );
  };
  
  // Функция для получения актуального счетчика лайков
  const getReviewLikesCount = (review) => {
    const reviewId = review.reviewId;
    
    // Проверяем глобальное состояние лайков
    if (likeStates[reviewId] && typeof likeStates[reviewId].count === 'number') {
      return likeStates[reviewId].count;
    }
    
    // В противном случае используем значение из данных рецензии
    return review.likesCount !== undefined ? review.likesCount : 0;
  };
  
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
                      <RateReviewIcon className="stats-icon" />
                      <span className="font-semibold">Полных рецензий</span>
                    </div>
                    <div className="stats-value">{stats.extendedReviews}</div>
                  </div>
                  
                  <div className="stats-row">
                    <div className="stats-label">
                      <ChatIcon className="stats-icon" />
                      <span className="font-semibold">Простых рецензий</span>
                    </div>
                    <div className="stats-value">{stats.simpleReviews}</div>
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
                
                {/* Подвкладки для фильтрации рецензий (отображаются всегда на вкладке рецензий) */}
                {tabValue === 1 && renderReviewSubTabs()}
                
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
                            isLiked={isOwnProfile ? isReviewLiked(review.reviewId) : (review.isLikedByCurrentUser || isReviewLiked(review.reviewId))}
                            onLikeToggle={handleLikeToggle}
                            cachedAvatarUrl={getCachedAvatarUrl()}
                            getCurrentUserIdFunc={getCurrentUserId}
                            getReviewLikesCount={getReviewLikesCount}
                          />
                        ))
                      ) : (
                        <div className="no-reviews">
                          {reviewFilter === 'all' 
                            ? (isOwnProfile ? 'У вас пока нет рецензий.' : 'У пользователя пока нет рецензий.') 
                            : (isOwnProfile ? 'У вас нет рецензий с авторскими лайками.' : 'У пользователя нет рецензий с авторскими лайками.')}
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
                            isLiked={isOwnProfile ? true : isReviewLiked(review.reviewId)}
                            onLikeToggle={handleLikeToggle}
                            cachedAvatarUrl={getCachedReviewAuthorAvatarUrl(review.user)}
                            getCurrentUserIdFunc={getCurrentUserId}
                            getReviewLikesCount={getReviewLikesCount}
                          />
                        ))
                      ) : (
                        <div className="no-reviews">
                          {isOwnProfile ? 'У вас нет понравившихся рецензий.' : 'У пользователя нет понравившихся рецензий.'}
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