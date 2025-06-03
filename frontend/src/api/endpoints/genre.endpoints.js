export const GENRE_ENDPOINTS = {
  GET_BY_ID: (id) => `/genres/${id}`,
  GET_ALL: '/genres',
  CREATE: '/genres',
  UPDATE: (id) => `/genres/${id}`,
  DELETE: (id) => `/genres/${id}`,
  GET_RELEASES: (genreId) => `/genres/${genreId}/releases`,
  GET_POPULAR: '/genres/popular',
  GET_STATISTICS: (genreId) => `/genres/${genreId}/statistics`
}; 