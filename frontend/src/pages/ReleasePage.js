import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { releaseApi } from '../shared/api/release';
import { reviewApi } from '../shared/api/review';
import { useAuth } from '../app/providers/AuthProvider';
import './ReleasePage.css';

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
      
    } catch (err) {
      console.error('Ошибка при создании рецензии:', err);
      setSubmitError('Не удалось сохранить рецензию. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
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
  }, [id]);

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
                        href={`/artist/${artist.id || ''}`}
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
                            href={`/producer/${producer.id || ''}`}
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
                      <span>{favoritesCount}</span>
                    </div>
                  </button>
                </div>
                <button 
                  className="like-button" 
                  data-state="closed"
                >
                  <svg 
                    stroke="currentColor" 
                    fill="currentColor" 
                    strokeWidth="0" 
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default ReleasePage; 