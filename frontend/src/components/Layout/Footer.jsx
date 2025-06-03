import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">MusicUnity</h3>
            <p className="text-gray-300">
              Платформа для музыкантов и их поклонников
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Ссылки</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white">
                  О нас
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white">
                  Контакты
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white">
                  Условия использования
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white">
                  Политика конфиденциальности
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Контакты</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Email: info@musicunity.com</li>
              <li className="text-gray-300">Телефон: +7 (999) 123-45-67</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} MusicUnity. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 