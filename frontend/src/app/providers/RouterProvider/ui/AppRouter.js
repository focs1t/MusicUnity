import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../../AuthProvider';
import LoginPage from '../../../../pages/LoginPage';
import RegisterPage from '../../../../pages/RegisterPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
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