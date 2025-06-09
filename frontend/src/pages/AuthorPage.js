import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { authorApi } from '../shared/api/author';
import { releaseApi } from '../shared/api/release';
import { userApi } from '../shared/api/user';
// import { userStore } from '../entities/user';
import './AuthorPage.css';

function AuthorPage() {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [releases, setReleases] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, [authorId]);

  const loadCurrentUser = async () => {
    try {
      const userData = await userApi.getCurrentUser();
      setCurrentUser(userData);
      
      // Проверяем, подписан ли пользователь на автора
      if (userData) {
        const followedAuthors = await userApi.getUserFollowedAuthors(userData.userId, 0, 1000);
        const isAuthorFollowed = followedAuthors.content.some(followedAuthor => 
          followedAuthor.authorId === parseInt(authorId)
        );
        setIsFollowing(isAuthorFollowed);
      }
    } catch (error) {
      console.error('Пользователь не авторизован или ошибка при получении данных:', error);
      // Пользователь не авторизован, это нормально
      setCurrentUser(null);
      setIsFollowing(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем данные автора
      const authorData = await authorApi.getAuthorById(authorId);
      setAuthor(authorData);
      setFollowingCount(authorData.followingCount || 0);
      
      // Загружаем релизы автора
      const releasesData = await releaseApi.getReleasesByAuthor(authorId, 0, 12);
      setReleases(releasesData.content || []);
      
    } catch (error) {
      console.error('Ошибка при загрузке данных автора:', error);
      setError('Не удалось загрузить данные автора');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      // Показываем уведомление о необходимости авторизации
      alert('Для подписки на автора необходимо войти в аккаунт');
      return;
    }

    try {
      if (isFollowing) {
        await authorApi.unfollowAuthor(parseInt(authorId), currentUser.userId);
        setIsFollowing(false);
        setFollowingCount(prev => Math.max(0, prev - 1));
      } else {
        await authorApi.followAuthor(parseInt(authorId));
        setIsFollowing(true);
        setFollowingCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Ошибка при изменении подписки:', error);
    }
  };

  const getDefaultAvatar = () => {
    return '/default-avatar.jpg';
  };

  const formatRating = (rating) => {
    if (rating === null || rating === undefined) return '-';
    return Math.round(rating);
  };

  const getReleaseLink = (release) => {
    return release.type === 'ALBUM' ? `/album/${release.releaseId}` : `/track/${release.releaseId}`;
  };

  const getReviewCounts = (release) => {
    // Примерные значения для демонстрации
    const extendedCount = Math.floor(Math.random() * 100) + 10;
    const simpleCount = Math.floor(Math.random() * 50) + 5;
    return { extended: extendedCount, simple: simpleCount };
  };

  if (loading) {
    return (
      <div className="author-page">
        <div className="container">
          <div className="loading-spinner">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="author-page">
        <div className="container">
          <div className="error-message">{error || 'Автор не найден'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="author-page">
      <div className="container">
        {/* Hero Section */}
        <div className="author-hero">
          <img 
            src={author.avatarUrl || getDefaultAvatar()} 
            alt={author.authorName}
            className="author-hero-bg"
          />
          
          {/* Like Button */}
          <button 
            className={`like-button ${isFollowing ? 'liked' : ''}`}
            onClick={handleFollowToggle}
          >
            <svg 
              stroke="currentColor" 
              fill={isFollowing ? "currentColor" : "none"} 
              strokeWidth="0" 
              viewBox="0 0 24 24" 
              className="heart-icon" 
              height="1em" 
              width="1em"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
            </svg>
          </button>

          {/* Author Info */}
          <div className="author-info">
            <div className="author-name-container">
              <div className="author-name-block">
                <h1 className="author-name">{author.authorName}</h1>
                <svg 
                  className={`verification-icon ${author.isVerified ? 'verified' : 'unverified'}`}
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  width="30"
                  height="30"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              
              <div className="following-count">
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
                <span>{followingCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <section className="ratings-section">
          <div className="ratings-grid">
            <div className="ratings-card">
              <h3 className="ratings-title">Средний балл</h3>
              
              <div className="rating-row">
                <svg 
                  stroke="currentColor" 
                  fill="currentColor" 
                  strokeWidth="0" 
                  viewBox="0 0 512 512" 
                  className="album-icon" 
                  height="1em" 
                  width="1em"
                >
                  <path d="M406.3 48.2c-4.7.9-202 39.2-206.2 40-4.2.8-8.1 3.6-8.1 8v240.1c0 1.6-.1 7.2-2.4 11.7-3.1 5.9-8.5 10.2-16.1 12.7-3.3 1.1-7.8 2.1-13.1 3.3-24.1 5.4-64.4 14.6-64.4 51.8 0 31.1 22.4 45.1 41.7 47.5 2.1.3 4.5.7 7.1.7 6.7 0 36-3.3 51.2-13.2 11-7.2 24.1-21.4 24.1-47.8V190.5c0-3.8 2.7-7.1 6.4-7.8l152-30.7c5-1 9.6 2.8 9.6 7.8v130.9c0 4.1-.2 8.9-2.5 13.4-3.1 5.9-8.5 10.2-16.2 12.7-3.3 1.1-8.8 2.1-14.1 3.3-24.1 5.4-64.4 14.5-64.4 51.7 0 33.7 25.4 47.2 41.8 48.3 6.5.4 11.2.3 19.4-.9s23.5-5.5 36.5-13c17.9-10.3 27.5-26.8 27.5-48.2V55.9c-.1-4.4-3.8-8.9-9.8-7.7z"></path>
                </svg>
                <div className="rating-circles">
                  <div className="rating-circle filled">
                    {formatRating(author.averageAlbumExtendedRating)}
                  </div>
                  <div className="rating-circle outlined">
                    {formatRating(author.averageAlbumSimpleRating)}
                  </div>
                </div>
              </div>

              <div className="rating-row">
                <svg 
                  stroke="currentColor" 
                  fill="currentColor" 
                  strokeWidth="0" 
                  viewBox="0 0 24 24" 
                  className="single-icon" 
                  height="1em" 
                  width="1em"
                >
                  <circle cx="11.99" cy="11.99" r="2.01"></circle>
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                  <path d="M12 6a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4z"></path>
                </svg>
                <div className="rating-circles">
                  <div className="rating-circle filled">
                    {formatRating(author.averageSingleEpExtendedRating)}
                  </div>
                  <div className="rating-circle outlined">
                    {formatRating(author.averageSingleEpSimpleRating)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Works Section */}
        <section className="best-works-section">
          <h2 className="section-title">Лучшие работы</h2>
          
          <div className="releases-grid">
            {releases.map((release) => {
              const reviewCounts = getReviewCounts(release);
              return (
                <div key={release.releaseId} className="release-card">
                  <a href={getReleaseLink(release)} className="release-link">
                    <div className="release-cover">
                      <img 
                        src={release.coverUrl || '/default-cover.jpg'} 
                        alt={release.title}
                        className="cover-image"
                      />
                      
                      {/* Review counts */}
                      <div className="review-counts">
                        <div className="review-count">
                          <svg 
                            stroke="currentColor" 
                            fill="currentColor" 
                            strokeWidth="0" 
                            viewBox="0 0 24 24" 
                            className="comment-icon"
                          >
                            <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                            <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                          </svg>
                          <span>{reviewCounts.extended}</span>
                        </div>
                        <div className="review-count">
                          <svg 
                            stroke="currentColor" 
                            fill="currentColor" 
                            strokeWidth="0" 
                            viewBox="0 0 24 24" 
                            className="comment-icon"
                          >
                            <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                            <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                          </svg>
                          <span>{reviewCounts.simple}</span>
                        </div>
                      </div>

                      {/* Release type icon */}
                      <div className="release-type-icon">
                        {release.type === 'ALBUM' ? (
                          <svg 
                            stroke="currentColor" 
                            fill="currentColor" 
                            strokeWidth="0" 
                            viewBox="0 0 24 24" 
                            className="album-type-icon"
                          >
                            <circle cx="11.99" cy="11.99" r="2.01"></circle>
                            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                            <path d="M12 6a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4z"></path>
                          </svg>
                        ) : (
                          <svg 
                            stroke="currentColor" 
                            fill="currentColor" 
                            strokeWidth="0" 
                            viewBox="0 0 512 512" 
                            className="single-type-icon"
                          >
                            <path d="M406.3 48.2c-4.7.9-202 39.2-206.2 40-4.2.8-8.1 3.6-8.1 8v240.1c0 1.6-.1 7.2-2.4 11.7-3.1 5.9-8.5 10.2-16.1 12.7-3.3 1.1-7.8 2.1-13.1 3.3-24.1 5.4-64.4 14.6-64.4 51.8 0 31.1 22.4 45.1 41.7 47.5 2.1.3 4.5.7 7.1.7 6.7 0 36-3.3 51.2-13.2 11-7.2 24.1-21.4 24.1-47.8V190.5c0-3.8 2.7-7.1 6.4-7.8l152-30.7c5-1 9.6 2.8 9.6 7.8v130.9c0 4.1-.2 8.9-2.5 13.4-3.1 5.9-8.5 10.2-16.2 12.7-3.3 1.1-8.8 2.1-14.1 3.3-24.1 5.4-64.4 14.5-64.4 51.7 0 33.7 25.4 47.2 41.8 48.3 6.5.4 11.2.3 19.4-.9s23.5-5.5 36.5-13c17.9-10.3 27.5-26.8 27.5-48.2V55.9c-.1-4.4-3.8-8.9-9.8-7.7z"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    <div className="release-info">
                      <h3 className="release-title">{release.title}</h3>
                      <div className="release-authors">
                        {release.authors.map((author, index) => (
                          <span key={author.id}>
                            <a href={`/author/${author.id}`} className="author-link">
                              {author.authorName}
                            </a>
                            {index < release.authors.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Rating circles */}
                    <div className="release-ratings">
                      <div className="rating-circle filled">
                        {Math.floor(Math.random() * 20) + 75}
                      </div>
                      <div className="rating-circle outlined">
                        {Math.floor(Math.random() * 15) + 70}
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthorPage; 