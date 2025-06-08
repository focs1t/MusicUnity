import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { likeApi } from '../shared/api/like';
import './AuthorLikesPage.css';

const AuthorLikesPage = () => {
  const [authorLikes, setAuthorLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchAuthorLikes = async () => {
      try {
        setLoading(true);
        const response = await likeApi.getAllReviewsWithAuthorLikes(currentPage - 1, 15);
        setAuthorLikes(response.content);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Ошибка при загрузке авторских лайков:', err);
        setError('Не удалось загрузить данные. Пожалуйста, повторите попытку позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorLikes();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;

    // Логика отображения номеров страниц
    if (totalPages <= maxPagesToShow) {
      // Если общее количество страниц меньше или равно максимальному количеству
      // отображаемых страниц, показываем все страницы
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Если текущая страница близка к началу
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
      // Если текущая страница близка к концу
      else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      }
      // Если текущая страница где-то в середине
      else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return (
      <nav className="mt-10 col-span-full">
        <ul className="pagination-list">
          {currentPage > 1 && (
            <li>
              <a
                className="pagination-link"
                onClick={() => handlePageChange(currentPage - 1)}
                href="#"
                aria-label="Предыдущая страница"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left h-4 w-4">
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
                <span className="max-md:hidden">Предыдущая</span>
              </a>
            </li>
          )}

          {pageNumbers.map((page, index) => (
            <li key={index}>
              {page === '...' ? (
                <span className="pagination-ellipsis">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis w-3 h-3 md:h-4 md:w-4">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                </span>
              ) : (
                <a
                  className={`pagination-link ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  href="#"
                >
                  {page}
                </a>
              )}
            </li>
          ))}

          {currentPage < totalPages && (
            <li>
              <a
                className="pagination-link"
                onClick={() => handlePageChange(currentPage + 1)}
                href="#"
                aria-label="Следующая страница"
              >
                <span className="max-md:hidden">Следующая</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </a>
            </li>
          )}
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div className="site-content">
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
      <div className="site-content">
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
    <div className="site-content">
      <main>
        <div className="container">
          <div className="header-container">
            <h2 className="page-title">
              <img 
                alt="logo-small" 
                width="30" 
                height="30" 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI1LjY1NDEgNC40NDE5M0wxNS4wNjc5IDBMNC40NDE5MyA0LjM0NTkzTDAgMTQuOTMyMUw0LjM0NTkzIDI1LjU1ODFMMTQuOTMyMSAzMEwyNS41NTgxIDI1LjY1NDFMMzAgMTUuMDY3OUwyNS42NTQxIDQuNDQxOTNaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfNDUwOF80NzQ4KSIvPgo8cGF0aCBkPSJNMjAuNDc2MyA3LjczNDM4SDE1Ljg2NzVMMTQuNzQyIDguODY5MzNMMTMuNjE2NiA3LjczNDM4SDkuMDA3NzlMNS41MjQ0MSAxMS4yMzY4VjE1LjgxN0wxNC43NDIgMjUuMjY3OEwyMy45NTk3IDE1LjgxN1YxMS4yMzY4TDIwLjQ3NjMgNy43MzQzOFoiIGZpbGw9IiNGMEYxRjEiLz4KPHBhdGggZD0iTTEzLjYxNjggNy43MzQzOEwxMi4xNzk3IDEwLjEzOTlMMTQuNzQyMyAxMi42NjQ0VjguODY5MzNMMTMuNjE2OCA3LjczNDM4WiIgZmlsbD0iI0M3QzVDOCIvPgo8cGF0aCBkPSJNMTIuMTc5NSAxMC4xMzk5SDkuNzY0NDVMOS4wMDc4MSA3LjczNDM4SDEzLjYxNjZMMTIuMTc5NSAxMC4xMzk5WiIgZmlsbD0iI0Q0RDFEMSIvPgo8cGF0aCBkPSJNOS43NjQ0MyAxMC4xMzk5TDcuODUzOCAxMi4xMUw1LjUyNDQxIDExLjIzNjhMOS4wMDc3OSA3LjczNDM4TDkuNzY0NDMgMTAuMTM5OVoiIGZpbGw9IiNEN0Q1RDYiLz4KPHBhdGggZD0iTTcuODUzOCAxMi4xMTE1VjE0LjQ1OTlMNS41MjQ0MSAxNS44MTg1VjExLjIzODNMNy44NTM4IDEyLjExMTVaIiBmaWxsPSIjRThFOEU5Ii8+CjxwYXRoIGQ9Ik03Ljg1MzggMTQuNDU5TDE0Ljc0MiAyMS40MDY3VjI1LjI2ODRMNS41MjQ0MSAxNS44MTc2TDcuODUzOCAxNC40NTlaIiBmaWxsPSIjRTZFNkU2Ii8+CjxwYXRoIGQ9Ik0xNS44NjgxIDcuNzM0MzhMMTcuMzAyOSAxMC4xMzk5TDE0Ljc0MjcgMTIuNjY0NFY4Ljg2OTMzTDE1Ljg2ODEgNy43MzQzOFoiIGZpbGw9IiNERERDREMiLz4KPHBhdGggZD0iTTE3LjMwMjQgMTAuMTM5OUgxOS43MTk5TDIwLjQ3NjUgNy43MzQzOEgxNS44Njc3TDE3LjMwMjQgMTAuMTM5OVoiIGZpbGw9IiNEMENGRDAiLz4KPHBhdGggZD0iTTE5LjcxOTcgMTAuMTM5OUwyMS42MzAzIDEyLjExTDIzLjk1OTcgMTEuMjM2OEwyMC40NzY0IDcuNzM0MzhMMTkuNzE5NyAxMC4xMzk5WiIgZmlsbD0iI0M2QzRDOCIvPgo8cGF0aCBkPSJNMjEuNjMwNCAxMi4xMTE1VjE0LjQ1OTlMMjMuOTU5OCAxNS44MTg1VjExLjIzODNMMjEuNjMwNCAxMi4xMTE1WiIgZmlsbD0iI0U5RThFQyIvPgo8cGF0aCBkPSJNMjEuNjMwOSAxNC40NTlMMTQuNzQyNyAyMS40MDY3VjI1LjI2ODRMMjMuOTYwMyAxNS44MTc2TDIxLjYzMDkgMTQuNDU5WiIgZmlsbD0iI0Q5REFEQyIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzQ1MDhfNDc0OCIgeDE9IjE1IiB5MT0iMS4wMTg1OCIgeDI9IjE1IiB5Mj0iMjguODEwNSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRDQxMjFBIi8+CjxzdG9wIG9mZnNldD0iMC43MSIgc3RvcC1jb2xvcj0iIzg5MTgxMyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM4MzE4MTIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K"
              />
              <span>Понравилось авторам</span>
            </h2>
          </div>

          <div className="reviews-grid">
            {authorLikes.map((review) => (
              <div key={review.reviewId} className="review-card-author-like">
                <div className="review-card-header">
                  <div className="review-card-user">
                    <Link to={`/profile/${review.userId}`} className="user-avatar-link">
                      <img 
                        alt={review.user?.username || "Пользователь"}
                        className="user-avatar"
                        src={review.user?.avatarUrl || "/noimage-single.png"}
                      />
                    </Link>
                    <div className="user-info">
                      <div className="username">
                        <Link to={`/profile/${review.userId}`}>{review.user?.username || "Пользователь"}</Link>
                      </div>
                      {review.user?.rank && (
                        <div className="user-rank">
                          <div className="rank-badge">ТОП-{review.user.rank}</div>
                        </div>
                      )}
                    </div>
                    <Link to={`/releases/${review.releaseId}`} className="release-cover-link">
                      <img 
                        alt={review.release?.title || "Релиз"}
                        className="release-cover"
                        src={review.release?.coverUrl || "/noimage-single.png"}
                      />
                    </Link>
                  </div>
                </div>

                <Link to={`/reviews/${review.reviewId}`} className="review-title">
                  {review.title || `Рецензия на ${review.release?.title || "релиз"}`}
                </Link>

                <div className="author-like-info">
                  <div className="author-info">
                    <Link to={`/profile/${review.authorLike?.userId}`} className="author-avatar-link">
                      <img 
                        alt={review.authorLike?.username || "Автор"}
                        className="author-avatar"
                        src={review.authorLike?.avatarUrl || "/noimage-single.png"}
                      />
                    </Link>
                    <div className="author-name">
                      <Link to={`/profile/${review.authorLike?.userId}`}>{review.authorLike?.username || "Автор"}</Link>
                    </div>
                  </div>
                  <div className="author-like-badge">
                    <img 
                      alt="Авторский лайк РЗТ"
                      src="/hearts/rubin_heart.png"
                      className="rubin-heart"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </div>
      </main>
    </div>
  );
};

export default AuthorLikesPage; 