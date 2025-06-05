import React, { useState } from 'react';
import { Dialog, DialogContent, Button, TextField, Box, Typography, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { authModel } from '../../../entities/auth';

const ForgotPasswordModal = ({ open, onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  // Флаг, чтобы отслеживать, была ли попытка восстановления
  const [resetAttempted, setResetAttempted] = useState(false);
  
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Введите ваш email');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Введите корректный email');
      return;
    }
    
    setLoading(true);
    setError('');
    // Устанавливаем флаг попытки восстановления
    setResetAttempted(true);
    
    try {
      const result = await dispatch(authModel.forgotPassword(email));
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Произошла ошибка при обработке запроса');
      }
    } catch (err) {
      setError('Произошла ошибка при отправке запроса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setEmail('');
    setSuccess(false);
    setError('');
    setResetAttempted(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={success ? handleReset : onClose}
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
        onClick={success ? handleReset : onClose}
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
          Восстановление пароля
        </Typography>
        
        {success ? (
          // Сообщение об успешной отправке
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
              Инструкции по восстановлению пароля отправлены на указанный email.
            </Alert>
            <Typography sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              Пожалуйста, проверьте вашу почту и следуйте инструкциям в письме для сброса пароля.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleReset}
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
              Вернуться к входу
            </Button>
          </Box>
        ) : (
          // Форма восстановления пароля
          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              Введите email, указанный при регистрации, и мы отправим вам инструкции по восстановлению пароля.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
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
            
            {error && resetAttempted && (
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
              {loading ? 'Отправка...' : 'Восстановить пароль'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Вспомнили пароль?
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  cursor: 'pointer', 
                  ml: 1,
                  fontWeight: 600,
                  color: '#666',
                  transition: 'color 0.2s',
                  '&:hover': { 
                    color: '#999', 
                    textDecoration: 'underline' 
                  }
                }}
                onClick={onSwitchToLogin}
              >
                Войти
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal; 