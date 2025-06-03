export const USER_ENDPOINTS = {
  GET_BY_ID: (id) => `/users/${id}`,
  FIND_BY_USERNAME: (username) => `/users/username/${username}`,
  SEARCH: '/users/search',
  FIND_BY_ROLE: (role) => `/users/role/${role}`,
  BLOCKED: '/users/blocked',
  FAVORITES: (userId) => `/users/${userId}/favorites`,
  FOLLOWED_AUTHORS: (userId) => `/users/${userId}/followed-authors`,
  FOLLOWED_AUTHORS_RELEASES: (userId) => `/users/${userId}/followed-authors/releases`
}; 