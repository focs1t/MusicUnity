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
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок ответа
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если ошибка 401 (Unauthorized), перенаправляем на страницу входа
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Если необходимо перенаправление при неавторизованном доступе:
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default httpClient; 