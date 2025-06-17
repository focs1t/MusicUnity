import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, TextField, Box, Typography, Checkbox, FormControlLabel, Alert, Radio, RadioGroup, FormControl, FormLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { authModel } from '../../../entities/auth';
import { modalStyles } from './styles';
import httpClient from '../../../shared/api/httpClient';
import { ROUTES } from '../../../shared/config/routes';
import { isValidEmail, validatePassword, doPasswordsMatch, getPasswordErrorMessage } from '../../../shared/utils/validation';

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
    agreePrivacy: false,
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
      agreePrivacy: false,
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
      [name]: name === 'agreeTerms' || name === 'agreePrivacy' ? checked : value
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
    } else if (!isValidEmail(registerData.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    
    if (!registerData.password) {
      newErrors.password = 'Пароль обязателен';
    } else {
      const passwordValidation = validatePassword(registerData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = getPasswordErrorMessage(passwordValidation);
      }
    }
    
    if (!doPasswordsMatch(registerData.password, registerData.confirmPassword)) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    // Валидация для авторов
    if (registerData.userType === 'author') {
      if (!registerData.authorName || registerData.authorName.trim().length < 2) {
        newErrors.authorName = 'Имя автора должно быть не менее 2 символов';
      }
    }
    
    if (!registerData.agreeTerms) {
      newErrors.agreeTerms = 'Необходимо согласиться с условиями пользовательского соглашения';
    }
    
    if (!registerData.agreePrivacy) {
      newErrors.agreePrivacy = 'Необходимо согласиться с условиями политики обработки персональных данных';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Валидация по мере ввода пароля
  const handlePasswordBlur = () => {
    if (registerData.password) {
      const passwordValidation = validatePassword(registerData.password);
      if (!passwordValidation.isValid) {
        setErrors(prev => ({
          ...prev,
          password: getPasswordErrorMessage(passwordValidation)
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          password: ''
        }));
      }
    }
  };

  // Проверка подтверждения пароля при потере фокуса
  const handleConfirmPasswordBlur = () => {
    if (registerData.confirmPassword && registerData.password !== registerData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Пароли не совпадают'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  };

  // Проверка формата email при потере фокуса
  const handleEmailBlur = () => {
    if (registerData.email && !isValidEmail(registerData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Некорректный формат email'
      }));
    } else {
      setErrors(prev => ({
        ...prev, 
        email: ''
      }));
    }
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
          // Показываем сообщение об успехе немедленно для лучшего UX
          setRegistrationSuccess(true);
          setRegisterData(prev => ({ ...prev, userType: 'author-request-sent' }));
          
          try {
            // Отправка заявки на регистрацию автора
            const response = await httpClient.post('/api/registration/author-request', {
              email: registerData.email,
              username: registerData.username,
              password: registerData.password,
              authorName: registerData.authorName
            });
          } catch (authorError) {
            // Если ошибка при отправке заявки автора, возвращаем к форме
            setRegistrationSuccess(false);
            setRegisterData(prev => ({ ...prev, userType: 'author' }));
            throw authorError; // Передаем ошибку дальше для обработки
          }
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
  
  // Функция для временного закрытия модального окна при переходе по ссылкам
  const handleNavigateToTerms = (e) => {
    e.preventDefault();
    // Сохраняем состояние формы в localStorage
    localStorage.setItem('registerFormData', JSON.stringify(registerData));
    // Закрываем модальное окно
    onClose();
    // Открываем новую вкладку с пользовательским соглашением
    window.open(ROUTES.USER_AGREEMENT, '_blank');
  };
  
  const handleNavigateToPrivacy = (e) => {
    e.preventDefault();
    // Сохраняем состояние формы в localStorage
    localStorage.setItem('registerFormData', JSON.stringify(registerData));
    // Закрываем модальное окно
    onClose();
    // Открываем новую вкладку с политикой обработки персональных данных
    window.open(ROUTES.PRIVACY_POLICY, '_blank');
  };

  return (
    <Dialog 
      open={open} 
      onClose={registrationSuccess ? handleCloseAfterSuccess : handleModalClose}
      fullWidth
      maxWidth="sm"
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
                ? 'Ваша заявка на роль автора отправлена. Для подтверждения статуса автора напишите на musciunity@mail.ru с доказательствами ваших музыкальных работ.' 
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
              margin="dense"
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
              size="small"
              InputLabelProps={{ 
                sx: modalStyles.inputLabel,
                required: true
              }}
              FormHelperTextProps={{ sx: modalStyles.helperText }}
              sx={modalStyles.textField}
            />
            <TextField
              margin="dense"
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
              size="small"
              InputLabelProps={{ 
                sx: modalStyles.inputLabel,
                required: true
              }}
              FormHelperTextProps={{ sx: modalStyles.helperText }}
              sx={modalStyles.textField}
              onBlur={handleEmailBlur}
            />
            <TextField
              margin="dense"
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
              size="small"
              InputLabelProps={{ 
                sx: modalStyles.inputLabel,
                required: true
              }}
              FormHelperTextProps={{ sx: modalStyles.helperText }}
              sx={modalStyles.textField}
              onBlur={handlePasswordBlur}
            />
            <TextField
              margin="dense"
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
              size="small"
              InputLabelProps={{ 
                sx: modalStyles.inputLabel,
                required: true
              }}
              FormHelperTextProps={{ sx: modalStyles.helperText }}
              sx={modalStyles.textField}
              onBlur={handleConfirmPasswordBlur}
            />

            {/* Выбор типа регистрации */}
            <FormControl component="fieldset" sx={{ mt: 1, mb: 0 }}>
              <FormLabel component="legend" sx={{ color: 'white', '&.Mui-focused': { color: 'white' }, fontSize: '0.9em' }}>
                Тип аккаунта
              </FormLabel>
              <RadioGroup
                name="userType"
                value={registerData.userType}
                onChange={handleChange}
                sx={{ mt: 0.25 }}
              >
                <FormControlLabel 
                  value="user" 
                  control={<Radio size="small" sx={{ color: 'white', '&.Mui-checked': { color: '#1976d2' }, py: 0.25 }} />} 
                  label={<Typography sx={{ color: 'white', fontSize: '0.9em' }}>Пользователь (слушатель)</Typography>}
                  sx={{ mb: 0 }}
                />
                <FormControlLabel 
                  value="author" 
                  control={<Radio size="small" sx={{ color: 'white', '&.Mui-checked': { color: '#1976d2' }, py: 0.25 }} />} 
                  label={<Typography sx={{ color: 'white', fontSize: '0.9em' }}>Автор (музыкант/артист)</Typography>}
                  sx={{ mb: 0 }}
                />
              </RadioGroup>
            </FormControl>

            {/* Поле имени автора */}
            {registerData.userType === 'author' && (
              <TextField
                margin="dense"
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
                size="small"
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
              <Alert severity="info" sx={{ mt: 1.5, mb: 1, bgcolor: 'rgba(33, 150, 243, 0.1)', color: '#2196f3', py: 1 }}>
                <Typography sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '0.95em' }}>Подтверждение статуса автора:</Typography>
                <Typography sx={{ fontSize: '0.85em', lineHeight: 1.3 }}>
                  После регистрации напишите на{' '}
                                        <strong style={{ color: '#1976d2' }}>musciunity@mail.ru</strong>{' '}
                  с доказательствами ваших музыкальных работ.
                </Typography>
              </Alert>
            )}
            
            {/* Чекбокс для пользовательского соглашения */}
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
                  Принимаю условия{' '}
                  <span 
                    style={{ textDecoration: 'underline', cursor: 'pointer', color: '#4dabf5' }}
                    onClick={handleNavigateToTerms}
                  >
                    Пользовательского соглашения
                  </span>{' '}*
                </Typography>
              }
              sx={{ mt: 1 }}
            />
            {errors.agreeTerms && (
              <Typography variant="caption" sx={{ display: 'block', ml: 2, color: '#bf616a' }}>
                {errors.agreeTerms}
              </Typography>
            )}
            
            {/* Чекбокс для политики обработки персональных данных */}
            <FormControlLabel
              control={
                <Checkbox 
                  name="agreePrivacy" 
                  checked={registerData.agreePrivacy}
                  onChange={handleChange}
                  sx={modalStyles.checkbox}
                />
              }
              label={
                <Typography variant="body2" sx={modalStyles.normalText}>
                  Принимаю условия{' '}
                  <span 
                    style={{ textDecoration: 'underline', cursor: 'pointer', color: '#4dabf5' }}
                    onClick={handleNavigateToPrivacy}
                  >
                    Политики обработки персональных данных
                  </span>{' '}*
                </Typography>
              }
              sx={{ mt: 1 }}
            />
            {errors.agreePrivacy && (
              <Typography variant="caption" sx={{ display: 'block', ml: 2, color: '#bf616a' }}>
                {errors.agreePrivacy}
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