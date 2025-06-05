import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, TextField, Box, Typography, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { authModel } from '../../../entities/auth';

const RegisterModal = ({ open, onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.auth.loading);
  const error = useSelector(state => state.auth.error);
  const isAuth = useSelector(state => state.auth.isAuthenticated);
  
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Локальное состояние для отслеживания попытки регистрации
  const [registerAttempted, setRegisterAttempted] = useState(false);

  // Эффект для закрытия модального окна при успешной регистрации
  useEffect(() => {
    if (isAuth && open && registerAttempted) {
      setRegistrationSuccess(true);
      // Сбрасываем флаг после успешной регистрации
      setRegisterAttempted(false);
      // Не закрываем модальное окно сразу, показываем сообщение об успехе
    }
  }, [isAuth, open, registerAttempted]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: name === 'agreeTerms' ? checked : value
    }));

    // Очистить ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!registerData.username) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (registerData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно быть не менее 3 символов';
    }
    
    if (!registerData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!registerData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    if (!registerData.agreeTerms) {
      newErrors.agreeTerms = 'Необходимо согласиться с условиями';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Устанавливаем флаг попытки регистрации
      setRegisterAttempted(true);
      
      dispatch(authModel.register(
        registerData.username,
        registerData.email,
        registerData.password
      ));
    }
  };
  
  const handleCloseAfterSuccess = () => {
    setRegistrationSuccess(false);
    setRegisterAttempted(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={registrationSuccess ? handleCloseAfterSuccess : onClose}
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
        onClick={registrationSuccess ? handleCloseAfterSuccess : onClose}
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
          {registrationSuccess ? 'Регистрация успешна!' : 'Регистрация'}
        </Typography>
        
        {registrationSuccess ? (
          // Сообщение об успешной регистрации
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
              Вы успешно зарегистрировались!
            </Alert>
            <Typography sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              Теперь вы можете использовать все возможности нашего сервиса. Добро пожаловать в MusicUnity!
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCloseAfterSuccess}
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
              Начать пользоваться сервисом
            </Button>
          </Box>
        ) : (
          // Форма регистрации
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Имя пользователя"
              name="username"
              autoComplete="username"
              autoFocus
              value={registerData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              variant="outlined"
              InputLabelProps={{ 
                sx: { color: 'rgba(255,255,255,0.6)' },
                required: true
              }}
              FormHelperTextProps={{ sx: { color: '#bf616a' } }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#333' },
                  '&.Mui-error fieldset': { borderColor: '#bf616a' },
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
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={registerData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              InputLabelProps={{ 
                sx: { color: 'rgba(255,255,255,0.6)' },
                required: true
              }}
              FormHelperTextProps={{ sx: { color: '#bf616a' } }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#333' },
                  '&.Mui-error fieldset': { borderColor: '#bf616a' },
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
              autoComplete="new-password"
              value={registerData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              variant="outlined"
              InputLabelProps={{ 
                sx: { color: 'rgba(255,255,255,0.6)' },
                required: true
              }}
              FormHelperTextProps={{ sx: { color: '#bf616a' } }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#333' },
                  '&.Mui-error fieldset': { borderColor: '#bf616a' },
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
              autoComplete="new-password"
              value={registerData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              variant="outlined"
              InputLabelProps={{ 
                sx: { color: 'rgba(255,255,255,0.6)' },
                required: true
              }}
              FormHelperTextProps={{ sx: { color: '#bf616a' } }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#333' },
                  '&.Mui-error fieldset': { borderColor: '#bf616a' },
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
            
            <FormControlLabel
              control={
                <Checkbox 
                  name="agreeTerms" 
                  checked={registerData.agreeTerms}
                  onChange={handleChange}
                  sx={{ 
                    color: 'rgba(255,255,255,0.3)', 
                    '&.Mui-checked': { 
                      color: '#444' 
                    } 
                  }}
                />
              }
              label="Я согласен с условиями использования сайта"
              sx={{ mt: 2, color: 'rgba(255,255,255,0.7)' }}
            />
            {errors.agreeTerms && (
              <Typography variant="caption" sx={{ display: 'block', ml: 2, color: '#bf616a' }}>
                {errors.agreeTerms}
              </Typography>
            )}
            
            {error && registerAttempted && (
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
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Уже есть аккаунт?
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

export default RegisterModal; 