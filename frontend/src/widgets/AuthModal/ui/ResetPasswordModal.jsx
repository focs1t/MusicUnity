import React, { useState } from 'react';
import { Dialog, DialogContent, Button, TextField, Box, Typography, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { authModel } from '../../../entities/auth';

const ResetPasswordModal = ({ open, onClose, token, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!passwordData.newPassword) {
      setError('Введите новый пароль');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await dispatch(authModel.resetPassword(token, passwordData.newPassword));
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Произошла ошибка при сбросе пароля');
      }
    } catch (err) {
      setError('Произошла ошибка при отправке запроса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    if (success) {
      // Если успешно сбросили пароль, переходим к форме входа
      onSwitchToLogin();
    } else {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
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
      {/* Крестик закрытия (абсолютное позиционирование) */}
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
          Сброс пароля
        </Typography>
        
        {success ? (
          // Сообщение об успешном сбросе пароля
          <Box>
            <Alert severity="success" sx={{ 
              mb: 3, 
              bgcolor: 'rgba(56, 142, 60, 0.15)', 
              color: '#66bb6a',
              borderRadius: 1.5,
              '& .MuiAlert-icon': {
                color: '#66bb6a'
              }
            }}>
              Пароль успешно изменен!
            </Alert>
            <Typography sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              Теперь вы можете войти в систему, используя новый пароль.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={onSwitchToLogin}
              sx={{ 
                mt: 2,
                py: 1.5,
                backgroundColor: '#333',
                '&:hover': {
                  backgroundColor: '#444'
                },
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
            >
              Перейти к входу
            </Button>
          </Box>
        ) : (
          // Форма сброса пароля
          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              Пожалуйста, введите новый пароль.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="Новый пароль"
              type="password"
              id="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ 
                sx: { color: 'rgba(255,255,255,0.6)' },
                required: true
              }}
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
                  padding: '14px 16px',
                },
                '& .MuiFormLabel-asterisk': {
                  color: '#bf616a'
                }
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Подтвердите пароль"
              type="password"
              id="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ 
                sx: { color: 'rgba(255,255,255,0.6)' },
                required: true
              }}
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
                  padding: '14px 16px',
                },
                '& .MuiFormLabel-asterisk': {
                  color: '#bf616a'
                }
              }}
            />
            
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 3, 
                py: 1.5,
                backgroundColor: '#333',
                '&:hover': {
                  backgroundColor: '#444'
                },
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
            >
              {loading ? 'Обработка...' : 'Сбросить пароль'}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal; 