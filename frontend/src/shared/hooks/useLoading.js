import { useState } from 'react';

/**
 * Хук для управления состоянием загрузки
 * @param {boolean} initialState - начальное состояние загрузки
 * @returns {Object} объект с состоянием и методами управления
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const startLoading = () => {
    setLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const setLoadingError = (errorMessage) => {
    setLoading(false);
    setError(errorMessage);
  };

  const withLoading = async (asyncFunction) => {
    try {
      startLoading();
      const result = await asyncFunction();
      stopLoading();
      return result;
    } catch (err) {
      setLoadingError(err.message || 'Произошла ошибка');
      throw err;
    }
  };

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    withLoading
  };
}; 