import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { useAuth } from '../../../app/providers/AuthProvider';
import { userApi } from '../../../shared/api/user';
import styles from './MobileNavigation.module.css';

// Импортируем все необходимые иконки из Material-UI
import HomeIcon from '@mui/icons-material/Home';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BarChartIcon from '@mui/icons-material/BarChart';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AlbumIcon from '@mui/icons-material/Album';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ReportIcon from '@mui/icons-material/Report';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

export const MobileNavigation = ({ 
  onLoginOpen, 
  onRegisterOpen, 
  onMobileMenuClose 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuth, user, logout } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Загружаем полные данные пользователя если он авторизован
  useEffect(() => {
    if (isAuth && user) {
      const fetchUserDetails = async () => {
        try {
          const userData = await userApi.getCurrentUser();
          setUserDetails(userData);
        } catch (error) {
          console.error('MobileNav: Ошибка при получении данных пользователя:', error);
        }
      };
      
      fetchUserDetails();
    } else {
      setUserDetails(null);
    }
  }, [isAuth, user]);

  // Закрываем меню при изменении маршрута
  useEffect(() => {
    setIsOpen(false);
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  }, [location.pathname, onMobileMenuClose]);

  // Основная структура навигации
  const navigationGroups = [
    {
      title: 'Основное',
      items: [
        { icon: <HomeIcon />, text: 'Главная', path: ROUTES.HOME },
        { icon: <HelpIcon />, text: 'FAQ', path: ROUTES.FAQ },
        { icon: <InfoIcon />, text: 'О нас', path: ROUTES.ABOUT },
      ]
    },
    {
      title: 'Рейтинги',
      items: [
        { icon: <EmojiEventsIcon />, text: 'ТОП-100', path: ROUTES.TOP_100 },
        { icon: <BarChartIcon />, text: 'Рейтинг', path: ROUTES.RATING },
      ]
    },
    {
      title: 'Контент',
      items: [
        { icon: <ThumbUpIcon />, text: 'Авторские лайки', path: ROUTES.AUTHOR_LIKES },
        { icon: <VerifiedUserIcon />, text: 'Верифицированные авторы', path: ROUTES.AUTHORS_VERIFIED },
        { icon: <PeopleIcon />, text: 'Авторы', path: ROUTES.AUTHORS },
        { icon: <RateReviewIcon />, text: 'Рецензии', path: ROUTES.REVIEWS },
        { icon: <AlbumIcon />, text: 'Релизы', path: ROUTES.RELEASES },
      ]
    }
  ];

  // Раздел для модераторов
  const moderatorGroup = {
    title: 'Модерация',
    items: [
      { icon: <AddIcon />, text: 'Создать релиз', path: ROUTES.MODERATOR_CREATE_RELEASE },
      { icon: <ReportIcon />, text: 'Жалобы', path: ROUTES.MODERATOR_REPORTS },
    ]
  };

  // Контактный раздел
  const contactGroup = {
    title: 'Связь',
    items: [
      { icon: <EditIcon />, text: 'Обратная связь', path: ROUTES.CONTACT },
    ]
  };

  const handleNavigation = (path) => {
    // Для маршрутов модератора проверяем права пользователя
    if (path === ROUTES.MODERATOR_REPORTS || path === ROUTES.MODERATOR_CREATE_RELEASE) {
      if (!user) {
        localStorage.setItem('redirectAfterAuth', path);
        alert('Для доступа к этой странице необходимо авторизоваться');
        navigate(ROUTES.HOME);
        return;
      }

      if (!userDetails || userDetails.rights !== 'MODERATOR') {
        if (!userDetails) {
          console.log("MobileNav: Ожидаем загрузку данных пользователя...");
        } else {
          alert('У вас нет прав для доступа к этой странице');
          navigate(ROUTES.HOME);
          return;
        }
      }
    }

    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate(ROUTES.HOME);
  };

  const handleAuthAction = (action) => {
    setIsOpen(false);
    if (action === 'login' && onLoginOpen) {
      onLoginOpen();
    } else if (action === 'register' && onRegisterOpen) {
      onRegisterOpen();
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Кнопка открытия меню */}
      <button 
        className={styles.menuButton}
        onClick={toggleMenu}
        aria-label="Открыть меню"
      >
        <MenuIcon />
      </button>

      {/* Оверлей */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Выдвижное меню */}
      <nav className={`${styles.mobileNav} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Навигация</h2>
            <button 
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть меню"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Профиль пользователя */}
          {isAuth && user && (
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {userDetails?.avatarUrl ? (
                    <img 
                      src={userDetails.avatarUrl} 
                      alt={userDetails.username || 'Avatar'}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={styles.avatarPlaceholder}>
                    <AccountCircleIcon />
                  </div>
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>
                    {userDetails?.username || user?.username || 'Пользователь'}
                  </div>
                  <div className={styles.userRole}>
                    {userDetails?.rights === 'MODERATOR' ? 'Модератор' : 'Пользователь'}
                  </div>
                </div>
              </div>
              
              <div className={styles.userActions}>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleNavigation('/profile')}
                >
                  <AccountCircleIcon />
                  <span>Профиль</span>
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleNavigation('/settings')}
                >
                  <SettingsIcon />
                  <span>Настройки</span>
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={handleLogout}
                >
                  <LogoutIcon />
                  <span>Выйти</span>
                </button>
              </div>
              <div className={styles.divider} />
            </div>
          )}

          {/* Блок авторизации для неавторизованных */}
          {!isAuth && (
            <div className={styles.authSection}>
              <button 
                className={styles.authButton}
                onClick={() => handleAuthAction('login')}
              >
                <LoginIcon />
                <span>Войти</span>
              </button>
              <button 
                className={styles.authButton}
                onClick={() => handleAuthAction('register')}
              >
                <AccountCircleIcon />
                <span>Регистрация</span>
              </button>
              <div className={styles.divider} />
            </div>
          )}

          {/* Основные разделы навигации */}
          {navigationGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={styles.navGroup}>
              <div className={styles.groupTitle}>{group.title}</div>
              {group.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleNavigation(item.path)}
                  className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
                >
                  <span className={styles.iconWrapper}>
                    {item.icon}
                  </span>
                  <span className={styles.textWrapper}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          ))}

          {/* Раздел модерации (только для модераторов) */}
          {userDetails && userDetails.rights === 'MODERATOR' && (
            <div className={styles.navGroup}>
              <div className={styles.groupTitle}>{moderatorGroup.title}</div>
              {moderatorGroup.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleNavigation(item.path)}
                  className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
                >
                  <span className={styles.iconWrapper}>
                    {item.icon}
                  </span>
                  <span className={styles.textWrapper}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Контактный раздел */}
          <div className={styles.navGroup}>
            <div className={styles.groupTitle}>{contactGroup.title}</div>
            {contactGroup.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={() => handleNavigation(item.path)}
                className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
              >
                <span className={styles.iconWrapper}>
                  {item.icon}
                </span>
                <span className={styles.textWrapper}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}; 