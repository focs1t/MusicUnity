import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar, 
  InputBase, 
  Container,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { useTheme, styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../../app/providers/AuthProvider';
import { LoginModal, RegisterModal, ForgotPasswordModal, ResetPasswordModal } from '../../AuthModal';
import { userApi } from '../../../shared/api/user';

// Стилизация поля поиска
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.08),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.12),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  maxWidth: '300px',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

// Стилизованный логотип
const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: theme.palette.common.white,
  '& img': {
    height: 45,
    marginRight: theme.spacing(1)
  }
}));

// Стилизованная кнопка навигации
const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: 500,
  fontSize: '1rem',
  textTransform: 'none',
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  }
}));

export const Header = () => {
  const { isAuth, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Состояние для мобильного меню
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Состояния для модальных окон
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetToken, setResetToken] = useState('');
  
  // Состояние для скрытия шапки при скролле
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  // Проверка состояния авторизации и загрузка данных пользователя
  useEffect(() => {
    console.log('Header mounted, isAuth:', isAuth, 'user:', user);
    if (user) {
      console.log('User object from token:', JSON.stringify(user, null, 2));
      
      // Если пользователь авторизован, запрашиваем полные данные с сервера
      const fetchUserDetails = async () => {
        try {
          const userData = await userApi.getCurrentUser();
          console.log('Fetched user details:', userData);
          setUserDetails(userData);
        } catch (error) {
          console.error('Ошибка при получении данных пользователя:', error);
        }
      };
      
      fetchUserDetails();
    }
  }, [isAuth, user]);

  // Проверка токена в URL при монтировании компонента
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    
    if (token) {
      // Если в URL есть токен для сброса пароля, открываем модальное окно
      setResetToken(token);
      setResetPasswordModalOpen(true);
      
      // Удаляем токен из URL, чтобы избежать повторного открытия окна
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Обработка скролла для скрытия/показа шапки
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      setVisible(
        (prevScrollPos > currentScrollPos) || 
        currentScrollPos < 10
      );
      
      setPrevScrollPos(currentScrollPos);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos, visible]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Обработчики мобильного меню
  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };
  
  // Обработчики модальных окон
  const handleOpenLoginModal = () => {
    setLoginModalOpen(true);
    setMobileMenuOpen(false);
    setRegisterModalOpen(false);
    setForgotPasswordModalOpen(false);
  };
  
  const handleCloseLoginModal = () => {
    setLoginModalOpen(false);
  };
  
  const handleOpenRegisterModal = () => {
    setRegisterModalOpen(true);
    setMobileMenuOpen(false);
    setLoginModalOpen(false);
    setForgotPasswordModalOpen(false);
  };
  
  const handleCloseRegisterModal = () => {
    setRegisterModalOpen(false);
  };
  
  // FIXME: Эта функция не используется напрямую, но должна быть вызвана при получении
  // ссылки восстановления пароля по email
  /* eslint-disable no-unused-vars */
  const handleOpenForgotPasswordModal = () => {
    setForgotPasswordModalOpen(true);
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
  };
  /* eslint-enable no-unused-vars */
  
  const handleCloseForgotPasswordModal = () => {
    setForgotPasswordModalOpen(false);
  };
  
  const handleSwitchToRegister = () => {
    setLoginModalOpen(false);
    setForgotPasswordModalOpen(false);
    setRegisterModalOpen(true);
  };
  
  const handleSwitchToLogin = () => {
    setRegisterModalOpen(false);
    setForgotPasswordModalOpen(false);
    setLoginModalOpen(true);
  };

  const handleSwitchToForgotPassword = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
    setForgotPasswordModalOpen(true);
  };
  
  // FIXME: Эта функция не используется напрямую, но должна быть вызвана 
  // при получении токена сброса пароля из URL или другого источника
  /* eslint-disable no-unused-vars */
  const handleOpenResetPasswordModal = (token) => {
    setResetToken(token);
    setResetPasswordModalOpen(true);
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
    setForgotPasswordModalOpen(false);
  };
  /* eslint-enable no-unused-vars */
  
  const handleCloseResetPasswordModal = () => {
    setResetPasswordModalOpen(false);
    setResetToken('');
  };
  
  const handleLogout = () => {
    console.log('Выполняем выход из системы...');
    // Очищаем storage напрямую перед вызовом logout
    localStorage.clear();
    sessionStorage.clear();
    
    // Устанавливаем флаг выхода
    localStorage.setItem('logged_out', 'true');
    sessionStorage.setItem('logged_out', 'true');
    
    // Очищаем куки
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Только после этого вызываем logout через AuthContext
    logout();
    
    // Закрываем все меню
    handleClose();
    setMobileMenuOpen(false);
    
    // Добавляем задержку перед переходом на главную, чтобы успели отработать все изменения
    setTimeout(() => {
      window.location.replace('/');
    }, 100);
  };

  // Получаем имя пользователя для отображения в меню
  const getUserDisplayName = () => {
    if (userDetails?.username) return userDetails.username;
    if (!user) return 'Пользователь';
    return user.username || user.sub || 'Пользователь';
  };

  // Получаем аватарку пользователя для отображения
  const getUserAvatar = () => {
    // Сначала проверяем детальные данные с сервера
    if (userDetails?.avatarUrl) return userDetails.avatarUrl;
    
    // Затем проверяем данные из JWT токена
    if (!user) return '';
    return user.avatarUrl || user.avatar || user.picture || '';
  };

  // Отображение компонентов в зависимости от статуса авторизации
  const renderAuthButtons = () => {
    if (isAuth) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleMenu}
            color="inherit"
            sx={{ ml: 2 }}
            aria-controls="menu-appbar"
            aria-haspopup="true"
          >
            <Avatar
              alt={getUserDisplayName()}
              src={getUserAvatar()}
              sx={{ 
                bgcolor: '#333',
                width: 40,
                height: 40,
                border: '2px solid rgba(255,255,255,0.1)'
              }}
            />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 220,
                bgcolor: '#000000',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.2,
                  fontSize: '0.9rem',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                  }
                },
                '& .MuiDivider-root': {
                  my: 0.5
                },
                '& .MuiTypography-root': {
                  fontSize: '0.9rem'
                },
                '& .MuiListItemIcon-root': {
                  minWidth: 40
                }
              }
            }}
          >
            <Box sx={{ 
              px: 2, 
              py: 1.2, 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              mb: 0.5
            }}>
              <Typography variant="body1" fontWeight="medium" fontSize="0.9rem">
                {getUserDisplayName()}
              </Typography>
            </Box>
            
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              <ListItemText>Моя страница</ListItemText>
              <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end' }}>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
            </MenuItem>
            
            <MenuItem onClick={() => { handleClose(); navigate('/profile/liked'); }}>
              <ListItemText>Мне понравилось</ListItemText>
              <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end' }}>
                <FavoriteIcon fontSize="small" />
              </ListItemIcon>
            </MenuItem>
            
            <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
              <ListItemText>Настройки профиля</ListItemText>
              <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end' }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
            </MenuItem>
            
            <MenuItem onClick={() => { handleClose(); navigate('/following-releases'); }}>
              <ListItemText>Релизы авторов</ListItemText>
              <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end' }}>
                <NotificationsIcon fontSize="small" />
              </ListItemIcon>
            </MenuItem>
            
            <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', mt: 0.75, mb: 0.75 }}>
              <MenuItem onClick={handleLogout}>
                <ListItemText>Выйти из профиля</ListItemText>
                <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
              </MenuItem>
            </Box>
          </Menu>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <NavButton 
            onClick={handleOpenLoginModal}
            variant="text"
          >
            Войти
          </NavButton>
          <NavButton 
            onClick={handleOpenRegisterModal}
            variant="contained"
            sx={{
              ml: 1,
              bgcolor: '#333',
              '&:hover': {
                bgcolor: '#444',
              }
            }}
          >
            Регистрация
          </NavButton>
        </Box>
      );
    }
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          transition: 'transform 0.3s ease',
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 70 }}>
            {/* Мобильная версия - меню и логотип */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleMobileMenuOpen}
                edge="start"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Логотип */}
            <Logo
              component={Link}
              to="/"
              sx={{ 
                mr: 2,
                display: 'flex',
                flexGrow: isMobile ? 1 : 0
              }}
            >
              <img src="/logo.png" alt="MusicUnity" />
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontWeight: 700,
                  letterSpacing: '.1rem',
                  textDecoration: 'none',
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                MusicUnity
              </Typography>
            </Logo>

            {/* Навигация - десктоп */}
            {!isMobile && (
              <Box sx={{ display: 'flex', flexGrow: 1 }}>
                <NavButton component={Link} to="/releases">
                  Релизы
                </NavButton>
                <NavButton component={Link} to="/authors">
                  Исполнители
                </NavButton>
                <NavButton component={Link} to="/genres">
                  Жанры
                </NavButton>
                <NavButton component={Link} to="/about">
                  О нас
                </NavButton>
              </Box>
            )}
            
            {/* Поиск */}
            <Search sx={{ 
              flexGrow: 0, 
              display: { xs: 'none', md: 'flex' },
              marginLeft: 'auto',
              marginRight: 2
            }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Поиск музыки..."
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
            
            {/* Поиск для мобильных - иконка */}
            {isMobile && (
              <IconButton color="inherit" sx={{ ml: 'auto', mr: 1 }}>
                <SearchIcon />
              </IconButton>
            )}

            {/* Авторизация/Профиль */}
            {renderAuthButtons()}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Пустое пространство под фиксированную шапку */}
      <Toolbar sx={{ height: 70 }} />
      
      {/* Мобильное меню */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: {
            width: '85%',
            maxWidth: 300,
            backgroundColor: '#000000',
            color: 'white'
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2
          }}
        >
          <Logo component={Link} to="/" onClick={handleMobileMenuClose}>
            <img src="/logo.png" alt="MusicUnity" style={{ height: 40 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              MusicUnity
            </Typography>
          </Logo>
          <IconButton color="inherit" onClick={handleMobileMenuClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        {isAuth && (
          <>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {getUserDisplayName()}
              </Typography>
              {(userDetails?.email || user?.email) && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                  {userDetails?.email || user?.email}
                </Typography>
              )}
            </Box>
          </>
        )}
        
        <List sx={{ pt: 0 }}>
          <ListItem button component={Link} to="/releases" onClick={handleMobileMenuClose} sx={{ py: 1.2 }}>
            <ListItemText primary="Релизы" primaryTypographyProps={{ sx: { fontSize: '0.9rem' } }} />
            <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end', minWidth: 40 }}>
              <MusicNoteIcon fontSize="small" />
            </ListItemIcon>
          </ListItem>
          <ListItem button component={Link} to="/authors" onClick={handleMobileMenuClose} sx={{ py: 1.2 }}>
            <ListItemText primary="Исполнители" primaryTypographyProps={{ sx: { fontSize: '0.9rem' } }} />
            <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end', minWidth: 40 }}>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
          </ListItem>
          <ListItem button component={Link} to="/genres" onClick={handleMobileMenuClose} sx={{ py: 1.2 }}>
            <ListItemText primary="Жанры" primaryTypographyProps={{ sx: { fontSize: '0.9rem' } }} />
            <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end', minWidth: 40 }}>
              <MusicNoteIcon fontSize="small" />
            </ListItemIcon>
          </ListItem>
          <ListItem button component={Link} to="/about" onClick={handleMobileMenuClose} sx={{ py: 1.2 }}>
            <ListItemText primary="О нас" primaryTypographyProps={{ sx: { fontSize: '0.9rem' } }} />
            <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end', minWidth: 40 }}>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
          </ListItem>
        </List>
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        
        {isAuth ? (
          <List>
            <ListItem button component={Link} to="/profile" onClick={handleMobileMenuClose} sx={{ py: 1.2 }}>
              <ListItemText primary="Моя страница" primaryTypographyProps={{ sx: { fontSize: '0.9rem' } }} />
              <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end', minWidth: 40 }}>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
            </ListItem>
            <ListItem button component={Link} to="/profile/liked" onClick={handleMobileMenuClose} sx={{ py: 1.2 }}>
              <ListItemText primary="Мне понравилось" primaryTypographyProps={{ sx: { fontSize: '0.9rem' } }} />
              <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end', minWidth: 40 }}>
                <FavoriteIcon fontSize="small" />
              </ListItemIcon>
            </ListItem>
            <ListItem button component={Link} to="/settings" onClick={handleMobileMenuClose} sx={{ py: 1.2 }}>
              <ListItemText primary="Настройки профиля" primaryTypographyProps={{ sx: { fontSize: '0.9rem' } }} />
              <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end', minWidth: 40 }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
            </ListItem>
            <ListItem button component={Link} to="/following-releases" onClick={handleMobileMenuClose} sx={{ py: 1.2 }}>
              <ListItemText primary="Релизы авторов" primaryTypographyProps={{ sx: { fontSize: '0.9rem' } }} />
              <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end', minWidth: 40 }}>
                <NotificationsIcon fontSize="small" />
              </ListItemIcon>
            </ListItem>
            <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', mt: 0.75, mb: 0.75 }}>
              <ListItem button onClick={handleLogout} sx={{ py: 1.2 }}>
                <ListItemText primary="Выйти из профиля" primaryTypographyProps={{ sx: { fontSize: '0.9rem' } }} />
                <ListItemIcon sx={{ color: 'white', justifyContent: 'flex-end', minWidth: 40 }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
              </ListItem>
            </Box>
          </List>
        ) : (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              onClick={handleOpenRegisterModal}
              sx={{ 
                py: 1, 
                mb: 1.5, 
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Регистрация
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              color="primary" 
              onClick={handleOpenLoginModal}
              sx={{ 
                py: 1, 
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Войти
            </Button>
          </Box>
        )}
      </Drawer>
      
      {/* Модальные окна авторизации и регистрации */}
      <LoginModal 
        open={loginModalOpen} 
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />
      
      <RegisterModal 
        open={registerModalOpen} 
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
      />
      
      <ForgotPasswordModal
        open={forgotPasswordModalOpen}
        onClose={handleCloseForgotPasswordModal}
        onSwitchToLogin={handleSwitchToLogin}
      />
      
      <ResetPasswordModal 
        open={resetPasswordModalOpen} 
        onClose={handleCloseResetPasswordModal}
        token={resetToken}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
}; 