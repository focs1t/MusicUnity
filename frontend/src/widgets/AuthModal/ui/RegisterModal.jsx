import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, TextField, Box, Typography, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { authModel } from '../../../entities/auth';
import { modalStyles } from './styles';

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
        sx: modalStyles.paper
      }}
    >
      {/* Крестик закрытия (абсолютное позиционирование) */}
      <Box 
        sx={modalStyles.closeButton}
        onClick={registrationSuccess ? handleCloseAfterSuccess : onClose}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 6L18 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </Box>
      
      <DialogContent sx={modalStyles.dialogContent}>
        {/* Заголовок */}
        <Typography variant="h5" component="div" sx={modalStyles.title}>
          {registrationSuccess ? 'Регистрация успешна!' : 'Регистрация'}
        </Typography>
        
        {registrationSuccess ? (
          // Сообщение об успешной регистрации
          <Box>
            <Alert severity="success" sx={modalStyles.successAlert}>
              Вы успешно зарегистрировались!
            </Alert>
            <Typography sx={modalStyles.normalText}>
              Теперь вы можете использовать все возможности нашего сервиса. Добро пожаловать в MusicUnity!
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCloseAfterSuccess}
              sx={modalStyles.button}
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
                sx: modalStyles.inputLabel,
                required: true
              }}
              FormHelperTextProps={{ sx: modalStyles.helperText }}
              sx={modalStyles.textField}
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
                sx: modalStyles.inputLabel,
                required: true
              }}
              FormHelperTextProps={{ sx: modalStyles.helperText }}
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
              autoComplete="new-password"
              value={registerData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              variant="outlined"
              InputLabelProps={{ 
                sx: modalStyles.inputLabel,
                required: true
              }}
              FormHelperTextProps={{ sx: modalStyles.helperText }}
              sx={modalStyles.textField}
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
                sx: modalStyles.inputLabel,
                required: true
              }}
              FormHelperTextProps={{ sx: modalStyles.helperText }}
              sx={modalStyles.textField}
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  name="agreeTerms" 
                  checked={registerData.agreeTerms}
                  onChange={handleChange}
                  sx={modalStyles.checkbox}
                />
              }
              label={
                <Typography variant="body2" sx={modalStyles.normalText}>
                  Я согласен с <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'white' }}>условиями использования</span>
                </Typography>
              }
              sx={{ mt: 2 }}
            />
            {errors.agreeTerms && (
              <Typography variant="caption" sx={{ display: 'block', ml: 2, color: '#bf616a' }}>
                {errors.agreeTerms}
              </Typography>
            )}
            
            {error && registerAttempted && (
              <Typography sx={modalStyles.errorText}>
                {error}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={modalStyles.button}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            
            <Box sx={modalStyles.flexCenter}>
              <Typography variant="body1" sx={modalStyles.normalText}>
                Уже есть аккаунт?
              </Typography>
              <Typography 
                variant="body1" 
                sx={modalStyles.linkText}
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