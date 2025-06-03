export const REVIEW_ENDPOINTS = {
  GET_BY_RELEASE: (releaseId) => `/reviews/release/${releaseId}/reviews`,
  GET_BY_USER: (userId) => `/reviews/user/${userId}/reviews`,
  GET_BY_ID: (id) => `/reviews/${id}`,
  CREATE: '/reviews',
  UPDATE: (id) => `/reviews/${id}`,
  DELETE: (id) => `/reviews/${id}`
}; 