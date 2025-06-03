import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authModel } from '../../../../entities/auth';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // При инициализации приложения проверяем авторизацию пользователя
    dispatch(authModel.checkAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider; 