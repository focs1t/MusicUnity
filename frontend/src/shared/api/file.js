import httpClient from './httpClient';

const API_URL = '/api/files';

export const fileApi = {
  /**
   * Загрузка аватара пользователя
   * @param {File} file - Файл изображения аватара
   * @returns {Promise<{key: string, url: string}>}
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await httpClient.post(`${API_URL}/upload/avatar`, formData, {
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
   * Загрузка обложки релиза
   * @param {File} file - Файл изображения обложки
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