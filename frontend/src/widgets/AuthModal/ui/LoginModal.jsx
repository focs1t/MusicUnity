import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, TextField, Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { authModel } from '../../../entities/auth';
import { modalStyles } from './styles';

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
        sx: modalStyles.paper
      }}
    >
      {/* Крестик закрытия (абсолютное позиционирование) */}
      <Box 
        sx={modalStyles.closeButton}
        onClick={onClose}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 6L18 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </Box>
      
      <DialogContent sx={modalStyles.dialogContent}>
        {/* Заголовок */}
        <Typography variant="h5" component="div" sx={modalStyles.title}>
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
              sx: modalStyles.inputLabel,
              required: true
            }}
            sx={modalStyles.textField}
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
              sx: modalStyles.inputLabel,
              required: true
            }}
            sx={modalStyles.textField}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  name="rememberMe" 
                  checked={loginData.rememberMe}
                  onChange={handleChange}
                  sx={modalStyles.checkbox}
                />
              }
              label="Запомнить меня"
              sx={modalStyles.normalText}
            />
            <Typography 
              variant="body2"
              sx={modalStyles.secondaryLinkText}
              onClick={onSwitchToForgotPassword}
            >
              Забыли пароль?
            </Typography>
          </Box>
          
          {error && loginAttempted && (
            <Typography sx={modalStyles.errorText}>
              {error}
            </Typography>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={modalStyles.button}
            disabled={loading}
          >
            {loading ? 'Выполняется вход...' : 'Войти'}
          </Button>
          
          <Box sx={modalStyles.flexCenter}>
            <Typography variant="body1" sx={modalStyles.normalText}>
              Нет аккаунта?
            </Typography>
            <Typography 
              variant="body1" 
              sx={modalStyles.linkText}
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