import httpClient from './httpClient';

const API_URL = '/api/files';

export const fileApi = {
  /**
   * Загрузка аватара пользователя
   * @param {File} file - Файл аватара
   * @returns {Promise<{key: string, url: string}>}
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Начинаем загрузку аватара...', file.name, file.size, file.type);
      
      const response = await httpClient.post(`${API_URL}/upload/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Ответ от сервера:', response.data);
      
      // Проверка структуры ответа с учетом возможных различий в именах полей
      const responseData = response.data;
      
      // Получаем URL из различных возможных полей ответа
      const url = responseData.temporaryUrl || 
                  responseData.url || 
                  (responseData.key ? `${API_URL}/presigned?key=${responseData.key}` : null);
      
      if (!url) {
        console.error('Неверный формат ответа от сервера:', responseData);
        throw new Error('Неверный формат ответа от сервера при загрузке аватара');
      }
      
      return {
        key: responseData.key || '',
        url: url
      };
    } catch (error) {
      console.error('Детали ошибки при загрузке аватара:', error);
      if (error.response) {
        console.error('Статус ответа:', error.response.status);
        console.error('Данные ответа:', error.response.data);
        console.error('Заголовки ответа:', error.response.headers);
      }
      throw error;
    }
  },

  /**
   * Загрузка обложки релиза
   * @param {File} file - Файл обложки
   * @returns {Promise<{key: string, url: string}>}
   */
  uploadCover: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await httpClient.post(`${API_URL}/upload/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получение временного URL для доступа к файлу
   * @param {string} key - Ключ файла в хранилище
   * @returns {Promise<string>}
   */
  getPresignedUrl: async (key) => {
    try {
      const response = await httpClient.get(`${API_URL}/presigned`, {
        params: { key }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 