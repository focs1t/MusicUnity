import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authModel } from '../../model';
import '../auth-forms.css';

const RegisterForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth) || {};
  const { loading, error } = auth;
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setFormError('Пароли не совпадают');
      return;
    }
    
    if (!username || !email || !password) {
      return;
    }
    
    const result = await dispatch(authModel.register(username, email, password));
    
    if (result.success && onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <div className="register-form">
      <h2>Регистрация</h2>
      
      {(error || formError) && (
        <div className="error-message">
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Имя пользователя</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            placeholder="Введите имя пользователя"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="Введите ваш email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Придумайте пароль"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Подтверждение пароля</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            placeholder="Повторите пароль"
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm; 