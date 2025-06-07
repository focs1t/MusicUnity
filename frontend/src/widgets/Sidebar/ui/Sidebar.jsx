import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import styles from './Sidebar.module.css';

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

export const Sidebar = () => {
  const navigate = useNavigate();

  // Структура навигации
  const navigationGroups = [
    {
      items: [
        { icon: <HomeIcon />, text: 'Главная', path: ROUTES.HOME },
        { icon: <HelpIcon />, text: 'Часто задаваемые вопросы', path: ROUTES.FAQ },
        { icon: <InfoIcon />, text: 'О нас', path: ROUTES.ABOUT },
      ]
    },
    {
      items: [
        { icon: <EmojiEventsIcon />, text: 'ТОП-100 пользователей', path: ROUTES.TOP_100 },
        { icon: <BarChartIcon />, text: 'Рейтинг', path: ROUTES.RATING },
      ]
    },
    {
      items: [
        { icon: <ThumbUpIcon />, text: 'Авторские лайки', path: ROUTES.AUTHOR_LIKES },
        { icon: <VerifiedUserIcon />, text: 'Зарегистрированные авторы', path: ROUTES.AUTHORS_VERIFIED },
        { icon: <PeopleIcon />, text: 'Авторы', path: ROUTES.AUTHORS },
        { icon: <RateReviewIcon />, text: 'Рецензии', path: ROUTES.REVIEWS },
        { icon: <AlbumIcon />, text: 'Релизы', path: ROUTES.RELEASES },
      ]
    },
    {
      items: [
        { icon: <EditIcon />, text: 'Обратная связь', path: ROUTES.CONTACT },
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside className={styles.sidebar}>
      {navigationGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          <nav className={styles.navGroup}>
            {group.items.map((item, itemIndex) => (
              <div 
                key={itemIndex} 
                onClick={() => handleNavigation(item.path)} 
                className={styles.navLink}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNavigation(item.path);
                  }
                }}
              >
                <span className={styles.iconWrapper}>
                  {item.icon}
                </span>
                <span className={styles.textWrapper}>
                  {item.text}
                </span>
              </div>
            ))}
          </nav>
          {groupIndex < navigationGroups.length - 1 && <div className={styles.divider} />}
        </React.Fragment>
      ))}
    </aside>
  );
}; 