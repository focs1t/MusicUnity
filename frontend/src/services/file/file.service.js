import api from '../../api/instance';
import { FILE_ENDPOINTS } from '../../api/endpoints';

/**
 * Сервис для работы с файлами
 */
export const fileService = {
  /**
   * Загрузка файла
   * @param {File} file - Файл для загрузки
   * @returns {Promise<FileUploadResponse>} Информация о загруженном файле
   */
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(FILE_ENDPOINTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => response.data);
  },

  /**
   * Скачивание файла
   * @param {string} key - Ключ файла
   * @returns {Promise<Blob>} Содержимое файла
   */
  download: (key) =>
    api.get(FILE_ENDPOINTS.DOWNLOAD(key), { responseType: 'blob' })
      .then(response => response.data),

  /**
   * Удаление файла
   * @param {string} key - Ключ файла
   * @returns {Promise<void>}
   */
  delete: (key) =>
    api.delete(FILE_ENDPOINTS.DELETE(key)),

  /**
   * Получение информации о файле
   * @param {string} key - Ключ файла
   * @returns {Promise<FileInfoDTO>} Информация о файле
   */
  getInfo: (key) =>
    api.get(FILE_ENDPOINTS.GET_INFO(key))
      .then(response => response.data),

  /**
   * Получение предподписанного URL для скачивания файла
   * @param {string} key - Ключ файла
   * @returns {Promise<string>} Предподписанный URL
   */
  getPresignedUrl: (key) =>
    api.get(FILE_ENDPOINTS.GET_PRESIGNED_URL(key))
      .then(response => response.data),

  /**
   * Получение URL для загрузки файла
   * @param {string} contentType - MIME-тип файла
   * @returns {Promise<UploadUrlDTO>} URL и параметры для загрузки
   */
  getUploadUrl: (contentType) =>
    api.get(FILE_ENDPOINTS.GET_UPLOAD_URL, { params: { contentType } })
      .then(response => response.data)
}; 