import axios from 'axios';

const httpClient = axios.create({
  baseURL: 'http://192.168.31.31:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для добавления токена авторизации в заголовки запросов
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Убираем префикс Bearer если он есть
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      // Проверяем что токен валидный
      if (cleanToken.includes('.')) {
        config.headers.Authorization = `Bearer ${cleanToken}`;
      } else {
        console.error('Invalid token format in localStorage');
        localStorage.removeItem('token');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем интерцептор для обработки ошибок
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default httpClient; 