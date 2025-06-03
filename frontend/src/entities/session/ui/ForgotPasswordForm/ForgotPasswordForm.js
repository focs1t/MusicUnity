import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../../model';
import '../auth-forms.css';

const ForgotPasswordForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    try {
      const result = await dispatch(forgotPassword(email));
      
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
        error: error.message || 'Произошла ошибка при отправке запроса', 
        success: false 
      });
    }
  };

  return (
    <div className="forgot-password-form">
      <h2>Восстановление пароля</h2>
      
      {status.success ? (
        <div className="success-message">
          <p>
            Инструкции по сбросу пароля отправлены на указанный email.
            Пожалуйста, проверьте вашу почту.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Введите ваш email"
              disabled={status.loading}
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
            {status.loading ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm; 