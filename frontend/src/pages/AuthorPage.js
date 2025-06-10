import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authorApi } from '../shared/api/author';
import { releaseApi } from '../shared/api/release';
import { userApi } from '../shared/api/user';
import Notification from '../components/Notification';
import './AuthorPage.css';

const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';
const userColor = '#3a82f7';

// Утилитарная функция для получения ID текущего пользователя
const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user.userId;
    }
  } catch (error) {
    console.error('Ошибка парсинга данных пользователя из localStorage:', error);
  }
  return null;
};

const AuthorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [authorReleases, setAuthorReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем данные автора
        const authorData = await authorApi.getAuthorById(id);
        setAuthor(authorData);
        setFollowersCount(authorData.followingCount || 0);

        // Проверяем подписку на автора только для авторизованных пользователей
        const currentUserId = getCurrentUserId();
        if (currentUserId) {
          try {
            const isFollowingAuthor = await authorApi.checkFollowStatus(id);
            setIsFollowing(isFollowingAuthor);
          } catch (err) {
            console.error('Ошибка при проверке подписки:', err);
            // Если ошибка 401 или 403, пользователь не авторизован
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              console.log('Пользователь не авторизован или нет прав для проверки подписки');
            }
            setIsFollowing(false);
          }
        } else {
          setIsFollowing(false);
        }

        // Получаем релизы автора (лучшие работы)
        const releasesData = await releaseApi.getReleasesByAuthor(id, 0, 10);
        setAuthorReleases(releasesData.content || []);

      } catch (err) {
        console.error('Ошибка при загрузке данных автора:', err);
        setError('Не удалось загрузить данные автора');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuthorData();
    }
  }, [id]);

  const handleFollowClick = async () => {
    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        console.error('Пользователь не авторизован');
        return;
      }

      if (isFollowing) {
        await authorApi.unfollowAuthor(id, currentUserId);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await authorApi.followAuthor(id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Ошибка при изменении подписки:', err);
      
      // Проверяем на ошибку автора
      if (err.response && err.response.status === 403 && 
          err.response.data && err.response.data.message && 
          err.response.data.message.includes('не может добавлять релизы в предпочтения')) {
        setNotification({
          message: 'Автор не может подписываться на других авторов',
          type: 'error'
        });
      } else {
        setNotification({
          message: 'Ошибка при подписке',
          type: 'error'
        });
      }
    }
  };

  const getAuthorAvatarUrl = (author) => {
    if (author?.avatarUrl && author.avatarUrl.trim() !== '') {
      return author.avatarUrl;
    }
    return DEFAULT_AVATAR_PLACEHOLDER;
  };

  const handleImageError = (e, author) => {
    if (e.target.src !== DEFAULT_AVATAR_PLACEHOLDER) {
      e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
    }
  };

  const getAverageRating = (extendedRating, simpleRating) => {
    if (extendedRating && simpleRating) {
      return Math.round((extendedRating + simpleRating) / 2);
    }
    return extendedRating || simpleRating || 0;
  };

  const formatRating = (rating) => {
    return rating ? Math.round(rating) : '—';
  };

  if (loading) {
    return (
      <div className="author-page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="author-page-container">
        <div className="error-message">
          <h2>Ошибка</h2>
          <p>{error || 'Автор не найден'}</p>
          <button onClick={() => navigate('/authors')} className="back-button">
            Вернуться к авторам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="author-page-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <main>
        <div className="container">
          {/* Главная секция с фоном */}
          <div className="author-hero-section">
            <div className="like-button-container">
              <button 
                className={`like-button ${isFollowing ? 'following' : ''}`}
                onClick={handleFollowClick}
                title={isFollowing ? "Отписаться" : "Подписаться"}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="heart-icon" 
                  height="1em" 
                  width="1em"
                  fill={isFollowing ? "#ef4444" : "none"}
                  stroke={isFollowing ? "none" : "currentColor"}
                  strokeWidth={isFollowing ? "0" : "2"}
                >
                  <path fill="none" d="M0 0h24v24H0z"></path>
                  <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                </svg>
              </button>
            </div>

            <img 
              alt={author.authorName} 
              className="hero-background-image" 
              src={getAuthorAvatarUrl(author)}
              onError={(e) => handleImageError(e, author)}
            />

            <div className="hero-content">
              <div className="author-info">
                <div className="author-name-block">
                  <h1 className="author-name">{author.authorName}</h1>
                  <div className="verification-container">
                    <svg 
                      className={`verification-icon ${author.isVerified ? 'verified' : 'unverified'}`}
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                      width="24"
                      height="24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                </div>

                <div className="followers-block">
                  <div className="followers-content">
                    <svg 
                      stroke="currentColor" 
                      fill="currentColor" 
                      strokeWidth="0" 
                      viewBox="0 0 384 512" 
                      className="bookmark-icon" 
                      height="1em" 
                      width="1em"
                    >
                      <path d="M0 512V48C0 21.49 21.49 0 48 0h288c26.51 0 48 21.49 48 48v464L192 400 0 512z"></path>
                    </svg>
                    <span>{followersCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Секция со средними баллами */}
          <section className="ratings-section">
            <div className="ratings-grid">
              <div className="ratings-card">
                <div className="ratings-title">Средний балл</div>
                
                <div className="rating-row">
                  <svg 
                    stroke="currentColor" 
                    fill="currentColor" 
                    strokeWidth="0" 
                    viewBox="0 0 24 24" 
                    className="rating-icon" 
                    height="1em" 
                    width="1em"
                  >
                    <circle cx="11.99" cy="11.99" r="2.01"></circle>
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                    <path d="M12 6a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4z"></path>
                  </svg>
                  <div className="rating-circles">
                    {author.averageAlbumExtendedRating ? (
                      <div className="rating-circle filled">
                        {formatRating(author.averageAlbumExtendedRating)}
                      </div>
                    ) : (
                      <div className="rating-circle dashed"></div>
                    )}
                    {author.averageAlbumSimpleRating ? (
                      <div className="rating-circle outlined">
                        {formatRating(author.averageAlbumSimpleRating)}
                      </div>
                    ) : (
                      <div className="rating-circle dashed"></div>
                    )}
                  </div>
                </div>

                <div className="rating-row">
                  <svg 
                    stroke="currentColor" 
                    fill="currentColor" 
                    strokeWidth="0" 
                    viewBox="0 0 512 512" 
                    className="rating-icon" 
                    height="1em" 
                    width="1em"
                  >
                    <path d="M406.3 48.2c-4.7.9-202 39.2-206.2 40-4.2.8-8.1 3.6-8.1 8v240.1c0 1.6-.1 7.2-2.4 11.7-3.1 5.9-8.5 10.2-16.1 12.7-3.3 1.1-7.8 2.1-13.1 3.3-24.1 5.4-64.4 14.6-64.4 51.8 0 31.1 22.4 45.1 41.7 47.5 2.1.3 4.5.7 7.1.7 6.7 0 36-3.3 51.2-13.2 11-7.2 24.1-21.4 24.1-47.8V190.5c0-3.8 2.7-7.1 6.4-7.8l152-30.7c5-1 9.6 2.8 9.6 7.8v130.9c0 4.1-.2 8.9-2.5 13.4-3.1 5.9-8.5 10.2-16.2 12.7-3.3 1.1-8.8 2.1-14.1 3.3-24.1 5.4-64.4 14.5-64.4 51.7 0 33.7 25.4 47.2 41.8 48.3 6.5.4 11.2.3 19.4-.9s23.5-5.5 36.5-13c17.9-10.3 27.5-26.8 27.5-48.2V55.9c-.1-4.4-3.8-8.9-9.8-7.7z"></path>
                  </svg>
                  <div className="rating-circles">
                    {author.averageSingleEpExtendedRating ? (
                      <div className="rating-circle filled">
                        {formatRating(author.averageSingleEpExtendedRating)}
                      </div>
                    ) : (
                      <div className="rating-circle dashed"></div>
                    )}
                    {author.averageSingleEpSimpleRating ? (
                      <div className="rating-circle outlined">
                        {formatRating(author.averageSingleEpSimpleRating)}
                      </div>
                    ) : (
                      <div className="rating-circle dashed"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Секция лучших работ */}
          <section className="best-works-section">
            <h2 className="section-title">Лучшие работы</h2>
            
            <div className="releases-grid">
              {authorReleases.length > 0 ? (
                authorReleases.map((release) => (
                  <div key={release.releaseId} className="release-card">
                    <div className="release-card-inner">
                      <a href={`/release/${release.releaseId}`} className="release-link">
                        <div className="release-cover-container">
                          <img 
                            alt={release.title} 
                            className="release-cover" 
                            src={release.coverUrl || '/default-release-cover.jpg'}
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
                            <span key={author.id}>
                              <a href={`/author/${author.id}`} className="border-b border-b-white/0 hover:border-white/30 opacity-70">
                                {author.authorName}
                              </a>
                              {index < release.authors.length - 1 && <span className="text-muted-foreground">,&nbsp;</span>}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="release-ratings">
                        {release.fullReviewRating ? (
                          <div className="rating-circle filled">
                            {formatRating(release.fullReviewRating)}
                          </div>
                        ) : (
                          <div className="rating-circle dashed"></div>
                        )}
                        {release.simpleReviewRating ? (  
                          <div className="rating-circle outlined">
                            {formatRating(release.simpleReviewRating)}
                          </div>
                        ) : (
                          <div className="rating-circle dashed"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-releases">
                  <p>У этого автора пока нет релизов</p>
                </div>
              )}
            </div>
          </section>

          {/* Секция релизов по типам */}
          <section className="releases-by-type-section">
            <div className="releases-by-type-title">Релизы артиста</div>
            <div className="releases-grid-container">
              {/* Треки и синглы */}
              <div className="releases-type-section">
                <div className="releases-type-header">
                  Треки
                </div>
                <div className="releases-list">
                  {authorReleases.filter(release => ['SINGLE', 'EP', 'TRACK'].includes(release.type)).map((release) => (
                    <div key={release.releaseId} className="release-row">
                      <a className="release-cover-link" href={`/release/${release.releaseId}`}>
                        <img 
                          alt={release.title}
                          loading="lazy"
                          width="100"
                          height="100"
                          decoding="async"
                          className="release-row-cover"
                          src={release.coverUrl || '/default-release-cover.jpg'}
                        />
                      </a>
                      
                      <div className="release-row-content">
                        <div className="release-row-stats">
                          <div className="release-row-stat">
                            <svg className="release-row-stat-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                              <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                            </svg>
                            <span>{release.extendedReviewsCount || 0}</span>
                          </div>
                          <div className="release-row-stat">
                            <svg className="release-row-stat-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                            </svg>
                            <span>{release.simpleReviewsCount || 0}</span>
                          </div>
                        </div>
                        
                        <div className="release-row-title-container">
                          <div className="release-row-title-wrapper">
                            <a 
                              className="release-row-title"
                              href={`/release/${release.releaseId}`}
                            >
                              {release.title}
                            </a>
                          </div>
                        </div>
                        
                        <div className="release-row-authors">
                          {release.authors && release.authors.map((author, index) => (
                            <span key={author.id}>
                              <a href={`/author/${author.id}`} className="release-row-author-link">
                                <span>{author.authorName}</span>
                              </a>
                              {index < release.authors.length - 1 && <span>,&nbsp;</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="release-row-ratings">
                        <div className="release-row-rating-circles">
                          {release.fullReviewRating ? (
                            <div className="release-row-rating-circle filled">
                              {formatRating(release.fullReviewRating)}
                            </div>
                          ) : (
                            <div className="release-row-rating-circle dashed"></div>
                          )}
                          {release.simpleReviewRating ? (
                            <div className="release-row-rating-circle outlined">
                              {formatRating(release.simpleReviewRating)}
                            </div>
                          ) : (
                            <div className="release-row-rating-circle dashed"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Альбомы */}
              <div className="releases-type-section">
                <div className="releases-type-header">
                  Альбомы
                </div>
                <div className="releases-list">
                  {authorReleases.filter(release => release.type === 'ALBUM').map((release) => (
                    <div key={release.releaseId} className="release-row">
                      <a className="release-cover-link" href={`/release/${release.releaseId}`}>
                        <img 
                          alt={release.title}
                          loading="lazy"
                          width="100"
                          height="100"
                          decoding="async"
                          className="release-row-cover"
                          src={release.coverUrl || '/default-release-cover.jpg'}
                        />
                      </a>
                      
                      <div className="release-row-content">
                        <div className="release-row-stats">
                          <div className="release-row-stat">
                            <svg className="release-row-stat-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                              <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                            </svg>
                            <span>{release.extendedReviewsCount || 0}</span>
                          </div>
                          <div className="release-row-stat">
                            <svg className="release-row-stat-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                            </svg>
                            <span>{release.simpleReviewsCount || 0}</span>
                          </div>
                        </div>
                        
                        <div className="release-row-title-container">
                          <div className="release-row-title-wrapper">
                            <a 
                              className="release-row-title"
                              href={`/release/${release.releaseId}`}
                            >
                              {release.title}
                            </a>
                          </div>
                        </div>
                        
                        <div className="release-row-authors">
                          {release.authors && release.authors.map((author, index) => (
                            <span key={author.id}>
                              <a href={`/author/${author.id}`} className="release-row-author-link">
                                <span>{author.authorName}</span>
                              </a>
                              {index < release.authors.length - 1 && <span>,&nbsp;</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="release-row-ratings">
                        <div className="release-row-rating-circles">
                          {release.fullReviewRating ? (
                            <div className="release-row-rating-circle filled">
                              {formatRating(release.fullReviewRating)}
                            </div>
                          ) : (
                            <div className="release-row-rating-circle dashed"></div>
                          )}
                          {release.simpleReviewRating ? (
                            <div className="release-row-rating-circle outlined">
                              {formatRating(release.simpleReviewRating)}
                            </div>
                          ) : (
                            <div className="release-row-rating-circle dashed"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AuthorPage; 