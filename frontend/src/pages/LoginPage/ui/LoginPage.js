import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../../../features/auth';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  
  const handleLoginSuccess = () => {
    // После успешного входа переходим на главную страницу
    navigate('/', { replace: true });
  };
  
  return (
    <div className="login-page">
      <div className="auth-container">
        <LoginForm onSuccess={handleLoginSuccess} />
        
        <div className="auth-links">
          <p>
            <Link to="/forgot-password">Забыли пароль?</Link>
          </p>
          <p>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 