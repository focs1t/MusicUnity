import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Alert,
  Pagination
} from '@mui/material';
import { 
  MusicNote as MusicNoteIcon,
  Album as AlbumIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { authorApi } from '../shared/api/author';
import { releaseApi } from '../shared/api/release';
import { userApi } from '../shared/api/user';
import { LoadingSpinner } from '../shared/ui/LoadingSpinner';
import './SearchPage.css';

// Встроенный плейсхолдер в формате data URI для аватара
const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'content';
  
  const [results, setResults] = useState([]);
  const [authorsResults, setAuthorsResults] = useState([]);
  const [releasesResults, setReleasesResults] = useState([]);
  const [usersResults, setUsersResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Загрузка результатов поиска
  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, page]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (type === 'users') {
        // Поиск только пользователей
        const usersResponse = await userApi.searchUsers(query, page, 10);
        
        // Фильтруем пользователей, исключая ADMIN и AUTHOR
        const filteredUsers = (usersResponse.content || []).filter(user => 
          user.rights !== 'ADMIN' && user.rights !== 'AUTHOR'
        );
        
        // Получаем ранги для пользователей
        const usersWithRanks = await Promise.all(
          filteredUsers.map(async (user) => {
            try {
              const rankData = await userApi.getUserRank(user.userId || user.id);
              return { ...user, rank: rankData.rank, points: rankData.points };
            } catch (error) {
              return user;
            }
          })
        );
        
        setUsersResults(usersWithRanks);
        setAuthorsResults([]);
        setReleasesResults([]);
        
        const combinedResults = usersWithRanks.map(item => ({ ...item, type: 'user' }));
        
        setResults(combinedResults);
        setTotalPages(usersResponse.totalPages || 0);
        setTotalElements(usersWithRanks.length);
      } else {
        // Поиск авторов и релизов параллельно
        const [authorsResponse, releasesResponse] = await Promise.all([
          authorApi.searchAuthors(query, page, 10),
          releaseApi.searchReleases(query, page, 10)
        ]);
        
        setAuthorsResults(authorsResponse.content || []);
        setReleasesResults(releasesResponse.content || []);
        setUsersResults([]);
        
        // Объединяем результаты для отображения
        const combinedResults = [
          ...authorsResponse.content.map(item => ({ ...item, type: 'author' })),
          ...releasesResponse.content.map(item => ({ ...item, type: 'release' }))
        ];
        
        setResults(combinedResults);
        setTotalPages(Math.max(authorsResponse.totalPages || 0, releasesResponse.totalPages || 0));
        setTotalElements((authorsResponse.totalElements || 0) + (releasesResponse.totalElements || 0));
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setError('Произошла ошибка при поиске');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1);
  };

  // Получение URL аватара автора
  const getAuthorAvatarUrl = (author) => {
    if (author.avatarUrl) {
      try {
        new URL(author.avatarUrl);
        let processedUrl = author.avatarUrl;
        if (processedUrl.includes('?')) {
          processedUrl = processedUrl.split('?')[0];
        }
        return processedUrl;
      } catch (e) {
        console.error(`Некорректный URL аватара для автора ${author.authorName}:`, author.avatarUrl);
        return DEFAULT_AVATAR_PLACEHOLDER;
      }
    }
    return DEFAULT_AVATAR_PLACEHOLDER;
  };

  // Обработка ошибки загрузки изображения
  const handleImageError = (e, author) => {
    console.error(`Ошибка загрузки аватара для автора ${author.authorName}:`, e.target.src);
    e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
  };

  // Отображение типа релиза в виде значка
  const getReleaseTypeIcon = (type) => {
    const upperType = typeof type === 'string' ? type.toUpperCase() : '';
    
    if (upperType === 'SINGLE' || upperType === 'EP') {
      return (
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 24 24"
          className="relative size-4"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      );
    } else if (upperType === 'ALBUM') {
      return (
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 24 24"
          className="relative size-4"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    } else {
      return (
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 24 24"
          className="relative size-4"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="11.99" cy="11.99" r="2.01" />
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
          <path d="M12 6a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4z" />
        </svg>
      );
    }
  };

  // Округление чисел для отображения рейтинга
  const formatRating = (rating) => {
    if (!rating) return null;
    return Math.round(rating);
  };

  // Карточка релиза в стиле ReleasesPage
  const ReleaseCard = ({ release }) => (
    <div className="release-card group">
      <div className="relative z-10">
        <Link to={`/release/${release.releaseId}`} className="relative block">
          <div className="aspect-square w-full block rounded-lg overflow-hidden relative">
            <img
              alt={release.title}
              loading="lazy"
              decoding="async"
              className="object-cover"
              src={release.coverUrl || `/_next/image?url=https%3A%2F%2Fcms.risazatvorchestvo.com%2Fwp-content%2Fuploads%2F2025%2F06%2Fm1000x1000-${release.releaseId % 16 + 1}.jpg&w=3840&q=75`}
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                inset: '0px',
                color: 'transparent'
              }}
            />
          </div>

          {/* Счетчики комментариев и рецензий */}
          {(release.extendedReviewsCount > 0 || release.simpleReviewsCount > 0) && (
            <div className="absolute bottom-1.5 left-1.5 bg-zinc-900 rounded-full px-1.5 flex gap-2 items-center font-semibold text-sm">
              {release.extendedReviewsCount > 0 && (
                <div className="flex items-center gap-[3px]">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    className="size-3 lg:size-3"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 7h10v2H7zm0 4h7v2H7z" />
                    <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" />
                  </svg>
                  <span>{release.extendedReviewsCount || 0}</span>
                </div>
              )}
              
              {release.simpleReviewsCount > 0 && (
                <div className="flex items-center gap-[3px]">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    className="size-3 lg:size-3"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" />
                  </svg>
                  <span>{release.simpleReviewsCount || 0}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Иконка типа релиза */}
          <div className="absolute size-6 bottom-1.5 right-1.5 bg-zinc-900 rounded-full flex items-center justify-center">
            {getReleaseTypeIcon(release.type)}
          </div>
        </Link>
      </div>
      
      {/* Информация о релизе */}
      <div className="mb-4 relative z-10">
        <Link
          to={`/release/${release.releaseId}`}
          className="text-sm w-full dark:text-white antialiased leading-4 mt-1.5 block font-bold"
        >
          {release.title}
        </Link>
        
        <div className="flex flex-wrap leading-3 mt-1 text-[13px]">
          {release.authors && release.authors.map((author, index) => (
            <React.Fragment key={index}>
              <Link
                to={`/author/${author.id}`}
                className="border-b border-b-white/0 hover:border-white/30 opacity-70"
              >
                {author.authorName}
              </Link>
              {index < release.authors.length - 1 && (
                <span className="text-muted-foreground">,&nbsp;</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Рейтинги - Отображаем только если они существуют */}
      {(release.fullReviewRating || release.simpleReviewRating) && (
        <div className="flex justify-between gap-1 items-center mt-auto px-1 pb-1">
          <div className="flex items-center gap-1 text-white">
            {/* Рейтинг по полным рецензиям (заполненный круг) */}
            {release.fullReviewRating && (
              <div className="inline-flex size-7 text-xs items-center font-semibold justify-center bg-userColor rounded-full">
                {formatRating(release.fullReviewRating)}
              </div>
            )}
            
            {/* Рейтинг по простым рецензиям (только бордер) */}
            {release.simpleReviewRating && (
              <div className="inline-flex size-7 text-xs items-center font-semibold justify-center border-2 border-userColor rounded-full px-0 text-center simple-review-rating">
                {formatRating(release.simpleReviewRating)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Карточка автора в стиле AuthorsPage
  const AuthorCard = ({ author }) => (
    <div className="author-card">
      <Link to={`/author/${author.authorId}`} className="author-link">
        <div className="author-avatar-container">
          <img
            src={getAuthorAvatarUrl(author)}
            alt={author.authorName}
            className="author-avatar"
            onError={(e) => handleImageError(e, author)}
          />
        </div>
        
        <div className="author-name-container">
          <span className="author-name">{author.authorName}</span>
          <div className="verification-button">
            <svg
              className={`verification-icon ${author.isVerified ? 'verified' : 'unverified'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>
        
        {author.followingCount > 0 && (
          <div className="followers-count">
            <div className="followers-badge">
              <svg className="bookmark-icon" viewBox="0 0 384 512" fill="currentColor">
                <path d="M0 512V48C0 21.49 21.49 0 48 0h288c26.51 0 48 21.49 48 48v464L192 400 0 512z" />
              </svg>
              <span>{author.followingCount}</span>
            </div>
          </div>
        )}
        
        <div className="ratings-grid">
          {/* Альбомы */}
          <div className="rating-row">
            <svg className="rating-icon album-icon" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="11.99" cy="11.99" r="2.01" />
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
              <path d="M12 6a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4z" />
            </svg>
            {author.averageAlbumExtendedRating ? (
              <div className="rating-circle filled">
                {Math.round(author.averageAlbumExtendedRating)}
              </div>
            ) : (
              <div className="rating-circle dashed"></div>
            )}
            {author.averageAlbumSimpleRating ? (
              <div className="rating-circle outlined">
                {Math.round(author.averageAlbumSimpleRating)}
              </div>
            ) : (
              <div className="rating-circle dashed"></div>
            )}
          </div>
          
          {/* Синглы и EP */}
          <div className="rating-row">
            <svg className="rating-icon single-icon" viewBox="0 0 512 512" fill="currentColor">
              <path d="M406.3 48.2c-4.7.9-202 39.2-206.2 40-4.2.8-8.1 3.6-8.1 8v240.1c0 1.6-.1 7.2-2.4 11.7-3.1 5.9-8.5 10.2-16.1 12.7-3.3 1.1-7.8 2.1-13.1 3.3-24.1 5.4-64.4 14.6-64.4 51.8 0 31.1 22.4 45.1 41.7 47.5 2.1.3 4.5.7 7.1.7 6.7 0 36-3.3 51.2-13.2 11-7.2 24.1-21.4 24.1-47.8V190.5c0-3.8 2.7-7.1 6.4-7.8l152-30.7c5-1 9.6 2.8 9.6 7.8v130.9c0 4.1-.2 8.9-2.5 13.4-3.1 5.9-8.5 10.2-16.2 12.7-3.3 1.1-8.8 2.1-14.1 3.3-24.1 5.4-64.4 14.5-64.4 51.7 0 33.7 25.4 47.2 41.8 48.3 6.5.4 11.2.3 19.4-.9s23.5-5.5 36.5-13c17.9-10.3 27.5-26.8 27.5-48.2V55.9c-.1-4.4-3.8-8.9-9.8-7.7z" />
            </svg>
            {author.averageSingleEpExtendedRating ? (
              <div className="rating-circle filled">
                {Math.round(author.averageSingleEpExtendedRating)}
              </div>
            ) : (
              <div className="rating-circle dashed"></div>
            )}
            {author.averageSingleEpSimpleRating ? (
              <div className="rating-circle outlined">
                {Math.round(author.averageSingleEpSimpleRating)}
              </div>
            ) : (
              <div className="rating-circle dashed"></div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );

  // Карточка пользователя
  const UserCard = ({ user }) => (
    <Card sx={{ 
      bgcolor: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: 3,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to={`/user/${user.userId || user.id}`} style={{ textDecoration: 'none' }}>
            <Avatar
              src={user.avatarUrl}
              sx={{ 
                width: 60, 
                height: 60,
                bgcolor: '#333333',
                border: '2px solid #555555',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              {user.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Link>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              component={Link}
              to={`/user/${user.userId || user.id}`}
              sx={{ 
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { color: '#4fc3f7' }
              }}
            >
              {user.username}
            </Typography>
            

            
            {user.bio && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#999999',
                  maxHeight: '40px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  mb: 1
                }}
              >
                {user.bio}
              </Typography>
            )}
            
            {/* Ранг пользователя */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              {user.rank && (
                <Typography variant="body2" sx={{ color: '#ffd700', fontSize: '0.8rem' }}>
                  🏆 #{user.rank}
                </Typography>
              )}
              {user.points && (
                <Typography variant="body2" sx={{ color: '#888', fontSize: '0.8rem' }}>
                  ⚡ {user.points} очков
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (!query.trim()) {
    return (
      <Box sx={{ 
        minHeight: '50vh', 
        bgcolor: '#000000', 
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Поиск по MusicUnity
          </Typography>
          <Typography variant="body1" sx={{ color: '#999999' }}>
            Введите запрос в поисковую строку в верхней части страницы
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <div className="site-content" style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Результаты поиска
          </Typography>
          <Typography variant="h6" sx={{ color: '#999999', mb: 3 }}>
            "{query}" {totalElements > 0 && `(${totalElements})`}
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: '#f44336'
            }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <LoadingSpinner 
            text="Поиск..." 
            className="loading-container--center"
          />
        ) : results.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              Ничего не найдено
            </Typography>
            <Typography variant="body1" sx={{ color: '#999999' }}>
              Попробуйте изменить поисковый запрос или выбрать другую категорию
            </Typography>
          </Box>
        ) : (
          <>
            {/* Сетка для авторов */}
            {type === 'content' && (
              <>
                {authorsResults.length > 0 && (
                  <div className="authors-list" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                    gap: '1.5rem',
                    marginBottom: '3rem'
                  }}>
                    {authorsResults.map((author, index) => (
                      <AuthorCard key={`author-${author.authorId}-${index}`} author={author} />
                    ))}
                  </div>
                )}

                {releasesResults.length > 0 && (
                  <div className="releases-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    {releasesResults.map((release, index) => (
                      <ReleaseCard key={`release-${release.releaseId}-${index}`} release={release} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Список пользователей */}
            {type === 'users' && (
              <Grid container spacing={3}>
                {usersResults.map((user, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`user-${user.userId || user.id}-${index}`}>
                    <UserCard user={user} />
                  </Grid>
                ))}
              </Grid>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#ffffff',
                      borderColor: '#333333',
                      '&:hover': {
                        bgcolor: '#333333'
                      },
                      '&.Mui-selected': {
                        bgcolor: '#4fc3f7',
                        color: '#000000'
                      }
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default SearchPage; 