export const RELEASE_ENDPOINTS = {
  GET_BY_ID: (id) => `/releases/${id}`,
  SEARCH: '/releases/search',
  CREATE: '/releases',
  UPDATE: (id) => `/releases/${id}`,
  DELETE: (id) => `/releases/${id}`,
  GET_BY_AUTHOR: (authorId) => `/releases/author/${authorId}`,
  GET_BY_GENRE: (genreId) => `/releases/genre/${genreId}`,
  GET_POPULAR: '/releases/popular',
  GET_LATEST: '/releases/latest',
  GET_RECOMMENDED: '/releases/recommended',
  GET_REVIEWS: (releaseId) => `/releases/${releaseId}/reviews`,
  ADD_REVIEW: (releaseId) => `/releases/${releaseId}/reviews`,
  TOGGLE_LIKE: (releaseId) => `/releases/${releaseId}/like`,
  ADD_TO_FAVORITES: (releaseId) => `/releases/${releaseId}/favorite`
}; 