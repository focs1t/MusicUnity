import React from 'react';
import { LoadingSpinner } from '../LoadingSpinner';

/**
 * Компонент-обертка для автоматического отображения состояния загрузки
 * @param {Object} props
 * @param {boolean} props.loading - состояние загрузки
 * @param {string} props.error - текст ошибки
 * @param {React.ReactNode} props.children - дочерние элементы
 * @param {string} props.loadingText - текст загрузки
 * @param {string} props.loadingSize - размер спиннера
 * @param {string} props.className - дополнительный CSS класс
 * @param {React.ReactNode} props.fallback - кастомный компонент загрузки
 * @param {React.ReactNode} props.errorComponent - кастомный компонент ошибки
 */
const LoadingWrapper = ({
  loading,
  error,
  children,
  loadingText = 'Загрузка...',
  loadingSize = 'medium',
  className = 'loading-container--center',
  fallback = null,
  errorComponent = null
}) => {
  if (loading) {
    return fallback || (
      <LoadingSpinner 
        text={loadingText}
        size={loadingSize}
        className={className}
      />
    );
  }

  if (error) {
    return errorComponent || (
      <div className="error-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '200px',
        color: '#ef4444',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Произошла ошибка</h3>
        <p style={{ color: '#a1a1aa' }}>{error}</p>
      </div>
    );
  }

  return children;
};

export default LoadingWrapper; 