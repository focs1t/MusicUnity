import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../shared/api';
import './Top100Page.css';

// Встроенный плейсхолдер в формате data URI для аватара
const DEFAULT_AVATAR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMzMzMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNTAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMzAiIHI9IjEwMCIgZmlsbD0iIzY2NjY2NiIvPjwvc3ZnPg==';

const Top100Page = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для обработки ошибок изображений
  const handleImageError = (e, user) => {
    console.log(`Ошибка загрузки аватара для пользователя ${user?.username || 'неизвестного'}, использую placeholder`);
    e.target.onerror = null;
    e.target.src = DEFAULT_AVATAR_PLACEHOLDER;
  };

  useEffect(() => {
    const fetchTop100Users = async () => {
      try {
        setLoading(true);
        const data = await userApi.getTop100Users();
        
        // Добавляем ранг каждому пользователю, если его нет
        const usersWithRank = data.map((user, index) => ({
          ...user,
          rank: user.rank || index + 1
        }));
        
        setUsers(usersWithRank);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные. Пожалуйста, повторите попытку позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchTop100Users();
  }, []);

  if (loading) {
    return (
      <div className="site-content top100-page">
        <main>
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Загрузка рейтинга...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="site-content top100-page">
        <main>
          <div className="container">
            <div className="error-container">
              <div className="error-message">{error}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="site-content top100-page">
        <main>
          <div className="container">
            <div className="empty-container">
              <p>В настоящее время рейтинг пуст.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="site-content top100-page">
      <main>
        <div className="container">
          <h1 className="top100-title">ТОП-100 пользователей</h1>
          
          <div className="top100-description">
            <p>Рейтинг пользователей формируется на основе активности на платформе, включая количество авторских лайков, рецензий, поставленных и полученных лайков.</p>
          </div>
          
          <div className="top100-table-container">
            <div className="top100-table-wrapper">
              <table className="top100-table">
                <thead>
                  <tr>
                    <th className="rank-column">
                      <div className="header-content">
                        <svg className="header-icon" viewBox="0 0 24 24" fill="white">
                          <path d="M3 15h4v6H3v-6zm6.5-8h3v14h-3V7zm6.5 4h4v10h-4V11z"/>
                        </svg>
                        №
                      </div>
                    </th>
                    <th className="points-column">
                      <div className="header-content">
                        <svg className="header-icon" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        Баллы
                      </div>
                    </th>
                    <th className="user-column">
                      <div className="header-content">
                        <svg className="header-icon" viewBox="0 0 24 24" fill="white">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        Пользователь
                      </div>
                    </th>
                    <th className="stat-column">
                      <div className="header-content">
                        <svg className="header-icon" viewBox="0 0 24 24" fill="#ef4444">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Авторские лайки
                      </div>
                    </th>
                    <th className="stat-column">
                      <div className="header-content">
                        <svg className="header-icon" viewBox="0 0 24 24" fill="white">
                          <path d="M7 7h10v2H7zm0 4h7v2H7z"></path>
                          <path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path>
                        </svg>
                        Рецензии
                      </div>
                    </th>
                    <th className="stat-column">
                      <div className="header-content">
                        <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Поставлено лайков
                      </div>
                    </th>
                    <th className="stat-column">
                      <div className="header-content">
                        <svg className="header-icon" viewBox="0 0 24 24" fill="white">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Получено лайков
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="user-row">
                      <td className="rank-cell">
                        <div className={`rank-number ${user.rank <= 3 ? `rank-${user.rank}` : ''}`}>
                          {user.rank}
                        </div>
                      </td>
                      <td className="points-cell">
                        <span className="points-value" style={{ color: 'white' }}>{user.points}</span>
                      </td>
                      <td className="user-cell">
                        <div className="user-info">
                          <Link to={`/profile/${user.id}`} className="user-avatar-link">
                            <img 
                              src={user.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER} 
                              alt={user.username}
                              className="user-avatar"
                              onError={(e) => handleImageError(e, user)}
                            />
                          </Link>
                          <Link to={`/profile/${user.id}`} className="user-name-link">
                            {user.username}
                          </Link>
                        </div>
                      </td>
                      <td className="stat-cell">{user.authorLikes}</td>
                      <td className="stat-cell">{user.reviews}</td>
                      <td className="stat-cell">{user.likesGiven}</td>
                      <td className="stat-cell">{user.likesReceived}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Top100Page; 