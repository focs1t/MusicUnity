export const AUDIT_ENDPOINTS = {
  GET_BY_ID: (id) => `/audit/${id}`,
  SEARCH: '/audit/search',
  GET_BY_USER: (userId) => `/audit/user/${userId}`,
  GET_BY_TYPE: (type) => `/audit/type/${type}`,
  GET_BY_ENTITY: (entityType, entityId) => `/audit/entity/${entityType}/${entityId}`,
  GET_STATISTICS: '/audit/statistics',
  EXPORT: '/audit/export'
}; 