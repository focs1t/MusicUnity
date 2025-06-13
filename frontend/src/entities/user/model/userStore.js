import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  profile: null,
  users: [],
  blockedUsers: [],
  moderators: [],
  loading: false,
  error: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadCurrentUserSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadProfileSuccess: (state, action) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadUsersSuccess: (state, action) => {
      state.users = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadBlockedUsersSuccess: (state, action) => {
      state.blockedUsers = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadModeratorsSuccess: (state, action) => {
      state.moderators = action.payload;
      state.loading = false;
      state.error = null;
    },

    updateProfileSuccess: (state, action) => {
      state.currentUser = action.payload;
      if (state.profile?.userId === action.payload.userId) {
        state.profile = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    changePasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    banUserSuccess: (state, action) => {
      state.users = state.users.map(user => 
        user.userId === action.payload.userId ? { ...user, isBlocked: true } : user
      );
      state.blockedUsers = [...state.blockedUsers, action.payload];
      state.loading = false;
      state.error = null;
    },
    unbanUserSuccess: (state, action) => {
      state.users = state.users.map(user => 
        user.userId === action.payload.userId ? { ...user, isBlocked: false } : user
      );
      state.blockedUsers = state.blockedUsers.filter(user => user.userId !== action.payload.userId);
      state.loading = false;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.currentUser = null;
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  startLoading,
  loginSuccess,
  loadCurrentUserSuccess,
  loadProfileSuccess,
  loadUsersSuccess,
  loadBlockedUsersSuccess,
  loadModeratorsSuccess,
  updateProfileSuccess,
  changePasswordSuccess,
  banUserSuccess,
  unbanUserSuccess,
  logoutSuccess,
  requestFailure,
  clearProfile,
  clearError
} = userSlice.actions;

export default userSlice.reducer; 