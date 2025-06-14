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
import { LoadingSpinner } from '../shared/ui/LoadingSpinner';

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
      
      // Дополняем данные статистикой и детализированными оценками
      const tracksWithStats = await Promise.all(
        tracksResponse.content.map(async (release) => {
          try {
            const [allReviewsCount, extendedReviewsResponse, averageRatings] = await Promise.all([
              reviewApi.getReviewsCountByRelease(release.releaseId),
              reviewApi.getExtendedReviewsByRelease(release.releaseId, 0, 1),
              reviewApi.getAverageRatingsByRelease(release.releaseId).catch(() => null)
            ]);
            
            const extendedReviewsCount = extendedReviewsResponse.totalElements;
            const simpleReviewsCount = Math.max(0, allReviewsCount - extendedReviewsCount);
            
            return {
              ...release,
              simpleReviewsCount,
              extendedReviewsCount,
              avgRating: release.simpleReviewRating || null,
              avgExtendedRating: release.averageExtendedRating || null,
              // Средние оценки по параметрам для расширенных рецензий
              avgRhymeImageryExtended: averageRatings?.extended?.rhymeImagery || 0,
              avgStructureRhythmExtended: averageRatings?.extended?.structureRhythm || 0,
              avgStyleExecutionExtended: averageRatings?.extended?.styleExecution || 0,
              avgIndividualityExtended: averageRatings?.extended?.individuality || 0,
              avgVibeExtended: averageRatings?.extended?.vibe || 0,
              // Средние оценки по параметрам для простых рецензий
              avgRhymeImagerySimple: averageRatings?.simple?.rhymeImagery || 0,
              avgStructureRhythmSimple: averageRatings?.simple?.structureRhythm || 0,
              avgStyleExecutionSimple: averageRatings?.simple?.styleExecution || 0,
              avgIndividualitySimple: averageRatings?.simple?.individuality || 0,
              avgVibeSimple: averageRatings?.simple?.vibe || 0
            };
          } catch (error) {
            console.error(`Ошибка получения статистики для трека ${release.releaseId}:`, error);
            return {
              ...release,
              simpleReviewsCount: 0,
              extendedReviewsCount: 0,
              avgRating: null,
              avgExtendedRating: null,
              // Устанавливаем нулевые значения для детализированных оценок
              avgRhymeImageryExtended: 0,
              avgStructureRhythmExtended: 0,
              avgStyleExecutionExtended: 0,
              avgIndividualityExtended: 0,
              avgVibeExtended: 0,
              avgRhymeImagerySimple: 0,
              avgStructureRhythmSimple: 0,
              avgStyleExecutionSimple: 0,
              avgIndividualitySimple: 0,
              avgVibeSimple: 0
            };
          }
        })
      );
      
      const albumsWithStats = await Promise.all(
        albumsResponse.content.map(async (release) => {
          try {
            const [allReviewsCount, extendedReviewsResponse, averageRatings] = await Promise.all([
              reviewApi.getReviewsCountByRelease(release.releaseId),
              reviewApi.getExtendedReviewsByRelease(release.releaseId, 0, 1),
              reviewApi.getAverageRatingsByRelease(release.releaseId).catch(() => null)
            ]);
            
            const extendedReviewsCount = extendedReviewsResponse.totalElements;
            const simpleReviewsCount = Math.max(0, allReviewsCount - extendedReviewsCount);
            
            return {
              ...release,
              simpleReviewsCount,
              extendedReviewsCount,
              avgRating: release.simpleReviewRating || null,
              avgExtendedRating: release.averageExtendedRating || null,
              // Средние оценки по параметрам для расширенных рецензий
              avgRhymeImageryExtended: averageRatings?.extended?.rhymeImagery || 0,
              avgStructureRhythmExtended: averageRatings?.extended?.structureRhythm || 0,
              avgStyleExecutionExtended: averageRatings?.extended?.styleExecution || 0,
              avgIndividualityExtended: averageRatings?.extended?.individuality || 0,
              avgVibeExtended: averageRatings?.extended?.vibe || 0,
              // Средние оценки по параметрам для простых рецензий
              avgRhymeImagerySimple: averageRatings?.simple?.rhymeImagery || 0,
              avgStructureRhythmSimple: averageRatings?.simple?.structureRhythm || 0,
              avgStyleExecutionSimple: averageRatings?.simple?.styleExecution || 0,
              avgIndividualitySimple: averageRatings?.simple?.individuality || 0,
              avgVibeSimple: averageRatings?.simple?.vibe || 0
            };
          } catch (error) {
            console.error(`Ошибка получения статистики для альбома ${release.releaseId}:`, error);
            return {
              ...release,
              simpleReviewsCount: 0,
              extendedReviewsCount: 0,
              avgRating: null,
              avgExtendedRating: null,
              // Устанавливаем нулевые значения для детализированных оценок
              avgRhymeImageryExtended: 0,
              avgStructureRhythmExtended: 0,
              avgStyleExecutionExtended: 0,
              avgIndividualityExtended: 0,
              avgVibeExtended: 0,
              avgRhymeImagerySimple: 0,
              avgStructureRhythmSimple: 0,
              avgStyleExecutionSimple: 0,
              avgIndividualitySimple: 0,
              avgVibeSimple: 0
            };
          }
        })
      );
      
      // Сортируем треки и альбомы по приоритету: полные рецензии, потом простые
      const sortByRating = (releases) => {
        return releases.sort((a, b) => {
          // Приоритет 1: Есть ли полные рецензии
          const aHasExtended = a.avgExtendedRating && a.avgExtendedRating > 0;
          const bHasExtended = b.avgExtendedRating && b.avgExtendedRating > 0;
          
          if (aHasExtended && !bHasExtended) return -1;
          if (!aHasExtended && bHasExtended) return 1;
          
          // Если у обоих есть полные рецензии, сортируем по их рейтингу
          if (aHasExtended && bHasExtended) {
            return b.avgExtendedRating - a.avgExtendedRating;
          }
          
          // Если у обоих нет полных рецензий, сортируем по простым
          const aSimpleRating = a.avgRating || 0;
          const bSimpleRating = b.avgRating || 0;
          
          return bSimpleRating - aSimpleRating;
        });
      };

      setTopTracks(sortByRating([...tracksWithStats]));
      setTopAlbums(sortByRating([...albumsWithStats]));
      
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
    
    const authorElements = [];
    
    authors.forEach((author, index) => {
      // Добавляем ссылку на автора
      authorElements.push(
        <Link 
          key={author.id || author.authorId || index} 
          to={`/author/${author.id || author.authorId}`} 
          className="author-link"
        >
          <span>{author.authorName}</span>
        </Link>
      );
      
      // Добавляем разделитель, если это не последний элемент
      if (index < authors.length - 1) {
        authorElements.push(
          <span key={`separator-${index}`} className="author-separator">,&nbsp;</span>
        );
      }
    });
    
    return authorElements;
  };

  const getSelectedMonthLabel = () => {
    const month = months.find(m => m.value === selectedMonth);
    return month ? month.label : 'Месяц';
  };

  // Функция для округления до десятых
  const roundToTenth = (value) => {
    if (value === null || value === undefined || value === 0) return '0.0';
    return Number(value).toFixed(1);
  };

  const renderReleaseItem = (release, isAlbum = false) => {
    const hasStats = release.simpleReviewsCount > 0 || release.extendedReviewsCount > 0;
    
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
                <div className="rating-stat-group">
                  <svg className="rating-stat-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                    <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                  </svg>
                  <span>{release.extendedReviewsCount || 0}</span>
                </div>
                <div className="rating-stat-group">
                  <svg className="rating-stat-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                  </svg>
                  <span>{release.simpleReviewsCount || 0}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="rating-item-title">
            <div className="rating-title-wrapper">
              <div className="rating-title-inner">
                <Link to={`/release/${release.releaseId}`} className="rating-title-link">
                  {release.title}
                </Link>
              </div>
            </div>
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
          <div className="rating-scores-group">
            {/* Расширенные рецензии - закрашенные кружки */}
            {release.avgExtendedRating && (
              <div className="rating-score-wrapper">
                <div 
                  className={`rating-score-circle filled ${release.avgExtendedRating === 100 ? 'gold' : ''}`}
                  data-release-id={release.releaseId}
                  data-review-type="extended"
                >
                  {Math.round(release.avgExtendedRating)}
                </div>
                <div className="rating-hover-menu" data-target={`${release.releaseId}-extended`}>
                  <div className="rating-hover-content">
                    <div className="rating-hover-title">Средняя оценка пользователей с рецензией</div>
                    <div className="rating-hover-stats">
                      <div className="rating-param">
                        <span className="param-name">Рифма и образность:</span>
                        <span className="param-value">{roundToTenth(release.avgRhymeImageryExtended)}</span>
                      </div>
                      <div className="rating-param">
                        <span className="param-name">Структура и ритм:</span>
                        <span className="param-value">{roundToTenth(release.avgStructureRhythmExtended)}</span>
                      </div>
                      <div className="rating-param">
                        <span className="param-name">Стиль и исполнение:</span>
                        <span className="param-value">{roundToTenth(release.avgStyleExecutionExtended)}</span>
                      </div>
                      <div className="rating-param">
                        <span className="param-name">Индивидуальность:</span>
                        <span className="param-value">{roundToTenth(release.avgIndividualityExtended)}</span>
                      </div>
                      <div className="rating-param vibe">
                        <span className="param-name">Вайб:</span>
                        <span className="param-value">{roundToTenth(release.avgVibeExtended)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Простые рецензии - кружки с обводкой */}
            {release.avgRating && (
              <div className="rating-score-wrapper">
                <div 
                  className={`rating-score-circle outlined ${release.avgRating === 100 ? 'gold' : ''}`}
                  data-release-id={release.releaseId}
                  data-review-type="simple"
                >
                  {Math.round(release.avgRating)}
                </div>
                <div className="rating-hover-menu" data-target={`${release.releaseId}-simple`}>
                  <div className="rating-hover-content">
                    <div className="rating-hover-title">Средняя оценка пользователей без рецензии</div>
                    <div className="rating-hover-stats">
                      <div className="rating-param">
                        <span className="param-name">Рифма и образность:</span>
                        <span className="param-value">{roundToTenth(release.avgRhymeImagerySimple)}</span>
                      </div>
                      <div className="rating-param">
                        <span className="param-name">Структура и ритм:</span>
                        <span className="param-value">{roundToTenth(release.avgStructureRhythmSimple)}</span>
                      </div>
                      <div className="rating-param">
                        <span className="param-name">Стиль и исполнение:</span>
                        <span className="param-value">{roundToTenth(release.avgStyleExecutionSimple)}</span>
                      </div>
                      <div className="rating-param">
                        <span className="param-name">Индивидуальность:</span>
                        <span className="param-value">{roundToTenth(release.avgIndividualitySimple)}</span>
                      </div>
                      <div className="rating-param vibe">
                        <span className="param-name">Вайб:</span>
                        <span className="param-value">{roundToTenth(release.avgVibeSimple)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="site-content rating-page">
        <main>
          <div className="container">
            <LoadingSpinner 
              text="Загрузка рейтинга..." 
              className="loading-container--center"
            />
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