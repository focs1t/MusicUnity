import React, { useState, useEffect } from 'react';
import { 
  Avatar, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Box, 
  Typography, 
  CircularProgress, 
  Container,
  useTheme,
  Alert
} from '@mui/material';
import { userApi } from '../shared/api';

const Top100Page = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTop100Users = async () => {
      try {
        setLoading(true);
        const data = await userApi.getTop100Users();
        
        // Добавляем ранг каждому пользователю, если его нет
        const usersWithRank = data.map((user, index) => ({
          ...user,
          rank: user.rank || index + 1
        }));
        
        setUsers(usersWithRank);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные. Пожалуйста, повторите попытку позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchTop100Users();
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '70vh',
          backgroundColor: theme.palette.background.default
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '70vh'
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography>
            Обратитесь к администратору для решения проблемы.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (users.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '70vh' 
          }}
        >
          <Typography>В настоящее время рейтинг пуст.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          mb: 4, 
          textAlign: 'center',
          color: theme.palette.primary.main
        }}
      >
        ТОП-100 пользователей
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Рейтинг пользователей формируется на основе активности на платформе, включая количество авторских лайков, 
          рецензий, поставленных и полученных лайков.
        </Typography>
      </Box>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 3, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="top 100 users table">
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[800] 
                : theme.palette.grey[100]
            }}>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>№</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Баллы</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Пользователь</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Авторские лайки</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Рецензии</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Поставлено лайков</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Получено лайков</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                sx={{ 
                  '&:nth-of-type(odd)': { 
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.02)' 
                  },
                  '&:hover': { 
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.04)' 
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <TableCell align="center" sx={{ fontWeight: user.rank <= 3 ? 'bold' : 'normal' }}>
                  {user.rank <= 3 ? (
                    <Box 
                      sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        backgroundColor: 
                          user.rank === 1 ? 'gold' : 
                          user.rank === 2 ? 'silver' : 
                          'bronze',
                        color: user.rank === 1 ? 'black' : 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {user.rank}
                    </Box>
                  ) : user.rank}
                </TableCell>
                <TableCell align="center" sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.primary.main
                }}>
                  {user.points}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={user.avatarUrl} alt={user.username} sx={{ mr: 2 }} />
                    <Typography>{user.username}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">{user.authorLikes}</TableCell>
                <TableCell align="center">{user.reviews}</TableCell>
                <TableCell align="center">{user.likesGiven}</TableCell>
                <TableCell align="center">{user.likesReceived}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Top100Page; 