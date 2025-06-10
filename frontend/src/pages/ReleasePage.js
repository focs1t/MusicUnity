import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { releaseApi } from '../shared/api/release';
import { reviewApi } from '../shared/api/review';
import { likeApi } from '../shared/api/like';
import { userApi } from '../shared/api/user';
import { useAuth } from '../app/providers/AuthProvider';
import './ReleasePage.css';

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
const DEFAULT_AVATAR_PLACEHOLDER = '/path/to/default-avatar.png';
const DEFAULT_COVER_PLACEHOLDER = '/path/to/default-cover.png';

// Компонент карточки рецензии (как в ReviewsPage)
const ReviewCard = ({ review, isLiked, onLikeToggle }) => {
  // Функция для обработки ошибок изображений
  const handleImageError = (e, placeholder) => {
    console.log('Ошибка загрузки изображения, использую placeholder');
    console.log(`Проблемный URL: ${e.target.src}`);
    e.target.onerror = null;
    e.target.src = placeholder;
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
                <span className="no-callout">{rating.total}</span>
              </div>
              <div className="flex gap-x-1.5 font-bold text-xs lg:text-sm justify-end">
                {rating.components.map((score, index) => (
                  <div
                    key={`rating-${index}`}
                    className={`no-callout ${index === 4 ? 'text-ratingVibe' : 'text-userColor'}`}
                    data-state="closed"
                  >
                    {score}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Содержимое рецензии */}
      <div>
        <div className="max-h-[120px] overflow-hidden relative transition-all duration-300 mb-4 px-1.5 block">
          {review.title && <div className="text-base lg:text-lg mt-3 mb-2 font-semibold">{review.title}</div>}
          <div className="mt-2 tracking-[-0.2px] font-light">
            <div className="prose prose-invert text-[15px] text-white lg:text-base lg:leading-[150%]">
              {review.content && review.content.length > 100 
                ? review.content.substring(0, 100) + '...' 
                : (review.content || 'Нет содержания')
              }
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
            
            {/* Всплывающее сообщение */}
            {showMessage && (
              <div className="tooltip-message">
                Нельзя лайкать свои рецензии
              </div>
            )}
          </div>
          <div className="review-date text-xs text-zinc-400">
            {formatDate(review.createdAt)}
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
  const { user, isAuth } = useAuth();
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inFavorites, setInFavorites] = useState(false);
  
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
  const [pageSize] = useState(1); // Количество рецензий на странице (для тестирования)
  
  // Состояния для лайков
  const [likedReviews, setLikedReviews] = useState(new Set());
  
  // Состояние для отображения сообщения о собственной рецензии

  
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
    if (!isAuth || !user || !user.id) {
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
    if (!userId) return new Set();
    
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
          console.log(`Получено ${likedIds.size} лайкнутых рецензий:`, Array.from(likedIds));
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
        setLoading(true);
        const data = await releaseApi.getReleaseById(id);
        console.log('Данные релиза:', JSON.stringify(data, null, 2));
        setRelease(data);
        // Временная заглушка для статуса избранного
        setInFavorites(data.favoritesCount > 0);
      } catch (err) {
        setError('Не удалось загрузить релиз');
        console.error('Ошибка загрузки релиза:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelease();
    fetchReviews();
  }, [id]);

  // Перезагружаем рецензии при изменении сортировки или страницы
  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [sortBy, currentPage]);

  const handleToggleFavorite = async () => {
    if (!release) return;
    
    try {
      if (inFavorites) {
        await releaseApi.removeFromFavorites(id);
      } else {
        await releaseApi.addToFavorites(id);
      }
      
      setInFavorites(!inFavorites);
      setRelease(prev => ({
        ...prev,
        favoritesCount: inFavorites 
          ? Math.max(0, prev.favoritesCount - 1) 
          : (prev.favoritesCount || 0) + 1
      }));
    } catch (err) {
      console.error('Ошибка при изменении статуса избранного:', err);
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

  if (loading) {
    return (
      <div className="release-page">
        <div className="site-content">
          <main className="main-container">
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <span>Загрузка...</span>
              </div>
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
    <div className="release-page">
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
                <div className="cover-wrapper" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r3i9:" data-state="closed">
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
                    <div className="rating-pill rating-critic" data-state="closed">
                      <span className="rating-value">{criticRating}</span>
                    </div>
                    <div className="rating-pill rating-user" data-state="closed">
                      <span className="rating-value">{userRating}</span>
                    </div>
                  </div>
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
                <button 
                  className="like-button" 
                  data-state="closed"
                  onClick={handleToggleFavorite}
                >
                  <svg 
                    stroke={inFavorites ? "none" : "currentColor"} 
                    fill={inFavorites ? "#ef4444" : "none"} 
                    strokeWidth={inFavorites ? "0" : "2"} 
                    viewBox="0 0 24 24" 
                    style={{ width: '1.5rem', height: '1.5rem' }} 
                    height="1em" 
                    width="1em" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Блок создания рецензии - отображается только для авторизованных пользователей */}
            {isAuth && user ? (
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
                        <div>Будут отклонены рецензии:</div>
                        <ul className="review-alert-list">
                          <li className="review-alert-list-item">с матом</li>
                          <li className="review-alert-list-item">с оскорблениями</li>
                          <li className="review-alert-list-item">с рекламой и ссылками</li>
                          <li className="review-alert-list-item">малосодержательные</li>
                        </ul>
                        <button 
                          className="review-criteria-button" 
                          type="button" 
                          aria-haspopup="dialog" 
                          aria-expanded="false" 
                          aria-controls="radix-:rk:" 
                          data-state="closed"
                        >
                          Критерии оценки
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
                                    placeholder="Текст рецензии (от 300 до 8500 символов)" 
                                    maxLength="9000"
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
                                    <div className="review-count-display">{contentLength}/8500</div>
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
                                      <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
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
                                    <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
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
            ) : (
              <div className="review-auth-container">
                <div className="review-auth-box">
                  <div className="review-auth-message">Чтобы оставить рецензию, необходимо авторизоваться</div>
                  <a href="/login" className="review-auth-button">
                    Войти
                  </a>
                </div>
              </div>
            )}

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
  );
}

export default ReleasePage; 