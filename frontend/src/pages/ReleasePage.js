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
const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM1NTU1NTUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjRkZGRkZGIj7QldCw0LXRgtGM0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMINC/0LDQtdGC0LU8L3RleHQ+PC9zdmc+';
const DEFAULT_COVER_PLACEHOLDER = '/path/to/default-cover.png';

// Компонент карточки рецензии (как в ReviewsPage)
const ReviewCard = ({ review, isLiked, onLikeToggle, authorLikes = [] }) => {
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
              className="review-like-button justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border group bg-white/5 max-lg:h-8 cursor-pointer flex items-center rounded-full gap-x-1 lg:gap-x-1.5"
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
              <span className="font-bold text-base lg:text-base">
                {review.likesCount !== undefined ? review.likesCount : 0}
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

/**
 * Страница релиза
 */
function ReleasePage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inFavorites, setInFavorites] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  // Состояния для модальных окон авторизации
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  
  // Состояние для модального окна критериев оценки
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  
  // Проверка роли пользователя
  const [userRole, setUserRole] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [userRoleLoading, setUserRoleLoading] = useState(true);
  
  // Состояния для рецензии
  const [tabState, setTabState] = useState('review-form'); // 'review-form' или 'score-review-form'
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [contentLength, setContentLength] = useState(0);
  
  // Состояния для оценок
  const [rhymeImagery, setRhymeImagery] = useState(5);
  const [structureRhythm, setStructureRhythm] = useState(5);
  const [styleExecution, setStyleExecution] = useState(5);
  const [individuality, setIndividuality] = useState(5);
  const [vibe, setVibe] = useState(1);
  
  // Состояние для общего счета
  const [totalScore, setTotalScore] = useState(28);
  
  // Состояние для процесса отправки
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Состояния для рецензий
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  
  // Состояния для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(3); // Количество рецензий на странице (для тестирования)
  
  // Состояния для лайков
  const [likedReviews, setLikedReviews] = useState(new Set());
  
  // Состояние для авторских лайков
  const [authorLikes, setAuthorLikes] = useState({});
  
  // Состояние для отображения сообщения о собственной рецензии
  const [notification, setNotification] = useState(null);
  
  // Состояние для детализированных рейтингов
  const [averageRatings, setAverageRatings] = useState(null);
  
  // Состояние для количества рецензий
  const [reviewCounts, setReviewCounts] = useState({
    extended: 0,
    simple: 0
  });

  // Проверка роли пользователя при загрузке
  useEffect(() => {
    const checkUserRole = async () => {
      setUserRoleLoading(true);
      if (user && user.id) {
        try {
          const userData = await userApi.getCurrentUser();
          setUserRole(userData.rights);
          setIsAuthor(userData.rights === 'AUTHOR');
        } catch (error) {
          console.error('Ошибка при получении данных пользователя:', error);
          setIsAuthor(false);
        }
      } else {
        setIsAuthor(false);
      }
      setUserRoleLoading(false);
    };
    
    checkUserRole();
  }, [user]);

  // Рассчитываем общий счет на основе формулы из бэкенда
  const calculateTotalScore = () => {
    const baseScore = rhymeImagery + structureRhythm + styleExecution + individuality;
    const vibeMultiplier = 1 + (vibe / 10) * 1.5;
    return Math.round(baseScore * vibeMultiplier);
  };
  
  // Максимальный возможный счет (100 баллов)
  const getMaxScore = () => {
    const maxBaseScore = 40; // 10+10+10+10 (максимум для каждого показателя)
    const maxVibeMultiplier = 1 + (10 / 10) * 1.5; // При значении vibe = 10
    return Math.round(maxBaseScore * maxVibeMultiplier); // 40 * 2.5 = 100
  };

  // Обновляем общий счет при изменении оценок
  useEffect(() => {
    setTotalScore(calculateTotalScore());
  }, [rhymeImagery, structureRhythm, styleExecution, individuality, vibe]);
  
  // Обработчики изменения полей формы
  const handleContentChange = (e) => {
    setReviewContent(e.target.value);
    setContentLength(e.target.value.length);
  };
  
  const handleTitleChange = (e) => {
    setReviewTitle(e.target.value);
  };
  
  // Обработчик очистки формы
  const handleClearDraft = () => {
    setReviewTitle('');
    setReviewContent('');
    setContentLength(0);
  };
  
  // Обработчик отправки формы
  const handleSubmitReview = async () => {
    if (!user || !user.id) {
      setSubmitError('Для создания рецензии необходимо авторизоваться');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      if (tabState === 'review-form') {
        // Проверка полноты заполнения формы для полной рецензии
        if (!reviewTitle.trim()) {
          setSubmitError('Введите заголовок рецензии');
          setIsSubmitting(false);
          return;
        }
        
        if (reviewContent.length < 10) {
          setSubmitError('Текст рецензии должен содержать не менее 10 символов');
          setIsSubmitting(false);
          return;
        }
        
        if (reviewContent.length > 1000) {
          setSubmitError('Текст рецензии не должен превышать 1000 символов');
          setIsSubmitting(false);
          return;
        }
        
        // Отправка полной рецензии
        await reviewApi.createFullReview(
          user.id,
          id,
          reviewTitle,
          reviewContent,
          rhymeImagery,
          structureRhythm,
          styleExecution,
          individuality,
          vibe
        );
      } else {
        // Отправка простой оценки
        await reviewApi.createSimpleReview(
          user.id,
          id,
          rhymeImagery,
          structureRhythm,
          styleExecution,
          individuality,
          vibe
        );
      }
      
      // Очистка формы после успешной отправки
      handleClearDraft();
      setRhymeImagery(5);
      setStructureRhythm(5);
      setStyleExecution(5);
      setIndividuality(5);
      setVibe(1);
      
      // Обновление данных о релизе после создания рецензии
      const updatedRelease = await releaseApi.getReleaseById(id);
      setRelease(updatedRelease);
      
      // Обновляем также детализированные рейтинги и количество
      try {
        const [updatedAverageRatings, totalReviewsCount, extendedReviewsResponse] = await Promise.all([
          reviewApi.getAverageRatingsByRelease(id),
          reviewApi.getReviewsCountByRelease(id),
          reviewApi.getExtendedReviewsByRelease(id, 0, 1)
        ]);
        
        setAverageRatings(updatedAverageRatings);
        
        const extendedCount = extendedReviewsResponse.totalElements;
        const simpleCount = Math.max(0, totalReviewsCount - extendedCount);
        
        setReviewCounts({
          extended: extendedCount,
          simple: simpleCount
        });
      } catch (ratingsError) {
        console.error('Ошибка при обновлении средних рейтингов:', ratingsError);
      }
      
      // Обновление списка рецензий
      fetchReviews();
      
    } catch (err) {
      console.error('Ошибка при создании рецензии:', err);
      setSubmitError('Не удалось сохранить рецензию. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Получение ID текущего пользователя в компоненте (как в ReviewsPage)
  const getCurrentUserIdInComponent = () => {
    // Сначала проверяем данные из хука useAuth
    if (user && user.id) {
      console.log('ID пользователя из useAuth:', user.id);
      return user.id;
    }
    
    // Если useAuth недоступен, используем глобальную функцию
    const globalUserId = getCurrentUserId();
    if (globalUserId) {
      console.log('ID пользователя из глобальной функции:', globalUserId);
      return globalUserId;
    }
    
    console.log('ID пользователя не найден');
    return null;
  };

  // Загрузка рецензий (как в ReviewsPage)
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      
      const userId = getCurrentUserIdInComponent();
      console.log('fetchReviews: currentUserId =', userId);
      
      // Очищаем старые данные лайков перед загрузкой новых
      setLikedReviews(new Set());
      setAuthorLikes({});
      
      // Параллельно загружаем рецензии и лайкнутые рецензии для повышения производительности
              const [reviewsResponse, likedReviewsSet] = await Promise.all([
          reviewApi.getExtendedReviewsByRelease(id, currentPage - 1, pageSize, sortBy),
        userId ? fetchLikedReviewsByCurrentUser() : new Set()
      ]);
      
      console.log('Ответ API рецензий:', reviewsResponse);
      setLikedReviews(likedReviewsSet);
      
      if (reviewsResponse && reviewsResponse.content) {
        // Обновляем количество лайков для каждой рецензии
        const reviewsWithLikes = await updateReviewsLikes(reviewsResponse.content);
        
        // Загружаем авторские лайки для всех рецензий
        await fetchAuthorLikes(reviewsWithLikes);
        
        setReviews(reviewsWithLikes);
        setTotalReviews(reviewsResponse.totalElements || 0);
        setTotalPages(reviewsResponse.totalPages || 0);
      } else {
        console.warn('Ответ API не содержит данных рецензий');
        throw new Error('Некорректные данные от API');
      }
    } catch (err) {
      setReviewsError('Не удалось загрузить рецензии');
      console.error('Ошибка загрузки рецензий:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Загрузка лайкнутых рецензий пользователя (как в ReviewsPage)
  const fetchLikedReviewsByCurrentUser = async () => {
    const userId = getCurrentUserIdInComponent();
    if (!userId) {
      console.log('Пользователь не авторизован, возвращаем пустой Set');
      return new Set();
    }
    
    try {
      console.log(`Загружаем рецензии, лайкнутые пользователем ID ${userId}`);
      
      try {
        const response = await likeApi.getLikedReviewsByUser(userId);
        
        if (response && response.content) {
          const likedIds = new Set(
            response.content
              .map(review => review.reviewId || review.id || 0)
              .filter(id => id > 0)
          );
          console.log(`Получено ${likedIds.size} лайкнутых рецензий для пользователя ${userId}:`, Array.from(likedIds));
          return likedIds;
        }
      } catch (apiError) {
        console.error('Ошибка API при загрузке лайкнутых рецензий:', apiError);
        return new Set();
      }
      
      return new Set();
    } catch (error) {
      console.error('Ошибка при загрузке лайкнутых рецензий:', error);
      return new Set();
    }
  };

  // Функция для загрузки авторских лайков для всех рецензий
  const fetchAuthorLikes = async (reviewsData) => {
    try {
      const authorLikesData = {};
      
      // Получаем авторские лайки для каждой рецензии
      await Promise.all(
        reviewsData.map(async (review) => {
          const reviewId = review.id || review.reviewId;
          if (reviewId) {
            const authorLikesForReview = await likeApi.getAuthorLikesByReview(reviewId);
            if (authorLikesForReview && authorLikesForReview.length > 0) {
              // Отладка структуры авторских лайков
              console.log(`DEBUG: Структура авторских лайков для рецензии ${reviewId}:`, 
                JSON.stringify(authorLikesForReview, null, 2));
              
              // Исправление отсутствующего authorId
              const fixedAuthorLikes = authorLikesForReview.map(like => {
                if (like.author) {
                  // Если у автора есть userId, но нет authorId, используем userId как authorId
                  if (like.author.userId && !like.author.authorId) {
                    like.author.authorId = like.author.userId;
                  }
                }
                return like;
              });
              
              authorLikesData[reviewId] = fixedAuthorLikes;
            }
          }
        })
      );
      
      setAuthorLikes(authorLikesData);
    } catch (error) {
      console.error('Ошибка при загрузке авторских лайков:', error);
    }
  };
  
  // Функция для обновления авторских лайков для конкретной рецензии
  const updateAuthorLikesForReview = async (reviewId) => {
    try {
      const updatedAuthorLikes = await likeApi.getAuthorLikesByReview(reviewId);
      if (updatedAuthorLikes && updatedAuthorLikes.length > 0) {
        // Исправление отсутствующего authorId
        const fixedAuthorLikes = updatedAuthorLikes.map(like => {
          if (like.author) {
            // Если у автора есть userId, но нет authorId, используем userId как authorId
            if (like.author.userId && !like.author.authorId) {
              like.author.authorId = like.author.userId;
            }
          }
          return like;
        });
        
        setAuthorLikes(prev => ({
          ...prev,
          [reviewId]: fixedAuthorLikes
        }));
      } else {
        setAuthorLikes(prev => {
          const newAuthorLikes = { ...prev };
          delete newAuthorLikes[reviewId];
          return newAuthorLikes;
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении авторских лайков:', error);
    }
  };

  // Обновление количества лайков для рецензий (как в ReviewsPage)
  const updateReviewsLikes = async (reviewsData) => {
    const updatedReviews = [...reviewsData];
    
    // Создаем запросы для получения количества лайков для каждой рецензии
    const likesPromises = updatedReviews.map(review => {
      const reviewId = review.id || review.reviewId;
      if (!reviewId) return Promise.resolve(review);
      
      return likeApi.getLikesCountByReview(reviewId)
        .then(likesCount => {
          review.likesCount = likesCount;
          return review;
        })
        .catch(error => {
          console.error(`Ошибка получения лайков для рецензии ${reviewId}:`, error);
          return review;
        });
    });
    
    try {
      const reviewsWithLikes = await Promise.all(likesPromises);
      return reviewsWithLikes;
    } catch (error) {
      console.error('Ошибка при обновлении лайков:', error);
      return updatedReviews;
    }
  };

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        console.log('🔄 Начинаем загрузку релиза с ID:', id);
        setLoading(true);
        const data = await releaseApi.getReleaseById(id);
        console.log('✅ Релиз загружен:', data.title);
        setRelease(data);
        

        
        // Проверяем статус избранного для текущего пользователя
        console.log('🔍 Проверяем статус избранного. Пользователь:', user ? `ID ${user.id}` : 'не авторизован');
        if (user) {
          console.log('👤 Пользователь авторизован, проверяем статус избранного через список избранных...');
          try {
            const currentReleaseId = parseInt(id);
            console.log('Ищем релиз с ID:', currentReleaseId);
            
            let found = false;
            let page = 0;
            let totalChecked = 0;
            
            // Проверяем все страницы избранных релизов
            while (!found && page < 20) { // Ограничиваем 20 страницами для безопасности
              console.log(`Проверяем страницу ${page} избранных релизов...`);
              const favoritesResponse = await releaseApi.getFavoriteReleases(page, 50);
              
              console.log(`Получено ${favoritesResponse.content.length} релизов на странице ${page}`);
              console.log('Релизы на странице:', favoritesResponse.content.map(r => r.releaseId));
              
              totalChecked += favoritesResponse.content.length;
              
              // Проверяем, есть ли наш релиз на этой странице
              found = favoritesResponse.content.some(release => {
                console.log(`Сравниваем ${release.releaseId} с ${currentReleaseId}`);
                return release.releaseId === currentReleaseId;
              });
              
              if (found) {
                console.log(`✅ Релиз ${currentReleaseId} НАЙДЕН в избранных на странице ${page}!`);
                setInFavorites(true);
                break;
              }
              
              // Если это была последняя страница, прекращаем поиск
              if (page >= favoritesResponse.totalPages - 1) {
                console.log('Достигнута последняя страница');
                break;
              }
              
              page++;
            }
            
            if (!found) {
              console.log(`❌ Релиз ${currentReleaseId} НЕ найден в избранных. Проверено ${totalChecked} релизов на ${page + 1} страницах.`);
              setInFavorites(false);
            }
            
          } catch (error) {
            console.error('Ошибка при проверке статуса избранного:', error);
            setInFavorites(false);
          }
        } else {
          console.log('❌ Пользователь НЕ авторизован, устанавливаем inFavorites = false');
          setInFavorites(false);
        }

        
        // Получаем детализированные средние рейтинги и количество рецензий
        try {
          const [averageRatingsData, totalReviewsCount, extendedReviewsResponse] = await Promise.all([
            reviewApi.getAverageRatingsByRelease(id),
            reviewApi.getReviewsCountByRelease(id),
            reviewApi.getExtendedReviewsByRelease(id, 0, 1)
          ]);
          
          console.log('Средние рейтинги:', averageRatingsData);
          setAverageRatings(averageRatingsData);
          
          const extendedCount = extendedReviewsResponse.totalElements;
          const simpleCount = Math.max(0, totalReviewsCount - extendedCount);
          
          setReviewCounts({
            extended: extendedCount,
            simple: simpleCount
          });
          
          console.log('Количество рецензий:', { extended: extendedCount, simple: simpleCount });
        } catch (ratingsError) {
          console.error('Ошибка при получении средних рейтингов:', ratingsError);
          setAverageRatings(null);
          setReviewCounts({ extended: 0, simple: 0 });
        }
      } catch (err) {
        setError('Не удалось загрузить релиз');
        console.error('Ошибка загрузки релиза:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelease();
    fetchReviews();
      }, [id, user]);

  // Перезагружаем рецензии при изменении сортировки или страницы
  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [sortBy, currentPage]);

  const handleToggleFavorite = async () => {
    console.log('=== КЛИК ПО КНОПКЕ ЛАЙКА ===');
    console.log('Релиз:', release);
    console.log('Пользователь:', user);
    console.log('Текущий inFavorites:', inFavorites);
    
    if (!release) {
      console.log('Релиз не загружен, выходим');
      return;
    }
    
    if (!user) {
      console.log('Пользователь не авторизован, выходим');
      return;
    }
    
    try {
      console.log('Переключаем статус избранного. Текущий статус:', inFavorites);
      
      if (inFavorites) {
        await releaseApi.removeFromFavorites(id);
        console.log('Релиз удален из избранного');
      } else {
        await releaseApi.addToFavorites(id);
        console.log('Релиз добавлен в избранное');
      }
      
             // Просто инвертируем статус - это быстрее и надежнее
       setInFavorites(!inFavorites);
      
      setRelease(prev => ({
        ...prev,
        favoritesCount: inFavorites 
          ? Math.max(0, prev.favoritesCount - 1) 
          : (prev.favoritesCount || 0) + 1
      }));
    } catch (err) {
      console.error('Ошибка при изменении статуса избранного:', err);
      
      // Проверяем на ошибку автора
      if (err.response && err.response.status === 403 && 
          err.response.data && err.response.data.message && 
          err.response.data.message.includes('не может добавлять релизы в предпочтения')) {
        setNotification({
          message: 'Автор не может добавлять релизы в предпочтения',
          type: 'error'
        });
      } else {
        setNotification({
          message: 'Ошибка при добавлении в избранное',
          type: 'error'
        });
      }
    }
  };

  // Функция для обновления заполнения слайдеров
  const updateSliderFill = (event, max = 10) => {
    const percentage = ((event.target.value - event.target.min) / (max - event.target.min)) * 100;
    event.target.style.setProperty('--slider-fill', `${percentage}%`);
  };

  // Инициализация заполнения слайдеров при загрузке
  useEffect(() => {
    const initializeSliders = () => {
      const sliders = document.querySelectorAll('.rating-slider');
      sliders.forEach(slider => {
        const value = parseInt(slider.value);
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const percentage = ((value - min) / (max - min)) * 100;
        slider.style.setProperty('--slider-fill', `${percentage}%`);
      });
    };

    // Try immediately
    initializeSliders();
    
    // And also try after a short delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      initializeSliders();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Обновление заполнения слайдеров при изменении значений
  useEffect(() => {
    const updateAllSliders = () => {
      document.querySelectorAll('.rating-slider').forEach(slider => {
        const value = parseInt(slider.value || 5); // Default to 5 if not set
        const min = parseInt(slider.min || 1);
        const max = parseInt(slider.max || 10);
        const percentage = ((value - min) / (max - min)) * 100;
        slider.style.setProperty('--slider-fill', `${percentage}%`);
      });
    };
    
    updateAllSliders();
  }, [rhymeImagery, structureRhythm, styleExecution, individuality, vibe]);

  // Ensure sliders are updated after component fully renders
  useEffect(() => {
    const updateSliderValues = () => {
      // Force sliders to update based on current state values
      const sliders = document.querySelectorAll('.rating-slider');
      if (sliders.length) {
        // Default values for our sliders
        const values = [rhymeImagery, structureRhythm, styleExecution, individuality, vibe];
        
        sliders.forEach((slider, index) => {
          if (index < values.length) {
            const value = values[index];
            const min = parseInt(slider.min || 1);
            const max = parseInt(slider.max || 10);
            const percentage = ((value - min) / (max - min)) * 100;
            slider.style.setProperty('--slider-fill', `${percentage}%`);
          }
        });
      }
    };

    // Call immediately after render
    updateSliderValues();
    
    // Also call after a very short delay to ensure DOM is ready
    const timer = setTimeout(updateSliderValues, 50);
    return () => clearTimeout(timer);
  }, [rhymeImagery, structureRhythm, styleExecution, individuality, vibe]);

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Функция для получения текста сортировки
  const getSortText = (sortType) => {
    switch (sortType) {
      case 'newest': return 'Новые';
      case 'oldest': return 'Старые';
      case 'popular': return 'Популярные';
      case 'top_rated': return 'Высоко оцененные';
      default: return 'Новые';
    }
  };



  // Компонент списка рецензий (точно как в ReviewsPage)
  const ReviewsList = React.memo(() => {
    if (reviewsLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-zinc-400">Загрузка рецензий...</div>
        </div>
      );
    }

    if (reviewsError) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-red-400">Ошибка загрузки рецензий: {reviewsError}</div>
        </div>
      );
    }

    if (!reviews || reviews.length === 0) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-zinc-400">Рецензий пока нет</div>
        </div>
      );
    }

    return (
      <div className="reviews-list space-y-4">
        {reviews.map((review) => {
          const reviewId = review.id || review.reviewId;
          const isLiked = isReviewLiked(reviewId);

          return (
            <ReviewCard
              key={reviewId}
              review={review}
              isLiked={isLiked}
              onLikeToggle={handleLikeToggle}
              authorLikes={authorLikes[reviewId] || []}
            />
          );
        })}
      </div>
    );
  }, [reviews, reviewsLoading, reviewsError, likedReviews]);

  // Обработчик изменения сортировки
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setSortDropdownOpen(false);
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении сортировки
  };

  // Обработчик изменения страницы
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Функции для модальных окон авторизации
      const handleOpenLoginModal = () => {
      // Сохраняем текущую страницу для возврата после авторизации
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

  // Функция для создания кнопок пагинации
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    // Определяем диапазон видимых страниц
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Корректируем начальную страницу если диапазон слишком мал
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Добавляем кнопки страниц
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i}>
          <button
            aria-current={i === currentPage ? "page" : undefined}
            className={`pagination-button ${i === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        </li>
      );
    }

    return (
      <div className="pagination-container">
        <nav role="navigation" aria-label="pagination" className="pagination-nav">
          <ul className="pagination-list">
            {/* Кнопка "Предыдущая" */}
            {currentPage > 1 && (
              <li>
                <button
                  className="pagination-button prev-next"
                  aria-label="Go to previous page"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                  <span className="prev-next-text">Предыдущая</span>
                </button>
              </li>
            )}
            
            {pages}
            
            {/* Кнопка "Следующая" */}
            {currentPage < totalPages && (
              <li>
                <button
                  className="pagination-button prev-next"
                  aria-label="Go to next page"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span className="prev-next-text">Следующая</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    );
  };

  // Проверка, лайкнута ли рецензия (как в ReviewsPage)
  const isReviewLiked = (reviewId) => {
    console.log(`Проверка лайка для рецензии ${reviewId}, likedReviews:`, Array.from(likedReviews));
    return likedReviews.has(reviewId);
  };

  // Обработчик лайка рецензии (как в ReviewsPage)
  const handleLikeToggle = async (reviewId) => {
    const userId = getCurrentUserIdInComponent();
    console.log('handleLikeToggle вызван для reviewId:', reviewId, 'userId:', userId);
    
    if (!userId) {
      console.warn('Пользователь не авторизован');
      return;
    }
    
    // Находим рецензию в массиве
    const review = reviews.find(r => r.id === reviewId || r.reviewId === reviewId);
    if (!review) {
      console.error(`Рецензия с ID ${reviewId} не найдена`);
      return;
    }
    
    // Проверяем, что пользователь не лайкает свою собственную рецензию
    const reviewUserId = review.userId || (review.user && review.user.id) || 0;
    if (reviewUserId === userId) {
      console.warn('Нельзя лайкать собственные рецензии');
      return;
    }
    
    try {
      const isLiked = likedReviews.has(reviewId);
      console.log(`Текущее состояние лайка для рецензии ${reviewId}: ${isLiked ? 'лайкнута' : 'не лайкнута'}`);
      
      if (isLiked) {
        // Оптимистично обновляем UI перед запросом к серверу
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
        
        setReviews(prevReviews => 
          prevReviews.map(r => 
            (r.id === reviewId || r.reviewId === reviewId) 
              ? {...r, likesCount: Math.max(0, (r.likesCount || 0) - 1)} 
              : r
          )
        );
        
        // Удаляем лайк в бэкенде
        try {
          await likeApi.removeLike(reviewId, userId);
          console.log(`Лайк удален: reviewId=${reviewId}, userId=${userId}`);
        } catch (apiError) {
          console.error('Ошибка при удалении лайка через API:', apiError);
          console.log('Продолжаем работу с локальными данными');
        }
        
        // Получаем актуальное количество лайков с сервера
        try {
          const updatedLikesCount = await likeApi.getLikesCountByReview(reviewId);
          
          // Обновляем точное количество лайков после получения от сервера
          setReviews(prevReviews => 
            prevReviews.map(r => 
              (r.id === reviewId || r.reviewId === reviewId) 
                ? {...r, likesCount: updatedLikesCount} 
                : r
            )
          );
          
          // Обновляем авторские лайки после удаления лайка
          await updateAuthorLikesForReview(reviewId);
        } catch (countError) {
          console.error('Ошибка при получении количества лайков:', countError);
        }
      } else {
        // Оптимистично обновляем UI перед запросом к серверу
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          newSet.add(reviewId);
          return newSet;
        });
        
        setReviews(prevReviews => 
          prevReviews.map(r => 
            (r.id === reviewId || r.reviewId === reviewId) 
              ? {...r, likesCount: (r.likesCount || 0) + 1} 
              : r
          )
        );
        
        // Добавляем лайк в бэкенде
        try {
          await likeApi.createLike(reviewId, userId, 'REGULAR');
          console.log(`Лайк добавлен: reviewId=${reviewId}, userId=${userId}`);
        } catch (apiError) {
          console.error('Ошибка при добавлении лайка через API:', apiError);
          
          // Проверяем на ошибку автора
          if (apiError.response && apiError.response.status === 403 && 
              apiError.response.data && apiError.response.data.message && 
              apiError.response.data.message.includes('может лайкать только рецензии на свои релизы')) {
            setNotification({
              message: 'Автор может лайкать только рецензии на свои релизы',
              type: 'error'
            });
            
            // Возвращаем локальное состояние обратно
            setLikedReviews(prev => {
              const newSet = new Set(prev);
              newSet.delete(reviewId);
              return newSet;
            });
            
            setReviews(prevReviews => 
              prevReviews.map(r => 
                (r.id === reviewId || r.reviewId === reviewId) 
                  ? {...r, likesCount: Math.max(0, (r.likesCount || 0) - 1)} 
                  : r
              )
            );
            return;
          }
          
          console.log('Продолжаем работу с локальными данными');
        }
        
        // Получаем актуальное количество лайков с сервера
        try {
          const updatedLikesCount = await likeApi.getLikesCountByReview(reviewId);
          
          // Обновляем точное количество лайков после получения от сервера
          setReviews(prevReviews => 
            prevReviews.map(r => 
              (r.id === reviewId || r.reviewId === reviewId) 
                ? {...r, likesCount: updatedLikesCount} 
                : r
            )
          );
          
          // Обновляем авторские лайки после добавления лайка
          await updateAuthorLikesForReview(reviewId);
        } catch (countError) {
          console.error('Ошибка при получении количества лайков:', countError);
        }
      }
    } catch (error) {
      console.error(`Ошибка при переключении лайка для рецензии ${reviewId}:`, error);
      
      // В случае ошибки оставляем локальное состояние без изменений
      console.log('Восстанавливаем интерфейс после ошибки');
    }
  };

  // Закрытие выпадающего списка при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownOpen && !event.target.closest('.reviews-sort-dropdown')) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sortDropdownOpen]);

  // Получаем ID пользователя при каждом рендере, чтобы гарантировать актуальность
  const currentUserId = getCurrentUserIdInComponent();
  console.log('ReleasePage инициализация, текущий ID пользователя:', currentUserId);
  
  // Очищаем состояние лайков при смене пользователя
  useEffect(() => {
    console.log('Смена пользователя обнаружена, очищаем состояние лайков');
    setLikedReviews(new Set());
    setAuthorLikes({});
  }, [currentUserId]);

  if (loading || userRoleLoading) {
    return (
      <div className="release-page">
        <div className="site-content">
          <main className="main-container">
            <div className="container">
              <LoadingSpinner 
                size="large"
                text={loading ? 'Загрузка релиза...' : 'Проверка прав доступа...'} 
                className="loading-container--center"
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="release-page">
        <div className="site-content">
          <main className="main-container">
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <span>{error}</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!release) {
    console.error('Релиз не загружен');
    return null;
  }

  // Обработка авторов: фильтруем по ролям
  const artists = release.authors ? release.authors.filter(author => author.isArtist) : [];
  const producers = release.authors ? release.authors.filter(author => author.isProducer) : [];
  
  console.log('Исполнители:', artists);
  console.log('Продюсеры:', producers);
  console.log('Тип релиза:', release.type);
  console.log('В избранном:', inFavorites);

  // Вывод URL аватарок для отладки
  if (artists.length > 0) {
    console.log('URL аватарки исполнителя:', artists[0].avatarUrl);
  }
  if (producers.length > 0) {
    console.log('URL аватарки продюсера:', producers[0].avatarUrl);
  }

  // Перевод типа релиза
  const translateReleaseType = (type) => {
    if (!type) return 'Альбом';
    
    const typeUpper = type.toUpperCase();
    if (typeUpper === 'SINGLE') return 'Сингл';
    if (typeUpper === 'ALBUM') return 'Альбом';
    if (typeUpper === 'EP') return 'EP';
    
    return type;
  };

  // Убедимся, что все нужные поля существуют
  const releaseType = translateReleaseType(release.type);
  const favoritesCount = release.favoritesCount || 0;
  
  // Функция для округления до десятых
  const roundToTenth = (value) => {
    if (value === undefined || value === null || value === 0) return 0;
    return Math.round(value * 10) / 10;
  };
  
  // Округляем оценки до целых чисел
  const criticRating = release.fullReviewRating !== undefined 
    ? Math.round(release.fullReviewRating) 
    : 'N/A';
  const userRating = release.simpleReviewRating !== undefined 
    ? Math.round(release.simpleReviewRating) 
    : 'N/A';

  const renderAuthorImage = (author) => {
    if (!author.avatarUrl) return null;
    
    console.log(`Рендерим аватарку для ${author.authorName}:`, author.avatarUrl);
    
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

  return (
    <>
      <div className="release-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="site-content">
        <main className="main-container">
          <div className="container">
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
                  onClick={() => setCoverModalOpen(true)}
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
                  {release.title}
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
                    {criticRating !== 'N/A' && (
                      <div className="author-rating-wrapper">
                        <div className="rating-pill rating-critic" data-state="closed">
                          <span className="rating-value">{criticRating}</span>
                        </div>
                        <div className="author-hover-menu">
                          <div className="author-hover-content">
                            <div className="author-hover-title">Средняя оценка рецензий пользователей</div>
                            {((averageRatings && averageRatings.extended) || reviewCounts.extended > 0) && (
                              <div className="author-hover-stats">
                                <div className="author-param">
                                  <span className="param-name">Всего рецензий:</span>
                                  <span className="param-value">{reviewCounts.extended}</span>
                                </div>
                                <div style={{borderBottom: '1px solid rgba(255, 255, 255, 0.1)', margin: '8px 0'}}></div>
                                <div className="author-param">
                                  <span className="param-name">Рифма и образность:</span>
                                  <span className="param-value">{roundToTenth(averageRatings?.extended?.rhymeImagery)}</span>
                                </div>
                                <div className="author-param">
                                  <span className="param-name">Структура и ритм:</span>
                                  <span className="param-value">{roundToTenth(averageRatings?.extended?.structureRhythm)}</span>
                                </div>
                                <div className="author-param">
                                  <span className="param-name">Стиль и исполнение:</span>
                                  <span className="param-value">{roundToTenth(averageRatings?.extended?.styleExecution)}</span>
                                </div>
                                <div className="author-param">
                                  <span className="param-name">Индивидуальность:</span>
                                  <span className="param-value">{roundToTenth(averageRatings?.extended?.individuality)}</span>
                                </div>
                                <div className="author-param vibe">
                                  <span className="param-name">Вайб:</span>
                                  <span className="param-value">{roundToTenth(averageRatings?.extended?.vibe)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {userRating !== 'N/A' && (
                      <div className="author-rating-wrapper">
                        <div className="rating-pill rating-user" data-state="closed">
                          <span className="rating-value">{userRating}</span>
                        </div>
                        <div className="author-hover-menu">
                          <div className="author-hover-content">
                            <div className="author-hover-title">Средняя оценка без рецензий от пользователей</div>
                            {((averageRatings && averageRatings.simple) || reviewCounts.simple > 0) && (
                              <div className="author-hover-stats">
                                <div className="author-param">
                                  <span className="param-name">Всего оценок:</span>
                                  <span className="param-value">{reviewCounts.simple}</span>
                                </div>
                                <div style={{borderBottom: '1px solid rgba(255, 255, 255, 0.1)', margin: '8px 0'}}></div>
                                <div className="author-param">
                                  <span className="param-name">Рифма и образность:</span>
                                  <span className="param-value">{roundToTenth(averageRatings?.simple?.rhymeImagery)}</span>
                                </div>
                                <div className="author-param">
                                  <span className="param-name">Структура и ритм:</span>
                                  <span className="param-value">{roundToTenth(averageRatings?.simple?.structureRhythm)}</span>
                                </div>
                                <div className="author-param">
                                  <span className="param-name">Стиль и исполнение:</span>
                                  <span className="param-value">{roundToTenth(averageRatings?.simple?.styleExecution)}</span>
                                </div>
                                <div className="author-param">
                                  <span className="param-name">Индивидуальность:</span>
                                  <span className="param-value">{roundToTenth(averageRatings?.simple?.individuality)}</span>
                                </div>
                                <div className="author-param vibe">
                                  <span className="param-name">Вайб:</span>
                                  <span className="param-value">{roundToTenth(averageRatings?.simple?.vibe)}</span>
                                </div>
                              </div>
                            )}
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
                      <span>{favoritesCount}</span>
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
                {release && user && (
                  <ReportButton
                    type={ReportType.RELEASE}
                    targetId={release.releaseId}
                    size="medium"
                    tooltip="Пожаловаться на релиз"
                    style={{ marginLeft: '8px' }}
                  />
                )}
              </div>
            </div>
            
            {/* Блок создания рецензии - отображается только для авторизованных пользователей (кроме авторов) */}
            {user && !isAuthor ? (
              <div className="review-form-container">
                <div className="review-form-title">Оценить работу</div>
                <div dir="ltr" data-orientation="vertical" className="review-form-grid">
                  <div className="lg:col-span-2">
                    <div 
                      role="tablist" 
                      aria-orientation="vertical" 
                      className="review-tabs-container" 
                      tabIndex="0" 
                      data-orientation="vertical"
                    >
                      <button 
                        type="button" 
                        role="tab" 
                        aria-selected={tabState === 'review-form'} 
                        aria-controls="radix-:rh:-content-review-form" 
                        data-state={tabState === 'review-form' ? 'active' : 'inactive'} 
                        id="radix-:rh:-trigger-review-form" 
                        className="review-tab-button" 
                        tabIndex="-1" 
                        data-orientation="vertical" 
                        data-radix-collection-item=""
                        onClick={() => setTabState('review-form')}
                      >
                        Рецензия
                      </button>
                      <button 
                        type="button" 
                        role="tab" 
                        aria-selected={tabState === 'score-review-form'} 
                        aria-controls="radix-:rh:-content-score-review-form" 
                        data-state={tabState === 'score-review-form' ? 'active' : 'inactive'} 
                        id="radix-:rh:-trigger-score-review-form" 
                        className="review-tab-button" 
                        tabIndex="-1" 
                        data-orientation="vertical" 
                        data-radix-collection-item=""
                        onClick={() => setTabState('score-review-form')}
                      >
                        Оценка без рецензии
                      </button>
                    </div>
                    <div 
                      role="alert" 
                      className="review-alert"
                    >
                      <svg 
                        stroke="currentColor" 
                        fill="currentColor" 
                        strokeWidth="0" 
                        viewBox="0 0 512 512" 
                        className="review-alert-icon" 
                        height="1em" 
                        width="1em" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M228.9 79.9L51.8 403.1C40.6 423.3 55.5 448 78.9 448h354.3c23.3 0 38.2-24.7 27.1-44.9L283.1 79.9c-11.7-21.2-42.5-21.2-54.2 0zM273.6 214L270 336h-28l-3.6-122h35.2zM256 402.4c-10.7 0-19.1-8.1-19.1-18.4s8.4-18.4 19.1-18.4 19.1 8.1 19.1 18.4-8.4 18.4-19.1 18.4z"></path>
                      </svg>
                      <h5 className="review-alert-title">Ознакомьтесь с критериями.</h5>
                      <div className="review-alert-content">
                        <button 
                          className="review-criteria-button" 
                          type="button" 
                          aria-haspopup="dialog" 
                          aria-expanded="false" 
                          aria-controls="criteria-modal" 
                          data-state="closed"
                          onClick={() => setCriteriaModalOpen(true)}
                        >
                          Ознакомиться с критериями
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-6">
                    <div 
                      data-state={tabState === 'review-form' ? 'active' : 'inactive'} 
                      data-orientation="vertical" 
                      role="tabpanel" 
                      aria-labelledby="radix-:rh:-trigger-review-form" 
                      id="radix-:rh:-content-review-form" 
                      tabIndex="0" 
                      className="review-tabpanel" 
                      style={{ display: tabState === 'review-form' ? 'block' : 'none' }}
                    >
                      <form action="">
                        <div className="review-form-card">
                          <div className="review-form-content">
                            <div className="review-form-inner">
                              <div className="review-ratings-grid">
                                <div className="review-ratings-text">
                                  <div className="rating-item">
                                    <div className="rating-header">
                                      <div className="rating-label">Рифмы / Образы</div>
                                      <div className="rating-value">{rhymeImagery}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={rhymeImagery}
                                      onChange={(e) => {
                                        setRhymeImagery(parseInt(e.target.value));
                                        updateSliderFill(e);
                                      }}
                                      className="rating-slider"
                                    />
                                  </div>
                                  <div className="rating-item">
                                    <div className="rating-header">
                                      <div className="rating-label">Структура / Ритмика</div>
                                      <div className="rating-value">{structureRhythm}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={structureRhythm}
                                      onChange={(e) => {
                                        setStructureRhythm(parseInt(e.target.value));
                                        updateSliderFill(e);
                                      }}
                                      className="rating-slider"
                                    />
                                  </div>
                                  <div className="rating-item">
                                    <div className="rating-header">
                                      <div className="rating-label">Реализация стиля</div>
                                      <div className="rating-value">{styleExecution}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={styleExecution}
                                      onChange={(e) => {
                                        setStyleExecution(parseInt(e.target.value));
                                        updateSliderFill(e);
                                      }}
                                      className="rating-slider"
                                    />
                                  </div>
                                  <div className="rating-item">
                                    <div className="rating-header">
                                      <div className="rating-label">Индивидуальность / Харизма</div>
                                      <div className="rating-value">{individuality}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={individuality}
                                      onChange={(e) => {
                                        setIndividuality(parseInt(e.target.value));
                                        updateSliderFill(e);
                                      }}
                                      className="rating-slider"
                                    />
                                  </div>
                                </div>
                                <div className="review-ratings-vibe">
                                  <div className="rating-item">
                                    <div className="rating-header">
                                      <div className="rating-label">Атмосфера / Вайб</div>
                                      <div className="rating-value">{vibe}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={vibe}
                                      onChange={(e) => {
                                        setVibe(parseInt(e.target.value));
                                        updateSliderFill(e);
                                      }}
                                      className="rating-slider"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="review-form-fields">
                                <div className="mb-2 lg:mb-2">
                                  <input 
                                    className="review-title-input" 
                                    id="review_title" 
                                    placeholder="Заголовок рецензии" 
                                    value={reviewTitle} 
                                    name="review_title"
                                    onChange={handleTitleChange}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <textarea 
                                    className="review-content-textarea" 
                                    name="content" 
                                    id="content" 
                                    placeholder="Текст рецензии (от 10 до 1000 символов)" 
                                    maxLength="1000"
                                    value={reviewContent}
                                    onChange={handleContentChange}
                                  ></textarea>
                                  <div className="review-form-actions">
                                    <button 
                                      className="review-clear-button" 
                                      type="button" 
                                      aria-haspopup="dialog" 
                                      aria-expanded="false" 
                                      aria-controls="radix-:rn:" 
                                      data-state="closed"
                                      onClick={handleClearDraft}
                                    >
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" t="1569683368540" viewBox="0 0 1024 1024" version="1.1" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                        <defs></defs>
                                        <path d="M899.1 869.6l-53-305.6H864c14.4 0 26-11.6 26-26V346c0-14.4-11.6-26-26-26H618V138c0-14.4-11.6-26-26-26H432c-14.4 0-26 11.6-26 26v182H160c-14.4 0-26 11.6-26 26v192c0 14.4 11.6 26 26 26h17.9l-53 305.6c-0.3 1.5-0.4 3-0.4 4.4 0 14.4 11.6 26 26 26h723c1.5 0 3-0.1 4.4-0.4 14.2-2.4 23.7-15.9 21.2-30zM204 390h272V182h72v208h272v104H204V390z m468 440V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H416V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H202.8l45.1-260H776l45.1 260H672z"></path>
                                      </svg>
                                      <span>Очистить черновик</span>
                                    </button>
                                    <div className="review-count-display">{contentLength}/1000</div>
                                  </div>
                                </div>
                                
                                {/* Отображение ошибки */}
                                {submitError && (
                                  <div className="review-error-message">{submitError}</div>
                                )}
                                
                                <div className="review-submit-container">
                                  <div className="review-score-display">
                                    <span className={`review-score-value ${totalScore === 100 ? 'perfect-score' : ''}`}>{totalScore}</span>
                                    <span className="review-score-max">/ 100</span>
                                  </div>
                                  <button 
                                    className={`review-submit-button ${totalScore === 100 ? 'perfect-score' : ''}`} 
                                    type="button" 
                                    aria-haspopup="dialog" 
                                    aria-expanded="false" 
                                    aria-controls="radix-:rq:" 
                                    data-state="closed"
                                    onClick={handleSubmitReview}
                                    disabled={isSubmitting}
                                  >
                                                                      {isSubmitting ? (
                                    <LoadingSpinner size="small" />
                                  ) : (
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="review-submit-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div 
                      data-state={tabState === 'score-review-form' ? 'active' : 'inactive'} 
                      data-orientation="vertical" 
                      role="tabpanel" 
                      aria-labelledby="radix-:rh:-trigger-score-review-form" 
                      id="radix-:rh:-content-score-review-form" 
                      tabIndex="0" 
                      className="review-tabpanel"
                      style={{ display: tabState === 'score-review-form' ? 'block' : 'none' }}
                    >
                      <form action="">
                        <div className="review-form-card">
                          <div className="review-form-content">
                            <div className="review-form-inner">
                              <div className="review-ratings-grid">
                                <div className="review-ratings-text">
                                  <div className="rating-item">
                                    <div className="rating-header">
                                      <div className="rating-label">Рифмы / Образы</div>
                                      <div className="rating-value">{rhymeImagery}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={rhymeImagery}
                                      onChange={(e) => {
                                        setRhymeImagery(parseInt(e.target.value));
                                        updateSliderFill(e);
                                      }}
                                      className="rating-slider"
                                    />
                                  </div>
                                  <div className="rating-item">
                                    <div className="rating-header">
                                      <div className="rating-label">Структура / Ритмика</div>
                                      <div className="rating-value">{structureRhythm}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={structureRhythm}
                                      onChange={(e) => {
                                        setStructureRhythm(parseInt(e.target.value));
                                        updateSliderFill(e);
                                      }}
                                      className="rating-slider"
                                    />
                                  </div>
                                  <div className="rating-item">
                                    <div className="rating-header">
                                      <div className="rating-label">Реализация стиля</div>
                                      <div className="rating-value">{styleExecution}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={styleExecution}
                                      onChange={(e) => {
                                        setStyleExecution(parseInt(e.target.value));
                                        updateSliderFill(e);
                                      }}
                                      className="rating-slider"
                                    />
                                  </div>
                                  <div className="rating-item">
                                    <div className="rating-header">
                                      <div className="rating-label">Индивидуальность / Харизма</div>
                                      <div className="rating-value">{individuality}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={individuality}
                                      onChange={(e) => {
                                        setIndividuality(parseInt(e.target.value));
                                        updateSliderFill(e);
                                      }}
                                      className="rating-slider"
                                    />
                                  </div>
                                </div>
                                <div className="review-ratings-vibe">
                                  <div className="rating-item">
                                    <div className="rating-header">
                                      <div className="rating-label">Атмосфера / Вайб</div>
                                      <div className="rating-value">{vibe}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={vibe}
                                      onChange={(e) => {
                                        setVibe(parseInt(e.target.value));
                                        updateSliderFill(e);
                                      }}
                                      className="rating-slider"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Отображение ошибки */}
                              {submitError && (
                                <div className="review-error-message">{submitError}</div>
                              )}
                              
                              <div className="review-submit-container">
                                <div className="review-score-display">
                                  <span className={`review-score-value ${totalScore === 100 ? 'perfect-score' : ''}`}>{totalScore}</span>
                                  <span className="review-score-max">/ 100</span>
                                </div>
                                <button 
                                  className={`review-submit-button ${totalScore === 100 ? 'perfect-score' : ''}`} 
                                  type="button" 
                                  aria-haspopup="dialog" 
                                  aria-expanded="false" 
                                  aria-controls="radix-:rq:" 
                                  data-state="closed"
                                  onClick={handleSubmitReview}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <LoadingSpinner size="small" />
                                  ) : (
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="review-submit-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ) : (!user && (
              <div className="review-auth-container">
                <div className="review-auth-box">
                  <div className="review-auth-message">Чтобы оставить рецензию, необходимо авторизоваться</div>
                  <button onClick={handleOpenLoginModal} className="review-auth-button">
                    Войти
                  </button>
                </div>
              </div>
            ))}

            {/* Секция с рецензиями пользователей */}
            <section className="reviews-section">
              <div className="reviews-header">
                                 <div className="reviews-title-container">
                   <div className="reviews-title">Рецензии пользователей</div>
                   <div className="reviews-count-badge">{totalReviews}</div>
                 </div>
                <div className="reviews-sort-container">
                  <div className="reviews-sort-card">
                    <div className="reviews-sort-content">
                      <div className="reviews-sort-label">Сортировать по:</div>
                      <div className="reviews-sort-dropdown">
                        <button 
                          type="button" 
                          className="reviews-sort-button"
                          onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                        >
                          <span>{getSortText(sortBy)}</span>
                          <svg className="reviews-sort-chevron" viewBox="0 0 24 24" width="24" height="24">
                            <path d="m6 9 6 6 6-6"></path>
                          </svg>
                        </button>
                        {sortDropdownOpen && (
                          <div className="reviews-sort-options">
                            <div 
                              className="reviews-sort-option"
                              onClick={() => handleSortChange('newest')}
                            >
                              Новые
                            </div>
                            <div 
                              className="reviews-sort-option"
                              onClick={() => handleSortChange('oldest')}
                            >
                              Старые
                            </div>
                            <div 
                              className="reviews-sort-option"
                              onClick={() => handleSortChange('popular')}
                            >
                              Популярные
                            </div>
                            <div 
                              className="reviews-sort-option"
                              onClick={() => handleSortChange('top_rated')}
                            >
                              Высоко оцененные
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                            <ReviewsList />
                            
                            {/* Пагинация */}
                            {renderPagination()}
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

      {/* Модальное окно критериев оценки */}
      {criteriaModalOpen && (
        <div className="criteria-modal-overlay bg-black bg-opacity-50 p-4">
          <div 
            className="relative w-full max-h-[80vh] overflow-y-auto"
            style={{
              maxWidth: '600px',
              borderRadius: '16px',
              backgroundColor: '#121212',
              backgroundImage: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
              color: '#ffffff'
            }}
          >
            {/* Крестик закрытия */}
            <div 
              style={{
                position: 'absolute', 
                right: '12px', 
                top: '12px', 
                zIndex: 10,
                cursor: 'pointer',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}
              className="hover:bg-white hover:bg-opacity-10 transition-colors"
              onClick={() => setCriteriaModalOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 6L18 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            <div style={{ padding: '20px 24px 24px 24px' }}>
              {/* Заголовок */}
              <h2 
                style={{ 
                  textAlign: 'center', 
                  marginBottom: '20px', 
                  fontWeight: 600, 
                  color: '#fff',
                  textShadow: '0px 2px 4px rgba(0,0,0,0.3)',
                  fontSize: '1.25rem'
                }}
              >
                Критерии оценки
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="text-white">
                <div>
                  <h3 
                    style={{ 
                      fontSize: '1rem',
                      fontWeight: 600, 
                      marginBottom: '16px', 
                      color: '#4dabf5',
                      textAlign: 'center'
                    }}
                  >
                    Параметры оценки
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div 
                      style={{
                        borderLeft: '3px solid #4dabf5',
                        paddingLeft: '12px',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
                        Рифма и образность (1-10 баллов)
                      </h4>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: '1.4', margin: 0 }}>
                        Качество рифм, их разнообразие, использование метафор, сравнений и других художественных приемов.
                      </p>
                    </div>
                    
                    <div 
                      style={{
                        borderLeft: '3px solid #10b981',
                        paddingLeft: '12px',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
                        Структура и ритм (1-10 баллов)
                      </h4>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: '1.4', margin: 0 }}>
                        Построение композиции трека, логичность изложения, соблюдение ритмической структуры.
                      </p>
                    </div>
                    
                    <div 
                      style={{
                        borderLeft: '3px solid #8b5cf6',
                        paddingLeft: '12px',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
                        Стиль и исполнение (1-10 баллов)
                      </h4>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: '1.4', margin: 0 }}>
                        Подача материала, техника исполнения, соответствие стилю жанра.
                      </p>
                    </div>
                    
                    <div 
                      style={{
                        borderLeft: '3px solid #f59e0b',
                        paddingLeft: '12px',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
                        Индивидуальность (1-10 баллов)
                      </h4>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: '1.4', margin: 0 }}>
                        Уникальность подхода, оригинальность идей, узнаваемость стиля автора.
                      </p>
                    </div>
                    
                    <div 
                      style={{
                        borderLeft: '3px solid #10b981',
                        paddingLeft: '12px',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
                        Вайб (1-10 баллов)
                      </h4>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: '1.4', margin: 0 }}>
                        Общее впечатление от трека, эмоциональное воздействие, атмосфера.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
                  <h3 
                    style={{ 
                      fontSize: '1rem',
                      fontWeight: 600, 
                      marginBottom: '12px', 
                      color: '#4dabf5',
                      textAlign: 'center'
                    }}
                  >
                    Формула вычисления
                  </h3>
                  <div 
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px', fontWeight: 600, textAlign: 'center', fontSize: '13px' }}>
                      (Рифма + Структура + Стиль + Индивидуальность) × (1 + Вайб/10 × 1.5)
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0, textAlign: 'center' }}>
                      Максимум: 100 баллов. Вайб работает как мультипликатор.
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <button 
                  onClick={() => setCriteriaModalOpen(false)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#000',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
                  }}
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для просмотра обложки */}
      {coverModalOpen && (
        <div 
          className="criteria-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setCoverModalOpen(false)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              className="hover:bg-white hover:bg-opacity-20 transition-colors"
              onClick={() => setCoverModalOpen(false)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Обложка */}
            <img 
              alt={release?.title || 'Обложка релиза'} 
              src={release?.coverUrl}
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.7)'
              }} 
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ReleasePage; 