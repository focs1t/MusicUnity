import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useAuth } from '../app/providers/AuthProvider';
import { userApi } from '../shared/api/user';
import { fileApi } from '../shared/api/file';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const SettingsPage = () => {
  const { user: authUser } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Поля формы
  const [bio, setBio] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(null);
  
  // Поля для смены пароля
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Ref для input file
  const fileInputRef = useRef(null);
  
  // Загрузка данных пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Получение подробных данных о пользователе
        let userData;
        if (authUser?.id) {
          userData = await userApi.getUserById(authUser.id);
        } else {
          userData = await userApi.getCurrentUser();
        }
        
        setUserDetails(userData);
        setBio(userData.bio || '');
        setTelegramChatId(userData.telegramChatId || '');
        setAvatarUrl(userData.avatarUrl || '');
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке данных пользователя:', err);
        setError('Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [authUser]);
  
  // Обработчик выбора аватара
  const handleAvatarSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Предпросмотр аватара
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Загрузка файла на сервер
      handleAvatarUpload(file);
    }
  };
  
  // Загрузка аватара на сервер
  const handleAvatarUpload = async (file) => {
    try {
      setSaving(true);
      const response = await fileApi.uploadAvatar(file);
      
      console.log('Ответ после загрузки аватара:', response);
      
      if (response && response.url) {
        setAvatarUrl(response.url);
        setNotification({
          open: true,
          message: 'Аватар успешно загружен',
          severity: 'success'
        });
      } else {
        throw new Error('Ошибка получения URL аватара');
      }
    } catch (err) {
      console.error('Ошибка при загрузке аватара:', err);
      setNotification({
        open: true,
        message: 'Не удалось загрузить аватар. Пожалуйста, попробуйте позже.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Сохранение данных профиля
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Преобразуем URL аватара, если он слишком длинный
      let processedAvatarUrl = avatarUrl;
      
      // Если URL содержит параметры запроса, берем только базовую часть URL
      if (avatarUrl && avatarUrl.includes('?')) {
        const baseUrl = avatarUrl.split('?')[0];
        console.log('URL аватара слишком длинный, используем базовый URL:', baseUrl);
        processedAvatarUrl = baseUrl;
      }
      
      // Отправляем данные без проверки формата telegramChatId
      await userApi.updateUserData(bio, processedAvatarUrl, telegramChatId);
      
      setNotification({
        open: true,
        message: 'Данные профиля успешно обновлены',
        severity: 'success'
      });
      
      // Обновляем данные пользователя
      const userData = await userApi.getCurrentUser();
      setUserDetails(userData);
    } catch (err) {
      console.error('Ошибка при сохранении данных профиля:', err);
      setNotification({
        open: true,
        message: 'Не удалось обновить данные профиля. Пожалуйста, попробуйте позже.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Смена пароля
  const handleChangePassword = async () => {
    // Валидация
    if (newPassword !== confirmPassword) {
      setNotification({
        open: true,
        message: 'Новый пароль и подтверждение не совпадают',
        severity: 'error'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      setNotification({
        open: true,
        message: 'Новый пароль должен содержать не менее 6 символов',
        severity: 'error'
      });
      return;
    }
    
    try {
      setSaving(true);
      await userApi.changePassword(oldPassword, newPassword);
      
      setNotification({
        open: true,
        message: 'Пароль успешно изменен',
        severity: 'success'
      });
      
      // Очищаем поля
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Ошибка при смене пароля:', err);
      setNotification({
        open: true,
        message: 'Не удалось изменить пароль. Проверьте правильность текущего пароля.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Закрытие уведомления
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" paragraph>
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
          Настройки профиля
        </Typography>
        
        {/* Форма настроек профиля */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#1e1e1e', color: 'white', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Основная информация
          </Typography>
          
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} sm={4} md={3} sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={previewAvatar || avatarUrl}
                  alt={userDetails?.username}
                  sx={{ width: 120, height: 120, mb: 2, mx: 'auto', border: '3px solid rgba(255,255,255,0.1)' }}
                />
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    color: 'white'
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <PhotoCameraIcon />
                </IconButton>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarSelect}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Размер аватара не должен превышать 5 МБ
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={8} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Имя пользователя"
                    value={userDetails?.username || ''}
                    fullWidth
                    disabled
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        '&.Mui-disabled fieldset': { borderColor: 'rgba(255,255,255,0.1)' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiInputBase-input': { color: 'rgba(255,255,255,0.5)' }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', ml: 1 }}>
                    Имя пользователя нельзя изменить
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    value={userDetails?.email || ''}
                    fullWidth
                    disabled
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        '&.Mui-disabled fieldset': { borderColor: 'rgba(255,255,255,0.1)' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiInputBase-input': { color: 'rgba(255,255,255,0.5)' }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', ml: 1 }}>
                    Email нельзя изменить
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="О себе"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiInputBase-input': { color: 'white' }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Telegram ID"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder="username"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">@</InputAdornment>,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiInputBase-input': { color: 'white' },
                      '& .MuiInputAdornment-root': { color: 'rgba(255,255,255,0.7)' }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', ml: 1 }}>
                    Укажите ваш Telegram для связи
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </Box>
        </Paper>
        
        {/* Смена пароля */}
        <Paper sx={{ p: 3, bgcolor: '#1e1e1e', color: 'white', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Смена пароля
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Текущий пароль"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {showOldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Новый пароль"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', ml: 1 }}>
                Минимум 6 символов
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Подтверждение нового пароля"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleChangePassword}
              disabled={saving || !oldPassword || !newPassword || !confirmPassword}
            >
              {saving ? 'Сохранение...' : 'Изменить пароль'}
            </Button>
          </Box>
        </Paper>
      </Box>
      
      {/* Уведомления */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 