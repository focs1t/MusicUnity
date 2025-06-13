import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authModel } from '../../model';
import '../auth-forms.css';

const LoginForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth) || {};
  const { loading, error } = auth;
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!username || !password) {
      setFormError('Пожалуйста, заполните все поля');
      return;
    }
    
    const result = await dispatch(authModel.login(username, password));
    
    if (result.success && onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <div className="login-form">
      <h2>Вход в систему</h2>
      
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
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Введите пароль"
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm; 