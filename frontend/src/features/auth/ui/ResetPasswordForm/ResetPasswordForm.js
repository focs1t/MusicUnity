import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { authModel } from '../../model';
import '../auth-forms.css';

const ResetPasswordForm = ({ token, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка совпадения паролей
    if (newPassword !== confirmPassword) {
      setStatus({ loading: false, error: 'Пароли не совпадают', success: false });
      return;
    }
    
    setStatus({ loading: true, error: null, success: false });

    try {
      const result = await dispatch(authModel.resetPassword(token, newPassword));
      
      if (result.success) {
        setStatus({ loading: false, error: null, success: true });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setStatus({ loading: false, error: result.error, success: false });
      }
    } catch (error) {
      setStatus({ 
        loading: false, 
        error: error.message || 'Произошла ошибка при сбросе пароля', 
        success: false 
      });
    }
  };

  return (
    <div className="reset-password-form">
      <h2>Сброс пароля</h2>
      
      {status.success ? (
        <div className="success-message">
          <p>
            Пароль успешно изменен! Теперь вы можете войти в систему, используя новый пароль.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">Новый пароль</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Введите новый пароль"
              disabled={status.loading}
              minLength="8"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Подтверждение пароля</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Повторите новый пароль"
              disabled={status.loading}
              minLength="8"
            />
          </div>
          
          {status.error && (
            <div className="error-message">
              {status.error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={status.loading}
          >
            {status.loading ? 'Сохранение...' : 'Сохранить новый пароль'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm; 