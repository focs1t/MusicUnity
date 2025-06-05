import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CircularProgress 
} from '@mui/material';
import { useAuth } from '../app/providers/AuthProvider';
import { releaseApi } from '../shared/api/release';

const FollowingReleasesPage = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuth } = useAuth();

  useEffect(() => {
    if (!isAuth) return;

    const fetchFollowedReleases = async () => {
      try {
        setLoading(true);
        // Используем существующий API метод
        const response = await releaseApi.getReleasesByFollowedAuthors(0, 20);
        setReleases(response.content || []);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке релизов отслеживаемых авторов:', err);
        setError('Не удалось загрузить релизы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedReleases();
  }, [isAuth]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" paragraph>
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (releases.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Релизы отслеживаемых авторов
          </Typography>
          <Typography variant="body1" paragraph>
            У отслеживаемых вами авторов пока нет новых релизов.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Подпишитесь на любимых авторов, чтобы не пропустить их новые релизы.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Релизы отслеживаемых авторов
        </Typography>
        <Grid container spacing={3}>
          {releases.map((release) => (
            <Grid item key={release.id} xs={12} sm={6} md={4} lg={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  backgroundColor: '#1e1e1e',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    transform: 'translateY(-5px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={release.coverUrl || '/default-release-cover.jpg'}
                  alt={release.title}
                />
                <CardContent>
                  <Typography variant="h6" component="div">
                    {release.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {release.authors.map(author => author.name).join(', ')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(release.releaseDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default FollowingReleasesPage; 