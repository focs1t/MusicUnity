import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Pagination,
  Tabs,
  Tab
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../app/providers/AuthProvider';
import { userApi } from '../shared/api/user';
import { reviewApi } from '../shared/api/review';

// Компонент для TabPanel (содержимое вкладки)
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`favorites-tabpanel-${index}`}
      aria-labelledby={`favorites-tab-${index}`}
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

const FavoritesPage = () => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Данные
  const [likedReviews, setLikedReviews] = useState([]);
  const [favoriteReleases, setFavoriteReleases] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем ID пользователя
        let userId;
        if (authUser?.id) {
          userId = authUser.id;
        } else {
          const userData = await userApi.getCurrentUser();
          userId = userData.userId;
        }
        
        if (tabValue === 0) {
          // Получаем избранные релизы
          const favoritesData = await userApi.getUserFavorites(userId, page - 1, 12);
          setFavoriteReleases(favoritesData.content);
          setTotalPages(favoritesData.totalPages);
        } else {
          // Получение лайкнутых рецензий
          const likedReviewsData = await reviewApi.getLikedReviewsByUser(userId, page - 1, 10);
          setLikedReviews(likedReviewsData.content);
          setTotalPages(likedReviewsData.totalPages);
        }
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [authUser, page, tabValue]);
  
  // Обработчик изменения вкладки
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Сбрасываем страницу при смене вкладки
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (event, value) => {
    setPage(value);
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
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
          Мне понравилось
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ 
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
              '& .Mui-selected': { color: 'white' },
              '& .MuiTabs-indicator': { backgroundColor: 'white' }
            }}
          >
            <Tab label="Релизы" />
            <Tab label="Рецензии" />
          </Tabs>
        </Box>
        
        {/* Избранные релизы */}
        <TabPanel value={tabValue} index={0}>
          {favoriteReleases.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {favoriteReleases.map((release) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={release.releaseId}>
                    <Card sx={{ bgcolor: '#1e1e1e', color: 'white', height: '100%' }}>
                      <img 
                        src={release.coverUrl || '/default-cover.jpg'} 
                        alt={release.title}
                        style={{ width: '100%', height: 200, objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography variant="h6" component={Link} to={`/release/${release.releaseId}`} sx={{ color: 'white', textDecoration: 'none' }}>
                          {release.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                          {release.authors?.map(a => a.name).join(', ') || 'Неизвестный исполнитель'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5 }}>
                          {new Date(release.releaseDate).getFullYear()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'white',
                      },
                      '& .Mui-selected': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 4 }}>
              У вас нет избранных релизов. Добавляйте релизы в избранное, чтобы они появились здесь.
            </Typography>
          )}
        </TabPanel>
        
        {/* Понравившиеся рецензии */}
        <TabPanel value={tabValue} index={1}>
          {likedReviews && likedReviews.length > 0 ? (
            <>
              <Grid container spacing={3}>
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
                            {review.content.substring(0, 200)}...
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'white',
                      },
                      '& .Mui-selected': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 4 }}>
              У вас нет понравившихся рецензий. Лайкайте рецензии, чтобы они появились здесь.
            </Typography>
          )}
        </TabPanel>
      </Box>
    </Container>
  );
};

export default FavoritesPage; 