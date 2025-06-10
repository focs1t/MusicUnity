import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, TextField, Box, Typography, Checkbox, FormControlLabel, Alert, Radio, RadioGroup, FormControl, FormLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { authModel } from '../../../entities/auth';
import { modalStyles } from './styles';
import httpClient from '../../../shared/api/httpClient';

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
    agreeTerms: false,
    userType: 'user', // 'user' или 'author'
    authorName: '' // для авторов
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

  // Сброс формы при закрытии модального окна
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Функция для сброса формы
  const resetForm = () => {
    setRegisterData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      userType: 'user',
      authorName: ''
    });
    setErrors({});
    setRegistrationSuccess(false);
    setRegisterAttempted(false);
  };

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
    
    // Валидация для авторов
    if (registerData.userType === 'author') {
      if (!registerData.authorName || registerData.authorName.trim().length < 2) {
        newErrors.authorName = 'Имя автора должно быть не менее 2 символов';
      }
    }
    
    if (!registerData.agreeTerms) {
      newErrors.agreeTerms = 'Необходимо согласиться с условиями';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setRegisterAttempted(true);
      
      try {
        if (registerData.userType === 'user') {
          // Обычная регистрация пользователя
          dispatch(authModel.register(
            registerData.username,
            registerData.email,
            registerData.password
          ));
        } else {
          // Отправка заявки на регистрацию автора
          const response = await httpClient.post('/api/registration/author-request', {
            email: registerData.email,
            username: registerData.username,
            password: registerData.password,
            authorName: registerData.authorName
          });
          
          // Показываем особое сообщение об успехе для заявок авторов
          setRegistrationSuccess(true);
          setRegisterData(prev => ({ ...prev, userType: 'author-request-sent' }));
        }
      } catch (error) {
        console.error('Ошибка регистрации:', error);
        setErrors({ 
          general: error.response?.data?.error || 'Произошла ошибка при регистрации' 
        });
      }
    }
  };
  
  const handleCloseAfterSuccess = () => {
    resetForm();
    onClose();
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={registrationSuccess ? handleCloseAfterSuccess : handleModalClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: modalStyles.paper
      }}
    >
      {/* Крестик закрытия (абсолютное позиционирование) */}
      <Box 
        sx={modalStyles.closeButton}
        onClick={registrationSuccess ? handleCloseAfterSuccess : handleModalClose}
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
              {registerData.userType === 'author-request-sent' 
                ? 'Заявка отправлена!' 
                : 'Вы успешно зарегистрировались!'}
            </Alert>
            <Typography sx={modalStyles.normalText}>
              {registerData.userType === 'author-request-sent' 
                ? 'Ваша заявка на роль автора отправлена. Для подтверждения статуса автора напишите на musicunity@mail.ru с доказательствами ваших музыкальных работ.' 
                : 'Теперь вы можете использовать все возможности нашего сервиса. Добро пожаловать в MusicUnity!'}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCloseAfterSuccess}
              sx={modalStyles.button}
            >
              {registerData.userType === 'author-request-sent' 
                ? 'Понятно' 
                : 'Начать пользоваться сервисом'}
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

            {/* Выбор типа регистрации */}
            <FormControl component="fieldset" sx={{ mt: 2, mb: 1 }}>
              <FormLabel component="legend" sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>
                Тип аккаунта
              </FormLabel>
              <RadioGroup
                name="userType"
                value={registerData.userType}
                onChange={handleChange}
                sx={{ mt: 1 }}
              >
                <FormControlLabel 
                  value="user" 
                  control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#1976d2' } }} />} 
                  label={<Typography sx={{ color: 'white' }}>Пользователь (слушатель)</Typography>}
                />
                <FormControlLabel 
                  value="author" 
                  control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#1976d2' } }} />} 
                  label={<Typography sx={{ color: 'white' }}>Автор (музыкант/артист)</Typography>}
                />
              </RadioGroup>
            </FormControl>

            {/* Поле имени автора */}
            {registerData.userType === 'author' && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="authorName"
                label="Имя автора"
                name="authorName"
                autoComplete="name"
                value={registerData.authorName}
                onChange={handleChange}
                error={!!errors.authorName}
                helperText={errors.authorName}
                variant="outlined"
                InputLabelProps={{ 
                  sx: modalStyles.inputLabel,
                  required: true
                }}
                FormHelperTextProps={{ sx: modalStyles.helperText }}
                sx={modalStyles.textField}
              />
            )}

            {/* Информация для авторов */}
            {registerData.userType === 'author' && (
              <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' }}>
                <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Подтверждение статуса автора:</Typography>
                <Typography>
                  После регистрации напишите на email{' '}
                  <strong style={{ color: '#1976d2' }}>musicunity@mail.ru</strong>{' '}
                  для подтверждения, что вы являетесь автором музыки.
                </Typography>
                <Typography sx={{ mt: 1, fontSize: '0.9em' }}>
                  В письме укажите ваши музыкальные работы, ссылки на треки или альбомы.
                </Typography>
              </Alert>
            )}
            
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
            
            {((error && registerAttempted) || errors.general) && (
              <Typography sx={modalStyles.errorText}>
                {errors.general || error}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={modalStyles.button}
            >
              {loading 
                ? (registerData.userType === 'author' ? 'Отправка заявки...' : 'Регистрация...') 
                : (registerData.userType === 'author' ? 'Отправить заявку' : 'Зарегистрироваться')}
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