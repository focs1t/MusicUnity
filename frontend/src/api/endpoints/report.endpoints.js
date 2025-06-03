export const REPORT_ENDPOINTS = {
  GET_BY_ID: (id) => `/reports/${id}`,
  CREATE: '/reports',
  UPDATE: (id) => `/reports/${id}`,
  DELETE: (id) => `/reports/${id}`,
  GET_BY_USER: (userId) => `/reports/user/${userId}`,
  GET_BY_STATUS: (status) => `/reports/status/${status}`,
  GET_BY_TYPE: (type) => `/reports/type/${type}`,
  PROCESS: (reportId) => `/reports/${reportId}/process`,
  REJECT: (reportId) => `/reports/${reportId}/reject`,
  GET_STATISTICS: '/reports/statistics'
}; 