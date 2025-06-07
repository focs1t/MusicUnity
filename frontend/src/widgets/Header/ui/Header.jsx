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
import styles from './Header.module.css';

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
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.content}>
            <a className={styles.logo} href="/">
              <img 
                alt="Риса за Творчество логотип" 
                width="200" 
                height="100" 
                decoding="async" 
                data-nimg="1" 
                className={styles.logoImage} 
                style={{ color: 'transparent' }} 
                src="/риса за творчество логотип.svg" 
              />
            </a>
            <div className={styles.searchContainer}>
              <form className={styles.searchForm}>
                <label htmlFor="search" className={styles.srOnly}>Search</label>
                <button 
                  className={styles.searchButton} 
                  type="submit"
                >
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className={styles.searchIcon} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M337.509 305.372h-17.501l-6.571-5.486c20.791-25.232 33.922-57.054 33.922-93.257C347.358 127.632 283.896 64 205.135 64 127.452 64 64 127.632 64 206.629s63.452 142.628 142.225 142.628c35.011 0 67.831-13.167 92.991-34.008l6.561 5.487v17.551L415.18 448 448 415.086 337.509 305.372zm-131.284 0c-54.702 0-98.463-43.887-98.463-98.743 0-54.858 43.761-98.742 98.463-98.742 54.7 0 98.462 43.884 98.462 98.742 0 54.856-43.762 98.743-98.462 98.743z"></path>
                  </svg>
                </button>
                <button 
                  type="button" 
                  role="combobox" 
                  aria-controls="radix-:Rqakq:" 
                  aria-expanded="false" 
                  aria-autocomplete="none" 
                  dir="ltr" 
                  data-state="closed" 
                  data-placeholder="" 
                  className={styles.searchButton}
                >
                  <span style={{ pointerEvents: 'none' }}>
                    <div>
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 7v10"></path>
                        <path d="M6 5v14"></path>
                        <rect width="12" height="18" x="10" y="3" rx="2"></rect>
                      </svg> 
                      <span className={styles.searchText}>Авторы и релизы</span>
                    </div>
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.chevronIcon} aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </button>
                <select aria-hidden="true" tabIndex="-1" style={{ position: 'absolute', border: '0px', width: '1px', height: '1px', padding: '0px', margin: '-1px', overflow: 'hidden', clip: 'rect(0px, 0px, 0px, 0px)', whiteSpace: 'nowrap', overflowWrap: 'normal' }}>
                  <option value=""></option>
                  <option value="releases"> Авторы и релизы</option>
                  <option value="users"> Пользователи</option>
                </select>
                <input 
                  className={styles.searchInput} 
                  placeholder="Поиск..." 
                  value=""
                />
              </form>
            </div>
            <div className={styles.authContainer}>
              {renderAuthButtons()}
            </div>
          </div>
        </div>
      </header>

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