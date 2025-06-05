import React, { useState } from 'react';
import { Dialog, DialogContent, Button, TextField, Box, Typography, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { authModel } from '../../../entities/auth';
import { modalStyles } from './styles';

const ForgotPasswordModal = ({ open, onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  // Флаг, чтобы отслеживать, была ли попытка восстановления
  const [resetAttempted, setResetAttempted] = useState(false);
  
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Введите ваш email');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Введите корректный email');
      return;
    }
    
    setLoading(true);
    setError('');
    // Устанавливаем флаг попытки восстановления
    setResetAttempted(true);
    
    try {
      const result = await dispatch(authModel.forgotPassword(email));
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Произошла ошибка при обработке запроса');
      }
    } catch (err) {
      setError('Произошла ошибка при отправке запроса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setEmail('');
    setSuccess(false);
    setError('');
    setResetAttempted(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={success ? handleReset : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: modalStyles.paper
      }}
    >
      {/* Крестик закрытия (абсолютное позиционирование) */}
      <Box 
        sx={modalStyles.closeButton}
        onClick={success ? handleReset : onClose}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 6L18 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </Box>
      
      <DialogContent sx={modalStyles.dialogContent}>
        {/* Заголовок */}
        <Typography variant="h5" component="div" sx={modalStyles.title}>
          Восстановление пароля
        </Typography>
        
        {success ? (
          // Сообщение об успешной отправке
          <Box>
            <Alert severity="success" sx={modalStyles.successAlert}>
              Инструкции по восстановлению пароля отправлены на указанный email.
            </Alert>
            <Typography sx={modalStyles.normalText}>
              Пожалуйста, проверьте вашу почту и следуйте инструкциям в письме для сброса пароля.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleReset}
              sx={modalStyles.button}
            >
              Вернуться к входу
            </Button>
          </Box>
        ) : (
          // Форма восстановления пароля
          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={modalStyles.normalText}>
              Введите email, указанный при регистрации, и мы отправим вам инструкции по восстановлению пароля.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ 
                sx: modalStyles.inputLabel,
                required: true
              }}
              sx={modalStyles.textField}
            />
            
            {error && resetAttempted && (
              <Typography sx={modalStyles.errorText}>
                {error}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={modalStyles.button}
            >
              {loading ? 'Отправка...' : 'Восстановить пароль'}
            </Button>
            
            <Box sx={modalStyles.flexCenter}>
              <Typography variant="body1" sx={modalStyles.normalText}>
                Вспомнили пароль?
              </Typography>
              <Typography 
                variant="body1" 
                sx={modalStyles.linkText}
                onClick={onSwitchToLogin}
              >
                Войти
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal; 