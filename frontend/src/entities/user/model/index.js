import userReducer, {
  startLoading,
  loadCurrentUserSuccess,
  loadProfileSuccess,
  requestFailure,
  updateProfileSuccess,
  clearProfile
} from './userStore';

import {
  fetchCurrentUser,
  fetchUserById,
  fetchUserByUsername,
  updateUserProfile,
  changeUserPassword,
  searchUsers
} from './userOperations';

import { UserRole } from './types';

export {
  // Reducer
  userReducer,
  
  // Actions
  startLoading,
  loadCurrentUserSuccess,
  loadProfileSuccess,
  requestFailure,
  updateProfileSuccess,
  clearProfile,
  
  // Operations
  fetchCurrentUser,
  fetchUserById,
  fetchUserByUsername,
  updateUserProfile,
  changeUserPassword,
  searchUsers,
  
  // Types
  UserRole
}; 