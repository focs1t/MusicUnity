import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sessionUI } from '../../../entities/session';

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const handleRegisterSuccess = () => {
    // После успешной регистрации переходим на главную страницу
    navigate('/', { replace: true });
  };
  
  return (
    <div className="register-page">
      <div className="auth-container">
        <sessionUI.RegisterForm onSuccess={handleRegisterSuccess} />
        
        <div className="auth-links">
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 