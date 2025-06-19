import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import styles from './BottomNavigation.module.css';

// Иконки
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import AlbumIcon from '@mui/icons-material/Album';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      icon: <HomeIcon />,
      label: 'Главная',
      path: ROUTES.HOME,
    },
    {
      icon: <PeopleIcon />,
      label: 'Авторы',
      path: ROUTES.AUTHORS,
    },
    {
      icon: <AlbumIcon />,
      label: 'Релизы',
      path: ROUTES.RELEASES,
    },
    {
      icon: <RateReviewIcon />,
      label: 'Рецензии',
      path: ROUTES.REVIEWS,
    },
    {
      icon: <EmojiEventsIcon />,
      label: 'ТОП-100',
      path: ROUTES.TOP_100,
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {navigationItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(item.path)}
            className={`${styles.navItem} ${
              location.pathname === item.path ? styles.active : ''
            }`}
            aria-label={item.label}
          >
            <div className={styles.iconWrapper}>
              {item.icon}
            </div>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}; 