export const REVIEW_ENDPOINTS = {
  GET_BY_ID: (id) => `/reviews/${id}`,
  CREATE: '/reviews',
  UPDATE: (id) => `/reviews/${id}`,
  DELETE: (id) => `/reviews/${id}`,
  GET_BY_USER: (userId) => `/reviews/user/${userId}`,
  GET_BY_RELEASE: (releaseId) => `/reviews/release/${releaseId}`,
  TOGGLE_LIKE: (reviewId) => `/reviews/${reviewId}/like`,
  GET_LIKES: (reviewId) => `/reviews/${reviewId}/likes`,
  REPORT: (reviewId) => `/reviews/${reviewId}/report`
}; 