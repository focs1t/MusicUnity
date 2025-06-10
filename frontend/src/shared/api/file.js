import httpClient from './httpClient';

const API_URL = '/api/files';

export const fileApi = {
  /**
   * Загрузка аватара пользователя
   * @param {File} file - Файл изображения
   * @returns {Promise<{key: string, temporaryUrl: string}>}
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post(`${API_URL}/upload/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Загрузка обложки релиза
   * @param {File} file - Файл изображения
   * @returns {Promise<{key: string, temporaryUrl: string}>}
   */
  uploadCover: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post(`${API_URL}/upload/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Получение временного URL для файла
   * @param {string} key - Ключ файла
   * @returns {Promise<string>}
   */
  getPresignedUrl: async (key) => {
    const response = await httpClient.get(`${API_URL}/presigned`, {
      params: { key }
    });
    return response.data;
  }
}; 