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
  const [reasonDialog, setReasonDialog] = useState({ open: false, reason: '' });

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

      // Проверяем, что у нас есть данные пользователя
      console.log('Данные пользователя:', userDetails);
      if (!userDetails || !userDetails.userId) {
        console.error('Нет данных пользователя:', { userDetails, userId: userDetails?.userId });
        throw new Error('Не удалось получить данные пользователя');
      }

      console.log('Выполняется действие:', actionType, 'для репорта:', reportId, 'модератором:', userDetails.userId);

      switch (actionType) {
        case 'delete-review':
          await reportApi.deleteReview(reportId, userDetails.userId);
          setSuccess('Рецензия успешно удалена');
          break;
        case 'delete-author':
          await reportApi.deleteAuthor(reportId, userDetails.userId);
          setSuccess('Автор успешно удален');
          break;
        case 'delete-release':
          await reportApi.deleteRelease(reportId, userDetails.userId);
          setSuccess('Релиз успешно удален');
          break;
        case 'ban-user':
          await reportApi.banUser(reportId, userDetails.userId);
          setSuccess('Пользователь заблокирован');
          break;
        case 'reject':
          await reportApi.rejectReport(reportId, userDetails.userId);
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

  // Открытие модального окна с полной причиной
  const openReasonDialog = (reason) => {
    setReasonDialog({ open: true, reason });
  };

  // Компонент для отображения причины с сокращением
  const ReasonCell = ({ report }) => {
    const maxLength = 40;
    const needsTruncation = report.reason.length > maxLength;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1
        }}>
          {needsTruncation ? report.reason.substring(0, maxLength) : report.reason}
        </Typography>
        {needsTruncation && (
          <span 
            onClick={() => openReasonDialog(report.reason)}
            style={{ 
              color: '#ffffff', 
              cursor: 'pointer',
              fontSize: '16px',
              userSelect: 'none',
              border: '1px solid #333333',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1a1a1a',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#333333';
              e.target.style.borderColor = '#555555';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#1a1a1a';
              e.target.style.borderColor = '#333333';
            }}
          >
            ...
          </span>
        )}
      </Box>
    );
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
      bgcolor: '#000000',
      background: '#000000',
      color: '#ffffff'
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: '#ffffff',
              textAlign: 'center',
              mb: 2,
              fontSize: '2rem'
            }}
          >
            Управление жалобами
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center',
              color: '#666666',
              fontWeight: 400,
              fontSize: '1rem'
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
          bgcolor: '#111111',
          border: '1px solid #333333',
          borderRadius: 2,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)',
          color: '#ffffff'
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
                    bgcolor: '#0a0a0a',
                    border: '1px solid #222222',
                    borderRadius: 1
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#1a1a1a' }}>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #333333' }}>ID</TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #333333' }}>Тип</TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #333333' }}>Переход</TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #333333' }}>Причина</TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #333333' }}>Статус</TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #333333' }}>Дата</TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: '1px solid #333333' }}>Действия</TableCell>
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
                              bgcolor: '#0a0a0a',
                              '&:hover': { bgcolor: '#1a1a1a' },
                              borderBottom: '1px solid #222222'
                            }}
                          >
                            <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #222222' }}>
                              #{report.reportId}
                            </TableCell>
                            <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #222222' }}>
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
                            <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #222222' }}>
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
                            <TableCell sx={{ color: '#ffffff', maxWidth: 200, borderBottom: '1px solid #222222' }}>
                              <ReasonCell report={report} />
                            </TableCell>
                            <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #222222' }}>
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
                            <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #222222' }}>
                              <Typography variant="body2" sx={{ color: '#888888' }}>
                                {formatDate(report.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #222222' }}>
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
                                          bgcolor: '#1a1a1a',
                                          border: `1px solid #333333`,
                                          borderRadius: '50%',
                                          width: 32,
                                          height: 32,
                                          '&:hover': { 
                                            bgcolor: action.color,
                                            color: '#000000',
                                            borderColor: action.color,
                                            transform: 'scale(1.1)'
                                          },
                                          '&:disabled': {
                                            color: '#555555',
                                            bgcolor: '#0a0a0a',
                                            borderColor: '#222222'
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
              bgcolor: '#121212',
              backgroundImage: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
              color: '#ffffff'
            }
          }}
        >
          <DialogTitle sx={{ 
            color: '#ffffff',
            fontWeight: 600,
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            pb: 2
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
                bgcolor: 'rgba(0,0,0,0.3)',
                borderRadius: 1.5,
                border: '1px solid rgba(255,255,255,0.1)',
                maxWidth: '100%',
                overflow: 'hidden'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getReportTypeIcon(actionDialog.report.type)}
                  <Typography variant="body2" sx={{ color: '#ffffff', ml: 1 }}>
                    <strong>Тип:</strong> {getReportTypeText(actionDialog.report.type)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#ffffff', mb: 1 }}>
                  <strong>ID объекта:</strong> {actionDialog.report.targetId}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#ffffff',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word'
                }}>
                  <strong>Причина:</strong> {actionDialog.report.reason}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.05)', 
            pt: 3,
            gap: 2,
            justifyContent: 'center'
          }}>
            <Button 
              onClick={() => setActionDialog({ open: false, type: '', report: null })}
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 1.5,
                px: 3,
                py: 1,
                textTransform: 'none',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              Отмена
            </Button>
            <Button 
              onClick={() => handleReportAction(actionDialog.type, actionDialog.report?.reportId, actionDialog.report?.type)}
              variant="contained"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.9)',
                color: '#000',
                borderRadius: 1.5,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                '&:hover': { 
                  bgcolor: 'white',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.5)'
                }
              }}
            >
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог для отображения полной причины */}
        <Dialog
          open={reasonDialog.open}
          onClose={() => setReasonDialog({ open: false, reason: '' })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              bgcolor: '#121212',
              backgroundImage: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
              color: '#ffffff'
            }
          }}
        >
          <DialogTitle sx={{ 
            color: '#ffffff',
            fontWeight: 600,
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            pb: 2
          }}>
            Полная причина жалобы
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" sx={{ 
              color: '#ffffff',
              lineHeight: 1.6,
              wordBreak: 'break-word'
            }}>
              {reasonDialog.reason}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.05)', 
            pt: 3,
            justifyContent: 'center'
          }}>
            <Button 
              onClick={() => setReasonDialog({ open: false, reason: '' })}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.9)',
                color: '#000',
                borderRadius: 1.5,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                '&:hover': { 
                  bgcolor: 'white',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.5)'
                }
              }}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ModeratorReportsPage; 