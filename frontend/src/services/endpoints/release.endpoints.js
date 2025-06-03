export const RELEASE_ENDPOINTS = {
  GET_BY_ID: (id) => `/releases/${id}`,
  NEW: '/releases/new',
  CREATE: '/releases',
  CREATE_OWN: '/releases/own',
  UPDATE: (id) => `/releases/${id}`,
  DELETE: (id) => `/releases/${id}`,
  ADD_TO_FAVORITES: (id) => `/releases/${id}/favorite`,
  REMOVE_FROM_FAVORITES: (id) => `/releases/${id}/favorite`,
  BY_TYPE: (type) => `/releases/type/${type}`,
  BY_AUTHOR: (authorId) => `/releases/author/${authorId}`,
  BY_GENRE: (genreId) => `/releases/genre/${genreId}`
}; 
 