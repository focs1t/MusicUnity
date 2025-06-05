import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Grid, 
  Tabs, 
  Tab, 
  Divider, 
  Chip,
  Link as MuiLink,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Pagination,
  IconButton
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/providers/AuthProvider';
import { userApi } from '../shared/api/user';
import { reviewApi } from '../shared/api/review';
import { likeApi } from '../shared/api/like';
import TelegramIcon from '@mui/icons-material/Telegram';
import VkIcon from '@mui/icons-material/Facebook'; // Используем Facebook как заменитель VK
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';

// Компонент для TabPanel (содержимое вкладки)
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Определение активной вкладки на основе URL
  const getTabValueFromPath = () => {
    const path = location.pathname;
    if (path.includes('/profile/reviews')) return 1;
    if (path.includes('/profile/liked')) return 2;
    return 0; // По умолчанию - Предпочтения
  };
  
  const [tabValue, setTabValue] = useState(getTabValueFromPath());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Статистика пользователя
  const [stats, setStats] = useState({
    receivedLikes: 0,
    givenLikes: 0,
    receivedAuthorLikes: 0,
    totalReviews: 0,
    simpleReviews: 0,
    fullReviews: 0,
    followedAuthors: 0,
    favorites: 0
  });
  
  // Данные для вкладок
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [favoriteReleases, setFavoriteReleases] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [likedReviews, setLikedReviews] = useState([]);
  
  // Фильтры для рецензий
  const [reviewFilter, setReviewFilter] = useState('all'); // all, full, simple, withAuthorLike
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Получение подробных данных о пользователе
        let userData;
        if (authUser?.id) {
          userData = await userApi.getUserById(authUser.id);
        } else {
          userData = await userApi.getCurrentUser();
        }
        setUserDetails(userData);
        
        // Получение статистики
        const [
          receivedLikes,
          givenLikes,
          authorLikes,
          reviewsCount,
          followedAuthorsData,
          favoritesData
        ] = await Promise.all([
          likeApi.getReceivedLikesCountByUser(userData.userId),
          likeApi.getGivenLikesCountByUser(userData.userId),
          likeApi.getReceivedAuthorLikesCountByUser(userData.userId),
          reviewApi.getReviewsCountByUser(userData.userId),
          userApi.getUserFollowedAuthors(userData.userId, 0, 6),
          userApi.getUserFavorites(userData.userId, 0, 6)
        ]);
        
        // Обновление статистики
        setStats({
          receivedLikes,
          givenLikes,
          receivedAuthorLikes: authorLikes,
          totalReviews: reviewsCount,
          simpleReviews: 1696, // Для демонстрации
          followedAuthors: followedAuthorsData.totalElements,
          favorites: favoritesData.totalElements
        });
        
        // Загрузка данных
        setFollowedAuthors(followedAuthorsData.content);
        setFavoriteReleases(favoritesData.content);
        setTotalPages(Math.max(followedAuthorsData.totalPages, favoritesData.totalPages));
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке данных пользователя:', err);
        setError('Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [authUser]);

  // Отдельный эффект для загрузки данных вкладок
  useEffect(() => {
    const fetchTabData = async () => {
      if (!userDetails) return;
      
      try {
        if (tabValue === 1) {
          const userReviewsData = await reviewApi.getReviewsByUser(userDetails.userId, page - 1, 5);
          setUserReviews(userReviewsData.content);
          setTotalPages(userReviewsData.totalPages);
        } else if (tabValue === 2) {
          try {
            // Загружаем лайкнутые рецензии с бэкенда
            const userLikedReviews = await likeApi.getLikedReviewsByUser(userDetails.userId, page - 1, 5);
            setLikedReviews(userLikedReviews.content || []);
            setTotalPages(userLikedReviews.totalPages || 0);
          } catch (error) {
            console.error('Ошибка при загрузке лайкнутых рецензий:', error);
            setLikedReviews([]);
            setTotalPages(0);
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных для вкладки:', err);
      }
    };
    
    fetchTabData();
  }, [userDetails, tabValue, page, reviewFilter]);

  // Обработчик изменения вкладки
  const handleTabChange = (event, newValue) => {
    setPage(1); // Сбрасываем страницу при смене вкладки
    setTabValue(newValue);
    
    // Обновляем URL в соответствии с выбранной вкладкой
    if (newValue === 0) {
      navigate('/profile');
    } else if (newValue === 1) {
      navigate('/profile/reviews');
    } else if (newValue === 2) {
      navigate('/profile/liked');
    }
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  // Обработчик фильтрации рецензий
  const handleReviewFilterChange = (filter) => {
    setReviewFilter(filter);
    setPage(1); // Сбрасываем страницу при смене фильтра
  };
  
  // Фильтрация рецензий
  const getFilteredReviews = () => {
    if (reviewFilter === 'all') {
      return userReviews;
    } else if (reviewFilter === 'full') {
      return userReviews.filter(review => review.content);
    } else if (reviewFilter === 'simple') {
      return userReviews.filter(review => !review.content);
    } else if (reviewFilter === 'withAuthorLike') {
      return userReviews.filter(review => review.authorLikesCount > 0);
    }
    return userReviews;
  };
  
  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" paragraph>
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Левая колонка: профиль и статистика */}
        <Grid item xs={12} md={4}>
          {/* Профиль */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: '#111', 
            color: 'white', 
            borderRadius: 2,
            textAlign: 'center',
            width: '100%'
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={userDetails?.avatarUrl}
                alt={userDetails?.username}
                sx={{ width: 120, height: 120 }}
              />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                {userDetails?.username}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                {userDetails?.bio || 'Пользователь не указал информацию о себе.'}
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 2 }}>
                Дата регистрации: {formatDate(userDetails?.createdAt)}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
                {userDetails?.telegramChatId && (
                  <IconButton 
                    href={`https://t.me/${userDetails.telegramChatId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ 
                      color: '#29b6f6',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                    size="large"
                  >
                    <TelegramIcon />
                  </IconButton>
                )}
                
                {userDetails?.vkId && (
                  <IconButton 
                    href={`https://vk.com/${userDetails.vkId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ 
                      color: '#4c75a3',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                    size="large"
                  >
                    <VkIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Paper>
          
          {/* Статистика */}
          <Paper sx={{ 
            p: 3, 
            bgcolor: '#111', 
            color: 'white', 
            borderRadius: 2, 
            mb: 3,
            width: '100%'
          }}>
            {/* Блок лайков */}
            <Box sx={{ mb: 2 }}>              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FavoriteIcon sx={{ color: '#ffffff', mr: 1, fontSize: 20 }} />
                  <Typography variant="body1">Поставлено лайков</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{stats.givenLikes}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FavoriteBorderIcon sx={{ color: '#ffffff', mr: 1, fontSize: 20 }} />
                  <Typography variant="body1">Получено лайков</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{stats.receivedLikes}</Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
            
            {/* Блок авторских лайков */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FavoriteIcon sx={{ color: '#f44336', mr: 1, fontSize: 20 }} />
                  <Typography variant="body1">Получено авторских лайков</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{stats.receivedAuthorLikes}</Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
            
            {/* Блок рецензий */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RateReviewIcon sx={{ color: '#ffffff', mr: 1, fontSize: 20 }} />
                  <Typography variant="body1">Всего рецензий</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{stats.totalReviews}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Правая колонка: вкладки с контентом */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              bgcolor: '#111', 
              color: 'white', 
              borderRadius: 2, 
              minHeight: '680px',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'rgba(255,255,255,0.1)',
                '& .MuiTab-root': { 
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'none',
                  py: 2,
                  fontSize: '1rem',
                  borderRadius: '8px 8px 0 0',
                },
                '& .Mui-selected': { color: 'white' },
                '& .MuiTabs-indicator': { backgroundColor: 'white' }
              }}
            >
              <Tab 
                label="Предпочтения" 
                sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px 8px 0 0' } }}
              />
              <Tab 
                label="Рецензии и оценки" 
                sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px 8px 0 0' } }}
              />
              <Tab 
                label="Понравилось" 
                sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px 8px 0 0' } }}
              />
            </Tabs>
            
            {/* Предпочтения: отслеживаемые авторы и избранные релизы */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 3 }}>
                {/* Авторы */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: '#999' }} />
                      <Typography variant="h6">
                        Авторы ({stats.followedAuthors})
                      </Typography>
                    </Box>
                    <Link to="/authors" style={{ textDecoration: 'none', color: '#2196f3' }}>
                      Все авторы
                    </Link>
                  </Box>
                  
                  {followedAuthors.length > 0 ? (
                    <Grid container spacing={2}>
                      {followedAuthors.slice(0, 5).map((author) => (
                        <Grid item xs={12} sm={6} md={4} lg={2.4} key={author.authorId}>
                          <Card sx={{ bgcolor: '#1e1e1e', color: 'white' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                              <Avatar 
                                src={author.avatarUrl} 
                                alt={author.name}
                                sx={{ width: 60, height: 60 }}
                              />
                              <Box>
                                <Typography 
                                  variant="h6" 
                                  component={Link} 
                                  to={`/authors/${author.authorId}`} 
                                  sx={{ color: 'white', textDecoration: 'none' }}
                                >
                                  {author.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                  {author.releasesCount} релизов
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                      Нет отслеживаемых авторов
                    </Box>
                  )}
                </Box>
                
                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
                
                {/* Альбомы */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AlbumIcon sx={{ mr: 1, color: '#999' }} />
                      <Typography variant="h6">
                        Альбомы ({stats.favorites})
                      </Typography>
                    </Box>
                    <Link to="/albums" style={{ textDecoration: 'none', color: '#2196f3' }}>
                      Все альбомы
                    </Link>
                  </Box>
                  
                  {favoriteReleases.length > 0 ? (
                    <Grid container spacing={2}>
                      {favoriteReleases.slice(0, 5).map((release) => (
                        <Grid item xs={12} sm={6} md={4} lg={2.4} key={release.releaseId}>
                          <Card sx={{ bgcolor: '#1e1e1e', color: 'white' }}>
                            <CardContent sx={{ display: 'flex', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                              <img 
                                src={release.coverUrl || '/default-cover.jpg'} 
                                alt={release.title}
                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                              />
                              <Box>
                                <Typography 
                                  variant="h6" 
                                  component={Link} 
                                  to={`/releases/${release.releaseId}`} 
                                  sx={{ color: 'white', textDecoration: 'none' }}
                                >
                                  {release.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                  {release.authors?.map(a => a.name).join(', ') || 'Неизвестный исполнитель'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>
                                  {new Date(release.releaseDate).getFullYear()}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                      Нет избранных альбомов
                    </Box>
                  )}
                </Box>
                
                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
                
                {/* EP и синглы */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LibraryMusicIcon sx={{ mr: 1, color: '#999' }} />
                      <Typography variant="h6">
                        EP и синглы (0)
                      </Typography>
                    </Box>
                    <Link to="/eps" style={{ textDecoration: 'none', color: '#2196f3' }}>
                      Все EP и синглы
                    </Link>
                  </Box>
                  
                  <Box sx={{ p: 2, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                    Нет избранных EP и синглов
                  </Box>
                </Box>
                
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination 
                      count={totalPages} 
                      page={page} 
                      onChange={handlePageChange} 
                      color="primary"
                      sx={{
                        '& .MuiPaginationItem-root': { color: 'white' },
                        '& .Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    />
                  </Box>
                )}
              </Box>
            </TabPanel>
            
            {/* Рецензии */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ваши рецензии ({stats.totalReviews})
                </Typography>
                {userReviews && userReviews.length > 0 ? (
                  <Grid container spacing={2}>
                    {userReviews.map((review) => (
                      <Grid item xs={12} key={review.reviewId}>
                        <Card sx={{ bgcolor: '#1e1e1e', color: 'white' }}>
                          <CardContent>
                            <Typography variant="h6" component={Link} to={`/reviews/${review.reviewId}`} sx={{ color: 'white', textDecoration: 'none' }}>
                              {review.title || `Рецензия на ${review.release?.title}`}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                              Релиз: {review.release?.title}
                            </Typography>
                            {review.content && (
                              <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.9)' }}>
                                {review.content.substring(0, 150)}...
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                    У вас пока нет рецензий.
                  </Box>
                )}
                
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination 
                      count={totalPages} 
                      page={page} 
                      onChange={handlePageChange} 
                      color="primary"
                      sx={{
                        '& .MuiPaginationItem-root': { color: 'white' },
                        '& .Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    />
                  </Box>
                )}
              </Box>
            </TabPanel>
            
            {/* Понравилось */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Понравившиеся рецензии ({stats.givenLikes})
                </Typography>
                {likedReviews && likedReviews.length > 0 ? (
                  <Grid container spacing={2}>
                    {likedReviews.map((review) => (
                      <Grid item xs={12} key={review.reviewId}>
                        <Card sx={{ bgcolor: '#1e1e1e', color: 'white' }}>
                          <CardContent>
                            <Typography variant="h6" component={Link} to={`/reviews/${review.reviewId}`} sx={{ color: 'white', textDecoration: 'none' }}>
                              {review.title || `Рецензия на ${review.release.title}`}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                              Автор: {review.user.username}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              Релиз: {review.release.title}
                            </Typography>
                            {review.content && (
                              <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.9)' }}>
                                {review.content.substring(0, 150)}...
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                    У вас нет понравившихся рецензий.
                  </Box>
                )}
                
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination 
                      count={totalPages} 
                      page={page} 
                      onChange={handlePageChange} 
                      color="primary"
                      sx={{
                        '& .MuiPaginationItem-root': { color: 'white' },
                        '& .Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    />
                  </Box>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage; 