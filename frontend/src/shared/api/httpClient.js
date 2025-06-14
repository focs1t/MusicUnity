import axios from 'axios';

// Возвращаем полный URL к API серверу, так как прокси не работает
const httpClient = axios.create({
  baseURL: 'http://192.168.31.31:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Включаем поддержку кросс-доменных куки
});

// Интерцептор для добавления токена авторизации в заголовки запросов
httpClient.interceptors.request.use(
  (config) => {
    // Проверяем оба хранилища
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      // Убираем префикс Bearer если он есть
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      // Проверяем что токен валидный
      if (cleanToken.includes('.')) {
        config.headers.Authorization = `Bearer ${cleanToken}`;
      } else {
        console.error('Недействительный формат токена в хранилище');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    }
    
    // Логирование для POST /api/releases/own
    if (config.method === 'post' && config.url?.includes('/api/releases/own')) {
      console.log('=== AXIOS REQUEST DEBUG ===');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      console.log('Headers:', config.headers);
      console.log('Data type:', typeof config.data);
      console.log('Data:', config.data);
      console.log('Data JSON:', JSON.stringify(config.data, null, 2));
      console.log('==========================');
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
    // Логирование ошибки для отладки
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('Получена 401 ошибка - токен недействителен или пользователь заблокирован');
      
      // Очищаем данные авторизации из обоих хранилищ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Устанавливаем флаг выхода для предотвращения автоматической авторизации
      localStorage.setItem('logged_out', 'true');
      sessionStorage.setItem('logged_out', 'true');
      
      // Создаем пользовательское событие для уведомления приложения о необходимости выхода
      const logoutEvent = new CustomEvent('forceLogout', {
        detail: { 
          reason: 'unauthorized',
          message: 'Ваша сессия недействительна. Возможно, ваш аккаунт был заблокирован.'
        }
      });
      window.dispatchEvent(logoutEvent);
    }
    
    if (error.response?.status === 403) {
      console.log('Получена 403 ошибка - доступ запрещен');
      
      // Проверяем, содержит ли ответ информацию о блокировке
      const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
      if (errorMessage.toLowerCase().includes('заблокирован') || errorMessage.toLowerCase().includes('blocked')) {
        // Пользователь заблокирован - принудительный выход
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.setItem('logged_out', 'true');
        sessionStorage.setItem('logged_out', 'true');
        
        const logoutEvent = new CustomEvent('forceLogout', {
          detail: { 
            reason: 'blocked',
            message: 'Ваш аккаунт был заблокирован.'
          }
        });
        window.dispatchEvent(logoutEvent);
      }
    }
    
    // Обработка ошибок сервера
    if (error.response?.status === 500) {
      console.error('Внутренняя ошибка сервера:', error.response?.data);
      error.message = 'Произошла внутренняя ошибка сервера';
    }
    
    return Promise.reject(error);
  }
);

export default httpClient; 