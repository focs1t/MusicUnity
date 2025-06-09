import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { reviewApi } from '../shared/api/review';
import { likeApi } from '../shared/api/like';
import { userApi } from '../shared/api/user';
import { useAuth } from '../app/providers/AuthProvider';
import './ReviewsPage.css'; // Импорт CSS

// Импорт иконок
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const REVIEWS_PER_PAGE = 1;

// Встроенный плейсхолдер в формате data URI для аватара
const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';

// Встроенный плейсхолдер в формате data URI для обложки релиза
const DEFAULT_COVER_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyMjIyMjIiLz48cGF0aCBkPSJNNzAgODBIMTMwVjEyMEg3MFY4MFoiIGZpbGw9IiM0NDQ0NDQiLz48cGF0aCBkPSJNNTAgMTUwSDE1MFYxNjBINTBWMTUwWiIgZmlsbD0iIzQ0NDQ0NCIvPjwvc3ZnPg==';

// Получение текущего ID пользователя из разных источников данных
const getCurrentUserId = () => {
  try {
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
    console.log('Все ключи в localStorage:', allKeys);
    
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
    
    // Пытаемся получить данные из всех возможных ключей
    const possibleUserKeys = ['userData', 'user', 'userInfo', 'currentUser', 'auth', 'authUser'];
    for (const key of possibleUserKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const data = JSON.parse(value);
          console.log(`Найдены данные пользователя в ключе "${key}":`, data);
          if (data && (data.id || data.userId || data.user_id)) {
            return data.id || data.userId || data.user_id;
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
          return sessionUser.id || sessionUser.userId;
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
        return parseInt(value, 10);
      }
    }
    
    // Проверяем глобальные переменные
    if (window.user && (window.user.id || window.user.userId)) {
      return window.user.id || window.user.userId;
    }
    
    // Проверяем, может быть ID передается в URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('userId') || urlParams.get('user_id');
    if (urlUserId) {
      console.log('ID пользователя найден в параметрах URL:', urlUserId);
      return parseInt(urlUserId, 10);
    }
    
    console.warn('Не удалось получить ID пользователя из доступных источников');
    
    // Для отладки: используем временный хардкодированный ID пользователя
    console.log('ВНИМАНИЕ: Возвращаем временный ID пользователя для отладки!');
    return 1; // Временное решение для тестирования
  } catch (error) {
    console.error('Ошибка при получении ID пользователя:', error);
    return 0;
  }
};

// Компонент карточки рецензии
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

  // Безопасное получение данных трека или релиза
  const getTrackData = () => {
    const trackData = review.track || review.release || {};
    return {
      id: trackData.id || trackData.releaseId || trackData.trackId || 0,
      title: trackData.title || "Трек",
      cover: trackData.cover || trackData.coverUrl || DEFAULT_COVER_PLACEHOLDER
    };
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

  // Получаем данные для отображения
  const user = {
    id: getUserId(),
    name: getUserName(),
    avatar: getAvatarUrl(),
    rank: getUserRank()
  };
  
  const track = getTrackData();
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

  // Строим карточку рецензии с использованием React.createElement вместо JSX
  return React.createElement('div', {
    key: review.id,
    className: 'bg-zinc-900 relative overflow-hidden review-wrapper p-1.5 lg:p-[5px] flex flex-col mx-auto border border-zinc-800 rounded-[15px] lg:rounded-[20px] w-full'
  }, [
    // Верхняя часть с информацией о пользователе и рейтинге
    React.createElement('div', { className: 'relative', key: 'header' }, 
      React.createElement('div', { className: 'bg-zinc-950/70 px-2 lg:px-2 py-2 rounded-[12px] flex gap-3' }, [
        // Блок с аватаром и информацией о пользователе
        React.createElement('div', { className: 'flex items-start space-x-2 lg:space-x-3 w-full', key: 'user-info' }, [
          React.createElement(Link, { 
            className: 'relative', 
            to: `/profile/${user.id}`,
            key: 'user-avatar-link'
          }, 
            React.createElement('img', {
              alt: user.name,
              src: user.avatar,
              className: 'shrink-0 size-[40px] lg:size-[40px] border border-white/10 rounded-full',
              loading: 'lazy',
              width: '40',
              height: '40',
              decoding: 'async',
              onError: (e) => handleImageError(e, DEFAULT_AVATAR_PLACEHOLDER)
            })
          ),
          React.createElement('div', { className: 'flex flex-col gap-1 items-start', key: 'user-details' }, [
            React.createElement('div', { 
              className: 'flex items-center gap-1 md:gap-2 max-sm:flex-wrap',
              key: 'user-name-container'
            }, 
              React.createElement(Link, {
                className: 'text-base lg:text-xl font-semibold leading-[18px] block items-center max-w-[170px] text-ellipsis whitespace-nowrap overflow-hidden text-white no-underline',
                to: `/profile/${user.id}`
              }, user.name)
            ),
            user.rank && React.createElement('div', { 
              className: 'text-[12px] flex items-center space-x-1.5',
              key: 'user-rank'
            }, 
              React.createElement('div', {
                className: 'inline-flex items-center text-center bg-red-500 rounded-full font-semibold px-1.5'
              }, `ТОП-${user.rank}`)
            )
          ])
        ]),

        // Блок с рейтингом и обложкой трека
        React.createElement('div', { className: 'flex items-center justify-end gap-2 lg:gap-4', key: 'rating-cover' }, [
          React.createElement('div', { className: 'text-right flex flex-col h-full justify-center', key: 'rating' }, [
            React.createElement('div', { 
              className: `text-[20px] lg:text-[24px] font-bold leading-[100%] lg:mt-1 !no-underline border-0 no-callout select-none text-right ${rating.total === 100 ? 'text-golden' : ''}`,
              key: 'total-rating'
            }, 
              React.createElement('span', { className: 'no-callout' }, rating.total)
            ),
            React.createElement('div', { className: 'flex gap-x-1.5 font-bold text-xs lg:text-sm justify-end', key: 'component-ratings' }, 
              rating.components.map((score, index) => 
                React.createElement('div', {
                  key: `rating-${index}`,
                  className: `no-callout ${index === 4 ? 'text-ratingVibe' : 'text-userColor'}`,
                  'data-state': 'closed'
                }, score)
              )
            )
          ]),
          React.createElement(Link, {
            className: 'shrink-0 size-10 lg:size-10 block',
            'data-state': 'closed',
            to: `/releases/${track.id}`,
            key: 'track-cover-link'
          }, 
            React.createElement('img', {
              alt: track.title,
              src: track.cover,
              className: 'rounded-md w-full h-full object-cover',
              loading: 'lazy',
              width: '40',
              height: '40',
              decoding: 'async',
              onError: (e) => handleImageError(e, DEFAULT_COVER_PLACEHOLDER)
            })
          )
        ])
      ])
    ),

    // Содержимое рецензии
    React.createElement('div', { key: 'content' }, [
      React.createElement('div', { 
        className: 'max-h-[120px] overflow-hidden relative transition-all duration-300 mb-4 px-1.5 block',
        key: 'review-text'
      }, [
        React.createElement('div', { className: 'text-base lg:text-lg mt-3 mb-2 font-semibold', key: 'review-title' }, review.title),
        React.createElement('div', { className: 'mt-2 tracking-[-0.2px] font-light', key: 'review-content-wrapper' }, 
          React.createElement('div', { className: 'prose prose-invert text-[15px] text-white lg:text-base lg:leading-[150%]' }, 
            review.content && review.content.length > 100 ? review.content.substring(0, 100) + '...' : (review.content || 'Нет содержания')
          )
        )
      ]),

      // Нижняя часть с лайками и ссылкой на полную рецензию
      React.createElement('div', { className: 'mt-auto flex justify-between items-center relative pr-1.5', key: 'actions' }, [
        React.createElement('div', { className: 'flex gap-2 items-center', key: 'likes-container' }, [
          React.createElement('button', {
            className: `review-like-button justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border group bg-white/5 max-lg:h-8 cursor-pointer flex items-center rounded-full gap-x-1 lg:gap-x-1.5`,
            onClick: () => isOwnReview ? handleOwnReviewLikeClick() : onLikeToggle && onLikeToggle(review.id || review.reviewId)
          }, [
            React.createElement('div', { className: 'w-6 h-6 lg:w-6 lg:h-6 flex items-center justify-center', key: 'like-icon' }, 
              isLiked 
              ? React.createElement(FavoriteIcon, { style: { color: '#FF5252', fontSize: '22px' } }) 
              : React.createElement(FavoriteBorderIcon, { style: { color: '#AAAAAA', fontSize: '22px' } })
            ),
            React.createElement('span', { className: 'font-bold text-base lg:text-base', key: 'likes-count' }, 
              review.likesCount !== undefined ? review.likesCount : 0
            )
          ]),
          
          // Всплывающее сообщение
          showMessage && React.createElement('div', { 
            className: 'tooltip-message',
            key: 'message'
          }, 'Нельзя лайкать свои рецензии')
        ]),
        React.createElement('div', { className: 'relative flex items-center gap-x-0.5', key: 'link-container' }, 
          React.createElement(Link, {
            className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground size-8 md:size-10 bg-transparent hover:bg-white/10',
            'data-state': 'closed',
            to: `/reviews/${review.id || review.reviewId}`
          }, 
            React.createElement(OpenInNewIcon, { 
              className: 'size-6 text-zinc-400 stroke-white fill-zinc-400'
            })
          )
        )
      ])
    ])
  ]);
};

// Форматирование данных с API для отображения
const formatReview = (review) => {
  if (!review) {
    console.error('Ошибка форматирования: review не определен');
    return null;
  }

  return {
    id: review.id || review.reviewId || 0,
    reviewId: review.id || review.reviewId || 0,
    userId: review.userId || (review.user && review.user.id) || 0,
    user: review.user || review.author || null,
    track: review.track || review.release || null,
    releaseId: review.releaseId || (review.release && review.release.id) || 0,
    title: review.title || 'Рецензия',
    content: review.content || '',
    rhymeImagery: review.rhymeImagery || 0,
    structureRhythm: review.structureRhythm || 0,
    styleExecution: review.styleExecution || 0,
    individuality: review.individuality || 0,
    vibe: review.vibe || 0,
    totalScore: review.totalScore || review.totalRating || null,
    likesCount: review.likesCount || review.likes || 0,
    createdAt: review.createdAt || new Date().toISOString()
  };
};

// Основной компонент страницы рецензий
const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOption, setSortOption] = useState('newest');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [likesLoading, setLikesLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth(); // Получаем данные авторизации через хук useAuth
  
  // Получаем ID пользователя из разных источников
  const getCurrentUserIdInComponent = () => {
    // Сначала проверяем данные из хука useAuth
    if (auth && auth.user) {
      const authUserId = auth.user.id || auth.user.userId;
      if (authUserId) {
        console.log('ID пользователя из useAuth:', authUserId);
        return authUserId;
      }
    }
    
    // Если нет данных из useAuth, используем функцию для поиска в других источниках
    return getCurrentUserId();
  };
  
  // Получаем ID пользователя при каждом рендере, чтобы гарантировать актуальность
  const currentUserId = getCurrentUserIdInComponent();
  console.log('ReviewsPage инициализация, текущий ID пользователя:', currentUserId);
  
  // Выводим данные авторизации из контекста
  useEffect(() => {
    if (auth) {
      console.log('Данные из useAuth:', auth);
      if (auth.user) {
        console.log('Пользователь из useAuth:', auth.user);
        
        // Если у нас есть пользователь из useAuth, используем его ID
        if (auth.user.id || auth.user.userId) {
          console.log('ID пользователя из useAuth:', auth.user.id || auth.user.userId);
        }
      }
    }
  }, [auth]);
  
  // Получение номера страницы из URL при загрузке
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pageParam = queryParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    }
  }, [location.search]);

  // Загрузка данных лайкнутых рецензий
  const fetchLikedReviewsByCurrentUser = async () => {
    const userId = getCurrentUserId();
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
        console.log('Используем тестовые данные для отображения');
        
        // Используем тестовые данные, если API недоступен
        // В реальном приложении этого кода не должно быть - только для отладки!
        const testLikedIds = new Set([1, 4, 7]); // Пример лайкнутых рецензий
        console.log('Тестовые данные лайков:', Array.from(testLikedIds));
        return testLikedIds;
      }
      
      return new Set();
    } catch (error) {
      console.error('Ошибка при загрузке лайкнутых рецензий:', error);
      return new Set();
    }
  };

  // Обновление количества лайков для рецензий
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

  // Загрузка данных из API
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      
      try {
        // Сначала получаем актуальный ID пользователя
        const userId = getCurrentUserId();
        console.log('fetchReviews: currentUserId =', userId);
        
        // Параллельно загружаем рецензии и лайкнутые рецензии для повышения производительности
        const [reviewsResponse, likedReviewsSet] = await Promise.all([
          reviewApi.getAllReviews(currentPage - 1, REVIEWS_PER_PAGE, sortOption),
          userId ? fetchLikedReviewsByCurrentUser() : new Set()
        ]);
        
        console.log('Ответ API рецензий:', reviewsResponse);
        console.log('totalPages из API:', reviewsResponse.totalPages);
        console.log('totalElements из API:', reviewsResponse.totalElements);
        setLikedReviews(likedReviewsSet);
        
        if (reviewsResponse && reviewsResponse.content) {
          // Преобразуем данные API в нужный формат
          const formattedReviews = reviewsResponse.content
            .map(review => formatReview(review))
            .filter(review => review !== null); // Фильтруем null значения
          
          // Обновляем количество лайков для каждой рецензии
          const reviewsWithLikes = await updateReviewsLikes(formattedReviews);
          
          setReviews(reviewsWithLikes);
          const totalPagesFromApi = reviewsResponse.totalPages || 1;
          console.log('Устанавливаем totalPages:', totalPagesFromApi);
          setTotalPages(totalPagesFromApi);
        } else {
          console.warn('Ответ API не содержит данных рецензий');
          throw new Error('Некорректные данные от API');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки рецензий:', err);
        setError('Не удалось загрузить рецензии. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage, sortOption]);

  // Проверка, лайкнута ли рецензия
  const isReviewLiked = (reviewId) => {
    console.log(`Проверка лайка для рецензии ${reviewId}, likedReviews:`, Array.from(likedReviews));
    return likedReviews.has(reviewId);
  };

  // Обработка лайка/дизлайка
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

  // Проверяет, лайкнута ли рецензия текущим пользователем (через API)
  const isReviewCurrentlyLiked = async (reviewId) => {
    const userId = getCurrentUserIdInComponent();
    if (!userId) return false;
    
    try {
      const likes = await likeApi.getLikesByReview(reviewId);
      return likes.some(like => like.userId === userId);
    } catch (error) {
      console.error(`Ошибка при проверке лайка для рецензии ${reviewId}:`, error);
      return false;
    }
  };

  // Обработка пагинации
  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`/reviews?page=${page}`);
    window.scrollTo(0, 0);
  };

  // Обработка выбора сортировки
  const handleSortChange = (option) => {
    setSortOption(option);
    setSortDropdownOpen(false);
    
    if (currentPage !== 1) {
      setCurrentPage(1);
      navigate('/reviews?page=1');
    }
  };

  // Создание элементов пагинации с новыми CSS классами
  const renderPaginationButtons = () => {
    console.log('renderPaginationButtons вызван. currentPage:', currentPage, 'totalPages:', totalPages);
    const buttons = [];
    const maxVisiblePages = 5;
    
    // Определяем диапазон видимых страниц
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Корректируем начальную страницу если диапазон слишком мал
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    console.log('Пагинация: startPage =', startPage, 'endPage =', endPage);

    // Добавляем кнопку "Предыдущая" если не на первой странице
    if (currentPage > 1) {
      buttons.push(
        React.createElement('li', { key: 'prev' }, 
          React.createElement(Link, {
            to: `/reviews?page=${currentPage - 1}`,
            'aria-label': 'Перейти на предыдущую страницу',
            className: 'pagination-button prev-next',
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }
          }, [
            React.createElement('svg', {
              key: 'prev-icon',
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }, React.createElement('path', { d: 'm15 18-6-6 6-6' })),
            React.createElement('span', {
              key: 'prev-text',
              className: 'prev-next-text'
            }, 'Предыдущая')
          ])
        )
      );
    }
    
    // Показываем страницы в диапазоне (обновлено)
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        React.createElement('li', { key: i }, 
          React.createElement(Link, {
            to: `/reviews?page=${i}`,
            className: `pagination-button ${i === currentPage ? 'active' : ''}`,
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(i);
            }
          }, i.toString())
        )
      );
    }

    // Добавляем кнопку "Следующая" если не на последней странице
    if (currentPage < totalPages) {
      buttons.push(
        React.createElement('li', { key: 'next' }, 
          React.createElement(Link, {
            to: `/reviews?page=${currentPage + 1}`,
            'aria-label': 'Перейти на следующую страницу',
            className: 'pagination-button prev-next',
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }
          }, [
            React.createElement('span', {
              key: 'next-text',
              className: 'prev-next-text'
            }, 'Следующая'),
            React.createElement('svg', {
              key: 'next-icon',
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }, React.createElement('path', { d: 'm9 18 6-6-6-6' }))
          ])
        )
      );
    }

    console.log('Пагинация: сгенерировано кнопок:', buttons.length);
    return buttons;
  };

  // Рендер сортировки
  const renderSortDropdown = () => {
    return React.createElement('div', {
      className: 'rounded-lg border text-card-foreground shadow-sm p-3 bg-zinc-900'
    }, 
      React.createElement('div', { className: 'md:flex md:items-center gap-4' }, 
        React.createElement('div', { className: 'flex items-center gap-4' }, [
          React.createElement('div', {
            className: 'max-md:hidden font-bold text-muted-foreground max-md:mb-3 max-md:text-sm',
            key: 'sort-label'
          }, 'Сортировать по:'),
          React.createElement('div', { className: 'relative', key: 'sort-dropdown' }, [
            React.createElement('button', {
              type: 'button',
              role: 'combobox',
              'aria-expanded': sortDropdownOpen,
              onClick: () => setSortDropdownOpen(!sortDropdownOpen),
              className: 'flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-[150px] md:w-[260px]',
              key: 'sort-button'
            }, [
              React.createElement('span', {
                style: { pointerEvents: 'none' },
                key: 'sort-text'
              }, 
                sortOption === 'newest' ? 'Новые' :
                sortOption === 'oldest' ? 'Старые' :
                sortOption === 'popular' ? 'Популярные' : 'Высший рейтинг'
              ),
              React.createElement(ChevronDownIcon, {
                className: 'h-4 w-4 opacity-50',
                key: 'sort-icon'
              })
            ]),
            
            sortDropdownOpen && React.createElement('div', {
              className: 'absolute z-10 mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 shadow-lg',
              key: 'sort-options'
            }, 
              React.createElement('ul', { className: 'py-1' }, [
                React.createElement('li', {
                  className: 'px-3 py-2 text-sm hover:bg-zinc-700 cursor-pointer',
                  onClick: () => handleSortChange('newest'),
                  key: 'sort-newest'
                }, 'Новые'),
                React.createElement('li', {
                  className: 'px-3 py-2 text-sm hover:bg-zinc-700 cursor-pointer',
                  onClick: () => handleSortChange('oldest'),
                  key: 'sort-oldest'
                }, 'Старые'),
                React.createElement('li', {
                  className: 'px-3 py-2 text-sm hover:bg-zinc-700 cursor-pointer',
                  onClick: () => handleSortChange('popular'),
                  key: 'sort-popular'
                }, 'Популярные'),
                React.createElement('li', {
                  className: 'px-3 py-2 text-sm hover:bg-zinc-700 cursor-pointer',
                  onClick: () => handleSortChange('top_rated'),
                  key: 'sort-top'
                }, 'Высший рейтинг')
              ])
            )
          ])
        ])
      )
    );
  };

  // Основной метод рендеринга
  return React.createElement('div', {
    className: 'site-content min-[1024px]:max-[1500px]:px-6 mb-[30px] lg:mb-[80px] mt-[20px] lg:mt-[30px]'
  }, 
    React.createElement('main', {}, 
      React.createElement('div', { className: 'container' }, [
        // Заголовок
        React.createElement('h1', {
          className: 'text-lg md:text-xl lg:text-3xl font-bold mb-4 lg:mb-8',
          key: 'page-title'
        }, 'Рецензии и оценки'),
        
        // Сортировка
        renderSortDropdown(),
        
        // Ошибка загрузки
        error && React.createElement('div', {
          className: 'my-5 p-4 bg-red-500/20 border border-red-500 rounded-lg text-center',
          key: 'error-message'
        }, error),
        
        // Индикатор загрузки
        loading && React.createElement('div', {
          className: 'flex justify-center my-10',
          key: 'loading-spinner'
        }, 
          React.createElement('div', {
            className: 'w-8 h-8 border-4 border-zinc-600 border-t-white rounded-full animate-spin'
          })
        ),
        
        // Рецензии
        !loading && !error && React.createElement('section', {
          className: 'gap-3 xl:gap-5 grid md:grid-cols-2 xl:grid-cols-3 mt-5 lg:mt-10 items-start',
          key: 'reviews-grid'
        }, 
          reviews.slice(0, REVIEWS_PER_PAGE).map(review => {
            return React.createElement(ReviewCard, {
              key: review.id || review.reviewId,
              review: review,
              isLiked: isReviewLiked(review.id || review.reviewId),
              onLikeToggle: handleLikeToggle
            });
          })
        ),
        
        // Пагинация
        !loading && !error && totalPages > 1 && React.createElement('div', {
          className: 'pagination-container',
          key: 'pagination'
        }, 
          React.createElement('nav', {
            role: 'navigation',
            'aria-label': 'pagination',
            className: 'pagination-nav'
          }, 
            React.createElement('ul', {
              className: 'pagination-list'
            }, renderPaginationButtons())
          )
        )
      ])
    )
  );
};

export default ReviewsPage; 