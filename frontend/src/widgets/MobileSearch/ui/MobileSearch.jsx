import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MobileSearch.module.css';

// Иконки
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export const MobileSearch = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Фокус на поле поиска при раскрытии
  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  // Закрытие при нажатии Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;

    const searchPath = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    navigate(searchPath);
    handleClose();
  };

  const handleClose = () => {
    setIsExpanded(false);
    setSearchQuery('');
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  if (!isExpanded) {
    return (
      <button 
        className={styles.searchButton}
        onClick={handleExpand}
        aria-label="Открыть поиск"
      >
        <SearchIcon />
      </button>
    );
  }

  return (
    <div className={styles.searchContainer}>
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.searchInputWrapper}>
          <SearchIcon className={styles.searchIcon} />
          <input
            ref={searchInputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Закрыть поиск"
          >
            <CloseIcon />
          </button>
        </div>
      </form>
    </div>
  );
}; 