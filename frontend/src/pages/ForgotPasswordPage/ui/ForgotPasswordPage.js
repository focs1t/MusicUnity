import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ForgotPasswordForm } from '../../../entities/session/ui';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    // Можно добавить таймер для автоматического перехода после успешного запроса
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 5000);
  };
  
  return (
    <div className="forgot-password-page">
      <div className="auth-container">
        <ForgotPasswordForm onSuccess={handleSuccess} />
        
        <div className="auth-links">
          <p>
            Вспомнили пароль? <Link to="/login">Войти</Link>
          </p>
          <p>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 