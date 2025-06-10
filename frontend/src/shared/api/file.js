import httpClient from './httpClient';

const API_URL = '/api/files';

export const fileApi = {
  /**
   * Загрузка аватара пользователя
   * @param {File} file - Файл изображения
   * @returns {Promise<{key: string, temporaryUrl: string, permanentUrl: string}>}
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
   * @returns {Promise<{key: string, temporaryUrl: string, permanentUrl: string}>}
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
   * Получение постоянного URL для файла (рекомендуется)
   * @param {string} key - Ключ файла
   * @returns {Promise<string>}
   */
  getPermanentUrl: async (key) => {
    const response = await httpClient.get(`${API_URL}/permanent`, {
      params: { key }
    });
    return response.data;
  },

  /**
   * Получение временного URL для файла (устаревший)
   * @param {string} key - Ключ файла
   * @returns {Promise<string>}
   * @deprecated Используйте getPermanentUrl
   */
  getPresignedUrl: async (key) => {
    const response = await httpClient.get(`${API_URL}/presigned`, {
      params: { key }
    });
    return response.data;
  }
}; 