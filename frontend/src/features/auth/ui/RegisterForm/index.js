import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authModel } from '../../model';
import { isValidEmail, validatePassword, doPasswordsMatch, getPasswordErrorMessage } from '../../../../shared/utils/validation';
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
  
  // Состояния для валидации
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formTouched, setFormTouched] = useState(false);
  
  // Валидация при изменении полей
  useEffect(() => {
    if (formTouched) {
      validateForm();
    }
  }, [email, password, confirmPassword, formTouched]);
  
  // Функция валидации формы
  const validateForm = () => {
    let isValid = true;
    
    // Проверка email
    if (!isValidEmail(email)) {
      setEmailError('Введите корректный email адрес');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Проверка пароля
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(getPasswordErrorMessage(passwordValidation));
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Проверка совпадения паролей
    if (!doPasswordsMatch(password, confirmPassword)) {
      setConfirmPasswordError('Пароли не совпадают');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormTouched(true);
    
    // Валидация перед отправкой формы
    if (!validateForm()) {
      return;
    }
    
    if (!username || !email || !password) {
      setFormError('Заполните все обязательные поля');
      return;
    }
    
    const result = await dispatch(authModel.register(username, email, password));
    
    if (result.success && onSuccess) {
      onSuccess();
    }
  };
  
  const handleBlur = () => {
    setFormTouched(true);
    validateForm();
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
            onBlur={handleBlur}
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
            onBlur={handleBlur}
            disabled={loading}
            placeholder="Введите ваш email"
            required
          />
          {emailError && <div className="field-error">{emailError}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={handleBlur}
            disabled={loading}
            placeholder="Придумайте пароль"
            required
          />
          {passwordError && <div className="field-error">{passwordError}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Подтверждение пароля</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={handleBlur}
            disabled={loading}
            placeholder="Повторите пароль"
            required
          />
          {confirmPasswordError && <div className="field-error">{confirmPasswordError}</div>}
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm; 