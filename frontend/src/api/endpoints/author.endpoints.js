export const AUTHOR_ENDPOINTS = {
  GET_BY_ID: (id) => `/authors/${id}`,
  SEARCH: '/authors/search',
  CREATE: '/authors',
  UPDATE: (id) => `/authors/${id}`,
  DELETE: (id) => `/authors/${id}`,
  GET_RELEASES: (authorId) => `/authors/${authorId}/releases`,
  GET_POPULAR: '/authors/popular',
  GET_LATEST: '/authors/latest',
  GET_RECOMMENDED: '/authors/recommended',
  TOGGLE_FOLLOW: (authorId) => `/authors/${authorId}/follow`,
  GET_FOLLOWERS: (authorId) => `/authors/${authorId}/followers`,
  GET_STATISTICS: (authorId) => `/authors/${authorId}/statistics`
}; 