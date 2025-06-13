import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reviewLikes: {},
  loading: false,
  error: null
};

export const likeSlice = createSlice({
  name: 'like',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadReviewLikesSuccess: (state, action) => {
      const { reviewId, likes } = action.payload;
      state.reviewLikes = {
        ...state.reviewLikes,
        [reviewId]: likes
      };
      state.loading = false;
      state.error = null;
    },
    addLikeSuccess: (state, action) => {
      const { reviewId, like } = action.payload;
      if (state.reviewLikes[reviewId]) {
        state.reviewLikes = {
          ...state.reviewLikes,
          [reviewId]: [...state.reviewLikes[reviewId], like]
        };
      } else {
        state.reviewLikes = {
          ...state.reviewLikes,
          [reviewId]: [like]
        };
      }
      state.loading = false;
      state.error = null;
    },
    removeLikeSuccess: (state, action) => {
      const { reviewId, likeId } = action.payload;
      if (state.reviewLikes[reviewId]) {
        state.reviewLikes = {
          ...state.reviewLikes,
          [reviewId]: state.reviewLikes[reviewId].filter(like => like.likeId !== likeId)
        };
      }
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
  loadReviewLikesSuccess,
  addLikeSuccess,
  removeLikeSuccess,
  requestFailure
} = likeSlice.actions;

export default likeSlice.reducer; 