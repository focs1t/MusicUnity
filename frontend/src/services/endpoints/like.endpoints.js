export const LIKE_ENDPOINTS = {
  RECEIVED_COUNT: (userId) => `/likes/user/${userId}/received`,
  GIVEN_COUNT: (userId) => `/likes/user/${userId}/given`,
  RECEIVED_AUTHOR_COUNT: (userId) => `/likes/user/${userId}/received/author`,
  ADD: (reviewId) => `/likes/${reviewId}`,
  REMOVE: (reviewId) => `/likes/${reviewId}`,
  BY_REVIEW: (reviewId) => `/likes/review/${reviewId}`,
  BY_USER: (userId) => `/likes/user/${userId}`
}; 