import api from '../../api/instance';
import { AUDIT_ENDPOINTS } from '../../api/endpoints';

/**
 * Сервис для работы с аудитом
 */
export const auditService = {
  /**
   * Получение записи аудита по ID
   * @param {number} id - ID записи
   * @returns {Promise<AuditDTO>} Данные записи аудита
   */
  getById: (id) =>
    api.get(AUDIT_ENDPOINTS.GET_BY_ID(id))
      .then(response => response.data),

  /**
   * Поиск записей аудита
   * @param {string} query - Поисковый запрос
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<AuditDTO>>} Страница с записями аудита
   */
  search: (query, page = 0, size = 10) =>
    api.get(AUDIT_ENDPOINTS.SEARCH, { params: { query, page, size } })
      .then(response => response.data),

  /**
   * Получение записей аудита пользователя
   * @param {number} userId - ID пользователя
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<AuditDTO>>} Страница с записями аудита
   */
  getByUser: (userId, page = 0, size = 10) =>
    api.get(AUDIT_ENDPOINTS.GET_BY_USER(userId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение записей аудита по типу
   * @param {string} type - Тип записи
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<AuditDTO>>} Страница с записями аудита
   */
  getByType: (type, page = 0, size = 10) =>
    api.get(AUDIT_ENDPOINTS.GET_BY_TYPE(type), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение записей аудита по сущности
   * @param {string} entityType - Тип сущности
   * @param {number} entityId - ID сущности
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<AuditDTO>>} Страница с записями аудита
   */
  getByEntity: (entityType, entityId, page = 0, size = 10) =>
    api.get(AUDIT_ENDPOINTS.GET_BY_ENTITY(entityType, entityId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение статистики аудита
   * @returns {Promise<AuditStatisticsDTO>} Статистика аудита
   */
  getStatistics: () =>
    api.get(AUDIT_ENDPOINTS.GET_STATISTICS)
      .then(response => response.data),

  /**
   * Экспорт записей аудита
   * @param {AuditExportDTO} exportData - Параметры экспорта
   * @returns {Promise<Blob>} Файл экспорта
   */
  export: (exportData) =>
    api.post(AUDIT_ENDPOINTS.EXPORT, exportData, { responseType: 'blob' })
      .then(response => response.data)
}; 