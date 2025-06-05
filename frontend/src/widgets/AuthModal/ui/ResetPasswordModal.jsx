import React, { useState } from 'react';
import { Dialog, DialogContent, Button, TextField, Box, Typography, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { authModel } from '../../../entities/auth';
import { modalStyles } from './styles';

const ResetPasswordModal = ({ open, onClose, token, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!passwordData.newPassword) {
      setError('Введите новый пароль');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await dispatch(authModel.resetPassword(token, passwordData.newPassword));
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Произошла ошибка при сбросе пароля');
      }
    } catch (err) {
      setError('Произошла ошибка при отправке запроса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    if (success) {
      // Если успешно сбросили пароль, переходим к форме входа
      onSwitchToLogin();
    } else {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: modalStyles.paper
      }}
    >
      {/* Крестик закрытия (абсолютное позиционирование) */}
      <Box 
        sx={modalStyles.closeButton}
        onClick={handleClose}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 6L18 18" stroke="#777" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </Box>
      
      <DialogContent sx={modalStyles.dialogContent}>
        {/* Заголовок */}
        <Typography variant="h5" component="div" sx={modalStyles.title}>
          Сброс пароля
        </Typography>
        
        {success ? (
          // Сообщение об успешном сбросе пароля
          <Box>
            <Alert severity="success" sx={modalStyles.successAlert}>
              Пароль успешно изменен!
            </Alert>
            <Typography sx={modalStyles.normalText}>
              Теперь вы можете войти в систему, используя новый пароль.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={onSwitchToLogin}
              sx={modalStyles.button}
            >
              Перейти к входу
            </Button>
          </Box>
        ) : (
          // Форма сброса пароля
          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={modalStyles.normalText}>
              Пожалуйста, введите новый пароль.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="Новый пароль"
              type="password"
              id="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ 
                sx: modalStyles.inputLabel,
                required: true
              }}
              sx={modalStyles.textField}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Подтвердите пароль"
              type="password"
              id="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ 
                sx: modalStyles.inputLabel,
                required: true
              }}
              sx={modalStyles.textField}
            />
            
            {error && (
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
              {loading ? 'Сохранение...' : 'Сохранить новый пароль'}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal; 