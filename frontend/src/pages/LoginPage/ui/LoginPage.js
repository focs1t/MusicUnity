import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { sessionUI } from '../../../entities/session';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем предыдущий маршрут, с которого пользователь был перенаправлен
  const from = location.state?.from?.pathname || '/';
  
  const handleLoginSuccess = () => {
    // Переходим на предыдущий маршрут после успешного входа
    navigate(from, { replace: true });
  };
  
  return (
    <div className="login-page">
      <div className="auth-container">
        <sessionUI.LoginForm onSuccess={handleLoginSuccess} />
        
        <div className="auth-links">
          <p>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 