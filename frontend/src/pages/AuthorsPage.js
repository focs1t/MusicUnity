import React, { useState } from 'react';
import './AuthorsPage.css';

const AuthorsPage = () => {
  const [selectedType, setSelectedType] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const authorTypes = [
    { value: 'all', label: 'Все' },
    { value: 'producers', label: 'Продюссеры' },
    { value: 'performers', label: 'Исполнители' }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setIsTypeDropdownOpen(false);
  };

  const toggleTypeDropdown = () => {
    setIsTypeDropdownOpen(!isTypeDropdownOpen);
  };

  return (
    <div className="site-content authors-page">
      <main className="">
        <div className="container">
          <h1 className="authors-title">Авторы</h1>
          
          <div className="filter-card">
            <div className="filter-content">
              <div className="filter-row">
                <div className="filter-controls">
                  <div className="dropdown-wrapper">
                    <button 
                      type="button" 
                      className={`dropdown-trigger ${isTypeDropdownOpen ? 'open' : ''}`}
                      onClick={toggleTypeDropdown}
                      aria-expanded={isTypeDropdownOpen}
                    >
                      <span className="dropdown-text">
                        {selectedType ? authorTypes.find(type => type.value === selectedType)?.label : 'Выберите тип автора'}
                      </span>
                      <svg 
                        className="dropdown-arrow" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </button>
                    
                    {isTypeDropdownOpen && (
                      <div className="dropdown-menu">
                        {authorTypes.map((type) => (
                          <button
                            key={type.value}
                            className="dropdown-item"
                            onClick={() => handleTypeSelect(type.value)}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthorsPage; 