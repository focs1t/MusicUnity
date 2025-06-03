export const GENRE_ENDPOINTS = {
  GET_ALL: '/genres',
  GET_BY_ID: (id) => `/genres/${id}`,
  CREATE: '/genres',
  UPDATE: (id) => `/genres/${id}`,
  DELETE: (id) => `/genres/${id}`
}; 