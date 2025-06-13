import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Загрузка...', 
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium', 
    large: 'loading-spinner--large'
  };

  if (fullScreen) {
    return (
      <div className={`loading-fullscreen ${className}`}>
        <div className="loading-content">
          <div className={`loading-spinner ${sizeClasses[size]}`}>
            <div className="spinner"></div>
          </div>
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-container ${className}`}>
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <div className="spinner"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner; 