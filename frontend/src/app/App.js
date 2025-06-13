import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { AppRouter } from './providers/RouterProvider';
import { Header } from '../widgets/Header';
import { Sidebar } from '../widgets/Sidebar';
import { Footer } from '../widgets/Footer';
import store from './store';

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <div className="app">
              <Sidebar />
              <div className="content">
                <Header />
                <AppRouter />
                <Footer />
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App; 