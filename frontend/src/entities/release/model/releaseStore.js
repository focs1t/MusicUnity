import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  releases: [],
  currentRelease: null,
  newReleases: [],
  favoriteReleases: [],
  followedReleases: [],
  authorReleases: {},
  deletedReleases: [],
  loading: false,
  error: null
};

export const releaseSlice = createSlice({
  name: 'release',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadReleasesSuccess: (state, action) => {
      state.releases = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadCurrentReleaseSuccess: (state, action) => {
      state.currentRelease = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadNewReleasesSuccess: (state, action) => {
      state.newReleases = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadFavoriteReleasesSuccess: (state, action) => {
      state.favoriteReleases = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadFollowedReleasesSuccess: (state, action) => {
      state.followedReleases = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadAuthorReleasesSuccess: (state, action) => {
      const { authorId, releases } = action.payload;
      state.authorReleases = {
        ...state.authorReleases,
        [authorId]: releases
      };
      state.loading = false;
      state.error = null;
    },
    loadDeletedReleasesSuccess: (state, action) => {
      state.deletedReleases = action.payload;
      state.loading = false;
      state.error = null;
    },
    addToFavoritesSuccess: (state, action) => {
      state.favoriteReleases = [...state.favoriteReleases, action.payload];
      state.loading = false;
      state.error = null;
    },
    removeFromFavoritesSuccess: (state, action) => {
      state.favoriteReleases = state.favoriteReleases.filter(
        release => release.releaseId !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
    createReleaseSuccess: (state, action) => {
      state.releases = [...state.releases, action.payload];
      state.loading = false;
      state.error = null;
    },
    updateReleaseSuccess: (state, action) => {
      if (state.currentRelease?.releaseId === action.payload.releaseId) {
        state.currentRelease = action.payload;
      }
      state.releases = state.releases.map(release => 
        release.releaseId === action.payload.releaseId ? action.payload : release
      );
      state.loading = false;
      state.error = null;
    },
    deleteReleaseSuccess: (state, action) => {
      state.releases = state.releases.filter(release => release.releaseId !== action.payload);
      state.loading = false;
      state.error = null;
    },
    restoreReleaseSuccess: (state, action) => {
      state.deletedReleases = state.deletedReleases.filter(
        release => release.releaseId !== action.payload.releaseId
      );
      state.releases = [...state.releases, action.payload];
      state.loading = false;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentRelease: (state) => {
      state.currentRelease = null;
    }
  }
});

export const {
  startLoading,
  loadReleasesSuccess,
  loadCurrentReleaseSuccess,
  loadNewReleasesSuccess,
  loadFavoriteReleasesSuccess,
  loadFollowedReleasesSuccess,
  loadAuthorReleasesSuccess,
  loadDeletedReleasesSuccess,
  addToFavoritesSuccess,
  removeFromFavoritesSuccess,
  createReleaseSuccess,
  updateReleaseSuccess,
  deleteReleaseSuccess,
  restoreReleaseSuccess,
  requestFailure,
  clearCurrentRelease
} = releaseSlice.actions;

export default releaseSlice.reducer; 