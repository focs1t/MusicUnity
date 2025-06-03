/**
 * Статус жалобы
 * @readonly
 * @enum {string}
 */
export const ReportStatus = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED'
};

/**
 * Модель жалобы
 * @typedef {Object} Report
 * @property {number} reportId - ID жалобы
 * @property {number} userId - ID пользователя, создавшего жалобу
 * @property {number} reviewId - ID отзыва
 * @property {string} reason - Причина жалобы
 * @property {ReportStatus} status - Статус жалобы
 * @property {number} moderatorId - ID модератора, обработавшего жалобу
 * @property {string} moderatorComment - Комментарий модератора
 * @property {string} createdAt - Дата создания
 * @property {string} resolvedAt - Дата обработки
 */ 