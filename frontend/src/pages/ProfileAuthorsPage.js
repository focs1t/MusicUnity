import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../shared/api/user';
import './AuthorsPage.css';
import { LoadingSpinner } from '../shared/ui/LoadingSpinner';

// Встроенный плейсхолдер в формате data URI для аватара
const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';

const ProfileAuthorsPage = () => {
  const [selectedType, setSelectedType] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useParams();

  const authorTypes = [
    { value: 'all', label: 'Все' },
    { value: 'producers', label: 'Продюссеры' },
    { value: 'performers', label: 'Исполнители' }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setIsTypeDropdownOpen(false);
    
    // Сбрасываем на первую страницу при смене фильтра
    setCurrentPage(1);
    
    // Обновляем URL с учетом фильтра
    const searchParams = new URLSearchParams();
    searchParams.set('page', '1');
    if (type && type !== 'all') {
      searchParams.set('type', type);
    }
    navigate(`/profile/${userId}/authors?${searchParams.toString()}`);
  };

  const toggleTypeDropdown = () => {
    setIsTypeDropdownOpen(!isTypeDropdownOpen);
  };

  const getAuthorAvatarUrl = (author) => {
    if (author.avatarUrl) {
      try {
        // Проверяем является ли строка URL валидным URL
        new URL(author.avatarUrl);
        
        let processedUrl = author.avatarUrl;
        // Обрезаем URL, если он содержит параметры запроса
        if (processedUrl.includes('?')) {
          processedUrl = processedUrl.split('?')[0];
        }
        
        return processedUrl;
      } catch (e) {
        console.error(`Некорректный URL аватара для автора ${author.name}:`, author.avatarUrl);
        return DEFAULT_AVATAR_PLACEHOLDER;
      }
    }
    
    // Если нет URL, возвращаем placeholder
    return DEFAULT_AVATAR_PLACEHOLDER;
  };

  const handleImageError = (e, author) => {
    console.error(`Ошибка загрузки аватара для автора ${author.name}:`, e.target.src);
    e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
  };

  const loadAuthors = async (type = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const pageSize = 10; // Количество авторов на странице
      const pageIndex = page - 1; // API ожидает индекс от 0
      
      // Загружаем отслеживаемых авторов пользователя
      // Загружаем больше данных для правильной фильтрации, если нужен фильтр
      const fetchSize = (type && type !== 'all') ? 100 : pageSize;
      const fetchIndex = (type && type !== 'all') ? 0 : pageIndex;
      
      const response = await userApi.getFollowedAuthors(userId, fetchIndex, fetchSize);
      
      // Фильтрация авторов по типу
      let filteredAuthors = response.content || [];
      
      // Добавляем отладку для понимания структуры данных
      if (filteredAuthors.length > 0) {
        console.log('Пример автора для отладки:', filteredAuthors[0]);
        console.log('Доступные поля автора:', Object.keys(filteredAuthors[0]));
      }
      
      if (type && type !== 'all') {
        console.log(`Фильтрация по типу: ${type}`);
        console.log(`Всего авторов до фильтрации: ${filteredAuthors.length}`);
        
        filteredAuthors = filteredAuthors.filter(author => {
          console.log(`Автор ${author.name}, authorType: ${author.authorType}, isProducer: ${author.isProducer}, isArtist: ${author.isArtist}`);
          
          if (type === 'producers') {
            // Проверяем разные возможные поля
            return author.authorType === 'PRODUCER' || 
                   author.authorType === 'Producer' || 
                   author.isProducer === true ||
                   author.type === 'PRODUCER';
          } else if (type === 'performers') {
            // Проверяем разные возможные поля  
            return author.authorType === 'ARTIST' || 
                   author.authorType === 'Artist' || 
                   author.authorType === 'PERFORMER' ||
                   author.authorType === 'Performer' ||
                   author.isArtist === true ||
                   author.type === 'ARTIST';
          }
          return true;
        });
        
        console.log(`Авторов после фильтрации: ${filteredAuthors.length}`);
        
        // Применяем пагинацию к отфильтрованным данным
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedAuthors = filteredAuthors.slice(startIndex, endIndex);
        
        setAuthors(paginatedAuthors);
        setTotalPages(Math.ceil(filteredAuthors.length / pageSize));
      } else {
        setAuthors(filteredAuthors);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err) {
      setError('Ошибка при загрузке авторов');
      console.error('Error loading authors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка информации о пользователе
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userApi.getUserDetails(userId);
        setUserDetails(userData);
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Получение параметров из URL при загрузке
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pageParam = queryParams.get('page');
    const typeParam = queryParams.get('type');
    
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    }
    if (typeParam) {
      setSelectedType(typeParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (userId) {
      loadAuthors(selectedType, currentPage);
    }
  }, [selectedType, currentPage, userId]);

  // Обработка смены страницы
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Сохраняем текущий фильтр в URL
    const searchParams = new URLSearchParams();
    searchParams.set('page', page.toString());
    if (selectedType && selectedType !== 'all') {
      searchParams.set('type', selectedType);
    }
    navigate(`/profile/${userId}/authors?${searchParams.toString()}`);
    window.scrollTo(0, 0);
  };

  // Функция для округления до десятых
  const roundToTenth = (value) => {
    if (value === null || value === undefined || value === 0) return '0.0';
    return Number(value).toFixed(1);
  };

  // Создание элементов пагинации
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    // Определяем диапазон видимых страниц
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Корректируем начальную страницу если диапазон слишком мал
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Добавляем кнопку "Предыдущая" если не на первой странице
    if (currentPage > 1) {
      buttons.push(
        <li key="prev">
          <Link
            to={(() => {
              const params = new URLSearchParams();
              params.set('page', (currentPage - 1).toString());
              if (selectedType && selectedType !== 'all') params.set('type', selectedType);
              return `/profile/${userId}/authors?${params.toString()}`;
            })()}
            aria-label="Перейти на предыдущую страницу"
            className="pagination-button prev-next"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            <span className="prev-next-text">Предыдущая</span>
          </Link>
        </li>
      );
    }
    
    // Показываем первую страницу если она не в диапазоне
    if (startPage > 1) {
      buttons.push(
        <li key={1}>
          <Link
            to={(() => {
              const params = new URLSearchParams();
              params.set('page', '1');
              if (selectedType && selectedType !== 'all') params.set('type', selectedType);
              return `/profile/${userId}/authors?${params.toString()}`;
            })()}
            className="pagination-button"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </Link>
        </li>
      );
    }
    
    // Показываем страницы в диапазоне
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <li key={i}>
          <Link
            to={(() => {
              const params = new URLSearchParams();
              params.set('page', i.toString());
              if (selectedType && selectedType !== 'all') params.set('type', selectedType);
              return `/profile/${userId}/authors?${params.toString()}`;
            })()}
            className={`pagination-button ${i === currentPage ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
          >
            {i}
          </Link>
        </li>
      );
    }

    // Показываем последнюю страницу если она не в диапазоне
    if (endPage < totalPages) {
      buttons.push(
        <li key={totalPages}>
          <Link
            to={(() => {
              const params = new URLSearchParams();
              params.set('page', totalPages.toString());
              if (selectedType && selectedType !== 'all') params.set('type', selectedType);
              return `/profile/${userId}/authors?${params.toString()}`;
            })()}
            className="pagination-button"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </Link>
        </li>
      );
    }

    // Добавляем кнопку "Следующая" если не на последней странице
    if (currentPage < totalPages) {
      buttons.push(
        <li key="next">
          <Link
            to={(() => {
              const params = new URLSearchParams();
              params.set('page', (currentPage + 1).toString());
              if (selectedType && selectedType !== 'all') params.set('type', selectedType);
              return `/profile/${userId}/authors?${params.toString()}`;
            })()}
            aria-label="Перейти на следующую страницу"
            className="pagination-button prev-next"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
          >
            <span className="prev-next-text">Следующая</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </Link>
        </li>
      );
    }

    return buttons;
  };

  return (
    <div className="site-content authors-page">
      <main className="">
        <div className="container">
          <h1 className="authors-title">
            Авторы {userDetails?.username && `пользователя ${userDetails.username}`}
          </h1>
          
          <div className="filter-card">
            <div className="filter-content">
              <div className="filter-row">
                <div className="filter-controls">
                  <div className="dropdown-wrapper">
                    <button 
                      type="button" 
                      className={`dropdown-trigger ${isTypeDropdownOpen ? 'open' : ''}`}
                      onClick={toggleTypeDropdown}
                      aria-expanded={isTypeDropdownOpen}
                    >
                      <span className="dropdown-text">
                        {selectedType ? authorTypes.find(type => type.value === selectedType)?.label : 'Выберите тип автора'}
                      </span>
                      <svg 
                        className="dropdown-arrow" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </button>
                    
                    {isTypeDropdownOpen && (
                      <div className="dropdown-menu">
                        {authorTypes.map((type) => (
                          <button
                            key={type.value}
                            className="dropdown-item"
                            onClick={() => handleTypeSelect(type.value)}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Список авторов */}
          <div className="authors-grid">
            {loading && (
              <LoadingSpinner 
                text="Загрузка авторов..." 
                className="loading-container--center"
              />
            )}
            
            {error && (
              <div className="error-container">
                <p className="error-message">{error}</p>
              </div>
            )}
            
            {!loading && !error && authors.length === 0 && (
              <div className="authors-placeholder">
                <p>Нет отслеживаемых авторов</p>
              </div>
            )}
            
            {!loading && !error && authors.length > 0 && (
              <div className="authors-list">
                {authors.map((author) => (
                  <div key={author.authorId} className="author-card">
                    <a href={`/author/${author.authorId}`} className="author-link">
                      <div className="author-avatar-container">
                        <img 
                          src={getAuthorAvatarUrl(author)} 
                          alt={author.name}
                          className="author-avatar"
                          onError={(e) => handleImageError(e, author)}
                        />
                      </div>
                     
                      <div className="author-name-container">
                        <span className="author-name">{author.name}</span>
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
            )}
          </div>
          
          {/* Пагинация */}
          {!loading && !error && totalPages > 1 && (
            <div className="pagination-container">
              <nav role="navigation" aria-label="pagination" className="pagination-nav">
                <ul className="pagination-list">
                  {renderPaginationButtons()}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfileAuthorsPage; 