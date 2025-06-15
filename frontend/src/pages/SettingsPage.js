import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Snackbar,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../app/providers/AuthProvider';
import { userApi } from '../shared/api/user';
import { fileApi } from '../shared/api/file';
import { authorApi } from '../shared/api/author';
import { setUser } from '../entities/auth/model';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import { LoadingSpinner } from '../shared/ui/LoadingSpinner';
import { validatePassword, getPasswordErrorMessage } from '../shared/utils/validation';

// Стилизованные компоненты
const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: 'calc(100vh - theme(spacing.16))',
  flexDirection: 'column',
  flex: 1,
  gap: theme.spacing(4),
  backgroundColor: '#09090b',
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(6),
    padding: theme.spacing(10),
  },
  marginTop: '-20px',
  marginBottom: '-20px',
  [theme.breakpoints.up('lg')]: {
    marginTop: '-60px',
    marginBottom: '-60px',
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  gap: theme.spacing(2),
}));

const ContentGrid = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gap: theme.spacing(4),
  alignItems: 'start',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '180px 1fr',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: '250px 1fr',
  },
}));

const NavLink = styled(RouterLink)(({ theme }) => ({
  color: 'rgba(161, 161, 170, 0.8)',
  fontWeight: 400,
  fontSize: '0.875rem',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  transition: 'color 0.3s',
  '&:hover': {
    color: '#fff',
  },
}));

const NavMenu = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  fontSize: '0.875rem',
  color: 'rgba(161, 161, 170, 0.8)',
}));

const ContentSection = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
}));

const FormCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  border: '1px solid rgba(255, 255, 255, 0.08)',
  backgroundColor: '#111113',
  color: 'white',
  boxShadow: 'none',
  overflow: 'hidden',
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  paddingBottom: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  paddingTop: 0,
}));

const CardFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(5),
}));

// Стили для информационного блока
const AlertBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  borderRadius: theme.spacing(1),
  border: '1px solid #ea580c',
  padding: theme.spacing(4),
  paddingLeft: theme.spacing(7),
  backgroundColor: 'rgba(234, 88, 12, 0.05)',
  color: 'white',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: '40px',
  padding: '0 16px',
  backgroundColor: 'white',
  color: 'black',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  }
}));

const SettingsPage = () => {
  const { user: authUser } = useAuth();
  const dispatch = useDispatch();
  const [userDetails, setUserDetails] = useState(null);
  const [linkedAuthor, setLinkedAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Проверяем, является ли пользователь автором
  const isAuthor = userDetails?.rights === 'AUTHOR';
  
  // Константа для заглушки аватара
  const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';
  
  // Поля формы
  const [bio, setBio] = useState('');
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
        
        // Если пользователь - автор, загружаем данные автора
        if (userData.rights === 'AUTHOR') {
          try {
            const authorData = await userApi.getLinkedAuthor(userData.userId || userData.id);
            setLinkedAuthor(authorData);
            // Для авторов используем данные из профиля автора
            setBio(authorData?.bio || '');
            setAvatarUrl(authorData?.avatarUrl || '');
          } catch (error) {
            console.error('Ошибка при получении данных автора:', error);
            setLinkedAuthor(null);
            // Fallback к данным пользователя
            setBio(userData.bio || '');
            setAvatarUrl(userData.avatarUrl || '');
          }
        } else {
          // Для обычных пользователей используем их данные
          setBio(userData.bio || '');
          setAvatarUrl(userData.avatarUrl || '');
        }
        
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
      
      // Проверяем наличие URL в ответе (может быть в разных полях)
      if (response && (response.permanentUrl || response.temporaryUrl || response.url)) {
        // Используем постоянный URL как приоритетный
        const avatarUrl = response.permanentUrl || response.temporaryUrl || response.url;
        setAvatarUrl(avatarUrl);
        
        // Сохраняем в localStorage для синхронизации между компонентами
        localStorage.setItem('user_avatar_url', avatarUrl);
        
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
  
  // Сохранение только аватара
  const handleSaveAvatar = async () => {
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
      
      // Отправляем только данные аватара, сохраняя текущие значения остальных полей
      if (isAuthor) {
        // Для авторов обновляем данные автора
        await authorApi.updateAuthorData(bio, processedAvatarUrl);
      } else {
        // Для обычных пользователей обновляем данные пользователя
        await userApi.updateUserData(bio, processedAvatarUrl);
      }
      
      // Сохраняем аватар в localStorage для синхронизации между компонентами
      if (processedAvatarUrl) {
        localStorage.setItem('user_avatar_url', processedAvatarUrl);
      }
      
      setNotification({
        open: true,
        message: 'Аватар успешно сохранен',
        severity: 'success'
      });
      
      // Обновляем данные пользователя
      const userData = await userApi.getCurrentUser();
      setUserDetails(userData);
      
      // Обновляем данные пользователя в redux для обновления хедера
      if (userData) {
        dispatch(setUser({
          ...authUser,
          avatarUrl: processedAvatarUrl
        }));
      }
    } catch (err) {
      console.error('Ошибка при сохранении аватара:', err);
      setNotification({
        open: true,
        message: 'Не удалось сохранить аватар. Пожалуйста, попробуйте позже.',
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
      
      if (isAuthor) {
        // Для авторов обновляем данные автора
        await authorApi.updateAuthorData(bio, processedAvatarUrl);
      } else {
        // Для обычных пользователей обновляем данные пользователя
        await userApi.updateUserData(bio, processedAvatarUrl);
      }
      
      // Сохраняем аватар в localStorage для синхронизации между компонентами
      if (processedAvatarUrl) {
        localStorage.setItem('user_avatar_url', processedAvatarUrl);
      }
      
      setNotification({
        open: true,
        message: 'Данные профиля успешно обновлены',
        severity: 'success'
      });
      
      // Обновляем данные пользователя
      const userData = await userApi.getCurrentUser();
      setUserDetails(userData);
      
      // Если автор, обновляем его данные
      if (isAuthor) {
        try {
          const authorData = await userApi.getLinkedAuthor(userData.userId || userData.id);
          setLinkedAuthor(authorData);
        } catch (error) {
          console.error('Ошибка при обновлении данных автора:', error);
        }
      }
      
      // Обновляем данные пользователя в redux для обновления хедера
      if (userData) {
        dispatch(setUser({
          ...authUser,
          avatarUrl: processedAvatarUrl,
          bio: bio
        }));
      }
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
    
    // Проверка пароля на соответствие требованиям
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setNotification({
        open: true,
        message: getPasswordErrorMessage(passwordValidation),
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
  
  // Обработчик ошибок загрузки изображений
  const handleImageError = (e) => {
    console.log('Ошибка загрузки аватарки в настройках, использую встроенный placeholder');
    // Прекращаем обработку ошибок для этого элемента
    e.target.onerror = null;
    // Используем встроенный data URI
    e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
  };
  
  if (loading) {
    return (
      <MainContainer>
        <LoadingSpinner 
          text="Загрузка настроек..." 
          className="loading-container--center"
        />
      </MainContainer>
    );
  }
  
  if (error) {
    return (
      <MainContainer>
        <Box sx={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h5" color="error" paragraph>
            {error}
          </Typography>
        </Box>
      </MainContainer>
    );
  }
  
  return (
    <MainContainer>
      <ContentContainer>
        <Typography variant="h3" sx={{ fontWeight: 600, fontSize: '1.5rem', mb: 2, color: 'white' }}>
          Настройки профиля
        </Typography>
      </ContentContainer>
      
      <ContentGrid>
        {/* Навигационное меню */}
        <NavMenu>
          <NavLink to="#" style={{ fontWeight: 600, color: 'white' }}>
            Основные
          </NavLink>
          
          <NavLink 
            to={
              isAuthor && linkedAuthor 
                ? `/author/${linkedAuthor.authorId}` 
                : `/profile/${userDetails?.userId || userDetails?.id || ''}`
            }
          >
            <span style={{ marginRight: '8px' }}>Мой профиль</span>
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </NavLink>
        </NavMenu>
        
        {/* Контент */}
        <ContentSection>
          {/* Уведомление для пользователей */}
          <AlertBox>
            <svg 
              stroke="currentColor" 
              fill="currentColor" 
              strokeWidth="0" 
              viewBox="0 0 512 512" 
              style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '16px', 
                width: '20px', 
                height: '20px',
                fill: '#f97316'
              }} 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M228.9 79.9L51.8 403.1C40.6 423.3 55.5 448 78.9 448h354.3c23.3 0 38.2-24.7 27.1-44.9L283.1 79.9c-11.7-21.2-42.5-21.2-54.2 0zM273.6 214L270 336h-28l-3.6-122h35.2zM256 402.4c-10.7 0-19.1-8.1-19.1-18.4s8.4-18.4 19.1-18.4 19.1 8.1 19.1 18.4-8.4 18.4-19.1 18.4z"></path>
            </svg>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 500, fontSize: '1rem' }}>
              Внимание
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
              Уважаемые пользователи и авторы, при редактировании вашего профиля на нашем сайте, все добавленные вами ссылки, описание профиля, фотографии и баннеры не должны содержать рекламу или нарушать законодательство РФ. Вы несете ответственность за размещение материалов на сайте.
            </Typography>
          </AlertBox>
          
          {/* Форма аватара */}
          <FormCard>
            <CardHeader>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                Аватар
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 0.8)', fontSize: '0.875rem' }}>
                Вы можете сменить свой аватар. После одобрения модерацией он сразу отобразится на сайте.
              </Typography>
            </CardHeader>
            
            <CardContent>
              <Box sx={{ width: '144px', mb: 2 }}>
                <Box sx={{ display: 'flex', width: '100%', mb: 2 }}>
                  <Button
                    component="label"
                    htmlFor="avatar"
                    sx={{
                      height: '40px',
                      backgroundColor: 'white',
                      color: 'black',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      borderRadius: '6px',
                      width: '250px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0 16px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      }
                    }}
                  >
                    <svg 
                      stroke="currentColor" 
                      fill="currentColor" 
                      strokeWidth="0" 
                      viewBox="0 0 512 512"
                      style={{ width: '16px', height: '16px', marginRight: '8px' }}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M464 448H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h416c26.51 0 48 21.49 48 48v288c0 26.51-21.49 48-48 48zM112 120c-30.928 0-56 25.072-56 56s25.072 56 56 56 56-25.072 56-56-25.072-56-56-56zM64 384h384V272l-87.515-87.515c-4.686-4.686-12.284-4.686-16.971 0L208 320l-55.515-55.515c-4.686-4.686-12.284-4.686-16.971 0L64 336v48z"></path>
                    </svg>
                    <span>Выберите изображение</span>
                    <input
                      type="file"
                      hidden
                      id="avatar"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleAvatarSelect}
                    />
                  </Button>
                </Box>
                
                <Box sx={{ mt: 2, mb: 2, width: '100%', position: 'relative' }}>
                  <Box 
                    sx={{ 
                      position: 'relative',
                      width: '144px',
                      height: '144px',
                      borderRadius: '50%',
                      overflow: 'hidden'
                    }}
                  >
                    <Avatar
                      src={previewAvatar || avatarUrl || DEFAULT_AVATAR_PLACEHOLDER}
                      alt={userDetails?.username}
                      onError={handleImageError}
                      sx={{ 
                        position: 'absolute',
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
            
            <CardFooter>
              <StyledButton
                onClick={handleSaveAvatar}
                disabled={saving}
                sx={{ width: '200px' }}
              >
                {saving ? 'Сохранение...' : 'Сохранить аватар'}
              </StyledButton>
            </CardFooter>
          </FormCard>
          
          {/* Форма данных профиля */}
          <FormCard>
            <CardHeader>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                Данные профиля
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 0.8)', fontSize: '0.875rem' }}>
                Вы можете обновить свою биографию и данные для связи.
              </Typography>
            </CardHeader>
            
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'grid', gap: 3 }}>
                  <Box>
                    <Typography component="label" htmlFor="email" sx={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', mb: 1 }}>
                      Email
                    </Typography>
                    <TextField
                      id="email"
                      value={userDetails?.email || ''}
                      disabled
                      fullWidth
                      placeholder="rztuser@mail.com"
                      variant="outlined"
                      InputProps={{
                        sx: {
                          backgroundColor: 'rgba(161, 161, 170, 0.1)',
                          color: 'rgba(161, 161, 170, 0.8)',
                          height: '40px',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.2)'
                          }
                        }
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography component="label" htmlFor="nickname" sx={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', mb: 1 }}>
                      Никнейм
                    </Typography>
                    <TextField
                      id="nickname"
                      value={userDetails?.username || ''}
                      disabled
                      fullWidth
                      placeholder="Введите ваш никнейм"
                      variant="outlined"
                      InputProps={{
                        sx: {
                          backgroundColor: 'rgba(161, 161, 170, 0.1)',
                          color: 'rgba(161, 161, 170, 0.8)',
                          height: '40px',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.2)'
                          }
                        }
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography component="label" htmlFor="description" sx={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', mb: 1 }}>
                      Биография
                    </Typography>
                    <TextField
                      id="description"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Расскажите о себе"
                      variant="outlined"
                      InputProps={{
                        sx: {
                          backgroundColor: 'transparent',
                          color: 'white',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.2)'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.3)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.5)'
                          }
                        }
                      }}
                    />
                  </Box>
                  

                </Box>
              </Box>
            </CardContent>
            
            <CardFooter>
              <StyledButton
                onClick={handleSaveProfile}
                disabled={saving}
                sx={{ width: '200px' }}
              >
                {saving ? 'Сохранение...' : 'Сохранить профиль'}
              </StyledButton>
            </CardFooter>
          </FormCard>
          
          {/* Форма смены пароля */}
          <FormCard>
            <CardHeader>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                Смена пароля
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(161, 161, 170, 0.8)', fontSize: '0.875rem' }}>
                Создайте новый пароль для вашего аккаунта.
              </Typography>
            </CardHeader>
            
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'grid', gap: 3 }}>
                  <Box>
                    <Typography component="label" htmlFor="current-password" sx={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', mb: 1 }}>
                      Текущий пароль
                    </Typography>
                    <TextField
                      id="current-password"
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
                        sx: {
                          backgroundColor: 'transparent',
                          color: 'white',
                          height: '40px',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.2)'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.3)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.5)'
                          }
                        }
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography component="label" htmlFor="new-password" sx={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', mb: 1 }}>
                      Новый пароль
                    </Typography>
                    <TextField
                      id="new-password"
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
                        sx: {
                          backgroundColor: 'transparent',
                          color: 'white',
                          height: '40px',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.2)'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.3)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.5)'
                          }
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'rgba(161, 161, 170, 0.8)', mt: 0.5, display: 'block' }}>
                      Пароль должен содержать минимум 8 символов, включать заглавные и строчные буквы, а также цифры.
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography component="label" htmlFor="confirm-password" sx={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', mb: 1 }}>
                      Подтверждение нового пароля
                    </Typography>
                    <TextField
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        sx: {
                          backgroundColor: 'transparent',
                          color: 'white',
                          height: '40px',
                          borderRadius: '6px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.2)'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.3)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(161, 161, 170, 0.5)'
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
            
            <CardFooter>
              <StyledButton
                onClick={handleChangePassword}
                disabled={saving || !oldPassword || !newPassword || !confirmPassword}
                sx={{ width: '200px' }}
              >
                {saving ? 'Сохранение...' : 'Изменить пароль'}
              </StyledButton>
            </CardFooter>
          </FormCard>
        </ContentSection>
      </ContentGrid>
      
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
    </MainContainer>
  );
};

export default SettingsPage; 