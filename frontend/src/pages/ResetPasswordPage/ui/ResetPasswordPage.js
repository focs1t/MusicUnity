import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ResetPasswordForm } from '../../../features/auth';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем токен из URL параметров
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  
  const handleSuccess = () => {
    // После успешного сброса пароля переходим на страницу входа
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 3000);
  };
  
  // Если токен не найден, показываем сообщение об ошибке
  if (!token) {
    return (
      <div className="reset-password-page">
        <div className="auth-container">
          <div className="error-message">
            <h2>Ошибка сброса пароля</h2>
            <p>Неверная или истекшая ссылка для сброса пароля.</p>
            <p>
              <Link to="/forgot-password">Запросить новую ссылку</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="reset-password-page">
      <div className="auth-container">
        <ResetPasswordForm token={token} onSuccess={handleSuccess} />
        
        <div className="auth-links">
          <p>
            Вспомнили пароль? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 