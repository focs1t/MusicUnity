import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sessionModel } from '../..';

const LoginForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.session);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      return;
    }
    
    const result = await dispatch(sessionModel.login(username, password));
    
    if (result.success && onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <div className="login-form">
      <h2>Вход в систему</h2>
      
      {error && (
        <div className="error-message">
          {error}
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