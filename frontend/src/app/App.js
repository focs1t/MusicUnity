import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { AppRouter } from './providers/RouterProvider';
import store from './store';

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <div className="app">
            <AppRouter />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App; 