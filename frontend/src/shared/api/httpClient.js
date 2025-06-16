import axios from 'axios';

// Возвращаем полный URL к API серверу, так как прокси не работает
const httpClient = axios.create({
  baseURL: 'http://26.179.22.134:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Включаем поддержку кросс-доменных куки
});

// Интерцептор для добавления токена авторизации в заголовки запросов
httpClient.interceptors.request.use(
  (config) => {
    // Проверяем оба хранилища для токена
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Проверяем наличие пользовательских данных
    const userDataLS = localStorage.getItem('user');
    const userDataSS = sessionStorage.getItem('user');
    
    // Логирование для отладки авторизации
    console.log('httpClient: Проверка авторизации');
    console.log('httpClient: Токен в localStorage:', localStorage.getItem('token') ? 'Есть' : 'Нет');
    console.log('httpClient: Токен в sessionStorage:', sessionStorage.getItem('token') ? 'Есть' : 'Нет');
    console.log('httpClient: Данные пользователя в localStorage:', userDataLS ? 'Есть' : 'Нет');
    console.log('httpClient: Данные пользователя в sessionStorage:', userDataSS ? 'Есть' : 'Нет');
    
    if (token) {
      // Убираем префикс Bearer если он есть
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      // Проверяем что токен валидный
      if (cleanToken.includes('.')) {
        config.headers.Authorization = `Bearer ${cleanToken}`;
        console.log('httpClient: Токен добавлен в заголовок запроса');
        
        // Декодируем токен для проверки
        try {
          const base64Url = cleanToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          console.log('httpClient: Декодированный токен:', {
            userId: payload.id || payload.sub,
            username: payload.sub,
            exp: new Date(payload.exp * 1000).toLocaleString()
          });
        } catch (e) {
          console.error('httpClient: Ошибка при декодировании токена:', e);
        }
      } else {
        console.error('httpClient: Недействительный формат токена в хранилище');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    } else {
      console.warn('httpClient: Токен не найден в хранилище');
      
      // Если нет токена, но есть данные пользователя, пробуем восстановить сессию
      if (userDataLS || userDataSS) {
        console.warn('httpClient: Найдены данные пользователя без токена, возможно сессия истекла');
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