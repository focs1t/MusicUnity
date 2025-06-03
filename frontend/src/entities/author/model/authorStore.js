import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  authors: [],
  currentAuthor: null,
  followedAuthors: [],
  artists: [],
  producers: [],
  deletedAuthors: [],
  loading: false,
  error: null
};

export const authorSlice = createSlice({
  name: 'author',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadAuthorsSuccess: (state, action) => {
      state.authors = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadCurrentAuthorSuccess: (state, action) => {
      state.currentAuthor = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadFollowedAuthorsSuccess: (state, action) => {
      state.followedAuthors = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadArtistsSuccess: (state, action) => {
      state.artists = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadProducersSuccess: (state, action) => {
      state.producers = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadDeletedAuthorsSuccess: (state, action) => {
      state.deletedAuthors = action.payload;
      state.loading = false;
      state.error = null;
    },
    followAuthorSuccess: (state, action) => {
      state.followedAuthors = [...state.followedAuthors, action.payload];
      state.loading = false;
      state.error = null;
    },
    unfollowAuthorSuccess: (state, action) => {
      state.followedAuthors = state.followedAuthors.filter(
        author => author.authorId !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
    createAuthorSuccess: (state, action) => {
      state.authors = [...state.authors, action.payload];
      state.loading = false;
      state.error = null;
    },
    updateAuthorSuccess: (state, action) => {
      if (state.currentAuthor?.authorId === action.payload.authorId) {
        state.currentAuthor = action.payload;
      }
      state.authors = state.authors.map(author => 
        author.authorId === action.payload.authorId ? action.payload : author
      );
      state.loading = false;
      state.error = null;
    },
    deleteAuthorSuccess: (state, action) => {
      state.authors = state.authors.filter(author => author.authorId !== action.payload);
      state.loading = false;
      state.error = null;
    },
    restoreAuthorSuccess: (state, action) => {
      state.deletedAuthors = state.deletedAuthors.filter(
        author => author.authorId !== action.payload.authorId
      );
      state.authors = [...state.authors, action.payload];
      state.loading = false;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentAuthor: (state) => {
      state.currentAuthor = null;
    }
  }
});

export const {
  startLoading,
  loadAuthorsSuccess,
  loadCurrentAuthorSuccess,
  loadFollowedAuthorsSuccess,
  loadArtistsSuccess,
  loadProducersSuccess,
  loadDeletedAuthorsSuccess,
  followAuthorSuccess,
  unfollowAuthorSuccess,
  createAuthorSuccess,
  updateAuthorSuccess,
  deleteAuthorSuccess,
  restoreAuthorSuccess,
  requestFailure,
  clearCurrentAuthor
} = authorSlice.actions;

export default authorSlice.reducer; 