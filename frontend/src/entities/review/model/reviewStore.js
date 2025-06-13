import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reviews: [],
  currentReview: null,
  userReviews: {},
  releaseReviews: {},
  popularReviews: [],
  deletedReviews: [],
  loading: false,
  error: null
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadReviewsSuccess: (state, action) => {
      state.reviews = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadCurrentReviewSuccess: (state, action) => {
      state.currentReview = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadUserReviewsSuccess: (state, action) => {
      const { userId, reviews } = action.payload;
      state.userReviews = {
        ...state.userReviews,
        [userId]: reviews
      };
      state.loading = false;
      state.error = null;
    },
    loadReleaseReviewsSuccess: (state, action) => {
      const { releaseId, reviews } = action.payload;
      state.releaseReviews = {
        ...state.releaseReviews,
        [releaseId]: reviews
      };
      state.loading = false;
      state.error = null;
    },
    loadPopularReviewsSuccess: (state, action) => {
      state.popularReviews = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadDeletedReviewsSuccess: (state, action) => {
      state.deletedReviews = action.payload;
      state.loading = false;
      state.error = null;
    },
    createReviewSuccess: (state, action) => {
      state.reviews = [...state.reviews, action.payload];
      const releaseId = action.payload.releaseId;
      if (state.releaseReviews[releaseId]) {
        state.releaseReviews = {
          ...state.releaseReviews,
          [releaseId]: [...state.releaseReviews[releaseId], action.payload]
        };
      }
      state.loading = false;
      state.error = null;
    },
    updateReviewSuccess: (state, action) => {
      if (state.currentReview?.reviewId === action.payload.reviewId) {
        state.currentReview = action.payload;
      }
      state.reviews = state.reviews.map(review => 
        review.reviewId === action.payload.reviewId ? action.payload : review
      );
      
      const releaseId = action.payload.releaseId;
      if (state.releaseReviews[releaseId]) {
        state.releaseReviews = {
          ...state.releaseReviews,
          [releaseId]: state.releaseReviews[releaseId].map(review => 
            review.reviewId === action.payload.reviewId ? action.payload : review
          )
        };
      }
      
      state.loading = false;
      state.error = null;
    },
    deleteReviewSuccess: (state, action) => {
      state.reviews = state.reviews.filter(review => review.reviewId !== action.payload);
      
      const deletedReview = state.reviews.find(review => review.reviewId === action.payload);
      if (deletedReview) {
        const releaseId = deletedReview.releaseId;
        if (state.releaseReviews[releaseId]) {
          state.releaseReviews = {
            ...state.releaseReviews,
            [releaseId]: state.releaseReviews[releaseId].filter(
              review => review.reviewId !== action.payload
            )
          };
        }
      }
      
      state.loading = false;
      state.error = null;
    },
    restoreReviewSuccess: (state, action) => {
      state.deletedReviews = state.deletedReviews.filter(
        review => review.reviewId !== action.payload.reviewId
      );
      state.reviews = [...state.reviews, action.payload];
      
      const releaseId = action.payload.releaseId;
      if (state.releaseReviews[releaseId]) {
        state.releaseReviews = {
          ...state.releaseReviews,
          [releaseId]: [...state.releaseReviews[releaseId], action.payload]
        };
      }
      
      state.loading = false;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    }
  }
});

export const {
  startLoading,
  loadReviewsSuccess,
  loadCurrentReviewSuccess,
  loadUserReviewsSuccess,
  loadReleaseReviewsSuccess,
  loadPopularReviewsSuccess,
  loadDeletedReviewsSuccess,
  createReviewSuccess,
  updateReviewSuccess,
  deleteReviewSuccess,
  restoreReviewSuccess,
  requestFailure,
  clearCurrentReview
} = reviewSlice.actions;

export default reviewSlice.reducer; 