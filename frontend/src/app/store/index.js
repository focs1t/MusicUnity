import { configureStore } from '@reduxjs/toolkit';
import { sessionModel } from '../../entities/session';

const store = configureStore({
  reducer: {
    session: sessionModel.sessionReducer,
    // Здесь будут добавляться другие редьюсеры
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
});

export default store; 