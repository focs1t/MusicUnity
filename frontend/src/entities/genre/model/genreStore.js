import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  genres: [],
  loading: false,
  error: null
};

export const genreSlice = createSlice({
  name: 'genre',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadGenresSuccess: (state, action) => {
      state.genres = action.payload;
      state.loading = false;
      state.error = null;
    },
    createGenreSuccess: (state, action) => {
      state.genres = [...state.genres, action.payload];
      state.loading = false;
      state.error = null;
    },
    updateGenreSuccess: (state, action) => {
      state.genres = state.genres.map(genre => 
        genre.genreId === action.payload.genreId ? action.payload : genre
      );
      state.loading = false;
      state.error = null;
    },
    deleteGenreSuccess: (state, action) => {
      state.genres = state.genres.filter(genre => genre.genreId !== action.payload);
      state.loading = false;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  startLoading,
  loadGenresSuccess,
  createGenreSuccess,
  updateGenreSuccess,
  deleteGenreSuccess,
  requestFailure
} = genreSlice.actions;

export default genreSlice.reducer; 