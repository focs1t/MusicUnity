export const AUTHOR_ENDPOINTS = {
  GET_ALL: '/authors',
  SEARCH: '/authors/search',
  GET_BY_ID: (id) => `/authors/${id}`,
  GET_BY_NAME: (name) => `/authors/name/${name}`,
  CREATE: '/authors',
  UPDATE: (id) => `/authors/${id}`,
  DELETE: (id) => `/authors/${id}`,
  FOLLOW: (id) => `/authors/${id}/follow`,
  UNFOLLOW: (id) => `/authors/${id}/follow`
}; 