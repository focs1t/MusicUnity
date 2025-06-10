import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Alert, 
  Button, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Pagination,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../app/providers/AuthProvider';
import { reportApi } from '../shared/api/report';
import { userApi } from '../shared/api/user';
import { useNavigate } from 'react-router-dom';

const ModeratorReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [accessLoading, setAccessLoading] = useState(true);
  
  // Загружаем полные данные пользователя
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setAccessLoading(false);
        return;
      }

      // Если у пользователя уже есть поле rights, используем его
      if (user.rights) {
        setUserDetails(user);
        setAccessLoading(false);
        if (user.rights !== 'MODERATOR') {
          navigate('/');
        }
        return;
      }

      // Иначе загружаем через API
      try {
        const userData = await userApi.getCurrentUser();
        setUserDetails(userData);
        setAccessLoading(false);
        
        if (userData.rights !== 'MODERATOR') {
          navigate('/');
        }
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        setAccessLoading(false);
        navigate('/');
      }
    };

    checkAccess();
  }, [user, navigate]);

  // Состояния
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', report: null });

  // Загрузка репортов
  const loadReports = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const response = await reportApi.getPendingReports(pageNumber, 10);
      setReports(response.content || []);
      setTotalPages(response.totalPages || 0);
      setPage(pageNumber);
    } catch (err) {
      console.error('Ошибка загрузки репортов:', err);
      setError('Ошибка при загрузке репортов: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Обработка действий с репортами
  const handleReportAction = async (actionType, reportId) => {
    try {
      setError('');
      setSuccess('');

      switch (actionType) {
        case 'delete-review':
          await reportApi.deleteReview(reportId, user.userId);
          setSuccess('Отзыв успешно удален');
          break;
        case 'ban-user':
          await reportApi.banUser(reportId, user.userId);
          setSuccess('Пользователь заблокирован');
          break;
        case 'reject':
          await reportApi.rejectReport(reportId, user.userId);
          setSuccess('Жалоба отклонена');
          break;
        default:
          throw new Error('Неизвестное действие');
      }

      // Перезагружаем список репортов
      loadReports(page);
      setActionDialog({ open: false, type: '', report: null });

    } catch (err) {
      console.error('Ошибка при обработке репорта:', err);
      setError('Ошибка: ' + (err.response?.data?.message || err.message));
    }
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'RESOLVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  // Функция для получения текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Ожидает';
      case 'RESOLVED': return 'Решен';
      case 'REJECTED': return 'Отклонен';
      default: return status;
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  // Если нет пользователя, показываем загрузку
  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#111', color: 'white', py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  // Если данные еще загружаются, показываем загрузку
  if (accessLoading || !userDetails) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#111', color: 'white', py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Проверка прав доступа...</Typography>
      </Box>
    );
  }

  // Если нет прав модератора, показываем ошибку
  if (userDetails.rights !== 'MODERATOR') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#111', color: 'white', py: 4 }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Доступ запрещен
          </Typography>
          <Typography>
            У вас нет прав для просмотра этой страницы.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111', color: 'white', py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Управление жалобами
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: '#d32f2f', color: 'white' }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3, bgcolor: '#2e7d32', color: 'white' }}>
            {success}
          </Alert>
        )}

        <Card sx={{ bgcolor: '#222', color: 'white' }}>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : reports.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                Нет ожидающих жалоб
              </Typography>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ bgcolor: '#333' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Причина</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Статус</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Дата создания</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.reportId}>
                          <TableCell sx={{ color: 'white' }}>{report.reportId}</TableCell>
                          <TableCell sx={{ color: 'white', maxWidth: 200 }}>
                            {report.reason.length > 50 
                              ? `${report.reason.substring(0, 50)}...` 
                              : report.reason}
                          </TableCell>
                          <TableCell sx={{ color: 'white' }}>
                            <Chip 
                              label={getStatusText(report.status)} 
                              color={getStatusColor(report.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'white' }}>
                            {formatDate(report.createdAt)}
                          </TableCell>
                          <TableCell sx={{ color: 'white' }}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => setActionDialog({ 
                                  open: true, 
                                  type: 'delete-review', 
                                  report 
                                })}
                                disabled={report.status !== 'PENDING'}
                              >
                                Удалить отзыв
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={() => setActionDialog({ 
                                  open: true, 
                                  type: 'ban-user', 
                                  report 
                                })}
                                disabled={report.status !== 'PENDING'}
                              >
                                Заблокировать
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="info"
                                onClick={() => setActionDialog({ 
                                  open: true, 
                                  type: 'reject', 
                                  report 
                                })}
                                disabled={report.status !== 'PENDING'}
                              >
                                Отклонить
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={page + 1}
                      onChange={(event, value) => loadReports(value - 1)}
                      color="primary"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: 'white',
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Диалог подтверждения действия */}
        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, type: '', report: null })}
          PaperProps={{
            sx: { bgcolor: '#333', color: 'white' }
          }}
        >
          <DialogTitle>
            Подтверждение действия
          </DialogTitle>
          <DialogContent>
            <Typography>
              {actionDialog.type === 'delete-review' && 'Вы уверены, что хотите удалить отзыв?'}
              {actionDialog.type === 'ban-user' && 'Вы уверены, что хотите заблокировать пользователя?'}
              {actionDialog.type === 'reject' && 'Вы уверены, что хотите отклонить жалобу?'}
            </Typography>
            {actionDialog.report && (
              <Typography variant="body2" sx={{ mt: 2, color: '#ccc' }}>
                Причина жалобы: {actionDialog.report.reason}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setActionDialog({ open: false, type: '', report: null })}
              color="inherit"
            >
              Отмена
            </Button>
            <Button 
              onClick={() => handleReportAction(actionDialog.type, actionDialog.report?.reportId)}
              color="error"
              variant="contained"
            >
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ModeratorReportsPage; 