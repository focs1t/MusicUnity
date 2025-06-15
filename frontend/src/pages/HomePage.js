import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { releaseApi } from '../shared/api/release';
import { authorApi } from '../shared/api/author';
import { userApi } from '../shared/api/user';
import { reviewApi } from '../shared/api/review';
import { likeApi } from '../shared/api/like';
import { LoadingSpinner } from '../shared/ui/LoadingSpinner';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReportButton from '../shared/ui/ReportButton/ReportButton';
import { ReportType } from '../entities/report/model/types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './HomePage.css';

const DEFAULT_COVER_PLACEHOLDER = '/default-release-cover.jpg';
const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM1NTU1NTUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjRkZGRkZGIj7QldCw0LXRgtGM0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMINC/0LDQtdGC0LU8L3RleHQ+PC9zdmc+';

// Получение текущего ID пользователя из разных источников (копия из ReviewsPage)
const getCurrentUserId = () => {
  try {
    // Пытаемся получить данные из всех возможных ключей
    const possibleUserKeys = ['userData', 'user', 'userInfo', 'currentUser', 'auth', 'authUser'];
    for (const key of possibleUserKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const data = JSON.parse(value);
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
        if (sessionUser && (sessionUser.id || sessionUser.userId)) {
          return sessionUser.id || sessionUser.userId;
        }
      } catch (error) {
        console.log('Ошибка при парсинге данных из sessionStorage:', error);
      }
    }
    
    console.warn('Не удалось получить ID пользователя из доступных источников');
    return 1; // Временное решение для тестирования
  } catch (error) {
    console.error('Ошибка при получении ID пользователя:', error);
    return 0;
  }
};

// Компонент карточки рецензии (полная копия из ReviewsPage)
const ReviewCard = ({ review, isLiked, onLikeToggle, authorLikes = [] }) => {
  const [showMessage, setShowMessage] = useState(false);

  // Функция для обработки ошибок изображений
  const handleImageError = (e, placeholder) => {
    console.log('Ошибка загрузки изображения, использую placeholder');
    // Предотвращаем бесконечный цикл
    if (e.target.src !== DEFAULT_AVATAR_PLACEHOLDER) {
      e.target.onerror = null;
      e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
    }
  };

  // Получение данных пользователя из рецензии
  const getUserName = () => {
    if (review && review.user) {
      return review.user.username || review.user.name || 'Неизвестный пользователь';
    }
    return 'Неизвестный пользователь';
  };

  const getAvatarUrl = () => {
    if (review && review.user) {
      return review.user.avatar || review.user.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER;
    }
    return DEFAULT_AVATAR_PLACEHOLDER;
  };

  const getUserId = () => {
    if (review && review.user) {
      return review.user.id || review.user.userId || 0;
    }
    return 0;
  };

  const getUserRank = () => {
    if (review && review.user && review.user.rank) {
      return review.user.rank;
    }
    return null;
  };

  const getTrackData = () => {
    const track = review.track || review.release || {};
    
    // Выводим полную структуру данных для отладки
    console.log("HomePage ReviewCard - полная структура данных рецензии:", JSON.stringify(review, null, 2));
    
    // Логируем информацию для отладки
    console.log(`HomePage ReviewCard: данные релиза:`, track);
    
    return {
      id: review.releaseId || (track && track.id) || (track && track.releaseId) || 1,
      title: track.title || track.name || 'Неизвестный трек',
      cover: track.cover || track.coverUrl || DEFAULT_COVER_PLACEHOLDER
    };
  };

  const getRatingData = () => {
    // Если есть готовые данные о рейтинге
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
  const isOwnReview = getUserId() === currentUserId;
  
  // Обработчик клика по кнопке лайка для собственной рецензии
  const handleOwnReviewLikeClick = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

  // Строим карточку рецензии с использованием React.createElement вместо JSX
  return React.createElement('div', {
    key: review.id,
    className: 'bg-zinc-900 relative overflow-hidden review-wrapper p-1.5 lg:p-[5px] flex flex-col h-full mx-auto border border-zinc-800 rounded-[15px] lg:rounded-[20px] w-full'
  }, [
    // Верхняя часть с информацией о пользователе и рейтинге
    React.createElement('div', { className: 'relative flex-shrink-0', key: 'header' }, 
      React.createElement('div', { className: 'bg-zinc-950/70 px-2 lg:px-2 py-2 rounded-[12px] flex gap-3' }, [
        // Блок с аватаром и информацией о пользователе
        React.createElement('div', { className: 'flex items-start space-x-2 lg:space-x-3 w-full', key: 'user-info' }, [
          React.createElement(Link, {
            className: 'relative', 
            to: `/profile/${review.userId || user.id}`,
            key: 'user-avatar-link'
          }, 
            React.createElement('img', {
              alt: user.name,
              src: user.avatar,
              className: 'shrink-0 size-[40px] lg:size-[40px] border border-white/10 rounded-full object-cover object-center',
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
                to: `/profile/${review.userId || user.id}`
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
              to: `/release/${review.releaseId || (review.release && review.release.id) || track.id}`,
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

    // Содержимое рецензии (блок с текстом)
    React.createElement('div', { key: 'content', className: 'flex-1 flex flex-col', style: { minHeight: 0 } }, 
      React.createElement('div', { 
        className: 'overflow-hidden relative px-1.5 block mt-3',
        key: 'review-text',
        style: { maxHeight: '120px' }
      }, [
        React.createElement('div', { className: 'text-base lg:text-lg mb-2 font-semibold', key: 'review-title' }, review.title),
        React.createElement('div', { className: 'tracking-[-0.2px] font-light', key: 'review-content-wrapper' }, 
          React.createElement('div', { className: 'prose prose-invert text-[15px] text-white lg:text-base lg:leading-[150%]' }, 
            review.content && review.content.length > 100 ? review.content.substring(0, 100) + '...' : (review.content || 'Нет содержания')
          )
        )
      ]),
      
      // Пустой блок для заполнения пространства
      React.createElement('div', { className: 'flex-grow' })
    ),

    // Нижняя часть с лайками и ссылкой на полную рецензию
    React.createElement('div', { className: 'flex-shrink-0 flex justify-between items-center relative pr-1.5 mt-2 pt-2 pb-1 border-t border-zinc-800/50 review-actions-block', key: 'actions' }, [
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
                  to: `/author/${authorLike.author?.authorId || authorLike.author?.id || (authorLike.author ? authorLike.author.id : 0)}`,
                  key: `author-like-link-${index}`
                },
                  React.createElement('img', {
                    src: authorLike.author?.avatar || DEFAULT_AVATAR_PLACEHOLDER,
                    alt: authorLike.author?.username || 'Автор',
                    className: 'w-6 h-6 rounded-full border border-yellow-500 object-cover object-center',
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

      React.createElement('div', { className: 'relative flex items-center gap-x-0.5', key: 'link-container' }, [
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
        ]),
        
        // Кнопка репорта (только если не собственная рецензия)
        !isOwnReview && React.createElement(ReportButton, {
          type: ReportType.REVIEW,
          targetId: review.id || review.reviewId,
          size: 'small',
          tooltip: 'Пожаловаться на рецензию',
          key: 'report-button'
        })
      ])
    ])
  ]);
};

const HomePage = () => {
  const navigate = useNavigate();
  
  // Состояния для данных
  const [newReleases, setNewReleases] = useState([]);
  const [topReleases, setTopReleases] = useState([]);
  const [verifiedAuthors, setVerifiedAuthors] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояния для лайков (как в ReviewsPage)
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [authorLikes, setAuthorLikes] = useState({});

  // Функция получения ID текущего пользователя (как в ReviewsPage)
  const getCurrentUserIdInComponent = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user.userId || null;
      }
      return null;
    } catch (error) {
      console.error('Ошибка при получении ID пользователя:', error);
      return null;
    }
  };

  // Функция для загрузки всех данных
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем данные параллельно, используя только реальные API методы
      const [
        newReleasesData,
        topReleasesData,
        verifiedAuthorsData,
        topUsersData,
        recentReviewsData
      ] = await Promise.all([
        releaseApi.getNewReleases(0, 12).catch(err => {
          console.error('Ошибка загрузки новых релизов:', err);
          return { content: [] };
        }),
        releaseApi.getTopRatedReleases(0, 12).catch(err => {
          console.error('Ошибка загрузки топ релизов:', err);
          return { content: [] };
        }),
        authorApi.getVerifiedAuthors(0, 12).catch(err => {
          console.error('Ошибка загрузки верифицированных авторов:', err);
          return { content: [] };
        }),
        userApi.getTop100Users().then(users => users.slice(0, 10)).catch(err => {
          console.error('Ошибка загрузки топ пользователей:', err);
          return [];
        }),
        reviewApi.getAllReviews(0, 8, 'newest').catch(err => {
          console.error('Ошибка загрузки последних рецензий:', err);
          return { content: [] };
        })
      ]);

      // Сортировка новых релизов по дате добавления (новые сначала)
      const sortedNewReleases = (newReleasesData.content || []).sort((a, b) => {
        const dateA = new Date(a.createdAt || a.addedAt || 0);
        const dateB = new Date(b.createdAt || b.addedAt || 0);
        return dateB - dateA;
      });

      // Сортировка лучших релизов по баллу рецензий (сначала полные, потом простые)
      const sortedTopReleases = (topReleasesData.content || []).sort((a, b) => {
        // Приоритет полным рецензиям
        const aFullRating = a.fullReviewRating || a.averageExtendedRating || 0;
        const bFullRating = b.fullReviewRating || b.averageExtendedRating || 0;
        const aSimpleRating = a.simpleReviewRating || a.averageSimpleRating || 0;
        const bSimpleRating = b.simpleReviewRating || b.averageSimpleRating || 0;
        
        // Если у одного есть полная рецензия, а у другого нет - полная выше
        if (aFullRating > 0 && bFullRating === 0) return -1;
        if (bFullRating > 0 && aFullRating === 0) return 1;
        
        // Если у обоих есть полные рецензии - сравниваем их
        if (aFullRating > 0 && bFullRating > 0) {
          return bFullRating - aFullRating;
        }
        
        // Если у обоих нет полных рецензий - сравниваем простые
        return bSimpleRating - aSimpleRating;
      });

      setNewReleases(sortedNewReleases);
      setTopReleases(sortedTopReleases);
      setVerifiedAuthors(verifiedAuthorsData.content || []);
      setTopUsers(topUsersData || []);
      setRecentReviews(recentReviewsData.content || []);

      // Загружаем лайкнутые рецензии сразу после получения рецензий
      fetchLikedReviewsByCurrentUser();

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Загрузка лайкнутых рецензий текущего пользователя (как в ReviewsPage)
  const fetchLikedReviewsByCurrentUser = async () => {
    const userId = getCurrentUserIdInComponent();
    if (!userId) return;
    
    try {
      const response = await likeApi.getLikedReviewsByUser(userId);
      
      if (response && response.content) {
        const likedIds = new Set(
          response.content
            .map(review => review.reviewId || review.id || 0)
            .filter(id => id > 0)
        );
        console.log(`Получено ${likedIds.size} лайкнутых рецензий для пользователя ${userId}:`, Array.from(likedIds));
        setLikedReviews(likedIds);
      }
    } catch (error) {
      console.error('Ошибка при загрузке лайкнутых рецензий:', error);
    }
  };

  // Обновление лайков для рецензий (как в ReviewsPage)
  const updateReviewsLikes = async (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) return reviewsData;
    
    try {
      const reviewIds = reviewsData.map(review => review.id || review.reviewId).filter(Boolean);
      if (reviewIds.length === 0) return reviewsData;
      
      const likesPromises = reviewIds.map(async (reviewId) => {
        try {
          const count = await likeApi.getLikesCountByReview(reviewId);
          return { reviewId, count };
        } catch (error) {
          console.error(`Ошибка при получении лайков для рецензии ${reviewId}:`, error);
          return { reviewId, count: 0 };
        }
      });
      
      const likesResults = await Promise.all(likesPromises);
      const likesMap = {};
      likesResults.forEach(({ reviewId, count }) => {
        likesMap[reviewId] = count;
      });
      
      return reviewsData.map(review => ({
        ...review,
        likesCount: likesMap[review.id || review.reviewId] || 0
      }));
    } catch (error) {
      console.error('Ошибка при обновлении лайков:', error);
      return reviewsData;
    }
  };

  // Проверка лайка рецензии (как в ReviewsPage)
  const isReviewLiked = (reviewId) => {
    return likedReviews.has(reviewId);
  };

  // Обработка лайка рецензии (как в ReviewsPage)
  const handleLikeToggle = async (reviewId) => {
    const userId = getCurrentUserIdInComponent();
    
    if (!userId) {
      console.warn('Пользователь не авторизован');
      return;
    }
    
    // Находим рецензию в массиве
    const review = recentReviews.find(r => r.id === reviewId || r.reviewId === reviewId);
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
      
      if (isLiked) {
        // Удаляем лайк
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
        
        setRecentReviews(prevReviews => 
          prevReviews.map(r => 
            (r.id === reviewId || r.reviewId === reviewId) 
              ? {...r, likesCount: Math.max(0, (r.likesCount || 0) - 1)} 
              : r
          )
        );
        
        try {
          await likeApi.removeLike(reviewId, userId);
        } catch (apiError) {
          console.error('Ошибка при удалении лайка через API:', apiError);
        }
      } else {
        // Добавляем лайк
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          newSet.add(reviewId);
          return newSet;
        });
        
        setRecentReviews(prevReviews => 
          prevReviews.map(r => 
            (r.id === reviewId || r.reviewId === reviewId) 
              ? {...r, likesCount: (r.likesCount || 0) + 1} 
              : r
          )
        );
        
        try {
          await likeApi.createLike(reviewId, userId, 'REGULAR');
        } catch (apiError) {
          console.error('Ошибка при добавлении лайка через API:', apiError);
          
          // Возвращаем состояние обратно при ошибке
          setLikedReviews(prev => {
            const newSet = new Set(prev);
            newSet.delete(reviewId);
            return newSet;
          });
          
          setRecentReviews(prevReviews => 
            prevReviews.map(r => 
              (r.id === reviewId || r.reviewId === reviewId) 
                ? {...r, likesCount: Math.max(0, (r.likesCount || 0) - 1)} 
                : r
            )
          );
        }
      }
    } catch (error) {
      console.error(`Ошибка при переключении лайка для рецензии ${reviewId}:`, error);
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
            try {
              const authorLikesForReview = await likeApi.getAuthorLikesByReview(reviewId);
              if (authorLikesForReview && authorLikesForReview.length > 0) {
                authorLikesData[reviewId] = authorLikesForReview;
              }
            } catch (error) {
              console.error(`Ошибка при загрузке авторских лайков для рецензии ${reviewId}:`, error);
            }
          }
        })
      );
      
      setAuthorLikes(authorLikesData);
    } catch (error) {
      console.error('Ошибка при загрузке авторских лайков:', error);
    }
  };

  // Функция для обновления данных пользователей с рангами
  const updateReviewsWithUserRanks = async (reviewsData) => {
    const updatedReviews = await Promise.all(
      reviewsData.map(async (review) => {
        const userId = review.user?.id || review.userId;
        if (userId) {
          try {
            const userRank = await userApi.getUserRank(userId);
            if (userRank && userRank.isInTop100) {
              review.user = {
                ...review.user,
                rank: userRank.rank
              };
            }
          } catch (error) {
            console.error(`Ошибка при загрузке ранга пользователя ${userId}:`, error);
          }
        }
        return review;
      })
    );
    return updatedReviews;
  };

  // Загружаем лайки после загрузки рецензий
  useEffect(() => {
    if (recentReviews.length > 0) {
      fetchLikedReviewsByCurrentUser();
      updateReviewsLikes(recentReviews).then(async (updatedReviews) => {
        // Обновляем данные пользователей с рангами
        const reviewsWithRanks = await updateReviewsWithUserRanks(updatedReviews);
        setRecentReviews(reviewsWithRanks);
        // Загружаем авторские лайки для рецензий
        fetchAuthorLikes(reviewsWithRanks);
      });
    }
  }, [recentReviews.length]);

  // Эффект для правильного позиционирования hover меню как в ReviewsPage
  useEffect(() => {
    const updateHoverMenuPositions = () => {
      const wrappers = document.querySelectorAll('.home-page-container .author-rating-wrapper');
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
      const wrappers = document.querySelectorAll('.home-page-container .author-rating-wrapper');
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

  // Функции для обработки ошибок изображений
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COVER_PLACEHOLDER;
  };

  const handleAvatarError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
  };

  // Функция для форматирования рейтинга (округление до целых чисел)
  const formatRating = (rating) => {
    return Math.round(rating);
  };

  // Функция для рендера рейтинговых кружков (точная копия из AuthorPage)
  const renderRatingCircles = (release) => {
    const circles = [];
    
    // Заполненный кружок для полных рецензий
    if (release.fullReviewRating || release.averageExtendedRating) {
      circles.push(
        <div key="filled" className="release-row-rating-circle filled">
          {formatRating(release.fullReviewRating || release.averageExtendedRating)}
        </div>
      );
    } else {
      circles.push(
        <div key="filled-dashed" className="release-row-rating-circle dashed"></div>
      );
    }
    
    // Контурный кружок для простых рецензий
    if (release.simpleReviewRating) {
      circles.push(
        <div key="outlined" className="release-row-rating-circle outlined">
          {formatRating(release.simpleReviewRating)}
        </div>
      );
    } else {
      circles.push(
        <div key="outlined-dashed" className="release-row-rating-circle dashed"></div>
      );
    }
    
    return circles;
  };

  if (loading) {
    return (
      <div className="home-page-container">
        <div className="container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page-container">
        <div className="container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchData} className="retry-button">
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page-container">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span style={{ color: 'white' }}>Добро пожаловать в</span> <span className="gradient-text">MusicUnity</span>
            </h1>
            <p className="hero-subtitle">
              Откройте для себя новую музыку, читайте рецензии и делитесь своими впечатлениями
            </p>
          </div>
        </section>

        {/* Новые релизы */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Новые релизы</h2>
            <button 
              className="view-all-button"
              onClick={() => navigate('/releases')}
            >
              Смотреть все
            </button>
          </div>
          
          {newReleases.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 5,
                  spaceBetween: 20,
                },
              }}
              className="releases-swiper"
            >
              {newReleases.map((release) => (
                <SwiperSlide key={release.releaseId}>
                  <div className="release-card">
                    <div className="release-card-inner">
                      <a href={`/release/${release.releaseId}`} className="release-link">
                        <div className="release-cover-container">
                          <img
                            src={release.coverUrl || release.cover || DEFAULT_COVER_PLACEHOLDER}
                            alt={release.title}
                            className="release-cover"
                            onError={handleImageError}
                          />
                          
                          {/* Статистика релиза - точная копия из AuthorPage */}
                          <div className="release-stats">
                            <div className="stat-item">
                              <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                                <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                              </svg>
                              <span>{release.extendedReviewsCount || 0}</span>
                            </div>
                            <div className="stat-item">
                              <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                              </svg>
                              <span>{release.simpleReviewsCount || 0}</span>
                            </div>
                          </div>

                          {/* Иконка типа релиза - точная копия из AuthorPage */}
                          <div className="release-type-icon">
                            {release.type === 'ALBUM' ? (
                              <svg className="type-icon" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="11.99" cy="11.99" r="2.01"></circle>
                                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                                <path d="M12 6a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4z"></path>
                              </svg>
                            ) : (
                              <svg className="type-icon" viewBox="0 0 512 512" fill="currentColor">
                                <path d="M406.3 48.2c-4.7.9-202 39.2-206.2 40-4.2.8-8.1 3.6-8.1 8v240.1c0 1.6-.1 7.2-2.4 11.7-3.1 5.9-8.5 10.2-16.1 12.7-3.3 1.1-7.8 2.1-13.1 3.3-24.1 5.4-64.4 14.6-64.4 51.8 0 31.1 22.4 45.1 41.7 47.5 2.1.3 4.5.7 7.1.7 6.7 0 36-3.3 51.2-13.2 11-7.2 24.1-21.4 24.1-47.8V190.5c0-3.8 2.7-7.1 6.4-7.8l152-30.7c5-1 9.6 2.8 9.6 7.8v130.9c0 4.1-.2 8.9-2.5 13.4-3.1 5.9-8.5 10.2-16.2 12.7-3.3 1.1-8.8 2.1-14.1 3.3-24.1 5.4-64.4 14.5-64.4 51.7 0 33.7 25.4 47.2 41.8 48.3 6.5.4 11.2.3 19.4-.9s23.5-5.5 36.5-13c17.9-10.3 27.5-26.8 27.5-48.2V55.9c-.1-4.4-3.8-8.9-9.8-7.7z"></path>
                              </svg>
                            )}
                          </div>
                        </div>
                      </a>

                      <div className="release-info">
                        <a href={`/release/${release.releaseId}`} className="release-title">
                          {release.title}
                        </a>
                        
                        <div className="flex flex-wrap leading-3 mt-1 text-[13px]">
                          {release.authors && release.authors.map((author, index) => (
                            <span key={author.authorId || index}>
                              <a href={`/author/${author.authorId || author.id || 0}`} className="border-b border-b-white/0 hover:border-white/30 opacity-70">
                                {author.authorName}
                              </a>
                              {index < release.authors.length - 1 && <span className="text-muted-foreground">,&nbsp;</span>}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="release-ratings">
                        <div className="release-row-rating-circles">
                          {renderRatingCircles(release)}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="no-data">
              <p>Новые релизы не найдены</p>
            </div>
          )}
        </section>

        {/* Топ релизы */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Топ релизы</h2>
            <button 
              className="view-all-button"
              onClick={() => navigate('/rating-releases')}
            >
              Смотреть все
            </button>
          </div>
          
          {topReleases.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 5,
                  spaceBetween: 20,
                },
              }}
              className="releases-swiper"
            >
              {topReleases.map((release) => (
                <SwiperSlide key={release.releaseId}>
                  <div className="release-card">
                    <div className="release-card-inner">
                      <a href={`/release/${release.releaseId}`} className="release-link">
                        <div className="release-cover-container">
                          <img
                            src={release.coverUrl || release.cover || DEFAULT_COVER_PLACEHOLDER}
                            alt={release.title}
                            className="release-cover"
                            onError={handleImageError}
                          />
                          
                          <div className="release-stats">
                            <div className="stat-item">
                              <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                                <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                              </svg>
                              <span>{release.extendedReviewsCount || 0}</span>
                            </div>
                            <div className="stat-item">
                              <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                              </svg>
                              <span>{release.simpleReviewsCount || 0}</span>
                            </div>
                          </div>

                          <div className="release-type-icon">
                            {release.type === 'ALBUM' ? (
                              <svg className="type-icon" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="11.99" cy="11.99" r="2.01"></circle>
                                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                                <path d="M12 6a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4z"></path>
                              </svg>
                            ) : (
                              <svg className="type-icon" viewBox="0 0 512 512" fill="currentColor">
                                <path d="M406.3 48.2c-4.7.9-202 39.2-206.2 40-4.2.8-8.1 3.6-8.1 8v240.1c0 1.6-.1 7.2-2.4 11.7-3.1 5.9-8.5 10.2-16.1 12.7-3.3 1.1-7.8 2.1-13.1 3.3-24.1 5.4-64.4 14.6-64.4 51.8 0 31.1 22.4 45.1 41.7 47.5 2.1.3 4.5.7 7.1.7 6.7 0 36-3.3 51.2-13.2 11-7.2 24.1-21.4 24.1-47.8V190.5c0-3.8 2.7-7.1 6.4-7.8l152-30.7c5-1 9.6 2.8 9.6 7.8v130.9c0 4.1-.2 8.9-2.5 13.4-3.1 5.9-8.5 10.2-16.2 12.7-3.3 1.1-8.8 2.1-14.1 3.3-24.1 5.4-64.4 14.5-64.4 51.7 0 33.7 25.4 47.2 41.8 48.3 6.5.4 11.2.3 19.4-.9s23.5-5.5 36.5-13c17.9-10.3 27.5-26.8 27.5-48.2V55.9c-.1-4.4-3.8-8.9-9.8-7.7z"></path>
                              </svg>
                            )}
                          </div>
                        </div>
                      </a>

                      <div className="release-info">
                        <a href={`/release/${release.releaseId}`} className="release-title">
                          {release.title}
                        </a>
                        
                        <div className="flex flex-wrap leading-3 mt-1 text-[13px]">
                          {release.authors && release.authors.map((author, index) => (
                            <span key={author.authorId || index}>
                              <a href={`/author/${author.authorId || author.id || 0}`} className="border-b border-b-white/0 hover:border-white/30 opacity-70">
                                {author.authorName}
                              </a>
                              {index < release.authors.length - 1 && <span className="text-muted-foreground">,&nbsp;</span>}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="release-ratings">
                        <div className="release-row-rating-circles">
                          {renderRatingCircles(release)}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="no-data">
              <p>Топ релизы не найдены</p>
            </div>
          )}
        </section>

        {/* Верифицированные авторы */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Верифицированные авторы</h2>
            <button 
              className="view-all-button"
              onClick={() => navigate('/authors-verified')}
            >
              Смотреть все
            </button>
          </div>
          
          {verifiedAuthors.length > 0 ? (
            <div className="authors-list">
              {verifiedAuthors.map((author) => (
                <div key={author.authorId} className="author-card">
                  <a href={`/author/${author.authorId || author.id || 0}`} className="author-link">
                    <div className="author-avatar-container">
                      <img 
                        src={author.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER} 
                        alt={author.authorName}
                        className="author-avatar"
                        onError={handleAvatarError}
                      />
                    </div>
                   
                   <div className="author-name-container">
                     <span className="author-name">{author.authorName}</span>
                     <div className="author-rating-wrapper">
                       <div className="verification-button">
                         <svg 
                           className={`verification-icon ${author.isVerified ? 'verified' : 'unverified'}`}
                           viewBox="0 0 24 24" 
                           fill="currentColor"
                           width="20"
                           height="20"
                         >
                           <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                         </svg>
                       </div>
                       <div className="author-hover-menu">
                         <div className="author-hover-content">
                           <div className="author-hover-title">
                             {author.userId ? 'Автор зарегистрирован на сайте' : 'Автор не зарегистрирован на сайте'}
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   
                   {author.followingCount > 0 && (
                     <div className="followers-count">
                       <div className="author-rating-wrapper">
                         <div className="followers-badge">
                           <svg className="bookmark-icon" viewBox="0 0 384 512" fill="currentColor">
                             <path d="M0 512V48C0 21.49 21.49 0 48 0h288c26.51 0 48 21.49 48 48v464L192 400 0 512z"/>
                           </svg>
                           <span>{author.followingCount}</span>
                         </div>
                         <div className="author-hover-menu">
                           <div className="author-hover-content">
                             <div className="author-hover-title">Количество добавлений в предпочтения</div>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                   
                   <div className="ratings-grid">
                     {/* Альбомы */}
                     <div className="rating-row">
                       <svg className="rating-icon album-icon" viewBox="0 0 24 24" fill="currentColor">
                         <circle cx="11.99" cy="11.99" r="2.01"/>
                         <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                         <path d="M12 6a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4z"/>
                       </svg>
                       {author.averageAlbumExtendedRating ? (
                         <div className="author-rating-wrapper">
                           <div className="rating-circle filled">
                             {Math.round(author.averageAlbumExtendedRating)}
                           </div>
                           <div className="author-hover-menu">
                             <div className="author-hover-content">
                               <div className="author-hover-title">Средняя оценка рецензий на альбомы от пользователей</div>
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div className="rating-circle dashed"></div>
                       )}
                       {author.averageAlbumSimpleRating ? (
                         <div className="author-rating-wrapper">
                           <div className="rating-circle outlined">
                             {Math.round(author.averageAlbumSimpleRating)}
                           </div>
                           <div className="author-hover-menu">
                             <div className="author-hover-content">
                               <div className="author-hover-title">Средняя оценка альбомов без рецензий от пользователей</div>
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div className="rating-circle dashed"></div>
                       )}
                     </div>
                     
                     {/* Синглы и EP */}
                     <div className="rating-row">
                       <svg className="rating-icon single-icon" viewBox="0 0 512 512" fill="currentColor">
                         <path d="M406.3 48.2c-4.7.9-202 39.2-206.2 40-4.2.8-8.1 3.6-8.1 8v240.1c0 1.6-.1 7.2-2.4 11.7-3.1 5.9-8.5 10.2-16.1 12.7-3.3 1.1-7.8 2.1-13.1 3.3-24.1 5.4-64.4 14.6-64.4 51.8 0 31.1 22.4 45.1 41.7 47.5 2.1.3 4.5.7 7.1.7 6.7 0 36-3.3 51.2-13.2 11-7.2 24.1-21.4 24.1-47.8V190.5c0-3.8 2.7-7.1 6.4-7.8l152-30.7c5-1 9.6 2.8 9.6 7.8v130.9c0 4.1-.2 8.9-2.5 13.4-3.1 5.9-8.5 10.2-16.2 12.7-3.3 1.1-8.8 2.1-14.1 3.3-24.1 5.4-64.4 14.5-64.4 51.7 0 33.7 25.4 47.2 41.8 48.3 6.5.4 11.2.3 19.4-.9s23.5-5.5 36.5-13c17.9-10.3 27.5-26.8 27.5-48.2V55.9c-.1-4.4-3.8-8.9-9.8-7.7z"/>
                       </svg>
                       {author.averageSingleEpExtendedRating ? (
                         <div className="author-rating-wrapper">
                           <div className="rating-circle filled">
                             {Math.round(author.averageSingleEpExtendedRating)}
                           </div>
                           <div className="author-hover-menu">
                             <div className="author-hover-content">
                               <div className="author-hover-title">Средняя оценка рецензий на синглы и EP от пользователей</div>
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div className="rating-circle dashed"></div>
                       )}
                       {author.averageSingleEpSimpleRating ? (
                         <div className="author-rating-wrapper">
                           <div className="rating-circle outlined">
                             {Math.round(author.averageSingleEpSimpleRating)}
                           </div>
                           <div className="author-hover-menu">
                             <div className="author-hover-content">
                               <div className="author-hover-title">Средняя оценка синглов и EP без рецензий от пользователей</div>
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div className="rating-circle dashed"></div>
                       )}
                     </div>
                   </div>
                 </a>
               </div>
             ))}
           </div>
          ) : (
            <div className="no-data">
              <p>Верифицированные авторы не найдены</p>
            </div>
          )}
        </section>

        {/* Топ пользователи */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Топ пользователи</h2>
            <button 
              className="view-all-button"
              onClick={() => navigate('/top100')}
            >
              Смотреть все
            </button>
          </div>
          
          {topUsers.length > 0 ? (
            <div className="users-grid">
              {topUsers.map((user, index) => (
                <div 
                  key={user.id}
                  className="user-card"
                >
                  <a href={`/profile/${user.id}`} className="user-card-link">
                    <img
                      src={user.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER}
                      alt={user.username}
                      className="user-avatar"
                      onError={handleAvatarError}
                    />
                    <div className="user-info">
                      <div className="user-name">#{index + 1} {user.username || user.name || 'Пользователь'}</div>
                      <div className="user-score">{user.points || 0} очков</div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>Топ пользователи не найдены</p>
            </div>
          )}
        </section>

        {/* Последние рецензии */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Последние рецензии</h2>
            <button 
              className="view-all-button"
              onClick={() => navigate('/reviews')}
            >
              Смотреть все
            </button>
          </div>
          
          {recentReviews.length > 0 ? (
            <div className="reviews-grid">
              {recentReviews.map((review) => {
                // Используем ReviewCard компонент точно как в ReviewsPage
                return React.createElement(ReviewCard, {
                  key: review.id,
                  review: review,
                  isLiked: isReviewLiked(review.id || review.reviewId),
                  onLikeToggle: handleLikeToggle,
                  authorLikes: authorLikes[review.id || review.reviewId] || []
                });
              })}
            </div>
          ) : (
            <div className="no-data">
              <p>Последние рецензии не найдены</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;