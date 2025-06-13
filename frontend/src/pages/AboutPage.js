import React, { useState } from 'react';
import './AboutPage.css';
import RegisterModal from '../widgets/AuthModal/ui/RegisterModal';

const AboutPage = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const handleOpenRegisterModal = () => {
    setRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setRegisterModalOpen(false);
  };

  const handleSwitchToLogin = () => {
    setRegisterModalOpen(false);
    // Здесь можно добавить логику переключения на модальное окно входа
  };

  return (
    <div className="about-page-container">
      <main>
        <div className="container">
          <div className="about-hero">
            <h1 className="about-title">О нас</h1>
            <p className="about-subtitle">
              MusicUnity — это платформа для любителей музыки, где каждый может делиться своим мнением о релизах и открывать новые звуки
            </p>
          </div>

          <div className="about-content">
            <section className="about-section">
              <h2 className="section-title">Наша миссия</h2>
              <p className="section-text">
                Мы создали MusicUnity, чтобы объединить музыкальное сообщество и дать каждому возможность 
                выразить свое мнение о музыке. Наша платформа позволяет пользователям писать детальные рецензии, 
                ставить оценки и открывать новых исполнителей.
              </p>
            </section>

            <section className="about-section">
              <h2 className="section-title">Что мы предлагаем</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 7h10v2H7zm0 4h7v2H7z"/>
                      <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"/>
                    </svg>
                  </div>
                  <h3 className="feature-title">Детальные рецензии</h3>
                  <p className="feature-description">
                    Пишите подробные рецензии с оценками по различным критериям: рифмы, структура, стиль и общее впечатление
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="feature-title">Система рейтингов</h3>
                  <p className="feature-description">
                    Оценивайте релизы по 10-балльной шкале или оставляйте быстрые оценки без развернутых комментариев
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                  </div>
                  <h3 className="feature-title">База данных релизов</h3>
                  <p className="feature-description">
                    Обширная коллекция альбомов, синглов и EP с информацией об исполнителях, жанрах и датах выхода
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <h3 className="feature-title">Персональные предпочтения</h3>
                  <p className="feature-description">
                    Добавляйте релизы в избранное, подписывайтесь на любимых исполнителей и создавайте свою музыкальную коллекцию
                  </p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2 className="section-title">Наша команда</h2>
              <p className="section-text">
                MusicUnity разрабатывается командой энтузиастов, которые искренне любят музыку и хотят создать 
                лучшую платформу для музыкального сообщества. Мы постоянно работаем над улучшением функциональности 
                и добавлением новых возможностей.
              </p>
            </section>

            <section className="about-section">
              <h2 className="section-title">Присоединяйтесь к нам</h2>
              <p className="section-text">
                Станьте частью нашего сообщества! Регистрируйтесь, делитесь своими музыкальными открытиями, 
                читайте рецензии других пользователей и помогайте создавать самую полную базу музыкальных оценок.
              </p>
              <div className="cta-buttons">
                <button onClick={handleOpenRegisterModal} className="cta-button primary">
                  Зарегистрироваться
                </button>
                <a href="/releases" className="cta-button secondary">
                  Посмотреть релизы
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Модальное окно регистрации */}
      <RegisterModal 
        open={registerModalOpen} 
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default AboutPage; 