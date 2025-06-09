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
        
        if (reviewContent.length < 300) {
          setSubmitError('Текст рецензии должен содержать не менее 300 символов');
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
              <div className="my-10 mx-auto">
                <div className="text-xl lg:text-2xl font-semibold mb-5">Оценить работу</div>
                <div dir="ltr" data-orientation="vertical" className="w-full h-full grid lg:grid-cols-8 items-start gap-5">
                  <div className="lg:col-span-2">
                    <div 
                      role="tablist" 
                      aria-orientation="vertical" 
                      className="rounded-md bg-muted p-1 text-muted-foreground grid w-full h-auto items-stretch justify-stretch" 
                      tabIndex="0" 
                      data-orientation="vertical" 
                      style={{ outline: 'none' }}
                    >
                      <button 
                        type="button" 
                        role="tab" 
                        aria-selected={tabState === 'review-form'} 
                        aria-controls="radix-:rh:-content-review-form" 
                        data-state={tabState === 'review-form' ? 'active' : 'inactive'} 
                        id="radix-:rh:-trigger-review-form" 
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm w-full max-w-full h-12 font-semibold ${tabState === 'review-form' ? 'data-[state=active]:bg-white data-[state=active]:text-black' : ''}`} 
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
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm w-full max-w-full h-12 font-semibold ${tabState === 'score-review-form' ? 'data-[state=active]:bg-white data-[state=active]:text-black' : ''}`} 
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
                      className="relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-foreground border-red-500/50 bg-white/5 mt-5 max-lg:py-1.5 max-lg:px-3 flex-col"
                    >
                      <svg 
                        stroke="currentColor" 
                        fill="currentColor" 
                        strokeWidth="0" 
                        viewBox="0 0 512 512" 
                        className="h-5 w-5 fill-red-600 max-lg:!top-1.5" 
                        height="1em" 
                        width="1em" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M228.9 79.9L51.8 403.1C40.6 423.3 55.5 448 78.9 448h354.3c23.3 0 38.2-24.7 27.1-44.9L283.1 79.9c-11.7-21.2-42.5-21.2-54.2 0zM273.6 214L270 336h-28l-3.6-122h35.2zM256 402.4c-10.7 0-19.1-8.1-19.1-18.4s8.4-18.4 19.1-18.4 19.1 8.1 19.1 18.4-8.4 18.4-19.1 18.4z"></path>
                      </svg>
                      <h5 className="leading-none tracking-tight max-lg:text-sm font-bold mb-2">Ознакомьтесь с критериями.</h5>
                      <div className="text-sm [&_p]:leading-relaxed max-lg:text-xs">
                        <div className="">Будут отклонены рецензии:</div>
                        <ul className="list-disc list-inside marker:text-red-500 ">
                          <li>с матом</li>
                          <li>с оскорблениями</li>
                          <li>с рекламой и ссылками</li>
                          <li>малосодержательные</li>
                        </ul>
                        <button 
                          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3 w-full mt-2" 
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
                  <div className="lg:col-span-6 ">
                    <div 
                      data-state={tabState === 'review-form' ? 'active' : 'inactive'} 
                      data-orientation="vertical" 
                      role="tabpanel" 
                      aria-labelledby="radix-:rh:-trigger-review-form" 
                      id="radix-:rh:-content-review-form" 
                      tabIndex="0" 
                      className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-0" 
                      style={{ animationDuration: '0s', display: tabState === 'review-form' ? 'block' : 'none' }}
                    >
                      <form action="">
                        <div className="border text-card-foreground shadow-sm bg-zinc-900 rounded-xl p-2">
                          <div className="p-0">
                            <div className="">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <div className="grid col-span-full px-5 pt-3 pb-5 w-full grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-2 lg:gap-y-3 lg:gap-x-5 border border-ratingText bg-gradient-to-br from-ratingText/20 to-ratingText/5 rounded-xl">
                                  <div className="">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">Рифмы / Образы</div>
                                      <div className="lg:text-xl font-bold">{rhymeImagery}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={rhymeImagery}
                                      onChange={(e) => setRhymeImagery(parseInt(e.target.value))}
                                      className="slider bg-white/10 h-[10px] w-full flex-grow rounded-full cursor-grab"
                                    />
                                  </div>
                                  <div className="">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">Структура / Ритмика</div>
                                      <div className="lg:text-xl font-bold">{structureRhythm}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={structureRhythm}
                                      onChange={(e) => setStructureRhythm(parseInt(e.target.value))}
                                      className="slider bg-white/10 h-[10px] w-full flex-grow rounded-full cursor-grab"
                                    />
                                  </div>
                                  <div className="">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">Реализация стиля</div>
                                      <div className="lg:text-xl font-bold">{styleExecution}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={styleExecution}
                                      onChange={(e) => setStyleExecution(parseInt(e.target.value))}
                                      className="slider bg-white/10 h-[10px] w-full flex-grow rounded-full cursor-grab"
                                    />
                                  </div>
                                  <div className="">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">Индивидуальность / Харизма</div>
                                      <div className="lg:text-xl font-bold">{individuality}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={individuality}
                                      onChange={(e) => setIndividuality(parseInt(e.target.value))}
                                      className="slider bg-white/10 h-[10px] w-full flex-grow rounded-full cursor-grab"
                                    />
                                  </div>
                                </div>
                                <div className="grid px-5 pt-2 slider-track-vibe pb-5 col-span-full items-start gap-10 border border-ratingVibe bg-gradient-to-br from-ratingVibe/20 to-ratingVibe/5 rounded-xl">
                                  <div className="">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">Атмосфера / Вайб</div>
                                      <div className="lg:text-xl font-bold">{vibe}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={vibe}
                                      onChange={(e) => setVibe(parseInt(e.target.value))}
                                      className="slider bg-white/10 h-[10px] w-full flex-grow rounded-full cursor-grab"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 lg:mt-5">
                                <div className="mb-2 lg:mb-2">
                                  <input 
                                    className="flex w-full border border-input bg-background px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-base max-lg:placeholder:text-sm h-14 rounded-lg transition-shadow duration-300" 
                                    id="review_title" 
                                    placeholder="Заголовок рецензии" 
                                    value={reviewTitle} 
                                    name="review_title"
                                    onChange={handleTitleChange}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <textarea 
                                    className="flex w-full border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-base resize-y max-lg:placeholder:text-xs h-14 rounded-lg min-h-[140px] max-h-[500px] transition-shadow duration-300" 
                                    name="content" 
                                    id="content" 
                                    placeholder="Текст рецензии (от 300 до 8500 символов)" 
                                    maxLength="9000"
                                    value={reviewContent}
                                    onChange={handleContentChange}
                                  ></textarea>
                                  <div className="flex justify-between items-stretch space-x-2">
                                    <button 
                                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 space-x-2 text-xs lg:text-sm w-[200px]" 
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
                                    <div className="text-sm items-center bg-zinc-950 h-10 flex text-center px-2 rounded-md border text-muted-foreground font-semibold">{contentLength}/8500</div>
                                  </div>
                                </div>
                                {/* Отображение ошибки */}
                                {submitError && (
                                  <div className="mt-2 text-red-500 text-sm">{submitError}</div>
                                )}
                                <div className="mt-5 flex items-center space-x-10 justify-end">
                                  <div className="relative">
                                    <span className="font-bold text-4xl lg:text-5xl ">{totalScore}</span>
                                    <span className="absolute top-1 text-xs -right-7 w-6 text-zinc-400 font-semibold">/ 100</span>
                                  </div>
                                  <button 
                                    className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full size-16 p-0 hover:ring-4 hover:ring-white/40 hover:scale-90 transition-all duration-500" 
                                    type="button" 
                                    aria-haspopup="dialog" 
                                    aria-expanded="false" 
                                    aria-controls="radix-:rq:" 
                                    data-state="closed"
                                    onClick={handleSubmitReview}
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting ? (
                                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="size-8" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
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
                      className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-0"
                      style={{ display: tabState === 'score-review-form' ? 'block' : 'none' }}
                    >
                      <form action="">
                        <div className="border text-card-foreground shadow-sm bg-zinc-900 rounded-xl p-2">
                          <div className="p-0">
                            <div className="">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <div className="grid col-span-full px-5 pt-3 pb-5 w-full grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-2 lg:gap-y-3 lg:gap-x-5 border border-ratingText bg-gradient-to-br from-ratingText/20 to-ratingText/5 rounded-xl">
                                  <div className="">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">Рифмы / Образы</div>
                                      <div className="lg:text-xl font-bold">{rhymeImagery}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={rhymeImagery}
                                      onChange={(e) => setRhymeImagery(parseInt(e.target.value))}
                                      className="slider bg-white/10 h-[10px] w-full flex-grow rounded-full cursor-grab"
                                    />
                                  </div>
                                  <div className="">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">Структура / Ритмика</div>
                                      <div className="lg:text-xl font-bold">{structureRhythm}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={structureRhythm}
                                      onChange={(e) => setStructureRhythm(parseInt(e.target.value))}
                                      className="slider bg-white/10 h-[10px] w-full flex-grow rounded-full cursor-grab"
                                    />
                                  </div>
                                  <div className="">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">Реализация стиля</div>
                                      <div className="lg:text-xl font-bold">{styleExecution}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={styleExecution}
                                      onChange={(e) => setStyleExecution(parseInt(e.target.value))}
                                      className="slider bg-white/10 h-[10px] w-full flex-grow rounded-full cursor-grab"
                                    />
                                  </div>
                                  <div className="">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">Индивидуальность / Харизма</div>
                                      <div className="lg:text-xl font-bold">{individuality}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={individuality}
                                      onChange={(e) => setIndividuality(parseInt(e.target.value))}
                                      className="slider bg-white/10 h-[10px] w-full flex-grow rounded-full cursor-grab"
                                    />
                                  </div>
                                </div>
                                <div className="grid px-5 pt-2 slider-track-vibe pb-5 col-span-full items-start gap-10 border border-ratingVibe bg-gradient-to-br from-ratingVibe/20 to-ratingVibe/5 rounded-xl">
                                  <div className="">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">Атмосфера / Вайб</div>
                                      <div className="lg:text-xl font-bold">{vibe}</div>
                                    </div>
                                    <input 
                                      type="range"
                                      min="1"
                                      max="10"
                                      step="1"
                                      value={vibe}
                                      onChange={(e) => setVibe(parseInt(e.target.value))}
                                      className="slider bg-white/10 h-[10px] w-full flex-grow rounded-full cursor-grab"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Отображение ошибки */}
                              {submitError && (
                                <div className="mt-2 text-red-500 text-sm">{submitError}</div>
                              )}
                              
                              <div className="mt-5 flex items-center space-x-10 justify-end">
                                <div className="relative">
                                  <span className="font-bold text-4xl lg:text-5xl ">{totalScore}</span>
                                  <span className="absolute top-1 text-xs -right-7 w-6 text-zinc-400 font-semibold">/ 100</span>
                                </div>
                                <button 
                                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full size-16 p-0 hover:ring-4 hover:ring-white/40 hover:scale-90 transition-all duration-500" 
                                  type="button" 
                                  aria-haspopup="dialog" 
                                  aria-expanded="false" 
                                  aria-controls="radix-:rq:" 
                                  data-state="closed"
                                  onClick={handleSubmitReview}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="size-8" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
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
              <div className="my-10 mx-auto text-center">
                <div className="p-6 border border-gray-700 rounded-lg bg-zinc-900/50">
                  <div className="text-xl font-semibold mb-4">Чтобы оставить рецензию, необходимо авторизоваться</div>
                  <a href="/login" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
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