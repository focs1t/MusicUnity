import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../../AuthProvider';
import LoginPage from '../../../../pages/LoginPage';
import RegisterPage from '../../../../pages/RegisterPage';
import ForgotPasswordPage from '../../../../pages/ForgotPasswordPage';
import ResetPasswordPage from '../../../../pages/ResetPasswordPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Защищенные маршруты */}
      <Route 
        path="/" 
        element={
          <AuthGuard>
            <div>Главная страница (защищена)</div>
          </AuthGuard>
        } 
      />
      
      {/* Редирект на главную при переходе на неизвестный маршрут */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter; 