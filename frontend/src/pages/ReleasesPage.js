import React, { useState, useEffect } from 'react';
import { releaseApi } from '../shared/api/release';
import './ReleasesPage.css';

/**
 * Страница со списком релизов
 */
function ReleasesPage() {
  const [releases, setReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [releaseType, setReleaseType] = useState('Все');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Размер страницы
  const pageSize = 12;
  
  // Типы релизов для фильтрации
  const releaseTypes = ['Все', 'Треки', 'Альбомы', 'EP', 'Синглы'];
  
  /**
   * Загрузка релизов
   */
  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await releaseApi.getNewReleases(currentPage, pageSize);
        
        setReleases(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (err) {
        console.error('Ошибка при загрузке релизов:', err);
        setError('Не удалось загрузить релизы. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReleases();
  }, [currentPage, pageSize]);
  
  /**
   * Обработчик выбора типа релиза
   */
  const handleReleaseTypeSelect = (type) => {
    setReleaseType(type);
    setIsDropdownOpen(false);
    setCurrentPage(0);
    // В реальном приложении здесь нужно отправить запрос с фильтром по типу
  };
  
  /**
   * Обработчик изменения страницы
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  /**
   * Закрытие выпадающего меню при клике вне его
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.filter-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  /**
   * Отображение типа релиза в виде значка
   */
  const getReleaseTypeIcon = (type) => {
    if (type === 'TRACK' || type === 'track') {
      return React.createElement('svg', {
        stroke: 'currentColor',
        fill: 'currentColor',
        strokeWidth: '0',
        viewBox: '0 0 512 512',
        className: 'relative size-4',
        height: '1em',
        width: '1em',
        xmlns: 'http://www.w3.org/2000/svg'
      }, React.createElement('path', {
        d: 'M406.3 48.2c-4.7.9-202 39.2-206.2 40-4.2.8-8.1 3.6-8.1 8v240.1c0 1.6-.1 7.2-2.4 11.7-3.1 5.9-8.5 10.2-16.1 12.7-3.3 1.1-7.8 2.1-13.1 3.3-24.1 5.4-64.4 14.6-64.4 51.8 0 31.1 22.4 45.1 41.7 47.5 2.1.3 4.5.7 7.1.7 6.7 0 36-3.3 51.2-13.2 11-7.2 24.1-21.4 24.1-47.8V190.5c0-3.8 2.7-7.1 6.4-7.8l152-30.7c5-1 9.6 2.8 9.6 7.8v130.9c0 4.1-.2 8.9-2.5 13.4-3.1 5.9-8.5 10.2-16.2 12.7-3.3 1.1-8.8 2.1-14.1 3.3-24.1 5.4-64.4 14.5-64.4 51.7 0 33.7 25.4 47.2 41.8 48.3 6.5.4 11.2.3 19.4-.9s23.5-5.5 36.5-13c17.9-10.3 27.5-26.8 27.5-48.2V55.9c-.1-4.4-3.8-8.9-9.8-7.7z'
      }));
    } else {
      return React.createElement('svg', {
        stroke: 'currentColor',
        fill: 'currentColor',
        strokeWidth: '0',
        viewBox: '0 0 24 24',
        className: 'relative size-4',
        height: '1em',
        width: '1em',
        xmlns: 'http://www.w3.org/2000/svg'
      }, [
        React.createElement('circle', { key: 'circle', cx: '11.99', cy: '11.99', r: '2.01' }),
        React.createElement('path', { key: 'path1', d: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z' }),
        React.createElement('path', { key: 'path2', d: 'M12 6a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4z' })
      ]);
    }
  };
  
  /**
   * Округление чисел для отображения рейтинга
   */
  const formatRating = (rating) => {
    if (!rating) return null;
    return Math.round(rating);
  };

  // Создание пагинации
  const renderPagination = () => {
    const paginationItems = [];
    
    // Добавляем первые 5 страниц
    for (let i = 0; i < Math.min(5, totalPages); i++) {
      paginationItems.push(
        React.createElement('li', { key: i }, 
          React.createElement('a', {
            'aria-current': currentPage === i ? 'page' : undefined,
            className: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${currentPage === i ? 'border border-white/20 bg-background' : ''} hover:bg-accent hover:text-accent-foreground h-10 w-10 max-lg:size-7 max-lg:text-[12px]`,
            href: `/releases?page=${i + 1}`,
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(i);
            }
          }, i + 1)
        )
      );
    }
    
    // Если страниц больше 5, добавляем многоточие и последнюю страницу
    if (totalPages > 5) {
      paginationItems.push(
        React.createElement('span', {
          key: 'ellipsis',
          'aria-hidden': 'true',
          className: 'flex h-7 w-3.5 md:h-9 md:w-9 items-center justify-center'
        }, 
          React.createElement('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: '2',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            className: 'lucide lucide-ellipsis w-3 h-3 md:h-4 md:w-4'
          }, [
            React.createElement('circle', { key: 'c1', cx: '12', cy: '12', r: '1' }),
            React.createElement('circle', { key: 'c2', cx: '19', cy: '12', r: '1' }),
            React.createElement('circle', { key: 'c3', cx: '5', cy: '12', r: '1' })
          ]),
          React.createElement('span', { className: 'sr-only' }, 'Больше страниц')
        )
      );
      
      paginationItems.push(
        React.createElement('li', { key: 'last' }, 
          React.createElement('a', {
            className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 max-lg:size-7 max-lg:text-[12px]',
            href: `/releases?page=${totalPages}`,
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(totalPages - 1);
            }
          }, totalPages)
        )
      );
    }
    
    // Кнопка "Следующая" если не на последней странице
    if (currentPage < totalPages - 1) {
      paginationItems.push(
        React.createElement('li', { key: 'next' }, 
          React.createElement('a', {
            className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 max-md:h-7 max-md:w-7 max-md:p-0 md:pr-2.5 max-lg:text-[12px]',
            'aria-label': 'Go to next page',
            href: `/releases?page=${currentPage + 2}`,
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }
          }, [
            React.createElement('span', { key: 'text', className: 'max-md:hidden' }, 'Следующая'),
            React.createElement('svg', {
              key: 'icon',
              xmlns: 'http://www.w3.org/2000/svg',
              width: '24',
              height: '24',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              className: 'lucide lucide-chevron-right h-4 w-4'
            }, React.createElement('path', { d: 'm9 18 6-6-6-6' }))
          ])
        )
      );
    }
    
    return React.createElement('nav', {
      role: 'navigation',
      'aria-label': 'pagination',
      className: 'mx-auto flex w-full justify-center'
    }, React.createElement('ul', { className: 'flex flex-row items-center gap-1' }, paginationItems));
  };

  // Отрисовка карточки релиза
  const renderReleaseCard = (release) => {
    // Убираем генерацию случайных рейтингов
    return React.createElement('div', {
      key: release.releaseId,
      className: 'bg-opacity-5 hover:bg-opacity-10 bg-white p-1 lg:p-1 overflow-hidden flex flex-col justify-start relative origin-bottom-left w-full h-full rounded-xl border border-zinc-800 group duration-300'
    }, [
      // Обложка и информация релиза
      React.createElement('div', { key: 'cover', className: 'relative z-10' }, 
        React.createElement('a', {
          className: 'relative block',
          href: `/track/${release.releaseId}`
        }, [
          // Обложка релиза
          React.createElement('div', {
            key: 'image-container',
            className: 'aspect-square w-full block rounded-lg overflow-hidden relative'
          }, 
            React.createElement('img', {
              alt: release.title,
              loading: 'lazy',
              decoding: 'async',
              'data-nimg': 'fill',
              className: 'object-cover',
              sizes: '100vw',
              src: release.coverUrl || `/_next/image?url=https%3A%2F%2Fcms.risazatvorchestvo.com%2Fwp-content%2Fuploads%2F2025%2F06%2Fm1000x1000-${release.releaseId % 16 + 1}.jpg&w=3840&q=75`,
              style: {
                position: 'absolute',
                height: '100%',
                width: '100%',
                inset: '0px',
                color: 'transparent'
              }
            })
          ),
          
          // Счетчики комментариев
          release.reviewsCount > 0 || (release.commentCount > 0) ? 
            React.createElement('div', {
              key: 'counters',
              className: 'absolute bottom-1.5 left-1.5 bg-zinc-900 rounded-full px-1.5 flex gap-2 items-center font-semibold text-sm'
            }, [
              release.commentCount > 0 ? 
                React.createElement('div', { key: 'comments', className: 'flex items-center gap-[3px]' }, [
                  React.createElement('svg', {
                    stroke: 'currentColor',
                    fill: 'currentColor',
                    strokeWidth: '0',
                    viewBox: '0 0 24 24',
                    className: 'size-3 lg:size-3',
                    height: '1em',
                    width: '1em',
                    xmlns: 'http://www.w3.org/2000/svg'
                  }, [
                    React.createElement('path', { key: 'p1', d: 'M7 7h10v2H7zm0 4h7v2H7z' }),
                    React.createElement('path', { key: 'p2', d: 'M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z' })
                  ]),
                  React.createElement('span', {}, release.commentCount || 1)
                ]) : null,
                
              release.reviewsCount > 0 ? 
                React.createElement('div', { key: 'reviews', className: 'flex items-center gap-[3px]' }, [
                  React.createElement('svg', {
                    stroke: 'currentColor',
                    fill: 'currentColor',
                    strokeWidth: '0',
                    viewBox: '0 0 24 24',
                    className: 'size-3 lg:size-3',
                    height: '1em',
                    width: '1em',
                    xmlns: 'http://www.w3.org/2000/svg'
                  }, 
                    React.createElement('path', { d: 'M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z' })
                  ),
                  React.createElement('span', {}, release.reviewsCount || 0)
                ]) : null
            ]) : null,
            
          // Иконка типа релиза  
          React.createElement('div', {
            key: 'type-icon',
            className: 'absolute size-6 bottom-1.5 right-1.5 bg-zinc-900 rounded-full flex items-center justify-center'
          }, getReleaseTypeIcon(release.type))
        ])
      ),
      
      // Информация о релизе
      React.createElement('div', { key: 'info', className: 'mb-4 relative z-10' }, [
        React.createElement('a', {
          key: 'title',
          className: 'text-sm w-full dark:text-white antialiased leading-4 mt-1.5 block font-bold',
          href: `/track/${release.releaseId}`
        }, release.title),
        
        React.createElement('div', { key: 'authors', className: 'flex flex-wrap leading-3 mt-1 text-[13px]' }, 
          release.authors && release.authors.map((author, index) => {
            const elements = [
              React.createElement('a', {
                key: `author-${index}`,
                className: 'border-b border-b-white/0 hover:border-white/30 opacity-70',
                href: `/artist/${author.id}`
              }, author.authorName)
            ];
            
            if (index < release.authors.length - 1) {
              elements.push(
                React.createElement('span', { key: `separator-${index}`, className: 'text-muted-foreground' }, ',\u00A0')
              );
            }
            
            return elements;
          })
        )
      ]),
      
      // Рейтинги - Отображаем только если они существуют
      (release.fullReviewRating || release.simpleReviewRating) ? 
        React.createElement('div', { key: 'ratings', className: 'flex justify-between gap-1 items-center mt-auto px-1 pb-1' }, 
          React.createElement('div', { className: 'flex items-center gap-1 text-white' }, [
            // Рейтинг по полным рецензиям (заполненный круг)
            release.fullReviewRating ? 
              React.createElement('div', {
                key: 'full-review-rating',
                className: 'inline-flex size-7 text-xs items-center font-semibold justify-center bg-userColor rounded-full'
              }, formatRating(release.fullReviewRating)) : null,
              
            // Рейтинг по простым рецензиям (только бордер)
            release.simpleReviewRating ? 
              React.createElement('div', {
                key: 'simple-review-rating',
                className: 'inline-flex size-7 text-xs items-center font-semibold justify-center border-2 border-userColor rounded-full px-0 text-center simple-review-rating'
              }, formatRating(release.simpleReviewRating)) : null
          ])
        ) : null
    ]);
  };

  // Основной рендер страницы
  return React.createElement('div', { className: 'site-content min-[1024px]:max-[1500px]:px-6 mb-[30px] lg:mb-[80px] mt-[20px] lg:mt-[30px]' },
    React.createElement('main', {}, [
      React.createElement('div', { key: 'header', className: 'container' }, [
        React.createElement('h1', { key: 'title', className: 'text-lg md:text-xl lg:text-3xl font-bold mb-4 lg:mb-8' }, 'Добавленные Релизы'),
        React.createElement('div', { key: 'filter', className: 'rounded-lg border text-card-foreground shadow-sm p-3 bg-zinc-900 flex items-center gap-5' },
          React.createElement('div', { className: 'md:flex md:items-center' }, [
            React.createElement('div', { key: 'label', className: 'max-md:hidden font-bold text-muted-foreground mr-5 max-md:mb-3 max-md:text-sm' }, 'Тип релизов:'),
            React.createElement('button', {
              key: 'dropdown',
              type: 'button',
              role: 'combobox',
              'aria-controls': 'radix-:r1c4:',
              'aria-expanded': isDropdownOpen,
              'aria-autocomplete': 'none',
              dir: 'ltr',
              'data-state': isDropdownOpen ? 'open' : 'closed',
              className: 'flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-full md:w-[130px]',
              onClick: () => setIsDropdownOpen(!isDropdownOpen)
            }, [
              React.createElement('span', { key: 'text', style: { pointerEvents: 'none' } }, releaseType),
              React.createElement('svg', {
                key: 'icon',
                xmlns: 'http://www.w3.org/2000/svg',
                width: '24',
                height: '24',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: '2',
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                className: 'lucide lucide-chevron-down h-4 w-4 opacity-50',
                'aria-hidden': 'true'
              }, React.createElement('path', { d: 'm6 9 6 6 6-6' }))
            ])
          ])
        )
      ]),
      
      // Контент с релизами
      React.createElement('div', { key: 'content', className: 'container mt-5' },
        React.createElement('div', {},
          React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xl:gap-5 xl:col-span-full' },
            isLoading ? 
              React.createElement('div', { className: 'col-span-full text-center py-8' }, 'Загрузка...') :
            error ? 
              React.createElement('div', { className: 'col-span-full text-center py-8 text-red-500' }, error) :
            releases.length === 0 ?
              React.createElement('div', { className: 'col-span-full text-center py-8' }, 'Релизы не найдены') :
            releases.map(release => renderReleaseCard(release))
          )
        )
      ),
      
      // Пагинация
      React.createElement('div', { key: 'pagination', className: 'mt-10 col-span-full' }, renderPagination())
    ])
  );
}

export default ReleasesPage;