import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            MusicUnity
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/releases" className="hover:text-gray-300">
              Релизы
            </Link>
            <Link to="/authors" className="hover:text-gray-300">
              Авторы
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="hover:text-gray-300">
                  Профиль
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                >
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 