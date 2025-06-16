import httpClient from './httpClient';

const API_URL = '/api/reviews';

export const reviewApi = {
  /**
   * Получение отзыва по ID
   * @param {number} id - ID отзыва
   * @returns {Promise<Object>}
   */
  getReviewById: async (id) => {
    try {
      const response = await httpClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Проверка, есть ли у пользователя рецензия на данный релиз
   * @param {number} userId - ID пользователя
   * @param {number} releaseId - ID релиза
   * @returns {Promise<boolean>} - true, если у пользователя есть рецензия на данный релиз
   */
  hasUserReviewed: async (userId, releaseId) => {
    try {
      console.log(`Проверка наличия рецензии: userId=${userId}, releaseId=${releaseId}`);
      
      if (!userId || !releaseId) {
        console.error('Отсутствуют обязательные параметры userId или releaseId');
        return false;
      }
      
      // Получаем данные текущего пользователя из localStorage
      let currentUserId = userId;
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          currentUserId = user.id || user.userId || userId;
          console.log(`Используем ID текущего пользователя: ${currentUserId}`);
        }
      } catch (e) {
        console.error('Ошибка при получении ID из localStorage:', e);
      }
      
      const response = await httpClient.get(`${API_URL}/check`, {
        params: { userId: currentUserId, releaseId }
      });
      
      console.log('Полный ответ API о наличии рецензии:', response);
      
      // Проверяем структуру ответа
      if (response && response.data) {
        console.log('Данные ответа API:', response.data);
        return response.data.hasReviewed === true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка при проверке наличия рецензии:', error);
      console.error('Детали запроса:', { userId, releaseId });
      if (error.response) {
        console.error('Статус ответа:', error.response.status);
        console.error('Данные ответа:', error.response.data);
      }
      return false;
    }
  },

  /**
   * Создание простой оценки
   * @param {number} userId - ID пользователя
   * @param {number} releaseId - ID релиза
   * @param {number} rhymeImagery - Оценка рифмы и образности
   * @param {number} structureRhythm - Оценка структуры и ритма
   * @param {number} styleExecution - Оценка стиля и исполнения
   * @param {number} individuality - Оценка индивидуальности
   * @param {number} vibe - Оценка вайба
   * @returns {Promise<Object>}
   */
  createSimpleReview: async (userId, releaseId, rhymeImagery, structureRhythm, styleExecution, individuality, vibe) => {
    try {
      const response = await httpClient.post(`${API_URL}/simple`, null, {
        params: {
          userId,
          releaseId,
          rhymeImagery,
          structureRhythm,
          styleExecution,
          individuality,
          vibe
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Создание полной рецензии
   * @param {number} userId - ID пользователя
   * @param {number} releaseId - ID релиза
   * @param {string} title - Заголовок рецензии
   * @param {string} content - Содержание рецензии
   * @param {number} rhymeImagery - Оценка рифмы и образности
   * @param {number} structureRhythm - Оценка структуры и ритма
   * @param {number} styleExecution - Оценка стиля и исполнения
   * @param {number} individuality - Оценка индивидуальности
   * @param {number} vibe - Оценка вайба
   * @returns {Promise<Object>}
   */
  createFullReview: async (userId, releaseId, title, content, rhymeImagery, structureRhythm, styleExecution, individuality, vibe) => {
    try {
      const response = await httpClient.post(`${API_URL}/full`, null, {
        params: {
          userId,
          releaseId,
          title,
          content,
          rhymeImagery,
          structureRhythm,
          styleExecution,
          individuality,
          vibe
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение отзывов на релиз
   * @param {number} releaseId - ID релиза
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getReviewsByRelease: async (releaseId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/release/${releaseId}/reviews`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение расширенных отзывов на релиз с сортировкой
   * @param {number} releaseId - ID релиза
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @param {string} sortBy - Тип сортировки (newest, oldest, popular, top_rated)
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getExtendedReviewsByRelease: async (releaseId, page = 0, size = 10, sortBy = 'newest') => {
    try {
      // Преобразуем параметр sortBy в параметры sort и direction для Spring Data
      let sort, direction;
      
      switch (sortBy) {
        case 'newest':
          sort = 'createdAt';
          direction = 'desc';
          break;
        case 'oldest':
          sort = 'createdAt';
          direction = 'asc';
          break;
        case 'popular':
          sort = 'likesCount';
          direction = 'desc';
          break;
        case 'top_rated':
          sort = 'totalScore';
          direction = 'desc';
          break;
        default:
          sort = 'createdAt';
          direction = 'desc';
      }
      
      const response = await httpClient.get(`${API_URL}/release/${releaseId}/extended`, {
        params: { 
          page, 
          size, 
          sort: `${sort},${direction}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение отзывов пользователя
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @param {string} type - Тип рецензии (EXTENDED, SIMPLE)
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getReviewsByUser: async (userId, page = 0, size = 10, type = null) => {
    try {
      const params = { page, size };
      if (type) {
        params.type = type;
      }
      const response = await httpClient.get(`${API_URL}/user/${userId}/reviews`, {
        params
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение расширенных отзывов пользователя
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getExtendedReviewsByUser: async (userId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/user/${userId}/reviews`, {
        params: { page, size, type: 'EXTENDED' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение простых отзывов пользователя
   * @param {number} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getSimpleReviewsByUser: async (userId, page = 0, size = 10) => {
    try {
      const response = await httpClient.get(`${API_URL}/user/${userId}/reviews`, {
        params: { page, size, type: 'SIMPLE' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение всех отзывов
   * @param {number} page - Номер страницы
   * @param {number} size - Размер страницы
   * @param {string} sortBy - Тип сортировки (newest, oldest, popular, top_rated)
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number}>}
   */
  getAllReviews: async (page = 0, size = 10, sortBy = 'newest') => {
    try {
      // Преобразуем параметр sortBy в параметры sort и direction для Spring Data
      let sort, direction;
      
      switch (sortBy) {
        case 'newest':
          sort = 'createdAt';
          direction = 'desc';
          break;
        case 'oldest':
          sort = 'createdAt';
          direction = 'asc';
          break;
        case 'popular':
          sort = 'likesCount';
          direction = 'desc';
          break;
        case 'top_rated':
          sort = 'totalScore';
          direction = 'desc';
          break;
        default:
          sort = 'createdAt';
          direction = 'desc';
      }
      
      const response = await httpClient.get(API_URL, {
        params: { 
          page, 
          size, 
          sort: `${sort},${direction}`,
          sortBy // Оставляем для совместимости, если бэкенд начнет использовать этот параметр
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение количества отзывов пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<number>}
   */
  getReviewsCountByUser: async (userId) => {
    try {
      console.log(`Запрос количества рецензий для пользователя ${userId}`);
      const response = await httpClient.get(`${API_URL}/user/${userId}/reviews/count`);
      console.log(`Ответ API о количестве рецензий:`, response.data);
      
      // Проверяем формат ответа
      if (response.data && typeof response.data === 'object') {
        if (response.data.total !== undefined) {
          return response.data.total;
        } else {
          // Если ответ - объект, но без поля total, возвращаем первое числовое значение
          const firstNumericValue = Object.values(response.data).find(value => typeof value === 'number');
          return firstNumericValue !== undefined ? firstNumericValue : 0;
        }
      } else if (typeof response.data === 'number') {
        return response.data;
      }
      
      return 0;
    } catch (error) {
      console.error('Ошибка при получении количества рецензий пользователя:', error);
      console.error('Детали запроса:', { userId });
      if (error.response) {
        console.error('Статус ответа:', error.response.status);
        console.error('Данные ответа:', error.response.data);
      }
      return 0;
    }
  },
  
  /**
   * Получение количества полных рецензий пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<number>}
   */
  getExtendedReviewsCountByUser: async (userId) => {
    try {
      console.log(`Запрос количества полных рецензий для пользователя ${userId}`);
      const response = await httpClient.get(`${API_URL}/user/${userId}/reviews/extended/count`);
      console.log(`Ответ API о количестве полных рецензий:`, response.data);
      return typeof response.data === 'number' ? response.data : 0;
    } catch (error) {
      console.error('Ошибка при получении количества полных рецензий пользователя:', error);
      console.error('Детали запроса:', { userId });
      if (error.response) {
        console.error('Статус ответа:', error.response.status);
        console.error('Данные ответа:', error.response.data);
      }
      return 0;
    }
  },
  
  /**
   * Получение количества простых рецензий пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<number>}
   */
  getSimpleReviewsCountByUser: async (userId) => {
    try {
      console.log(`Запрос количества простых рецензий для пользователя ${userId}`);
      const response = await httpClient.get(`${API_URL}/user/${userId}/reviews/simple/count`);
      console.log(`Ответ API о количестве простых рецензий:`, response.data);
      return typeof response.data === 'number' ? response.data : 0;
    } catch (error) {
      console.error('Ошибка при получении количества простых рецензий пользователя:', error);
      console.error('Детали запроса:', { userId });
      if (error.response) {
        console.error('Статус ответа:', error.response.status);
        console.error('Данные ответа:', error.response.data);
      }
      return 0;
    }
  },

  /**
   * Получение количества отзывов на релиз
   * @param {number} releaseId - ID релиза
   * @returns {Promise<number>}
   */
  getReviewsCountByRelease: async (releaseId) => {
    try {
      const response = await httpClient.get(`${API_URL}/release/${releaseId}/count`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Мягкое удаление отзыва (только для модераторов)
   * @param {number} id - ID отзыва
   * @returns {Promise<void>}
   */
  softDeleteReview: async (id) => {
    try {
      await httpClient.patch(`${API_URL}/${id}/delete`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение средних оценок по параметрам для релиза
   * @param {number} releaseId - ID релиза
   * @returns {Promise<Object>} Объект со средними оценками по параметрам
   */
  getAverageRatingsByRelease: async (releaseId) => {
    try {
      const response = await httpClient.get(`${API_URL}/release/${releaseId}/averages`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 