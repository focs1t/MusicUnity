import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { releaseApi } from '../shared/api/release';
import { reviewApi } from '../shared/api/review';
import { likeApi } from '../shared/api/like';
import { userApi } from '../shared/api/user';
import { useAuth } from '../app/providers/AuthProvider';
import { LoadingSpinner } from '../shared/ui/LoadingSpinner';
import './ReleasePage.css';
import Notification from '../components/Notification';
import LoginModal from '../widgets/AuthModal/ui/LoginModal';
import RegisterModal from '../widgets/AuthModal/ui/RegisterModal';
import ForgotPasswordModal from '../widgets/AuthModal/ui/ForgotPasswordModal';
import ReportButton from '../shared/ui/ReportButton/ReportButton';
import { ReportType } from '../entities/report/model/types';

// Получение ID текущего пользователя (как в ReviewsPage)
const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const userId = user.id || user.userId;
      console.log('getCurrentUserId: получен ID из localStorage:', userId);
      return userId;
    }
  } catch (error) {
    console.error('Ошибка парсинга данных пользователя из localStorage:', error);
  }
  
  console.log('getCurrentUserId: пользователь не найден в localStorage');
  return null;
};

// Константы для placeholder изображений (как в ReviewsPage)
const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM1NTU1NTUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjRkZGRkZGIj7QldCw0LXRgtGM0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GCINC/0LDQtdGC0LU8L3RleHQ+PC9zdmc+';
const DEFAULT_COVER_PLACEHOLDER = '/path/to/default-cover.png';

// Компонент карточки рецензии (как в ReviewsPage)
const ReviewCard = ({ review, isLiked, onLikeToggle, authorLikes = [], getReviewLikesCount }) => {
  console.log('ReviewCard получил данные:', { 
    reviewId: review.id || review.reviewId,
    likesCount: review.likesCount,
    isLiked,
    authorLikesCount: authorLikes.length,
    review
  });

  // Функция для обработки ошибок изображений
  const handleImageError = (e, placeholder) => {
    console.log('Ошибка загрузки изображения, использую placeholder');
    console.log(`Проблемный URL: ${e.target.src}`);
    
    // Предотвращаем бесконечный цикл
    if (e.target.src !== DEFAULT_AVATAR_PLACEHOLDER) {
      e.target.onerror = null;
      e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
    }
  };

  // Безопасное получение имени пользователя
  const getUserName = () => {
    if (!review.user) return "Пользователь";
    
    // Проверяем разные возможные поля с именем пользователя
    if (review.user.username) return review.user.username;
    if (review.user.name) return review.user.name;
    if (review.user.displayName) return review.user.displayName;
    
    return "Пользователь";
  };

  // Безопасное получение URL аватара
  const getAvatarUrl = () => {
    if (!review.user) return DEFAULT_AVATAR_PLACEHOLDER;
    
    // Проверяем разные возможные поля с URL аватара
    if (review.user.avatarUrl) return review.user.avatarUrl;
    if (review.user.avatar) return review.user.avatar;
    
    return DEFAULT_AVATAR_PLACEHOLDER;
  };

  // Безопасное получение ID пользователя
  const getUserId = () => {
    if (!review.user) return 0;
    return review.user.id || review.user.userId || review.userId || 0;
  };

  // Состояние для ранга пользователя
  const [userRank, setUserRank] = useState(null);

  // Загружаем ранг пользователя
  useEffect(() => {
    const fetchUserRank = async () => {
      const userId = getUserId();
      if (!userId || userId === 0) return;
      
      try {
        const rankData = await userApi.getUserRank(userId);
        console.log(`Получен ранг для пользователя ${userId}:`, rankData);
        setUserRank(rankData);
      } catch (error) {
        console.error(`Ошибка при получении ранга пользователя ${userId}:`, error);
        setUserRank(null);
      }
    };

    fetchUserRank();
  }, [review.user]);

  // Безопасное получение ранга пользователя (ТОП)
  const getUserRank = () => {
    if (!userRank || !userRank.isInTop100) return null;
    return userRank.rank;
  };

  // Безопасное получение данных рейтинга
  const getRatingData = () => {
    // Если есть прямое значение totalScore, используем его
    if (review.totalScore !== undefined && review.totalScore !== null) {
      return {
        total: review.totalScore,
        components: [
          review.rhymeImagery || 0,
          review.structureRhythm || 0, 
          review.styleExecution || 0,
          review.individuality || 0,
          review.vibe || 0
        ]
      };
    }
    
    // Если есть объект rating, используем его
    if (review.rating) {
      return {
        total: review.rating.total || 0,
        components: review.rating.components || [0, 0, 0, 0, 0]
      };
    }
    
    // Вычисляем по формуле как на бэкенде
    const rhymeImagery = review.rhymeImagery || 0;
    const structureRhythm = review.structureRhythm || 0;
    const styleExecution = review.styleExecution || 0;
    const individuality = review.individuality || 0;
    const vibe = review.vibe || 0;
    
    const baseScore = rhymeImagery + structureRhythm + styleExecution + individuality;
    const vibeMultiplier = 1 + (vibe / 10) * 1.5;
    const total = Math.round(baseScore * vibeMultiplier);
    
    return {
      total: total,
      components: [rhymeImagery, structureRhythm, styleExecution, individuality, vibe]
    };
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Получаем данные для отображения
  const user = {
    id: getUserId(),
    name: getUserName(),
    avatar: getAvatarUrl(),
    rank: getUserRank()
  };
  
  const rating = getRatingData();
  
  // Проверка, является ли текущий пользователь автором рецензии
  const currentUserId = getCurrentUserId();
  console.log(`ReviewCard: рецензия ID ${review.id || review.reviewId}, автор ID ${getUserId()}, текущий пользователь ID ${currentUserId}`);
  
  // Если у нас есть какие-то данные о пользователе, используем их для проверки
  const isOwnReview = getUserId() === currentUserId;
  console.log(`Является ли рецензия собственной: ${isOwnReview}`);
  
  // Состояние для отображения сообщения
  const [showMessage, setShowMessage] = useState(false);
  
  // Обработчик клика по кнопке лайка для собственной рецензии
  const handleOwnReviewLikeClick = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000); // Скрываем сообщение через 2 секунды
  };

  // Эффект для позиционирования hover меню
  useEffect(() => {
    const updateHoverMenuPositions = () => {
      const wrappers = document.querySelectorAll('.author-rating-wrapper');
      wrappers.forEach(wrapper => {
        const menu = wrapper.querySelector('.author-hover-menu');
        if (menu) {
          const rect = wrapper.getBoundingClientRect();
          const menuRect = menu.getBoundingClientRect();
          
          // Вычисляем позицию по центру элемента
          let left = rect.left + (rect.width / 2) - (menuRect.width / 2);
          let top = rect.bottom + 8;
          
          // Проверяем границы экрана
          if (left < 10) left = 10;
          if (left + menuRect.width > window.innerWidth - 10) {
            left = window.innerWidth - menuRect.width - 10;
          }
          if (top + menuRect.height > window.innerHeight - 10) {
            top = rect.top - menuRect.height - 8;
          }
          
          menu.style.left = `${left}px`;
          menu.style.top = `${top}px`;
        }
      });
    };

    // Функция для добавления обработчиков к элементам
    const attachHoverHandlers = () => {
      const wrappers = document.querySelectorAll('.author-rating-wrapper');
      wrappers.forEach(wrapper => {
        if (!wrapper.hasAttribute('data-hover-attached')) {
          wrapper.addEventListener('mouseenter', () => {
            setTimeout(updateHoverMenuPositions, 10);
          });
          wrapper.setAttribute('data-hover-attached', 'true');
        }
      });
    };

    // Начальное подключение обработчиков и наблюдатель за изменениями DOM
    attachHoverHandlers();
    
    const observer = new MutationObserver(() => {
      attachHoverHandlers();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener('scroll', updateHoverMenuPositions);
    window.addEventListener('resize', updateHoverMenuPositions);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateHoverMenuPositions);
      window.removeEventListener('resize', updateHoverMenuPositions);
    };
  }, []);

  // Строим карточку рецензии точно как в ReviewsPage
  return (
    <div className="bg-zinc-900 relative overflow-hidden review-wrapper p-1.5 lg:p-[5px] flex flex-col mx-auto border border-zinc-800 rounded-[15px] lg:rounded-[20px] w-full">
      {/* Верхняя часть с информацией о пользователе и рейтинге */}
      <div className="relative">
        <div className="bg-zinc-950/70 px-2 lg:px-2 py-2 rounded-[12px] flex gap-3">
          {/* Блок с аватаром и информацией о пользователе */}
          <div className="flex items-start space-x-2 lg:space-x-3 w-full">
            <a className="relative" href={`/profile/${user.id}`}>
              <img
                alt={user.name}
                src={user.avatar}
                className="shrink-0 size-[40px] lg:size-[40px] border border-white/10 rounded-full"
                loading="lazy"
                width="40"
                height="40"
                decoding="async"
                onError={(e) => handleImageError(e, DEFAULT_AVATAR_PLACEHOLDER)}
              />
            </a>
            <div className="flex flex-col gap-1 items-start">
              <div className="flex items-center gap-1 md:gap-2 max-sm:flex-wrap">
                <a
                  className="text-base lg:text-xl font-semibold leading-[18px] block items-center max-w-[170px] text-ellipsis whitespace-nowrap overflow-hidden text-white no-underline"
                  href={`/profile/${user.id}`}
                >
                  {user.name}
                </a>
              </div>
              {user.rank && (
                <div className="text-[12px] flex items-center space-x-1.5">
                  <div className="inline-flex items-center text-center bg-red-500 rounded-full font-semibold px-1.5">
                    ТОП-{user.rank}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Блок с рейтингом */}
          <div className="flex items-center justify-end">
            <div className="text-right flex flex-col h-full justify-center">
              <div className={`text-[20px] lg:text-[24px] font-bold leading-[100%] lg:mt-1 !no-underline border-0 no-callout select-none text-right ${rating.total === 100 ? 'text-golden' : ''}`}>
                <div className="author-rating-wrapper">
                  <span className="no-callout">{rating.total}</span>
                  <div className="author-hover-menu">
                    <div className="author-hover-content">
                      <div className="author-hover-title">Общая оценка рецензии</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-x-1.5 font-bold text-xs lg:text-sm justify-end">
                {rating.components.map((score, index) => {
                  const ratingTitles = [
                    'Рифма и образность',
                    'Структура и ритм', 
                    'Стиль и исполнение',
                    'Индивидуальность',
                    'Вайб'
                  ];
                  
                  return (
                    <div className="author-rating-wrapper" key={`rating-wrapper-${index}`}>
                      <div
                        key={`rating-${index}`}
                        className={`no-callout ${index === 4 ? 'text-ratingVibe' : 'text-userColor'}`}
                        data-state="closed"
                      >
                        {score}
                      </div>
                      <div className="author-hover-menu">
                        <div className="author-hover-content">
                          <div className="author-hover-title">{ratingTitles[index]}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Содержимое рецензии */}
      <div>
        <div className="relative transition-all duration-300 mb-4 px-1.5 block w-full">
          {review.title && <div className="text-base lg:text-lg mt-3 mb-2 font-semibold w-full">{review.title}</div>}
          <div className="mt-2 tracking-[-0.2px] font-light w-full">
            <div className="text-[15px] text-white lg:text-base lg:leading-[150%] w-full break-words">
              {review.content || 'Нет содержания'}
            </div>
          </div>
        </div>

        {/* Нижняя часть с лайками */}
        <div className="mt-auto flex justify-between items-center relative pr-1.5">
          <div className="flex gap-2 items-center">
            <button
              className={`review-like-button justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border group max-lg:h-8 cursor-pointer flex items-center rounded-full gap-x-1 lg:gap-x-1.5 ${isLiked ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5'}`}
              onClick={() => isOwnReview ? handleOwnReviewLikeClick() : onLikeToggle && onLikeToggle(review.id || review.reviewId)}
            >
              <div className="w-6 h-6 lg:w-6 lg:h-6 flex items-center justify-center">
                {isLiked ? (
                  <svg 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill="#FF5252"
                    stroke="none"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                ) : (
                  <svg 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="#AAAAAA" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
              </div>
              <span className={`font-bold text-base lg:text-base ${isLiked ? 'text-red-400' : ''}`}>
                {getReviewLikesCount(review)}
              </span>
            </button>
            
            {/* Авторские лайки */}
            {authorLikes.length > 0 && (
              <div className="author-likes-section ml-3">
                <div className="author-likes-avatars flex items-center gap-1">
                  {authorLikes.slice(0, 3).map((authorLike, index) => (
                    <div className="author-rating-wrapper" key={`author-like-wrapper-${index}`}>
                      <a href={`/author/${authorLike.author?.authorId || authorLike.author?.id || 0}`}>
                        <img
                          src={authorLike.author?.avatar || DEFAULT_AVATAR_PLACEHOLDER}
                          alt={authorLike.author?.username || 'Автор'}
                          className="w-6 h-6 rounded-full border border-yellow-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
                          }}
                        />
                      </a>
                      <div className="author-hover-menu">
                        <div className="author-hover-content">
                          <div className="author-hover-title">{authorLike.author?.username || 'Автор'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {authorLikes.length > 3 && (
                    <span className="text-xs text-yellow-500 ml-1">
                      +{authorLikes.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Всплывающее сообщение */}
            {showMessage && (
              <div className="tooltip-message">
                Нельзя лайкать свои рецензии
              </div>
            )}
          </div>
          

          
          <div className="flex items-center justify-between">
            <div className="review-date text-xs text-zinc-400">
              {formatDate(review.createdAt)}
            </div>
            
            {/* Кнопка репорта (только если не собственная рецензия) */}
            {!isOwnReview && (
              <ReportButton
                type={ReportType.REVIEW}
                targetId={review.id || review.reviewId}
                size="small"
                tooltip="Пожаловаться на рецензию"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function ReviewPage() {
  const { reviewId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  
  // Состояния
  const [review, setReview] = useState(null);
  const [release, setRelease] = useState(null);
  const [artists, setArtists] = useState([]);
  const [producers, setProducers] = useState([]);
  const [releaseType, setReleaseType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояния для лайков
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [authorLikes, setAuthorLikes] = useState({});
  const [likeStates, setLikeStates] = useState({});

    // Состояния для предпочтений релиза
  const [inFavorites, setInFavorites] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Отладочная информация
  useEffect(() => {
    console.log('=== СОСТОЯНИЯ ЛАЙКОВ ===');
    console.log('likedReviews:', Array.from(likedReviews));
    console.log('authorLikes:', authorLikes);
    console.log('likeStates:', likeStates);
    console.log('review:', review);
    console.log('========================');
  }, [likedReviews, authorLikes, likeStates, review]);

  // Отладочная информация для релиза
  useEffect(() => {
    console.log('=== СОСТОЯНИЕ РЕЛИЗА ===');
    console.log('release:', release);
    console.log('release.releaseId:', release?.releaseId);
    console.log('release.id:', release?.id);
    console.log('Object.keys(release):', release ? Object.keys(release) : 'release is null');
    console.log('favoritesCount:', favoritesCount);
    console.log('inFavorites:', inFavorites);
    console.log('========================');
  }, [release, favoritesCount, inFavorites]);
  
  // Состояния для модальных окон
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Получение ID текущего пользователя
  const getCurrentUserIdInComponent = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.id || user.userId;
        console.log('getCurrentUserIdInComponent: получен ID из localStorage:', userId);
        return userId;
      }
    } catch (error) {
      console.error('Ошибка парсинга данных пользователя из localStorage:', error);
    }
    
    console.log('getCurrentUserIdInComponent: пользователь не найден в localStorage');
    return null;
  };

  // Функции для модальных окон
  const handleOpenLoginModal = () => {
    localStorage.setItem('redirectAfterAuth', location.pathname + location.search);
    setLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setLoginModalOpen(false);
  };

  const handleOpenRegisterModal = () => {
    localStorage.setItem('redirectAfterAuth', location.pathname + location.search);
    setRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setRegisterModalOpen(false);
  };

  const handleOpenForgotPasswordModal = () => {
    setForgotPasswordModalOpen(true);
  };

  const handleCloseForgotPasswordModal = () => {
    setForgotPasswordModalOpen(false);
  };

  const handleSwitchToRegister = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };

  const handleSwitchToForgotPassword = () => {
    setLoginModalOpen(false);
    setForgotPasswordModalOpen(true);
  };

  // Проверка, лайкнута ли рецензия
  const isReviewLiked = (reviewId) => {
    console.log(`Проверка лайка для рецензии ${reviewId}, likedReviews:`, Array.from(likedReviews));
    return likedReviews.has(reviewId);
  };

  // Функция для получения актуального счетчика лайков (авторские лайки уже включены в likesCount)
  const getReviewLikesCount = (review) => {
    const reviewId = review.id || review.reviewId;
    
    // Проверяем глобальное состояние лайков
    if (likeStates[reviewId] && typeof likeStates[reviewId].count === 'number') {
      console.log(`getReviewLikesCount для рецензии ${reviewId}: возвращаем из likeStates: ${likeStates[reviewId].count}`);
      return likeStates[reviewId].count;
    }
    
    // В противном случае используем значение из данных рецензии (включает авторские лайки)
    const count = review.likesCount !== undefined ? review.likesCount : 0;
    console.log(`getReviewLikesCount для рецензии ${reviewId}: возвращаем из review.likesCount: ${count}`);
    return count;
  };

  // Обработчик лайка рецензии
  const handleLikeToggle = async (reviewId) => {
    const userId = getCurrentUserIdInComponent();
    console.log('handleLikeToggle вызван для reviewId:', reviewId, 'userId:', userId);
    
    if (!userId) {
      console.warn('Пользователь не авторизован');
      return;
    }
    
    // Проверяем, что пользователь не лайкает свою собственную рецензию
    const reviewUserId = review.user?.id || review.userId || 0;
    console.log(`Проверка собственной рецензии: review.user.id=${review.user?.id}, review.userId=${review.userId}, userId=${userId}`);
    
    if (reviewUserId === userId) {
      console.warn('Попытка лайка собственной рецензии заблокирована');
      return;
    }

    const currentIsLiked = isReviewLiked(reviewId);
    console.log(`Текущее состояние лайка: ${currentIsLiked}`);

    try {
      if (currentIsLiked) {
        console.log('Удаляем лайк с рецензии');
        await likeApi.removeLikeFromReview(reviewId);
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          console.log(`Лайк удален, новый set:`, Array.from(newSet));
          return newSet;
        });
        
        // Обновляем счетчик лайков в likeStates
        setLikeStates(prev => ({
          ...prev,
          [reviewId]: {
            ...prev[reviewId],
            isLiked: false,
            count: Math.max(0, ((prev[reviewId]?.count !== undefined ? prev[reviewId].count : review.likesCount) || 0) - 1)
          }
        }));
        
        // Обновляем счетчик лайков в review объекте
        setReview(prev => ({
          ...prev,
          likesCount: Math.max(0, (prev.likesCount || 0) - 1)
        }));
      } else {
        console.log('Добавляем лайк к рецензии');
        await likeApi.addLikeToReview(reviewId);
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          newSet.add(reviewId);
          console.log(`Лайк добавлен, новый set:`, Array.from(newSet));
          return newSet;
        });
        
        // Обновляем счетчик лайков в likeStates
        setLikeStates(prev => ({
          ...prev,
          [reviewId]: {
            ...prev[reviewId],
            isLiked: true,
            count: ((prev[reviewId]?.count !== undefined ? prev[reviewId].count : review.likesCount) || 0) + 1
          }
        }));
        
        // Обновляем счетчик лайков в review объекте
        setReview(prev => ({
          ...prev,
          likesCount: (prev.likesCount || 0) + 1
        }));
      }
      
      // Обновляем авторские лайки для этой рецензии
      await updateAuthorLikesForReview(reviewId);
      
    } catch (error) {
      console.error('Ошибка при изменении лайка:', error);
      setNotification({
        type: 'error',
        message: 'Ошибка при изменении лайка'
      });
    }
  };

  // Обновление авторских лайков для конкретной рецензии
  const updateAuthorLikesForReview = async (reviewId) => {
    try {
      const authorLikesData = await likeApi.getAuthorLikesByReview(reviewId);
      console.log(`Получены авторские лайки для рецензии ${reviewId}:`, authorLikesData);
      
      setAuthorLikes(prev => ({
        ...prev,
        [reviewId]: authorLikesData || []
      }));
    } catch (error) {
      console.error(`Ошибка при получении авторских лайков для рецензии ${reviewId}:`, error);
    }
  };

  // Загрузка лайкнутых рецензий текущим пользователем
  const fetchLikedReviewsByCurrentUser = async () => {
    const currentUserId = getCurrentUserIdInComponent();
    if (!currentUserId) {
      console.log('Пользователь не авторизован, пропускаем загрузку лайков');
      return;
    }
    
    try {
      console.log(`Загружаем лайкнутые рецензии для пользователя ${currentUserId}`);
      const likedReviewsData = await likeApi.getLikedReviewsByUser(currentUserId);
      console.log(`Получены лайкнутые рецензии:`, likedReviewsData);
      
      // Создаем Set из ID рецензий, которые лайкнул пользователь
      const likedSet = new Set();
      likedReviewsData.forEach(like => {
        const reviewId = like.reviewId;
        if (reviewId) {
          likedSet.add(reviewId);
          console.log(`Добавлена лайкнутая рецензия: ${reviewId}`);
        }
      });
      
      console.log(`Итоговый set лайкнутых рецензий:`, Array.from(likedSet));
      setLikedReviews(likedSet);
      
      // Обновляем likeStates для синхронизации
      likedReviewsData.forEach(like => {
        const reviewId = like.reviewId;
        if (reviewId) {
          setLikeStates(prev => ({
            ...prev,
            [reviewId]: {
              ...prev[reviewId],
              isLiked: true
            }
          }));
        }
      });
    } catch (error) {
      console.error('Ошибка при загрузке лайкнутых рецензий:', error);
    }
  };

  // Загрузка авторских лайков
  const fetchAuthorLikes = async (reviewData) => {
    if (!reviewData) return;
    
    try {
      const reviewId = reviewData.id || reviewData.reviewId;
      const authorLikesData = await likeApi.getAuthorLikesByReview(reviewId);
      console.log(`Получены авторские лайки для рецензии ${reviewId}:`, authorLikesData);
      
      setAuthorLikes({
        [reviewId]: authorLikesData || []
      });
    } catch (error) {
      console.error('Ошибка при загрузке авторских лайков:', error);
    }
  };

  // Загрузка актуального количества лайков рецензии
  const fetchActualReviewLikesCount = async (reviewData) => {
    if (!reviewData) return;
    
    try {
      const reviewId = reviewData.id || reviewData.reviewId;
      console.log(`Загружаем АКТУАЛЬНОЕ количество лайков для рецензии ${reviewId}`);
      
      // Получаем все лайки для этой рецензии
      const reviewLikesData = await likeApi.getLikesCountByReview(reviewId);
      console.log(`Получено актуальное количество лайков для рецензии ${reviewId}:`, reviewLikesData);
      
      // Обновляем likeStates с актуальным count
      setLikeStates(prev => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          count: reviewLikesData || 0
        }
      }));
      
      // Также обновляем объект review
      setReview(prev => ({
        ...prev,
        likesCount: reviewLikesData || 0
      }));
      
    } catch (error) {
      console.error('Ошибка при загрузке актуального количества лайков рецензии:', error);
    }
  };

  // Обработчик добавления/удаления из предпочтений
  const handleToggleFavorite = async () => {
    const userId = getCurrentUserIdInComponent();
    const releaseId = release?.releaseId || release?.id;
    console.log('handleToggleFavorite вызван:', { userId, release, releaseId });
    
    if (!userId || !release || !releaseId) {
      console.warn('Пользователь не авторизован или релиз не загружен:', { userId, release, releaseId });
      return;
    }

    try {
      console.log(`Попытка ${inFavorites ? 'удалить' : 'добавить'} релиз ${releaseId} в предпочтения`);
      
      if (inFavorites) {
        // Удаляем из предпочтений
        await releaseApi.removeFromFavorites(releaseId);
        setInFavorites(false);
        setFavoritesCount(prev => Math.max(0, prev - 1));
        
        // Обновляем счетчик в объекте релиза
        setRelease(prev => ({
          ...prev,
          favoritesCount: Math.max(0, (prev?.favoritesCount || 0) - 1)
        }));
        
        console.log('Релиз удален из предпочтений');
      } else {
        // Добавляем в предпочтения
        await releaseApi.addToFavorites(releaseId);
        setInFavorites(true);
        setFavoritesCount(prev => prev + 1);
        
        // Обновляем счетчик в объекте релиза
        setRelease(prev => ({
          ...prev,
          favoritesCount: (prev?.favoritesCount || 0) + 1
        }));
        
        console.log('Релиз добавлен в предпочтения');
      }
    } catch (error) {
      console.error('Ошибка при изменении предпочтений:', error);
      setNotification({
        type: 'error',
        message: 'Ошибка при изменении предпочтений'
      });
    }
  };

  // Загрузка данных о предпочтениях релиза
  const fetchFavoriteStatus = async (releaseData) => {
    const userId = getCurrentUserIdInComponent();
    if (!userId || !releaseData) {
      console.log('Пользователь не авторизован или релиз не загружен, пропускаем загрузку предпочтений');
      return;
    }

    try {
      const currentReleaseId = releaseData.releaseId || releaseData.id;
      console.log(`=== НАЧИНАЕМ ЗАГРУЗКУ ПРЕДПОЧТЕНИЙ ДЛЯ РЕЛИЗА ${currentReleaseId} ===`);
      
      // Загружаем количество лайков релиза
      console.log(`Загружаем данные релиза с ID ${currentReleaseId}...`);
      const releaseWithLikes = await releaseApi.getReleaseById(currentReleaseId);
      console.log(`Получены данные релиза:`, releaseWithLikes);
      console.log(`LikesCount в ответе: ${releaseWithLikes.likesCount}`);
      
      const likesCount = releaseWithLikes.likesCount || 0;
      setFavoritesCount(likesCount);
      console.log(`Установлено favoritesCount: ${likesCount}`);

      // Проверяем, лайкнул ли текущий пользователь этот релиз
      console.log(`Загружаем лайкнутые релизы для пользователя ${userId}...`);
      const likedReleases = await userApi.getFavoriteReleases(userId);
      console.log(`Получены лайкнутые релизы:`, likedReleases);
      
      const isLiked = likedReleases.content ? likedReleases.content.some(release => release.releaseId === currentReleaseId) : false;
      setInFavorites(isLiked);
      console.log(`Установлено inFavorites: ${isLiked}`);
      
      console.log(`=== ФИНАЛЬНОЕ СОСТОЯНИЕ ПРЕДПОЧТЕНИЙ: лайкнут=${isLiked}, всего лайков=${likesCount} ===`);
    } catch (error) {
      console.error('Ошибка при загрузке данных о предпочтениях:', error);
    }
  };

  // Основная загрузка данных
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем рецензию
      const reviewData = await reviewApi.getReviewById(reviewId);
      console.log('Загружена рецензия:', reviewData);
      
      // Проверяем и загружаем количество лайков если его нет
      if (reviewData.likesCount === undefined) {
        try {
          const reviewWithLikes = await reviewApi.getReviewById(reviewId);
          reviewData.likesCount = reviewWithLikes.likesCount || 0;
          console.log('Обновлен likesCount для рецензии:', reviewData.likesCount);
        } catch (error) {
          console.warn('Не удалось загрузить количество лайков:', error);
          reviewData.likesCount = 0;
        }
      }
      
      setReview(reviewData);
      
      // Инициализируем likeStates для этой рецензии
      const currentReviewId = reviewData.id || reviewData.reviewId;
      setLikeStates(prev => ({
        ...prev,
        [currentReviewId]: {
          isLiked: false, // будет обновлено позже при загрузке лайков
          count: reviewData.likesCount || 0
        }
      }));

      // Загружаем данные релиза
      if (reviewData.releaseId) {
        console.log(`Загружаем релиз с ID: ${reviewData.releaseId}`);
        const releaseData = await releaseApi.getReleaseById(reviewData.releaseId);
        console.log('Получены данные релиза:', releaseData);
        console.log('ID релиза:', releaseData?.id);
        
        setRelease(releaseData);
        
        // Обрабатываем данные релиза
        if (releaseData) {
          setArtists(releaseData.authors || []);
          setProducers(releaseData.producers || []);
          setReleaseType(translateReleaseType(releaseData.type));
        }
        
        // Загружаем данные о предпочтениях релиза
        await fetchFavoriteStatus(releaseData);
      } else {
        console.warn('reviewData.releaseId отсутствует!', reviewData);
      }

      // Загружаем лайки
      await fetchLikedReviewsByCurrentUser();
      await fetchAuthorLikes(reviewData);
      
      // ВАЖНО: Загружаем АКТУАЛЬНОЕ количество лайков рецензии после всех запросов
      await fetchActualReviewLikesCount(reviewData);

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить рецензию');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reviewId) {
      fetchData();
    }
  }, [reviewId]);

  // Функции для релиза
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const translateReleaseType = (type) => {
    const types = {
      'album': 'Альбом',
      'single': 'Сингл',
      'ep': 'EP',
      'mixtape': 'Микстейп'
    };
    return types[type] || type;
  };

  const renderAuthorImage = (author) => {
    if (!author.avatarUrl) return null;
    
    return (
      <div className="artist-avatar-container">
        <img 
          alt={author.authorName || 'Автор'} 
          loading="lazy" 
          decoding="async" 
          data-nimg="fill" 
          className="artist-avatar" 
          src={author.avatarUrl}
          style={{ color: 'transparent' }} 
          onError={(e) => {
            console.error(`Ошибка загрузки аватарки для ${author.authorName}:`, e);
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Рецензия не найдена'}</p>
          <Link 
            to="/reviews" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white no-underline"
          >
            Вернуться к рецензиям
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="release-page">
        {/* Уведомления */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
        
        <div className="site-content">
        <main className="main-container">
          <div className="container">
            {/* Карточка релиза (полная копия из ReleasePage) */}
            {release && (
              <div className="release-header">
                {/* Блюр фона для мобильных устройств */}
                <div className="backdrop-blur">
                  <div className="backdrop-blur-inner">
                    <img 
                      alt={release.title} 
                      loading="lazy" 
                      width="10" 
                      height="10" 
                      decoding="async" 
                      data-nimg="1" 
                      className="backdrop-blur-image" 
                      src={release.coverUrl}
                      style={{ color: 'transparent' }} 
                    />
                  </div>
                </div>
                
                {/* Обложка релиза */}
                <div className="cover-container">
                  <div 
                    className="cover-wrapper" 
                    type="button" 
                    aria-haspopup="dialog" 
                    aria-expanded="false" 
                    data-state="closed"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="zoom-button">
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1rem', height: '1rem' }} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                      <span className="zoom-text">Увеличить обложку</span>
                    </div>
                    <img 
                      alt={release.title} 
                      loading="lazy" 
                      width="250" 
                      height="250" 
                      decoding="async" 
                      data-nimg="1" 
                      className="cover-image" 
                      src={release.coverUrl}
                      style={{ color: 'transparent' }} 
                    />
                  </div>
                </div>
                
                {/* Информация о релизе */}
                <div className="release-info">
                  {/* Тип релиза */}
                  <div className="release-type">
                    <div className="release-type-text">{releaseType}</div>
                  </div>
                  
                  {/* Название релиза */}
                  <div className="release-title">
                    <Link to={`/release/${release.releaseId}`}>
                      {release.title}
                    </Link>
                  </div>
                  
                  {/* Авторы и продюсеры */}
                  <div className="artists-container">
                    {/* Исполнители */}
                    {artists.map((artist, index) => (
                      <div key={`artist-${artist.id || index}`}>
                        <a 
                          className="artist-link" 
                          href={`/author/${artist.id || ''}`}
                        >
                          {renderAuthorImage(artist)}
                          <span className="artist-name">{artist.authorName || 'Автор'}</span>
                        </a>
                      </div>
                    ))}
                    
                    {/* Продюсеры */}
                    {producers.length > 0 && (
                      <div className="producer-section">
                        <div className="producer-label">prod.</div>
                        <div className="producer-list">
                          {producers.map((producer, index) => (
                            <a 
                              key={`producer-${producer.id || index}`}
                              className="producer-link" 
                              href={`/author/${producer.id || ''}`}
                            >
                              {producer.avatarUrl && (
                                <img 
                                  alt={producer.authorName || 'Продюсер'} 
                                  loading="lazy" 
                                  width="30" 
                                  height="30" 
                                  decoding="async" 
                                  data-nimg="1" 
                                  className="producer-avatar" 
                                  src={producer.avatarUrl}
                                  style={{ color: 'transparent' }} 
                                  onError={(e) => {
                                    console.error(`Ошибка загрузки аватарки продюсера для ${producer.authorName}:`, e);
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <span className="artist-name">{producer.authorName || 'Продюсер'}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="divider" data-orientation="vertical" role="none" style={{ width: '1px', height: '1.25rem' }}></div>
                    <div className="release-year">{new Date(release.releaseDate).getFullYear()}</div>
                  </div>
                  
                  {/* Рейтинги */}
                  <div className="ratings-container">
                    <div className="ratings-group">
                      {release.fullReviewRating !== undefined && (
                        <div className="author-rating-wrapper">
                          <div className="rating-pill rating-critic" data-state="closed">
                            <span className="rating-value">{Math.round(release.fullReviewRating)}</span>
                          </div>
                          <div className="author-hover-menu">
                            <div className="author-hover-content">
                              <div className="author-hover-title">Средняя оценка рецензий пользователей</div>
                            </div>
                          </div>
                        </div>
                      )}
                      {release.simpleReviewRating !== undefined && (
                        <div className="author-rating-wrapper">
                          <div className="rating-pill rating-user" data-state="closed">
                            <span className="rating-value">{Math.round(release.simpleReviewRating)}</span>
                          </div>
                          <div className="author-hover-menu">
                            <div className="author-hover-content">
                              <div className="author-hover-title">Средняя оценка без рецензий от пользователей</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Жанры справа от рейтингов */}
                    {release.genres && release.genres.length > 0 && (
                      <div className="genres-container">
                        <div className="genres-list">
                          {release.genres.map((genre) => (
                            <span key={genre.genreId} className="genre-tag">
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Кнопки действий */}
                <div className="actions-container">
                  <div className="bookmark-button">
                    <button 
                      data-state={inFavorites ? "open" : "closed"}
                      onClick={handleToggleFavorite}
                    >
                      <div className="bookmark-content">
                        <svg 
                          stroke="currentColor" 
                          fill={inFavorites ? "var(--user-color)" : "none"} 
                          strokeWidth={inFavorites ? "0" : "2"} 
                          viewBox="0 0 384 512" 
                          className="bookmark-icon" 
                          height="1em" 
                          width="1em" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M0 512V48C0 21.49 21.49 0 48 0h288c26.51 0 48 21.49 48 48v464L192 400 0 512z"></path>
                        </svg>
                        <span>{release?.favoritesCount || 0}</span>
                      </div>
                    </button>
                  </div>
                  <div className="author-rating-wrapper">
                    <button 
                      className="release-like-button"
                      onClick={handleToggleFavorite}
                    >
                      <div className="w-6 h-6 lg:w-6 lg:h-6 flex items-center justify-center">
                        {inFavorites ? (
                          <svg 
                            width="22" 
                            height="22" 
                            viewBox="0 0 24 24" 
                            fill="#FF5252"
                            stroke="none"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        ) : (
                          <svg 
                            width="22" 
                            height="22" 
                            viewBox="0 0 24 24" 
                            fill="none"
                            stroke="#AAAAAA" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        )}
                      </div>
                    </button>
                    <div className="author-hover-menu">
                      <div className="author-hover-content">
                        <div className="author-hover-title">
                          {inFavorites ? 'Убрать из предпочтений' : 'Добавить в предпочтения'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Кнопка репорта на релиз */}
                  <ReportButton
                    type={ReportType.RELEASE}
                    targetId={release.releaseId}
                    size="medium"
                    tooltip="Пожаловаться на релиз"
                    style={{ marginLeft: '8px' }}
                  />
                </div>
              </div>
            )}

            {/* Секция с рецензией */}
            <section className="reviews-section">
              <div className="reviews-header">
                <div className="reviews-title-container">
                  <div className="reviews-title">Рецензия</div>
                </div>
              </div>

              <div className="reviews-list space-y-4">
                {review && (
                  <ReviewCard
                    review={review}
                    isLiked={isReviewLiked(review.id || review.reviewId)}
                    onLikeToggle={handleLikeToggle}
                    authorLikes={authorLikes[review.id || review.reviewId] || []}
                    getReviewLikesCount={getReviewLikesCount}
                  />
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
      </div>

      {/* Модальные окна авторизации */}
      <LoginModal 
        open={loginModalOpen} 
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />
      
      <RegisterModal 
        open={registerModalOpen} 
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
      />
      
      <ForgotPasswordModal 
        open={forgotPasswordModalOpen} 
        onClose={handleCloseForgotPasswordModal}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
}

export default ReviewPage;