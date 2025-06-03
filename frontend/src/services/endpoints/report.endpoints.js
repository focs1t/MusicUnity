export const REPORT_ENDPOINTS = {
  GET_ALL: '/reports',
  GET_BY_ID: (id) => `/reports/${id}`,
  CREATE: '/reports',
  UPDATE_STATUS: (id) => `/reports/${id}/status`,
  ASSIGN_MODERATOR: (reportId, moderatorId) => `/reports/${reportId}/moderator/${moderatorId}`,
  CLEAR_RESOLVED: '/reports/resolved',
  GET_PENDING: '/reports/pending',
  GET_BY_MODERATOR: (moderatorId) => `/reports/moderator/${moderatorId}`
}; 