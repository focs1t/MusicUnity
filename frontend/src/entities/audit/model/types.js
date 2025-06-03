/**
 * Тип действия аудита
 * @readonly
 * @enum {string}
 */
export const AuditAction = {
  BAN_USER: 'BAN_USER',
  UNBAN_USER: 'UNBAN_USER',
  DELETE_REVIEW: 'DELETE_REVIEW',
  RESTORE_REVIEW: 'RESTORE_REVIEW',
  DELETE_RELEASE: 'DELETE_RELEASE',
  RESTORE_RELEASE: 'RESTORE_RELEASE',
  DELETE_AUTHOR: 'DELETE_AUTHOR',
  RESTORE_AUTHOR: 'RESTORE_AUTHOR',
  RESOLVE_REPORT: 'RESOLVE_REPORT',
  REJECT_REPORT: 'REJECT_REPORT'
};

/**
 * Модель записи аудита
 * @typedef {Object} Audit
 * @property {number} auditId - ID записи аудита
 * @property {number} moderatorId - ID модератора
 * @property {number} targetId - ID цели
 * @property {AuditAction} action - Тип действия
 * @property {string} details - Детали действия
 * @property {string} createdAt - Дата создания
 */ 