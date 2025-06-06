import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import styles from './Sidebar.module.css';

// Импортируем все необходимые иконки из Material-UI
import HomeIcon from '@mui/icons-material/Home';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DiamondIcon from '@mui/icons-material/Diamond';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AlbumIcon from '@mui/icons-material/Album';
import EditIcon from '@mui/icons-material/Edit';

export const Sidebar = () => {
  // Структура навигации
  const navigationGroups = [
    {
      items: [
        { icon: <HomeIcon />, text: 'Главная', path: ROUTES.HOME },
        { icon: <NewspaperIcon />, text: 'Новости', path: ROUTES.NEWS },
        { icon: <HelpIcon />, text: 'Часто задаваемые вопросы', path: ROUTES.FAQ },
        { icon: <InfoIcon />, text: 'О нас', path: ROUTES.ABOUT },
      ]
    },
    {
      items: [
        { icon: <EmojiEventsIcon />, text: 'ТОП-90 пользователей', path: ROUTES.TOP_90 },
        { icon: <DiamondIcon />, text: 'Ценность альбомов', path: ROUTES.ALBUM_VALUE },
        { icon: <BarChartIcon />, text: 'Рейтинг', path: ROUTES.RATING },
        { icon: <StarIcon />, text: 'Премия РЗТ', path: ROUTES.RZT_AWARDS },
        { icon: <LocalFireDepartmentIcon />, text: 'Фрешмены', path: ROUTES.FRESHMEN },
        { icon: <QueueMusicIcon />, text: 'Плейлисты', path: ROUTES.PLAYLISTS },
      ]
    },
    {
      items: [
        { icon: <ThumbUpIcon />, text: 'Авторские лайки', path: ROUTES.AUTHOR_LIKES },
        { icon: <CommentIcon />, text: 'Авторские комментарии', path: ROUTES.AUTHOR_COMMENTS },
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

  return (
    <aside className={styles.sidebar}>
      {navigationGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          <nav className={styles.navGroup}>
            {group.items.map((item, itemIndex) => (
              <Link 
                key={itemIndex} 
                to={item.path} 
                className={styles.navLink}
              >
                <span className={styles.iconWrapper}>
                  {item.icon}
                </span>
                <span className={styles.textWrapper}>
                  {item.text}
                </span>
              </Link>
            ))}
          </nav>
          {groupIndex < navigationGroups.length - 1 && <div className={styles.divider} />}
        </React.Fragment>
      ))}
    </aside>
  );
}; 