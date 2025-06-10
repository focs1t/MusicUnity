import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { useAuth } from '../../../app/providers/AuthProvider';
import { userApi } from '../../../shared/api/user';
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
import AddIcon from '@mui/icons-material/Add';
import ReportIcon from '@mui/icons-material/Report';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { isAuth, user } = useAuth();
  const [userDetails, setUserDetails] = useState(null);

  // Загружаем полные данные пользователя если он авторизован
  useEffect(() => {
    if (isAuth && user) {
      const fetchUserDetails = async () => {
        try {
          const userData = await userApi.getCurrentUser();
          console.log('Sidebar: Fetched user details:', userData);
          setUserDetails(userData);
        } catch (error) {
          console.error('Sidebar: Ошибка при получении данных пользователя:', error);
        }
      };
      
      fetchUserDetails();
    } else {
      setUserDetails(null);
    }
  }, [isAuth, user]);

  // Основная структура навигации
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
    }
  ];

  // Раздел для модераторов (отображается только для модераторов)
  const moderatorGroup = {
    title: 'Модерация',
    items: [
      { icon: <AddIcon />, text: 'Создать релиз', path: ROUTES.MODERATOR_CREATE_RELEASE },
      { icon: <ReportIcon />, text: 'Жалобы', path: ROUTES.MODERATOR_REPORTS },
    ]
  };

  // Контактный раздел
  const contactGroup = {
    items: [
      { icon: <EditIcon />, text: 'Обратная связь', path: ROUTES.CONTACT },
    ]
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Отладочная информация
  console.log('Sidebar render:', { 
    isAuth, 
    user, 
    userDetails, 
    userRights: userDetails?.rights,
    isModerator: userDetails?.rights === 'MODERATOR' 
  });

  return (
    <aside className={styles.sidebar}>
      {/* Основные разделы навигации */}
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
          <div className={styles.divider} />
        </React.Fragment>
      ))}

      {/* Раздел модерации (только для модераторов) */}
      {userDetails && userDetails.rights === 'MODERATOR' && (
        <React.Fragment>
          <nav className={styles.navGroup}>
            {moderatorGroup.items.map((item, itemIndex) => (
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
          <div className={styles.divider} />
        </React.Fragment>
      )}

      {/* Контактный раздел */}
      <nav className={styles.navGroup}>
        {contactGroup.items.map((item, itemIndex) => (
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
    </aside>
  );
}; 