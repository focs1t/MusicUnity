import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { reviewApi } from '../shared/api/review';

// Импорт иконок
import FavoriteIcon from '@mui/icons-material/Favorite';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const REVIEWS_PER_PAGE = 9;

// Встроенный плейсхолдер в формате data URI для аватара
const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';

// Встроенный плейсхолдер в формате data URI для обложки релиза
const DEFAULT_COVER_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyMjIyMjIiLz48cGF0aCBkPSJNNzAgODBIMTMwVjEyMEg3MFY4MFoiIGZpbGw9IiM0NDQ0NDQiLz48cGF0aCBkPSJNNTAgMTUwSDE1MFYxNjBINTBWMTUwWiIgZmlsbD0iIzQ0NDQ0NCIvPjwvc3ZnPg==';

// Компонент карточки рецензии
const ReviewCard = ({ review, onLikeToggle }) => {
  const handleImageError = (e, placeholder) => {
    console.log('Ошибка загрузки изображения, использую placeholder');
    e.target.onerror = null;
    e.target.src = placeholder;
  };

  // Безопасное получение данных пользователя
  const getUserData = () => {
    return review.user || {
      id: 1,
      name: 'Пользователь',
      avatar: DEFAULT_AVATAR_PLACEHOLDER,
      top: 100
    };
  };

  // Безопасное получение данных трека
  const getTrackData = () => {
    return review.track || review.release || {
      id: 1,
      title: 'Трек',
      cover: DEFAULT_COVER_PLACEHOLDER
    };
  };

  // Безопасное получение данных рейтинга
  const getRatingData = () => {
    // Проверяем есть ли объект rating в review
    if (!review.rating) {
      // Если нет, создаем стандартный объект с рейтингом
      return {
        total: review.totalRating || 80,
        components: [
          review.rhymeImagery || 8,
          review.structureRhythm || 8,
          review.styleExecution || 8,
          review.individuality || 8,
          review.vibe || 8
        ]
      };
    }
    return review.rating;
  };

  const user = getUserData();
  const track = getTrackData();
  const rating = getRatingData();

  // Строим карточку рецензии с использованием React.createElement вместо JSX
  return React.createElement('div', {
    key: review.id,
    className: 'bg-zinc-900 relative overflow-hidden review-wrapper p-1.5 lg:p-[5px] flex flex-col mx-auto border border-zinc-800 rounded-[15px] lg:rounded-[20px] w-full'
  }, [
    // Верхняя часть с информацией о пользователе и рейтинге
    React.createElement('div', { className: 'relative', key: 'header' }, 
      React.createElement('div', { className: 'bg-zinc-950/70 px-2 lg:px-2 py-2 rounded-[12px] flex gap-3' }, [
        // Блок с аватаром и информацией о пользователе
        React.createElement('div', { className: 'flex items-center space-x-2 lg:space-x-3 w-full', key: 'user-info' }, [
          React.createElement(Link, { 
            className: 'relative', 
            to: `/user/${user.id}`,
            key: 'user-avatar-link'
          }, 
            React.createElement('img', {
              alt: user.name,
              src: user.avatar,
              className: 'shrink-0 size-[40px] lg:size-[45px] border border-white/10 rounded-full',
              loading: 'lazy',
              width: '38',
              height: '38',
              decoding: 'async',
              onError: (e) => handleImageError(e, DEFAULT_AVATAR_PLACEHOLDER)
            })
          ),
          React.createElement('div', { className: 'flex flex-col gap-1 justify-center', key: 'user-details' }, [
            React.createElement('div', { 
              className: 'flex items-center gap-1 md:gap-2 max-sm:flex-wrap',
              key: 'user-name-container'
            }, 
              React.createElement(Link, {
                className: 'text-sm lg:text-lg font-semibold leading-[14px] block items-center max-w-[170px] text-ellipsis whitespace-nowrap overflow-hidden',
                to: `/user/${user.id}`
              }, user.name)
            ),
            React.createElement('div', { 
              className: 'text-[12px] flex items-center space-x-1.5',
              key: 'user-rank'
            }, 
              React.createElement('div', {
                className: 'inline-flex items-center text-center bg-red-500 rounded-full font-semibold px-1.5'
              }, `ТОП-${user.top}`)
            )
          ])
        ]),

        // Блок с рейтингом и обложкой трека
        React.createElement('div', { className: 'flex items-center justify-end gap-2 lg:gap-4', key: 'rating-cover' }, [
          React.createElement('div', { className: 'text-right flex flex-col h-full justify-center', key: 'rating' }, [
            React.createElement('div', { 
              className: 'text-[20px] lg:text-[24px] font-bold leading-[100%] lg:mt-1 !no-underline border-0 no-callout select-none',
              key: 'total-rating'
            }, 
              React.createElement('span', { className: 'no-callout' }, rating.total)
            ),
            React.createElement('div', { className: 'flex gap-x-1.5 font-bold text-xs lg:text-sm', key: 'component-ratings' }, 
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
            className: 'shrink-0 size-10 lg:size-11',
            'data-state': 'closed',
            to: `/track/${track.id}`,
            key: 'track-cover-link'
          }, 
            React.createElement('img', {
              alt: track.title,
              src: track.cover,
              className: 'rounded-md w-full',
              loading: 'lazy',
              width: '70',
              height: '70',
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
        React.createElement('div', { className: 'flex gap-2 items-center', key: 'likes-container' }, 
          React.createElement('button', {
            className: 'justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border group bg-white/5 max-lg:h-8 cursor-pointer flex items-center rounded-full gap-x-1 lg:gap-x-1.5',
            onClick: () => onLikeToggle && onLikeToggle(review.id)
          }, [
            React.createElement('div', { className: 'w-5 lg:w-7', key: 'like-icon' }, 
              React.createElement(FavoriteIcon, { 
                className: 'opacity-50 transition-all duration-300 group-hover:opacity-100'
              })
            ),
            React.createElement('span', { className: 'font-bold lg:text-lg', key: 'likes-count' }, review.likes || 0)
          ])
        ),
        React.createElement('div', { className: 'relative flex items-center gap-x-0.5', key: 'link-container' }, 
          React.createElement(Link, {
            className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground size-8 md:size-10 bg-transparent hover:bg-white/10',
            'data-state': 'closed',
            to: `/reviews/${review.id}`
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
    return {
      id: 0,
      user: {
        id: 1,
        name: 'Пользователь',
        avatar: DEFAULT_AVATAR_PLACEHOLDER,
        top: 100
      },
      track: {
        id: 1,
        title: 'Трек',
        cover: DEFAULT_COVER_PLACEHOLDER
      },
      title: 'Рецензия',
      content: 'Содержание рецензии отсутствует',
      rating: {
        total: 80,
        components: [8, 8, 8, 8, 8]
      },
      likes: 0,
      date: new Date().toISOString()
    };
  }

  return {
    id: review.id || 0,
    user: review.user || review.author || {
      id: 1,
      name: 'Пользователь',
      avatar: DEFAULT_AVATAR_PLACEHOLDER,
      top: 100
    },
    track: review.track || review.release || {
      id: 1,
      title: 'Трек',
      cover: DEFAULT_COVER_PLACEHOLDER
    },
    title: review.title || 'Рецензия',
    content: review.content || 'Содержание рецензии отсутствует',
    rating: {
      total: review.totalRating || 80,
      components: [
        review.rhymeImagery || 8,
        review.structureRhythm || 8,
        review.styleExecution || 8,
        review.individuality || 8,
        review.vibe || 8
      ]
    },
    likes: review.likesCount || 0,
    date: review.createdAt || new Date().toISOString()
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
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получение номера страницы из URL при загрузке
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pageParam = queryParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    }
  }, [location.search]);

  // Загрузка данных из API
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await reviewApi.getAllReviews(currentPage - 1, REVIEWS_PER_PAGE);
        console.log('Ответ API:', response);
        
        if (response && response.content) {
          // Преобразуем данные API в нужный формат
          const formattedReviews = response.content.map(review => formatReview(review));
          setReviews(formattedReviews);
          setTotalPages(response.totalPages || 1);
        } else {
          console.warn('Ответ API не содержит данных рецензий');
          throw new Error('Некорректные данные от API');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки рецензий:', err);
        setError('Не удалось загрузить рецензии. Пожалуйста, попробуйте позже.');
        setLoading(false);
        
        // Если API не работает, используем моковые данные
        const mockReviews = generateMockReviews(50);
        setReviews(mockReviews);
        setTotalPages(Math.ceil(mockReviews.length / REVIEWS_PER_PAGE));
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage, sortOption]);

  // Функция для генерации тестовых данных (используется только если API недоступен)
  const generateMockReviews = (count) => {
    const mockUsers = [
      { id: 1, name: 'Alio', avatar: 'https://cms.risazatvorchestvo.com/wp-content/uploads/2024/11/profile_photo-4648-180x180.jpg', top: 58 },
      { id: 2, name: 'JazzFan', avatar: 'https://cdn-icons-png.flaticon.com/512/147/147142.png', top: 124 },
      { id: 3, name: 'RockStar', avatar: 'https://cdn-icons-png.flaticon.com/512/147/147144.png', top: 32 },
      { id: 4, name: 'ClassicLover', avatar: 'https://cdn-icons-png.flaticon.com/512/219/219986.png', top: 78 },
      { id: 5, name: 'MusicCritic', avatar: 'https://cdn-icons-png.flaticon.com/512/219/219969.png', top: 15 }
    ];

    const mockTracks = [
      { id: 1, title: 'Назад в будущее', cover: 'https://cms.risazatvorchestvo.com/wp-content/uploads/2025/06/m1000x1000-180x180.png' },
      { id: 2, title: 'Летний вечер', cover: 'https://example.com/covers/summer-evening.jpg' },
      { id: 3, title: 'Время перемен', cover: 'https://example.com/covers/time-of-change.jpg' },
      { id: 4, title: 'Мечта', cover: 'https://example.com/covers/dream.jpg' },
      { id: 5, title: 'Путешествие', cover: 'https://example.com/covers/journey.jpg' }
    ];

    const mockReviews = [];
    for (let i = 0; i < count; i++) {
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const track = mockTracks[Math.floor(Math.random() * mockTracks.length)];
      
      mockReviews.push({
        id: i + 1,
        user,
        track,
        title: ['Сильно.', 'Великолепно!', 'Впечатляет', 'Не понравилось', 'Потрясающе'][Math.floor(Math.random() * 5)],
        content: ['Все сниппеты благополучно проскипал и не знал в каком стиле будет новый трек от Вани, но ждал как всегда невероятного качества и хит-потенциала, и не ошибся. Этот трек - настоящий шедевр!',
                  'Очень понравилась композиция, автор отлично передает настроение через мелодию и текст. Слушаю на повторе уже неделю.',
                  'Честно говоря, ожидал большего. Хотя техническое исполнение на высоте, не хватает души и оригинальности.',
                  'Одна из лучших работ в дискографии автора. Особенно впечатляет продакшн и аранжировка.',
                  'Интересный эксперимент со звуком, но не уверен, что это понравится широкой аудитории.'][Math.floor(Math.random() * 5)],
        rating: {
          total: Math.floor(Math.random() * 21) + 80,
          components: [
            Math.floor(Math.random() * 3) + 8,
            Math.floor(Math.random() * 3) + 8,
            Math.floor(Math.random() * 3) + 8,
            Math.floor(Math.random() * 3) + 8,
            Math.floor(Math.random() * 3) + 8
          ]
        },
        likes: Math.floor(Math.random() * 10) + 1,
        date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
      });
    }

    // Сортировка по дате
    return mockReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
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

  // Создание элементов пагинации
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Показываем первые 5 страниц
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      buttons.push(
        React.createElement('li', { key: i }, 
          React.createElement(Link, {
            to: `/reviews?page=${i}`,
            className: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              i === currentPage 
                ? 'border border-white/20 bg-background hover:bg-accent hover:text-accent-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            } h-10 w-10 max-lg:size-7 max-lg:text-[12px]`,
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(i);
            }
          }, i.toString())
        )
      );
    }

    // Если страниц больше 5, добавляем многоточие
    if (totalPages > 5) {
      buttons.push(
        React.createElement('span', {
          key: 'ellipsis',
          'aria-hidden': 'true',
          className: 'flex h-7 w-3.5 md:h-9 md:w-9 items-center justify-center'
        }, [
          React.createElement(MoreHorizIcon, {
            key: 'ellipsis-icon',
            className: 'w-3 h-3 md:h-4 md:w-4'
          }),
          React.createElement('span', {
            key: 'ellipsis-text',
            className: 'sr-only'
          }, 'Больше страниц')
        ])
      );

      // Добавляем последнюю страницу
      buttons.push(
        React.createElement('li', { key: totalPages }, 
          React.createElement(Link, {
            to: `/reviews?page=${totalPages}`,
            className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 max-lg:size-7 max-lg:text-[12px]',
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }
          }, totalPages.toString())
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
            className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 max-md:h-7 max-md:w-7 max-md:p-0 md:pr-2.5 max-lg:text-[12px]',
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }
          }, [
            React.createElement('span', {
              key: 'next-text',
              className: 'max-md:hidden'
            }, 'Следующая'),
            React.createElement(ChevronRightIcon, {
              key: 'next-icon',
              className: 'h-4 w-4'
            })
          ])
        )
      );
    }

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
          reviews.slice(0, REVIEWS_PER_PAGE).map(reviewItem => {
            // Форматируем данные для отображения
            const review = reviewItem.user ? reviewItem : formatReview(reviewItem);
            return React.createElement(ReviewCard, {
              key: review.id,
              review: review,
              onLikeToggle: () => console.log('Like toggled for review', review.id)
            });
          })
        ),
        
        // Пагинация
        !loading && !error && totalPages > 0 && React.createElement('section', {
          className: 'mt-10',
          key: 'pagination'
        }, 
          React.createElement('nav', {
            role: 'navigation',
            'aria-label': 'pagination',
            className: 'mx-auto flex w-full justify-center'
          }, 
            React.createElement('ul', {
              className: 'flex flex-row items-center gap-1'
            }, renderPaginationButtons())
          )
        )
      ])
    )
  );
};

export default ReviewsPage; 