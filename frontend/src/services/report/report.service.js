import api from '../../api/instance';
import { REPORT_ENDPOINTS } from '../../api/endpoints';

/**
 * Сервис для работы с отчетами
 */
export const reportService = {
  /**
   * Получение отчета по ID
   * @param {number} id - ID отчета
   * @returns {Promise<ReportDTO>} Данные отчета
   */
  getById: (id) =>
    api.get(REPORT_ENDPOINTS.GET_BY_ID(id))
      .then(response => response.data),

  /**
   * Создание нового отчета
   * @param {ReportDTO} reportData - Данные отчета
   * @returns {Promise<ReportDTO>} Созданный отчет
   */
  create: (reportData) =>
    api.post(REPORT_ENDPOINTS.CREATE, reportData)
      .then(response => response.data),

  /**
   * Обновление отчета
   * @param {number} id - ID отчета
   * @param {ReportDTO} reportData - Данные отчета
   * @returns {Promise<ReportDTO>} Обновленный отчет
   */
  update: (id, reportData) =>
    api.put(REPORT_ENDPOINTS.UPDATE(id), reportData)
      .then(response => response.data),

  /**
   * Удаление отчета
   * @param {number} id - ID отчета
   * @returns {Promise<void>}
   */
  delete: (id) =>
    api.delete(REPORT_ENDPOINTS.DELETE(id)),

  /**
   * Получение отчетов пользователя
   * @param {number} userId - ID пользователя
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReportDTO>>} Страница с отчетами
   */
  getByUser: (userId, page = 0, size = 10) =>
    api.get(REPORT_ENDPOINTS.GET_BY_USER(userId), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение отчетов по статусу
   * @param {string} status - Статус отчета
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReportDTO>>} Страница с отчетами
   */
  getByStatus: (status, page = 0, size = 10) =>
    api.get(REPORT_ENDPOINTS.GET_BY_STATUS(status), { params: { page, size } })
      .then(response => response.data),

  /**
   * Получение отчетов по типу
   * @param {string} type - Тип отчета
   * @param {number} [page=0] - Номер страницы
   * @param {number} [size=10] - Размер страницы
   * @returns {Promise<PageResponse<ReportDTO>>} Страница с отчетами
   */
  getByType: (type, page = 0, size = 10) =>
    api.get(REPORT_ENDPOINTS.GET_BY_TYPE(type), { params: { page, size } })
      .then(response => response.data),

  /**
   * Обработка отчета
   * @param {number} reportId - ID отчета
   * @param {ReportProcessDTO} processData - Данные обработки
   * @returns {Promise<ReportDTO>} Обработанный отчет
   */
  process: (reportId, processData) =>
    api.post(REPORT_ENDPOINTS.PROCESS(reportId), processData)
      .then(response => response.data),

  /**
   * Отклонение отчета
   * @param {number} reportId - ID отчета
   * @param {ReportRejectDTO} rejectData - Данные отклонения
   * @returns {Promise<ReportDTO>} Отклоненный отчет
   */
  reject: (reportId, rejectData) =>
    api.post(REPORT_ENDPOINTS.REJECT(reportId), rejectData)
      .then(response => response.data),

  /**
   * Получение статистики по отчетам
   * @returns {Promise<ReportStatisticsDTO>} Статистика по отчетам
   */
  getStatistics: () =>
    api.get(REPORT_ENDPOINTS.GET_STATISTICS)
      .then(response => response.data)
}; 