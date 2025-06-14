import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { reviewApi } from '../shared/api/review';
import { likeApi } from '../shared/api/like';
import { userApi } from '../shared/api/user';
import { useAuth } from '../app/providers/AuthProvider';
import './AuthorLikesPage.css'; // Импорт CSS
import Notification from '../components/Notification';
import { LoadingSpinner } from '../shared/ui/LoadingSpinner';

// Импорт иконок
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const REVIEWS_PER_PAGE = 6;

// Встроенный плейсхолдер в формате data URI для аватара
const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';

// Встроенный плейсхолдер в формате data URI для обложки релиза
const DEFAULT_COVER_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyMjIyMjIiLz48cGF0aCBkPSJNNzAgODBIMTMwVjEyMEg3MFY4MFoiIGZpbGw9IiM0NDQ0NDQiLz48cGF0aCBkPSJNNTAgMTUwSDE1MFYxNjBINTBWMTUwWiIgZmlsbD0iIzQ0NDQ0NCIvPjwvc3ZnPg==';

// Функция для получения текущего ID пользователя из localStorage
const getCurrentUserId = () => {
  try {
    const userDataFromStorage = localStorage.getItem('userData');
    if (userDataFromStorage) {
      const userData = JSON.parse(userDataFromStorage);
      const userId = userData?.id || userData?.userId;
      if (userId) {
        console.log('ID пользователя из localStorage:', userId);
        return parseInt(userId, 10) || null;
      }
    }
  } catch (error) {
    console.error('Ошибка при парсинге userData из localStorage:', error);
  }
  
  // Пытаемся получить из токена
  try {
    const tokenFromStorage = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (tokenFromStorage) {
      const tokenParts = tokenFromStorage.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const userIdFromToken = payload?.userId || payload?.id || payload?.sub;
        if (userIdFromToken) {
          console.log('ID пользователя из токена:', userIdFromToken);
          return parseInt(userIdFromToken, 10) || null;
        }
      }
    }
  } catch (error) {
    console.error('Ошибка при декодинге токена:', error);
  }
  
  console.log('ID пользователя не найден');
  return null;
};

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
    const userId = review.user.id || review.user.userId || review.userId || 0;
    return parseInt(userId, 10) || 0; // Приводим к числу
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
      id: trackData.releaseId || trackData.id || trackData.trackId || review.releaseId || 0,
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
  
  // Приводим оба ID к числу для корректного сравнения
  const reviewAuthorId = parseInt(getUserId(), 10) || 0;
  const currentUserIdNum = parseInt(currentUserId, 10) || 0;
  const isOwnReview = reviewAuthorId === currentUserIdNum && currentUserIdNum !== 0;
  console.log(`Является ли рецензия собственной: ${isOwnReview} (автор: ${reviewAuthorId}, текущий: ${currentUserIdNum})`);
  
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
            }, [
              React.createElement('div', { className: 'author-rating-wrapper' }, [
                React.createElement('span', { className: 'no-callout' }, rating.total),
                React.createElement('div', { className: 'author-hover-menu' }, 
                  React.createElement('div', { className: 'author-hover-content' }, 
                    React.createElement('div', { className: 'author-hover-title' }, 'Общая оценка рецензии')
                  )
                )
              ])
            ]),
            React.createElement('div', { className: 'flex gap-x-1.5 font-bold text-xs lg:text-sm justify-end', key: 'component-ratings' }, 
              rating.components.map((score, index) => {
                const ratingTitles = [
                  'Рифма и образность',
                  'Структура и ритм', 
                  'Стиль и исполнение',
                  'Индивидуальность',
                  'Вайб'
                ];
                
                return React.createElement('div', { className: 'author-rating-wrapper', key: `rating-wrapper-${index}` }, [
                  React.createElement('div', {
                    key: `rating-${index}`,
                    className: `no-callout ${index === 4 ? 'text-ratingVibe' : 'text-userColor'}`,
                    'data-state': 'closed'
                  }, score),
                  React.createElement('div', { className: 'author-hover-menu' }, 
                    React.createElement('div', { className: 'author-hover-content' }, 
                      React.createElement('div', { className: 'author-hover-title' }, ratingTitles[index])
                    )
                  )
                ]);
              })
            )
          ]),
          React.createElement('div', { className: 'author-rating-wrapper', key: 'track-cover-wrapper' }, [
            React.createElement(Link, {
              className: 'shrink-0 size-10 lg:size-10 block',
              'data-state': 'closed',
              to: `/release/${track.id}`,
              key: 'track-cover-link',
              style: { width: '40px', height: '40px', overflow: 'hidden', display: 'block', flexShrink: 0 }
            }, 
              React.createElement('img', {
                alt: track.title,
                src: track.cover,
                className: 'rounded-md w-full h-full object-cover',
                loading: 'lazy',
                width: '40',
                height: '40',
                decoding: 'async',
                style: { width: '40px', height: '40px', objectFit: 'cover', objectPosition: 'center', display: 'block' },
                onError: (e) => handleImageError(e, DEFAULT_COVER_PLACEHOLDER)
              })
            ),
            React.createElement('div', { className: 'author-hover-menu' }, 
              React.createElement('div', { className: 'author-hover-content' }, 
                React.createElement('div', { className: 'author-hover-title' }, track.title)
              )
            )
          ])
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
          
          // Авторские лайки отдельно от кнопки
          authorLikes.length > 0 && React.createElement('div', { 
            className: 'author-likes-section ml-3',
            key: 'author-likes-section'
          }, 
            React.createElement('div', { className: 'author-likes-avatars flex items-center gap-1' },
              authorLikes.slice(0, 3).map((authorLike, index) => 
                React.createElement('div', { className: 'author-rating-wrapper', key: `author-like-wrapper-${index}` }, [
                  React.createElement(Link, {
                    to: `/author/${authorLike.author?.authorId || authorLike.author?.id}`,
                    key: `author-like-link-${index}`
                  },
                    React.createElement('img', {
                      src: authorLike.author?.avatar || DEFAULT_AVATAR_PLACEHOLDER,
                      alt: authorLike.author?.username || 'Автор',
                      className: 'w-6 h-6 rounded-full border border-yellow-500',
                      onError: (e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
                      }
                    })
                  ),
                  React.createElement('div', { className: 'author-hover-menu' }, 
                    React.createElement('div', { className: 'author-hover-content' }, 
                      React.createElement('div', { className: 'author-hover-title' }, authorLike.author?.username || 'Автор')
                    )
                  )
                ])
              ),
              authorLikes.length > 3 && React.createElement('span', {
                className: 'text-xs text-yellow-500 ml-1',
                key: 'more-likes'
              }, `+${authorLikes.length - 3}`)
            )
          ),
          
          // Всплывающее сообщение
          showMessage && React.createElement('div', { 
            className: 'tooltip-message',
            key: 'message'
          }, 'Нельзя лайкать свои рецензии')
        ]),
        React.createElement('div', { className: 'relative flex items-center gap-x-0.5', key: 'link-container' }, 
          React.createElement('div', { className: 'author-rating-wrapper' }, [
            React.createElement(Link, {
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground size-8 md:size-10 bg-transparent hover:bg-white/10',
              'data-state': 'closed',
              to: `/reviews/${review.id || review.reviewId}`
            }, 
              React.createElement(OpenInNewIcon, { 
                className: 'size-6 text-zinc-400 stroke-white fill-zinc-400'
              })
            ),
            React.createElement('div', { className: 'author-hover-menu' }, 
              React.createElement('div', { className: 'author-hover-content' }, 
                React.createElement('div', { className: 'author-hover-title' }, 'Перейти к рецензии')
              )
            )
          ])
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

// Основной компонент страницы авторских лайков
const AuthorLikesPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOption, setSortOption] = useState('newest');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [likesLoading, setLikesLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Состояние для авторских лайков
  const [authorLikes, setAuthorLikes] = useState({});
  
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
        return parseInt(authUserId, 10) || null;
      }
    }
    
    // Если нет данных из useAuth, используем функцию для поиска в других источниках
    const userId = getCurrentUserId();
    return userId ? parseInt(userId, 10) || null : null;
  };
  
  // Получаем ID пользователя при каждом рендере, чтобы гарантировать актуальность
  const currentUserId = getCurrentUserIdInComponent();
  console.log('AuthorLikesPage инициализация, текущий ID пользователя:', currentUserId);
  
  // Очищаем состояние лайков при смене пользователя
  useEffect(() => {
    console.log('Смена пользователя обнаружена, очищаем состояние лайков');
    setLikedReviews(new Set());
    setAuthorLikes({});
  }, [currentUserId]);
  
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
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get('page'), 10);
    if (pageFromUrl && pageFromUrl > 0) {
      setCurrentPage(pageFromUrl);
    }
  }, [location.search]);

  // Загрузка данных лайкнутых рецензий
  const fetchLikedReviewsByCurrentUser = async () => {
    const userId = getCurrentUserId();
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
        // Убираем тестовые данные - они могут вызывать путаницу
        return new Set();
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
              authorLikesData[reviewId] = authorLikesForReview;
            }
          }
        })
      );
      
      setAuthorLikes(authorLikesData);
    } catch (error) {
      console.error('Ошибка при загрузке авторских лайков:', error);
    }
  };

  const updateAuthorLikesForReview = async (reviewId) => {
    try {
      const updatedAuthorLikes = await likeApi.getAuthorLikesByReview(reviewId);
      if (updatedAuthorLikes && updatedAuthorLikes.length > 0) {
        setAuthorLikes(prev => ({
          ...prev,
          [reviewId]: updatedAuthorLikes
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

  // Функция сортировки рецензий
  const sortReviews = (reviewsArray, sortOption) => {
    const sorted = [...reviewsArray];
    
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
      
      case 'popular':
        return sorted.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      
      case 'top_rated':
        return sorted.sort((a, b) => {
          // Получаем рейтинг для каждой рецензии
          const getRating = (review) => {
            if (review.totalScore !== undefined && review.totalScore !== null) {
              return review.totalScore;
            }
            
            if (review.rating && review.rating.total) {
              return review.rating.total;
            }
            
            // Вычисляем рейтинг по формуле
            const rhymeImagery = review.rhymeImagery || 0;
            const structureRhythm = review.structureRhythm || 0;
            const styleExecution = review.styleExecution || 0;
            const individuality = review.individuality || 0;
            const vibe = review.vibe || 0;
            
            const baseScore = rhymeImagery + structureRhythm + styleExecution + individuality;
            const vibeMultiplier = 1 + (vibe / 10) * 1.5;
            return Math.round(baseScore * vibeMultiplier);
          };
          
          return getRating(b) - getRating(a);
        });
      
      default:
        return sorted;
    }
  };

  // Загрузка данных из API
  const fetchReviews = async () => {
    setLoading(true);
    
    try {
      // Сначала получаем актуальный ID пользователя
      const userId = getCurrentUserId();
      console.log('fetchReviews: currentUserId =', userId);
      
      // Очищаем старые данные лайков перед загрузкой новых
      setLikedReviews(new Set());
      setAuthorLikes({});
      
      // Параллельно загружаем рецензии с авторскими лайками и лайкнутые рецензии для повышения производительности
      const [reviewsResponse, likedReviewsSet] = await Promise.all([
        likeApi.getAllReviewsWithAuthorLikes(currentPage - 1, REVIEWS_PER_PAGE),
        userId ? fetchLikedReviewsByCurrentUser() : new Set()
      ]);
      
      console.log('Ответ API рецензий с авторскими лайками:', reviewsResponse);
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
        
        // Загружаем авторские лайки для всех рецензий
        await fetchAuthorLikes(reviewsWithLikes);
        
        // Применяем сортировку
        const sortedReviews = sortReviews(reviewsWithLikes, sortOption);
        
        setReviews(sortedReviews);
        const totalPagesFromApi = reviewsResponse.totalPages || 1;
        console.log('Устанавливаем totalPages:', totalPagesFromApi);
        setTotalPages(totalPagesFromApi);
      } else {
        console.warn('Ответ API не содержит данных рецензий');
        throw new Error('Некорректные данные от API');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки рецензий с авторскими лайками:', err);
      setError('Не удалось загрузить рецензии с авторскими лайками. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  // Основная загрузка данных при изменении страницы или сортировки
  useEffect(() => {
    fetchReviews();
  }, [currentPage, sortOption]);

  // Проверка, лайкнута ли рецензия
  const isReviewLiked = (reviewId) => {
    console.log(`Проверка лайка для рецензии ${reviewId}, likedReviews:`, Array.from(likedReviews));
    return likedReviews.has(reviewId);
  };

  // Обработка лайка/дизлайка
  const handleLikeToggle = async (reviewId) => {
    console.log(`handleLikeToggle вызван для рецензии ${reviewId}`);
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.log('Пользователь не авторизован');
      setNotification({
        message: 'Войдите в систему чтобы поставить лайк',
        type: 'warning'
      });
      return;
    }

    const isCurrentlyLiked = isReviewLiked(reviewId);
    console.log(`Текущее состояние лайка для рецензии ${reviewId}: ${isCurrentlyLiked}`);
    
    // Получаем рецензию для проверки авторства
    const targetReview = reviews.find(r => (r.id || r.reviewId) === reviewId);
    const reviewAuthorId = targetReview?.userId || (targetReview?.user && targetReview.user.id) || 0;
    
    // Приводим ID к числу для корректного сравнения
    const reviewAuthorIdNum = parseInt(reviewAuthorId, 10) || 0;
    const currentUserIdNum = parseInt(currentUserId, 10) || 0;
    
    // Проверяем, является ли пользователь автором рецензии
    if (reviewAuthorIdNum === currentUserIdNum && currentUserIdNum !== 0) {
      console.log(`Пользователь пытается лайкнуть свою рецензию (автор: ${reviewAuthorIdNum}, текущий: ${currentUserIdNum})`);
      setNotification({
        message: 'Нельзя лайкать свои рецензии',
        type: 'warning'
      });
      return;
    }

    setLikesLoading(true);
    
    try {
      // Оптимистичное обновление UI
      const newLikedReviews = new Set(likedReviews);
      if (isCurrentlyLiked) {
        newLikedReviews.delete(reviewId);
      } else {
        newLikedReviews.add(reviewId);
      }
      setLikedReviews(newLikedReviews);
      
      // Обновляем количество лайков в списке рецензий
      setReviews(prevReviews => 
        prevReviews.map(review => {
          if ((review.id || review.reviewId) === reviewId) {
            const currentLikesCount = review.likesCount || 0;
            return {
              ...review,
              likesCount: isCurrentlyLiked 
                ? Math.max(0, currentLikesCount - 1)
                : currentLikesCount + 1
            };
          }
          return review;
        })
      );
      
      let response;
      if (isCurrentlyLiked) {
        // Дизлайк
        console.log(`Убираем лайк с рецензии ${reviewId}`);
        response = await likeApi.unlikeReview(reviewId);
      } else {
        // Лайк
        console.log(`Ставим лайк рецензии ${reviewId}`);
        response = await likeApi.likeReview(reviewId);
      }
      
      console.log('Ответ API:', response);
      
      // Показываем уведомление об успехе
      setNotification({
        message: isCurrentlyLiked ? 'Лайк убран' : 'Лайк поставлен',
        type: 'success'
      });
      
      // Обновляем авторские лайки, если действие выполнил автор
      await updateAuthorLikesForReview(reviewId);
      
    } catch (error) {
      console.error('Ошибка при обновлении лайка:', error);
      
      // Откатываем оптимистичное обновление при ошибке
      const revertedLikedReviews = new Set(likedReviews);
      if (!isCurrentlyLiked) {
        revertedLikedReviews.delete(reviewId);
      } else {
        revertedLikedReviews.add(reviewId);
      }
      setLikedReviews(revertedLikedReviews);
      
      // Откатываем обновление количества лайков
      setReviews(prevReviews => 
        prevReviews.map(review => {
          if ((review.id || review.reviewId) === reviewId) {
            const currentLikesCount = review.likesCount || 0;
            return {
              ...review,
              likesCount: !isCurrentlyLiked 
                ? Math.max(0, currentLikesCount - 1)
                : currentLikesCount + 1
            };
          }
          return review;
        })
      );
      
      // Показываем уведомление об ошибке
      const errorMessage = error.response?.data?.message || error.message || 'Не удалось обновить лайк';
      setNotification({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLikesLoading(false);
    }
  };

  // Функция для проверки текущего статуса лайка через API
  const isReviewCurrentlyLiked = async (reviewId) => {
    const userId = getCurrentUserId();
    if (!userId) return false;
    
    try {
      const isLiked = await likeApi.isReviewLikedByUser(reviewId, userId);
      return isLiked;
    } catch (error) {
      console.error('Ошибка при проверке лайка:', error);
      return false;
    }
  };

  // Переход на другую страницу
  const handlePageChange = (page) => {
    console.log(`Переход на страницу ${page}, текущая страница: ${currentPage}`);
    setCurrentPage(page);
    navigate(`/author-likes?page=${page}`);
  };

  // Изменение сортировки
  const handleSortChange = (option) => {
    setSortOption(option);
    setSortDropdownOpen(false);
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении сортировки
    navigate('/author-likes?page=1'); // Обновляем URL
  };

  // Генерация кнопок пагинации
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    const sidePages = Math.floor(maxVisiblePages / 2);
    
    console.log(`Пагинация: текущая страница ${currentPage}, всего страниц ${totalPages}`);
    
    // Добавляем кнопку "Предыдущая" если не на первой странице
    if (currentPage > 1) {
      buttons.push(
        React.createElement('li', { key: 'prev' }, 
          React.createElement(Link, {
            to: `/author-likes?page=${currentPage - 1}`,
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
    
    // Определяем диапазон видимых страниц
    let startPage = Math.max(1, currentPage - sidePages);
    let endPage = Math.min(totalPages, currentPage + sidePages);
    
    // Корректируем диапазон если он слишком мал
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    // Добавляем "..." в начале если нужно
    if (startPage > 1) {
      buttons.push(
        React.createElement('li', { key: 1 }, 
          React.createElement(Link, {
            to: `/author-likes?page=1`,
            className: 'pagination-button',
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(1);
            }
          }, '1')
        )
      );
      
      if (startPage > 2) {
        buttons.push(
          React.createElement('li', { key: 'ellipsis-start' }, 
            React.createElement('span', { 
              className: 'pagination-ellipsis' 
            }, '...')
          )
        );
      }
    }
    
    // Показываем страницы в диапазоне (обновлено)
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        React.createElement('li', { key: i }, 
          React.createElement(Link, {
            to: `/author-likes?page=${i}`,
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
            to: `/author-likes?page=${currentPage + 1}`,
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
      className: 'rating-filters-container'
    }, 
      React.createElement('div', { className: 'rating-filters-card' }, 
        React.createElement('div', { className: 'rating-filters-content' }, [
          React.createElement('div', {
            className: 'rating-filters-label',
            key: 'sort-label'
          }, 'Сортировать по:'),
          React.createElement('div', { className: 'rating-filters-controls', key: 'sort-controls' }, 
            React.createElement('div', { className: 'rating-filter-dropdown', key: 'sort-dropdown' }, [
              React.createElement('button', {
                type: 'button',
                className: 'rating-filter-button',
                onClick: () => setSortDropdownOpen(!sortDropdownOpen),
                key: 'sort-button'
              }, [
                React.createElement('span', {
                  key: 'sort-text'
                }, 
                  sortOption === 'newest' ? 'Новые' :
                  sortOption === 'oldest' ? 'Старые' :
                  sortOption === 'popular' ? 'Популярные' : 'Высший рейтинг'
                ),
                React.createElement('svg', {
                  className: 'rating-filter-chevron',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  strokeWidth: '2',
                  key: 'sort-icon'
                }, React.createElement('path', { d: 'm6 9 6 6 6-6' }))
              ]),
              
              sortDropdownOpen && React.createElement('div', {
                className: 'rating-filter-menu',
                key: 'sort-options'
              }, [
                React.createElement('div', {
                  className: `rating-filter-option ${sortOption === 'newest' ? 'selected' : ''}`,
                  onClick: () => handleSortChange('newest'),
                  key: 'sort-newest'
                }, 'Новые'),
                React.createElement('div', {
                  className: `rating-filter-option ${sortOption === 'oldest' ? 'selected' : ''}`,
                  onClick: () => handleSortChange('oldest'),
                  key: 'sort-oldest'
                }, 'Старые'),
                React.createElement('div', {
                  className: `rating-filter-option ${sortOption === 'popular' ? 'selected' : ''}`,
                  onClick: () => handleSortChange('popular'),
                  key: 'sort-popular'
                }, 'Популярные'),
                React.createElement('div', {
                  className: `rating-filter-option ${sortOption === 'top_rated' ? 'selected' : ''}`,
                  onClick: () => handleSortChange('top_rated'),
                  key: 'sort-top'
                }, 'Высший рейтинг')
              ])
            ])
          ),
          React.createElement('div', { className: 'rating-filters-separator', key: 'separator' })
        ])
      )
    );
  };

  // Основной метод рендеринга
  return React.createElement('div', {
    className: 'author-likes-page site-content min-[1024px]:max-[1500px]:px-6 mb-[30px] lg:mb-[80px] mt-[20px] lg:mt-[30px]'
  }, 
    React.createElement('main', {}, 
      React.createElement('div', { className: 'container' }, [
        // Заголовок
        React.createElement('h1', {
          className: 'text-lg md:text-xl lg:text-3xl font-bold mb-4 lg:mb-8',
          key: 'page-title'
        }, 'Рецензии с авторскими лайками'),
        
        // Сортировка
        renderSortDropdown(),
        
        // Ошибка загрузки
        error && React.createElement('div', {
          className: 'my-5 p-4 bg-red-500/20 border border-red-500 rounded-lg text-center',
          key: 'error-message'
        }, error),
        
        // Индикатор загрузки
        loading && React.createElement(LoadingSpinner, {
          text: 'Загрузка рецензий...',
          className: 'loading-container--center',
          key: 'loading-spinner'
        }),
        
        // Рецензии
        !loading && !error && React.createElement('section', {
          className: 'gap-3 xl:gap-5 grid md:grid-cols-2 xl:grid-cols-3 mt-5 lg:mt-10 items-start',
          key: 'reviews-grid'
        }, 
          reviews.slice(0, REVIEWS_PER_PAGE).map(review => {
            const reviewId = review.id || review.reviewId;
            return React.createElement(ReviewCard, {
              key: reviewId,
              review: review,
              isLiked: isReviewLiked(reviewId),
              onLikeToggle: handleLikeToggle,
              authorLikes: authorLikes[reviewId] || []
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
    ),
    notification && (
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(null)}
      />
    )
  );
};

export default AuthorLikesPage; 