import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getTopRatedReleasesByType, 
  getAvailableYears, 
  getAvailableYearsByType, 
  getAvailableMonthsByYear, 
  getAvailableMonthsByYearAndType 
} from '../api/release';
import { reviewApi } from '../shared/api/review';
import { likeApi } from '../shared/api/like';
import './RatingPage.css';

const DEFAULT_COVER_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTExODI3Ii8+CjxwYXRoIGQ9Ik0yMCAxMkM5IDE4IDkgMjYgMjAgMzJDMzEgMjYgMzEgMTggMjAgMTJaIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjQiIGZpbGw9IiM2Mzc0OEEiLz4KPC9zdmc+';

const RatingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Фильтры
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  
  // Данные
  const [topTracks, setTopTracks] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  
  const months = [
    { value: 1, label: 'Январь' },
    { value: 2, label: 'Февраль' },
    { value: 3, label: 'Март' },
    { value: 4, label: 'Апрель' },
    { value: 5, label: 'Май' },
    { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' },
    { value: 8, label: 'Август' },
    { value: 9, label: 'Сентябрь' },
    { value: 10, label: 'Октябрь' },
    { value: 11, label: 'Ноябрь' },
    { value: 12, label: 'Декабрь' }
  ];

  // Загружаем доступные годы
  useEffect(() => {
    const loadAvailableYears = async () => {
      try {
        const years = await getAvailableYears();
        setAvailableYears(years);
        
        // Если текущий год не входит в доступные, выбираем первый доступный
        if (years.length > 0 && !years.includes(selectedYear)) {
          setSelectedYear(years[0]);
        }
      } catch (error) {
        console.error('Ошибка загрузки доступных годов:', error);
        // Fallback к статичному списку
        const currentYear = new Date().getFullYear();
        const fallbackYears = [];
        for (let year = currentYear; year >= 2020; year--) {
          fallbackYears.push(year);
        }
        setAvailableYears(fallbackYears);
      }
    };

    loadAvailableYears();
  }, []);

  // Загружаем доступные месяцы при изменении года
  useEffect(() => {
    const loadAvailableMonths = async () => {
      if (!selectedYear) return;
      
      try {
        const months = await getAvailableMonthsByYear(selectedYear);
        setAvailableMonths(months);
        
        // Если текущий месяц не входит в доступные, выбираем первый доступный
        if (months.length > 0 && !months.includes(selectedMonth)) {
          setSelectedMonth(months[0]);
        }
      } catch (error) {
        console.error('Ошибка загрузки доступных месяцев:', error);
        // Fallback к всем месяцам
        setAvailableMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      }
    };

    loadAvailableMonths();
  }, [selectedYear]);

  const fetchRatingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Получаем топ треки (SINGLE типы)
      const tracksResponse = await getTopRatedReleasesByType('SINGLE', 0, 10, {
        year: selectedYear,
        month: selectedMonth
      });
      
      // Получаем топ альбомы (ALBUM типы)
      const albumsResponse = await getTopRatedReleasesByType('ALBUM', 0, 10, {
        year: selectedYear,
        month: selectedMonth
      });
      
      // Дополняем данные статистикой
      const tracksWithStats = await Promise.all(
        tracksResponse.content.map(async (release) => {
          try {
            const [reviewsCount, extendedReviewsCount, avgRating] = await Promise.all([
              reviewApi.getReviewsCountByRelease(release.releaseId),
              reviewApi.getExtendedReviewsByRelease(release.releaseId, 0, 1),
              // Используем средний рейтинг релиза если есть
              Promise.resolve(release.averageRating || release.avgRating || null)
            ]);
            
            return {
              ...release,
              reviewsCount,
              extendedReviewsCount: extendedReviewsCount.totalElements,
              avgRating: avgRating || (release.averageRating || release.avgRating)
            };
          } catch (error) {
            console.error(`Ошибка получения статистики для трека ${release.releaseId}:`, error);
            return {
              ...release,
              reviewsCount: 0,
              extendedReviewsCount: 0,
              avgRating: null
            };
          }
        })
      );
      
      const albumsWithStats = await Promise.all(
        albumsResponse.content.map(async (release) => {
          try {
            const [reviewsCount, extendedReviewsCount, avgRating] = await Promise.all([
              reviewApi.getReviewsCountByRelease(release.releaseId),
              reviewApi.getExtendedReviewsByRelease(release.releaseId, 0, 1),
              Promise.resolve(release.averageRating || release.avgRating || null)
            ]);
            
            return {
              ...release,
              reviewsCount,
              extendedReviewsCount: extendedReviewsCount.totalElements,
              avgRating: avgRating || (release.averageRating || release.avgRating)
            };
          } catch (error) {
            console.error(`Ошибка получения статистики для альбома ${release.releaseId}:`, error);
            return {
              ...release,
              reviewsCount: 0,
              extendedReviewsCount: 0,
              avgRating: null
            };
          }
        })
      );
      
      setTopTracks(tracksWithStats);
      setTopAlbums(albumsWithStats);
      
    } catch (error) {
      console.error('Ошибка загрузки данных рейтинга:', error);
      setError('Не удалось загрузить данные рейтинга');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatingData();
  }, [selectedYear, selectedMonth]);

  // Закрытие дропдаунов при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.rating-filter-dropdown')) {
        setYearDropdownOpen(false);
        setMonthDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleReleaseImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COVER_PLACEHOLDER;
  };

  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Неизвестный исполнитель';
    
    return authors.map((author, index) => (
      <span key={author.authorId || index}>
        {index > 0 && ', '}
        <Link to={`/author/${author.authorId}`} className="author-link">
          {author.name}
        </Link>
      </span>
    ));
  };

  const getSelectedMonthLabel = () => {
    const month = months.find(m => m.value === selectedMonth);
    return month ? month.label : 'Месяц';
  };

  const renderReleaseItem = (release, isAlbum = false) => {
    const hasStats = release.reviewsCount > 0 || release.extendedReviewsCount > 0;
    
    return (
      <div key={release.releaseId} className="rating-item">
        <Link className="rating-item-image" to={`/release/${release.releaseId}`}>
          <img 
            alt={release.title} 
            loading="lazy" 
            className="rating-cover"
            src={release.coverUrl || DEFAULT_COVER_PLACEHOLDER} 
            onError={handleReleaseImageError}
          />
        </Link>
        
        <div className="rating-item-info">
          {hasStats && (
            <div className="rating-item-stats">
              <div className="rating-stat-item">
                <svg className="rating-stat-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                  <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                </svg>
                <span>{release.extendedReviewsCount || 0}</span>
              </div>
              <div className="rating-stat-item">
                <svg className="rating-stat-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                  <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                </svg>
                <span>{release.reviewsCount || 0}</span>
              </div>
            </div>
          )}
          
          <div className="rating-item-title">
            <Link to={`/release/${release.releaseId}`} className="rating-title-link">
              {release.title}
            </Link>
          </div>
          
          <div className="rating-item-authors">
            {release.authors && release.authors.length > 0 ? (
              formatAuthors(release.authors)
            ) : (
              <span className="unknown-author">Неизвестный исполнитель</span>
            )}
          </div>
        </div>
        
        <div className="rating-item-scores">
          {release.avgRating && (
            <div className="rating-scores-group">
              <div className="rating-score-circle filled">
                {Math.round(release.avgRating)}
              </div>
              {release.averageExtendedRating && release.averageExtendedRating !== release.avgRating && (
                <div className="rating-score-circle outlined">
                  {Math.round(release.averageExtendedRating)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="site-content rating-page">
        <main>
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="site-content rating-page">
        <main>
          <div className="container">
            <div className="error-container">
              <div className="error-message">{error}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="site-content rating-page">
      <main>
        <div className="container">
          <h1 className="rating-title">Рейтинг</h1>
        </div>
        
        <div className="container">
          <div className="rating-filters-container">
            <div className="rating-filters-card">
              <div className="rating-filters-content">
                <div className="rating-filters-label">Фильтр</div>
                
                <div className="rating-filters-controls">
                  {/* Год */}
                  <div className="rating-filter-dropdown">
                    <button 
                      type="button" 
                      className="rating-filter-button"
                      onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                    >
                      <span>{selectedYear}</span>
                      <svg className="rating-filter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </button>
                    
                    {yearDropdownOpen && (
                      <div className="rating-filter-menu">
                        {availableYears.map(year => (
                          <div 
                            key={year}
                            className={`rating-filter-option ${selectedYear === year ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedYear(year);
                              setYearDropdownOpen(false);
                            }}
                          >
                            {year}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Месяц */}
                  <div className="rating-filter-dropdown">
                    <button 
                      type="button" 
                      className="rating-filter-button"
                      onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                    >
                      <span>{getSelectedMonthLabel()}</span>
                      <svg className="rating-filter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </button>
                    
                    {monthDropdownOpen && (
                      <div className="rating-filter-menu">
                        {availableMonths.map(month => (
                          <div 
                            key={month}
                            className={`rating-filter-option ${selectedMonth === month ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedMonth(month);
                              setMonthDropdownOpen(false);
                            }}
                          >
                            {months.find(m => m.value === month)?.label || month}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="rating-filters-separator"></div>
              </div>
            </div>
          </div>
          
          <div className="rating-content">
            <div className="rating-section">
              <h2 className="rating-section-title">Треки</h2>
              <div className="rating-items">
                {topTracks.length > 0 ? (
                  topTracks.map(track => renderReleaseItem(track, false))
                ) : (
                  <div className="rating-no-items">Нет данных за выбранный период</div>
                )}
              </div>
            </div>
            
            <div className="rating-section">
              <h2 className="rating-section-title">Альбомы</h2>
              <div className="rating-items">
                {topAlbums.length > 0 ? (
                  topAlbums.map(album => renderReleaseItem(album, true))
                ) : (
                  <div className="rating-no-items">Нет данных за выбранный период</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RatingPage; 