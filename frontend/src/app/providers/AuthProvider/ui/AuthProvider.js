import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { sessionModel } from '../../../../entities/session';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // При инициализации приложения проверяем авторизацию пользователя
    dispatch(sessionModel.checkAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider; 