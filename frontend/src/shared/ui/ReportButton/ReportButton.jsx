import React, { useState } from 'react';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, MenuItem, Select, FormControl, InputLabel, Box, Snackbar, Alert } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { reportApi } from '../../api/report';
import { ReportType } from '../../../entities/report/model/types';
import { useAuth } from '../../../app/providers/AuthProvider';

const ReportButton = ({ 
  type, 
  targetId, 
  disabled = false, 
  size = 'medium',
  color = '#999',
  style = {},
  className = '',
  tooltip = 'Пожаловаться',
  onReportSuccess = () => {},
  onReportError = () => {}
}) => {
  const { user, isAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const reportReasons = [
    'Спам или реклама',
    'Неприемлемый контент',
    'Оскорбления или угрозы',
    'Ложная информация',
    'Нарушение авторских прав',
    'Другое'
  ];

  const handleClick = () => {
    if (!isAuth) {
      alert('Необходимо авторизоваться для подачи жалобы');
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setReason('');
    setReportReason('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!reportReason) {
      setError('Выберите причину жалобы');
      return;
    }

    if (reportReason === 'Другое' && !reason) {
      setError('Укажите причину жалобы');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const finalReason = reportReason === 'Другое' ? reason : reportReason;
      const userId = user.userId || user.id || user.user_id;
      
      if (!userId) {
        setError('Не удалось определить ID пользователя');
        return;
      }
      
      // console.log('Отправка жалобы:', { type, targetId, userId, finalReason });
      await reportApi.createUniversalReport(type, targetId, userId, finalReason);
      onReportSuccess();
      handleClose();
      setShowSuccess(true);
    } catch (err) {
      console.error('Ошибка при отправке жалобы:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Произошла ошибка';
      setError(errorMessage);
      onReportError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDialogTitle = () => {
    switch (type) {
      case ReportType.REVIEW: return 'Пожаловаться на рецензию';
      case ReportType.AUTHOR: return 'Пожаловаться на автора';
      case ReportType.RELEASE: return 'Пожаловаться на релиз';
      case ReportType.PROFILE: return 'Пожаловаться на профиль';
      default: return 'Подать жалобу';
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        disabled={disabled || !isAuth}
        size={size}
        className={className}
        title={tooltip}
        sx={{ 
          color: color,
          width: size === 'small' ? '32px' : '40px',
          height: size === 'small' ? '32px' : '40px',
          borderRadius: '50%',
          minWidth: 'unset',
          padding: size === 'small' ? '6px' : '8px',
          '&:hover': { 
            color: '#ef4444' 
          },
          ...style
        }}
      >
        <FlagIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      </IconButton>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: '#121212',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            position: 'relative',
            backgroundImage: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
            border: '1px solid rgba(255,255,255,0.05)'
          }
        }}
      >
        {/* Крестик закрытия */}
        <Box 
          sx={{
            position: 'absolute', 
            right: 12, 
            top: 12, 
            zIndex: 10,
            cursor: 'pointer',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)'
            }
          }}
          onClick={handleClose}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 6L18 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Box>

        <DialogContent sx={{ px: 4, py: 5 }}>
          {/* Заголовок */}
          <Typography variant="h5" component="div" sx={{ 
            textAlign: 'center', 
            mb: 4, 
            fontWeight: 600, 
            color: '#fff',
            textShadow: '0px 2px 4px rgba(0,0,0,0.3)'
          }}>
            {getDialogTitle()}
          </Typography>

          <FormControl fullWidth margin="normal" required sx={{
            '& .MuiInputLabel-asterisk': {
              color: '#ef4444 !important'
            },
            '& .MuiFormLabel-asterisk': {
              color: '#ef4444 !important'
            }
          }}>
            <InputLabel sx={{ 
              color: 'rgba(255,255,255,0.6)',
              '&.Mui-focused': { color: 'white' }
            }}>
              Причина жалобы
            </InputLabel>
            <Select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              label="Причина жалобы *"
              sx={{ 
                color: 'white',
                mb: 2.5,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                bgcolor: 'rgba(0,0,0,0.3)',
                borderRadius: 1.5
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#1e1e1e',
                    color: 'white',
                    '& .MuiMenuItem-root': {
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }
                  }
                }
              }}
            >
              {reportReasons.map((reasonOption) => (
                <MenuItem key={reasonOption} value={reasonOption}>
                  {reasonOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {reportReason === 'Другое' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Опишите причину жалобы..."
              margin="normal"
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#333' },
                  bgcolor: 'rgba(0,0,0,0.3)',
                  borderRadius: 1.5
                },
                '& .MuiInputBase-input': { 
                  color: 'white',
                  padding: '14px 16px'
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.5)'
                }
              }}
            />
          )}

          {error && (
            <Typography sx={{ 
              mt: 2.5, 
              mb: 1, 
              textAlign: 'center', 
              color: '#bf616a',
              bgcolor: 'rgba(191,97,106,0.1)',
              borderRadius: 1,
              py: 1,
              px: 2
            }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: '#ef4444',
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 1.5,
                py: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                '&:hover': { 
                  backgroundColor: '#dc2626' 
                },
                '&:disabled': {
                  backgroundColor: 'rgba(239, 68, 68, 0.5)',
                  color: 'rgba(255, 255, 255, 0.5)'
                }
              }}
            >
              {loading ? 'Отправка...' : 'Отправить жалобу'}
            </Button>
            <Button 
              onClick={handleClose}
              fullWidth
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 1.5,
                py: 1,
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white'
                }
              }}
            >
              Отмена
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar 
        open={showSuccess} 
        autoHideDuration={4000} 
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{
            width: '100%',
            backgroundColor: '#10B981',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          Жалоба отправлена и будет рассмотрена модераторами
        </Alert>
      </Snackbar>
    </>
  );
};

export default ReportButton; 