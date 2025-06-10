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
  CircularProgress,
  IconButton,
  Container,
  Tooltip
} from '@mui/material';
import { 
  Article as ReviewIcon,
  Person as AuthorIcon,
  Album as ReleaseIcon,
  AccountCircle as ProfileIcon,
  OpenInNew as OpenIcon,
  Delete as DeleteIcon,
  Block as BanIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { useAuth } from '../app/providers/AuthProvider';
import { reportApi } from '../shared/api/report';
import { userApi } from '../shared/api/user';
import { useNavigate } from 'react-router-dom';
import { ReportType } from '../entities/report/model/types';

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
  const handleReportAction = async (actionType, reportId, reportType) => {
    try {
      setError('');
      setSuccess('');

      switch (actionType) {
        case 'delete-review':
          await reportApi.deleteReview(reportId, user.userId);
          setSuccess('Рецензия успешно удалена');
          break;
        case 'delete-author':
          // TODO: Добавить API для удаления автора
          setSuccess('Автор помечен для удаления');
          break;
        case 'delete-release':
          // TODO: Добавить API для мягкого удаления релиза
          setSuccess('Релиз помечен для удаления');
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

  // Функция для получения текста типа репорта
  const getReportTypeText = (type) => {
    switch (type) {
      case 'REVIEW': return 'Рецензия';
      case 'AUTHOR': return 'Автор';
      case 'RELEASE': return 'Релиз';
      case 'PROFILE': return 'Профиль';
      default: return 'Неизвестно';
    }
  };

  // Функция для получения цвета типа репорта
  const getReportTypeColor = (type) => {
    switch (type) {
      case 'REVIEW': return '#2196f3';
      case 'AUTHOR': return '#ff9800';
      case 'RELEASE': return '#4caf50';
      case 'PROFILE': return '#9c27b0';
      default: return '#757575';
    }
  };

  // Функция для получения доступных действий для типа репорта
  const getAvailableActions = (reportType) => {
    switch (reportType) {
      case 'REVIEW':
        return [
          { type: 'reject', label: 'Отклонить', color: '#ffffff', icon: <RejectIcon /> },
          { type: 'delete-review', label: 'Удалить рецензию', color: '#f44336', icon: <DeleteIcon /> },
          { type: 'ban-user', label: 'Заблокировать пользователя', color: '#ff9800', icon: <BanIcon /> }
        ];
      case 'AUTHOR':
        return [
          { type: 'reject', label: 'Отклонить', color: '#ffffff', icon: <RejectIcon /> },
          { type: 'delete-author', label: 'Удалить автора', color: '#f44336', icon: <DeleteIcon /> }
        ];
      case 'RELEASE':
        return [
          { type: 'reject', label: 'Отклонить', color: '#ffffff', icon: <RejectIcon /> },
          { type: 'delete-release', label: 'Удалить релиз', color: '#f44336', icon: <DeleteIcon /> }
        ];
      case 'PROFILE':
        return [
          { type: 'reject', label: 'Отклонить', color: '#ffffff', icon: <RejectIcon /> },
          { type: 'ban-user', label: 'Заблокировать пользователя', color: '#ff9800', icon: <BanIcon /> }
        ];
      default:
        return [
          { type: 'reject', label: 'Отклонить', color: '#ffffff', icon: <RejectIcon /> }
        ];
    }
  };

  // Функция для получения иконки типа репорта
  const getReportTypeIcon = (type) => {
    console.log('Получение иконки для типа:', type);
    try {
      switch (type) {
        case 'REVIEW': return <ReviewIcon />;
        case 'AUTHOR': return <AuthorIcon />;
        case 'RELEASE': return <ReleaseIcon />;
        case 'PROFILE': return <ProfileIcon />;
        default: 
          console.log('Неизвестный тип:', type);
          return <OpenIcon />;
      }
    } catch (error) {
      console.error('Ошибка в getReportTypeIcon:', error);
      return <OpenIcon />;
    }
  };

  // Функция для получения ссылки на объект
  const getObjectLink = (type, targetId) => {
    switch (type) {
      case 'REVIEW': return `/review/${targetId}`;
      case 'AUTHOR': return `/author/${targetId}`;
      case 'RELEASE': return `/release/${targetId}`;
      case 'PROFILE': return `/profile/${targetId}`;
      default: return '/';
    }
  };

  // Функция для перехода к объекту
  const handleObjectNavigation = (type, targetId) => {
    try {
      console.log('Навигация:', type, targetId);
      const link = getObjectLink(type, targetId);
      console.log('Ссылка:', link);
      
      // Открываем в новой вкладке, чтобы избежать проблем с роутингом
      window.open(link, '_blank');
    } catch (error) {
      console.error('Ошибка навигации:', error);
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
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0a0a0a',
      backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: '#e0e0e0'
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              mb: 2
            }}
          >
            Управление жалобами
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center',
              color: '#888',
              fontWeight: 400
            }}
          >
            Модерация пользовательского контента
          </Typography>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              bgcolor: 'rgba(244, 67, 54, 0.1)', 
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: '#f44336',
              '& .MuiAlert-icon': { color: '#f44336' }
            }}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              bgcolor: 'rgba(76, 175, 80, 0.1)', 
              border: '1px solid rgba(76, 175, 80, 0.3)',
              color: '#4caf50',
              '& .MuiAlert-icon': { color: '#4caf50' }
            }}
          >
            {success}
          </Alert>
        )}

        <Card sx={{ 
          bgcolor: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          color: '#e0e0e0'
        }}>
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
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    bgcolor: 'rgba(20, 20, 20, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 2
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'rgba(40, 40, 40, 0.8)' }}>
                        <TableCell sx={{ color: '#e0e0e0', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>ID</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Тип</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Переход</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Причина</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Статус</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Дата</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.map((report) => {
                        console.log('Обработка репорта:', report);
                        const availableActions = getAvailableActions(report.type);
                        return (
                          <TableRow 
                            key={report.reportId}
                            sx={{ 
                              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                          >
                            <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              #{report.reportId}
                            </TableCell>
                            <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <Chip 
                                icon={report.type ? getReportTypeIcon(report.type) : <OpenIcon />}
                                label={report.type ? getReportTypeText(report.type) : 'Неизвестно'} 
                                clickable={false}
                                sx={{ 
                                  bgcolor: report.type ? getReportTypeColor(report.type) : '#757575',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  '& .MuiChip-icon': { color: 'white' },
                                  cursor: 'default',
                                  pointerEvents: 'none',
                                  '&:hover': { 
                                    bgcolor: report.type ? getReportTypeColor(report.type) : '#757575',
                                    transform: 'none'
                                  },
                                  '&:focus': { 
                                    bgcolor: report.type ? getReportTypeColor(report.type) : '#757575',
                                    transform: 'none'
                                  },
                                  '&:active': { 
                                    bgcolor: report.type ? getReportTypeColor(report.type) : '#757575',
                                    transform: 'none'
                                  }
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <Tooltip title="Перейти к объекту" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    if (typeof handleObjectNavigation === 'function') {
                                      handleObjectNavigation(report.type, report.targetId);
                                    }
                                  }}
                                  sx={{ 
                                    color: 'white',
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    '&:hover': { 
                                      color: '#2196f3',
                                      bgcolor: 'rgba(33, 150, 243, 0.1)',
                                      borderColor: '#2196f3',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <OpenIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ color: '#e0e0e0', maxWidth: 200, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <Typography variant="body2" sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {report.reason.length > 40 
                                  ? `${report.reason.substring(0, 40)}...` 
                                  : report.reason}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <Chip 
                                label={getStatusText(report.status)} 
                                color={getStatusColor(report.status)}
                                size="small"
                                variant="outlined"
                                clickable={false}
                                sx={{ 
                                  cursor: 'default',
                                  pointerEvents: 'none',
                                  '&:hover': { 
                                    transform: 'none',
                                    backgroundColor: 'inherit'
                                  },
                                  '&:focus': { 
                                    transform: 'none',
                                    backgroundColor: 'inherit'
                                  },
                                  '&:active': { 
                                    transform: 'none',
                                    backgroundColor: 'inherit'
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <Typography variant="body2" sx={{ color: '#aaa' }}>
                                {formatDate(report.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                {availableActions.map((action) => (
                                  <Tooltip key={action.type} title={action.label} arrow>
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          console.log('Клик по действию:', action.type, action.label);
                                          if (typeof setActionDialog === 'function') {
                                            setActionDialog({ 
                                              open: true, 
                                              type: action.type, 
                                              report 
                                            });
                                          } else {
                                            console.error('setActionDialog не является функцией');
                                          }
                                        }}
                                        disabled={report.status !== 'PENDING'}
                                        sx={{ 
                                          color: action.color,
                                          bgcolor: `${action.color}20`,
                                          border: `1px solid ${action.color}40`,
                                          borderRadius: '50%',
                                          width: 32,
                                          height: 32,
                                          '&:hover': { 
                                            bgcolor: `${action.color}30`,
                                            borderColor: action.color,
                                            transform: 'scale(1.1)'
                                          },
                                          '&:disabled': {
                                            color: 'rgba(255, 255, 255, 0.3)',
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                            borderColor: 'rgba(255, 255, 255, 0.1)'
                                          },
                                          transition: 'all 0.3s ease'
                                        }}
                                      >
                                        {action.icon}
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
            sx: { 
              bgcolor: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              color: '#e0e0e0'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 600
          }}>
            Подтверждение действия
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              {actionDialog.type === 'delete-review' && 'Вы уверены, что хотите удалить рецензию?'}
              {actionDialog.type === 'delete-author' && 'Вы уверены, что хотите удалить автора?'}
              {actionDialog.type === 'delete-release' && 'Вы уверены, что хотите удалить релиз?'}
              {actionDialog.type === 'ban-user' && 'Вы уверены, что хотите заблокировать пользователя?'}
              {actionDialog.type === 'reject' && 'Вы уверены, что хотите отклонить жалобу?'}
            </Typography>
            {actionDialog.report && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'rgba(40, 40, 40, 0.5)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getReportTypeIcon(actionDialog.report.type)}
                  <Typography variant="body2" sx={{ color: '#e0e0e0', ml: 1 }}>
                    <strong>Тип:</strong> {getReportTypeText(actionDialog.report.type)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 1 }}>
                  <strong>ID объекта:</strong> {actionDialog.report.targetId}
                </Typography>
                <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                  <strong>Причина:</strong> {actionDialog.report.reason}
                </Typography>
              </Box>
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
              onClick={() => handleReportAction(actionDialog.type, actionDialog.report?.reportId, actionDialog.report?.type)}
              color="error"
              variant="contained"
            >
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ModeratorReportsPage; 