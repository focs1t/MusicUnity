import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  audits: [],
  loading: false,
  error: null
};

export const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadAuditsSuccess: (state, action) => {
      state.audits = action.payload;
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
  loadAuditsSuccess,
  requestFailure
} = auditSlice.actions;

export default auditSlice.reducer; 