import { createSlice } from '@reduxjs/toolkit';
import { ReportStatus } from './types';

const initialState = {
  reports: [],
  pendingReports: [],
  resolvedReports: [],
  rejectedReports: [],
  loading: false,
  error: null
};

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadReportsSuccess: (state, action) => {
      state.reports = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadPendingReportsSuccess: (state, action) => {
      state.pendingReports = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadResolvedReportsSuccess: (state, action) => {
      state.resolvedReports = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadRejectedReportsSuccess: (state, action) => {
      state.rejectedReports = action.payload;
      state.loading = false;
      state.error = null;
    },
    createReportSuccess: (state, action) => {
      state.reports = [...state.reports, action.payload];
      state.pendingReports = [...state.pendingReports, action.payload];
      state.loading = false;
      state.error = null;
    },
    resolveReportSuccess: (state, action) => {
      const updatedReport = {
        ...action.payload,
        status: ReportStatus.RESOLVED
      };
      
      state.reports = state.reports.map(report => 
        report.reportId === updatedReport.reportId ? updatedReport : report
      );
      
      state.pendingReports = state.pendingReports.filter(
        report => report.reportId !== updatedReport.reportId
      );
      
      state.resolvedReports = [...state.resolvedReports, updatedReport];
      
      state.loading = false;
      state.error = null;
    },
    rejectReportSuccess: (state, action) => {
      const updatedReport = {
        ...action.payload,
        status: ReportStatus.REJECTED
      };
      
      state.reports = state.reports.map(report => 
        report.reportId === updatedReport.reportId ? updatedReport : report
      );
      
      state.pendingReports = state.pendingReports.filter(
        report => report.reportId !== updatedReport.reportId
      );
      
      state.rejectedReports = [...state.rejectedReports, updatedReport];
      
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
  loadReportsSuccess,
  loadPendingReportsSuccess,
  loadResolvedReportsSuccess,
  loadRejectedReportsSuccess,
  createReportSuccess,
  resolveReportSuccess,
  rejectReportSuccess,
  requestFailure
} = reportSlice.actions;

export default reportSlice.reducer; 