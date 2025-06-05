import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, TextField, Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { authModel } from '../../../entities/auth';

const LoginModal = ({ open, onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.auth.loading);
  const error = useSelector(state => state.auth.error);
  const isAuth = useSelector(state => state.auth.isAuthenticated);
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  // Локальное состояние для отслеживания успешной авторизации
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Эффект для закрытия модального окна ТОЛЬКО при успешной авторизации
  useEffect(() => {
    if (isAuth && open && loginAttempted) {
      onClose();
      // Сбрасываем флаг после успешного входа
      setLoginAttempted(false);
    }
  }, [isAuth, open, onClose, loginAttempted]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Убедимся, что поля не пустые
    if (!loginData.username.trim() || !loginData.password.trim()) {
      return;
    }
    
    // Устанавливаем флаг, что была попытка входа
    setLoginAttempted(true);
    
    dispatch(authModel.login(loginData.username, loginData.password, loginData.rememberMe));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
        onClick={onClose}
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
          Вход в аккаунт
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Имя пользователя или Email"
            name="username"
            autoComplete="username"
            autoFocus
            value={loginData.username}
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
            name="password"
            label="Пароль"
            type="password"
            id="password"
            autoComplete="current-password"
            value={loginData.password}
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
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  name="rememberMe" 
                  checked={loginData.rememberMe}
                  onChange={handleChange}
                  sx={{ 
                    color: 'rgba(255,255,255,0.3)', 
                    '&.Mui-checked': { 
                      color: '#444' 
                    } 
                  }}
                />
              }
              label="Запомнить меня"
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            />
            <Typography 
              variant="body2"
              sx={{ 
                cursor: 'pointer', 
                color: '#666',
                transition: 'color 0.2s',
                '&:hover': { 
                  color: '#999', 
                  textDecoration: 'underline' 
                } 
              }}
              onClick={onSwitchToForgotPassword}
            >
              Забыли пароль?
            </Typography>
          </Box>
          
          {error && loginAttempted && (
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
            disabled={loading}
          >
            {loading ? 'Выполняется вход...' : 'Войти'}
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Нет аккаунта?
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
              onClick={onSwitchToRegister}
            >
              Зарегистрироваться
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal; 