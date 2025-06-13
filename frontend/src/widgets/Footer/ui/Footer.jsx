import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { ROUTES } from '../../../shared/config/routes';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.infoContainer}>
            <div className={styles.copyright}>«MusicUnity» © 2025</div>
            <div className={styles.linksContainer}>
              <Link className={styles.link} to={ROUTES.CONTACT}>Обратная связь</Link>
              <Link className={styles.link} to={ROUTES.PRIVACY_POLICY}>Политика обработки персональных данных</Link>
              <Link className={styles.link} to={ROUTES.USER_AGREEMENT}>Пользовательское соглашение</Link>
            </div>
            <div className={styles.contactInfo}>
              <div>
                Техническая поддержка: <a href="mailto:musciunity@mail.ru" className={styles.link}>musciunity@mail.ru</a>
              </div>
              <div>
                Предложения о сотрудничестве: <a href="mailto:musciunity@mail.ru" className={styles.link}>musciunity@mail.ru</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}; 