import React, { useState, useEffect } from 'react';
import { useAuth } from '../app/providers/AuthProvider';
import { releaseApi } from '../shared/api/release';
import './ReleasesPage.css';

function FollowingReleasesPage() {
  const [releases, setReleases] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [releaseType, setReleaseType] = useState('Все');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuth } = useAuth();
  
  // Типы релизов для фильтрации
  const releaseTypes = ['Все', 'Альбомы', 'Синглы/EP'];

  useEffect(() => {
    if (!isAuth) return;
    fetchReleases();
  }, [isAuth, currentPage, releaseType]);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const response = await releaseApi.getReleasesByFollowedAuthors(currentPage, 30);
      
      // Фильтрация релизов по типу
      let filteredReleases = response.content || [];
      if (releaseType !== 'Все') {
        filteredReleases = filteredReleases.filter(release => {
          const releaseTypeUpper = release.type?.toUpperCase();
          if (releaseType === 'Альбомы') {
            return releaseTypeUpper === 'ALBUM';
          } else if (releaseType === 'Синглы/EP') {
            return releaseTypeUpper === 'SINGLE' || releaseTypeUpper === 'EP';
          }
          return false;
        });
      }
      
      setReleases(filteredReleases);
      setTotalPages(response.totalPages || 0);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке релизов отслеживаемых авторов:', err);
      setError('Не удалось загрузить релизы. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Обработчик выбора типа релиза
   */
  const handleReleaseTypeSelect = (type) => {
    setReleaseType(type);
    setIsDropdownOpen(false);
    setCurrentPage(0);
  };

  /**
   * Закрытие выпадающего меню при клике вне его
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('[data-dropdown-wrapper]')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const getReleaseTypeIcon = (type) => {
    // Преобразуем тип к верхнему регистру для единообразия сравнения
    const upperType = typeof type === 'string' ? type.toUpperCase() : '';
    
    if (upperType === 'SINGLE' || upperType === 'EP') {
      // Иконка для синглов и EP - нота (как MusicNoteIcon)
      return React.createElement('svg', {
        stroke: 'currentColor',
        fill: 'currentColor',
        strokeWidth: '0',
        viewBox: '0 0 24 24',
        className: 'relative size-4',
        height: '1em',
        width: '1em',
        xmlns: 'http://www.w3.org/2000/svg'
      }, React.createElement('path', {
        d: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'
      }));
    } else if (upperType === 'ALBUM') {
      // Иконка для альбомов - диск (как AlbumIcon)
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
        React.createElement('path', { key: 'path1', d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z' }),
        React.createElement('circle', { key: 'circle', cx: '12', cy: '12', r: '2.5' })
      ]);
    } else if (upperType === 'TRACK') {
      // Иконка для треков - нота (как было раньше)
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
      // Для всех остальных типов релизов - круг с точкой (как было раньше)
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

  const formatRating = (rating) => {
    return rating !== null && rating !== undefined ? Math.round(rating).toString() : '0';
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(0, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages));
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Добавляем кнопку "Предыдущая" если не на первой странице
    if (currentPage > 0) {
      pages.push(
        React.createElement('li', { key: 'prev' }, 
          React.createElement('a', {
            className: 'pagination-button prev-next',
            'aria-label': 'Go to previous page',
            href: `/following-releases?page=${currentPage}`,
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }
          }, [
            React.createElement('svg', {
              key: 'prev-icon',
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }, React.createElement('path', { d: 'm15 18-6-6 6-6' })),
            React.createElement('span', {
              key: 'prev-text',
              className: 'prev-next-text'
            }, 'Предыдущая')
          ])
        )
      );
    }

    // Добавляем кнопки страниц
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        React.createElement('li', { key: i },
          React.createElement('a', {
            'aria-current': currentPage === i ? 'page' : undefined,
            className: `pagination-button ${currentPage === i ? 'active' : ''}`,
            href: `/following-releases?page=${i + 1}`,
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(i);
            }
          }, i + 1)
        )
      );
    }

    // Добавляем кнопку "Следующая" если не на последней странице
    if (currentPage < totalPages - 1) {
      pages.push(
        React.createElement('li', { key: 'next' }, 
          React.createElement('a', {
            className: 'pagination-button prev-next',
            'aria-label': 'Go to next page',
            href: `/following-releases?page=${currentPage + 2}`,
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }
          }, [
            React.createElement('span', {
              key: 'next-text',
              className: 'prev-next-text'
            }, 'Следующая'),
            React.createElement('svg', {
              key: 'next-icon',
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }, React.createElement('path', { d: 'm9 18 6-6-6-6' }))
          ])
        )
      );
    }

    return React.createElement('div', { className: 'pagination-container' },
      React.createElement('nav', {
        role: 'navigation',
        'aria-label': 'pagination',
        className: 'pagination-nav'
      }, 
        React.createElement('ul', { className: 'pagination-list' }, pages)
      )
    );
  };

  // Отрисовка карточки релиза
  const renderReleaseCard = (release) => {
    return React.createElement('div', {
      key: release.releaseId,
      className: 'release-card group'
    }, [
      // Обложка и информация релиза
      React.createElement('div', { key: 'cover', className: 'relative z-10' }, 
        React.createElement('a', {
          className: 'relative block',
          href: `/release/${release.releaseId}`
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
          
          // Счетчики комментариев и рецензий
          release.extendedReviewsCount > 0 || release.simpleReviewsCount > 0 ? 
            React.createElement('div', {
              key: 'counters',
              className: 'absolute bottom-1.5 left-1.5 bg-zinc-900 rounded-full px-1.5 flex gap-2 items-center font-semibold text-sm'
            }, [
              release.extendedReviewsCount > 0 ? 
                React.createElement('div', { key: 'extended-reviews', className: 'flex items-center gap-[3px]' }, [
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
                  React.createElement('span', {}, release.extendedReviewsCount || 0)
                ]) : null,
                
              release.simpleReviewsCount > 0 ? 
                React.createElement('div', { key: 'simple-reviews', className: 'flex items-center gap-[3px]' }, [
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
                  React.createElement('span', {}, release.simpleReviewsCount || 0)
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
          href: `/release/${release.releaseId}`
        }, release.title),
        
        React.createElement('div', { key: 'authors', className: 'flex flex-wrap leading-3 mt-1 text-[13px]' }, 
          release.authors && release.authors.map((author, index) => {
            const elements = [
              React.createElement('a', {
                key: `author-${index}`,
                className: 'border-b border-b-white/0 hover:border-white/30 opacity-70',
                href: `/author/${author.id}`
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
                className: 'inline-flex size-7 text-xs items-center font-semibold justify-center border-2 border-userColor rounded-full'
              }, formatRating(release.simpleReviewRating)) : null
          ])
        ) : null
    ]);
  };

  if (loading) {
    return React.createElement('div', { className: 'site-content' },
      React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'text-center py-8' },
          React.createElement('div', { className: 'text-lg' }, 'Загрузка...')
        )
      )
    );
  }

  if (error) {
    return React.createElement('div', { className: 'site-content' },
      React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'text-center py-8' },
          React.createElement('div', { className: 'text-lg text-red-500' }, error)
        )
      )
    );
  }

  if (releases.length === 0) {
    return React.createElement('div', { className: 'site-content' },
      React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'text-center py-8' }, [
          React.createElement('h1', { 
            key: 'title',
            className: 'text-lg md:text-xl lg:text-3xl font-bold mb-4 lg:mb-8' 
          }, 'Релизы отслеживаемых авторов'),
          React.createElement('div', { key: 'empty-message', className: 'text-lg' }, 'У отслеживаемых вами авторов пока нет новых релизов.'),
          React.createElement('div', { key: 'help-text', className: 'text-sm text-muted-foreground mt-2' }, 'Подпишитесь на любимых авторов, чтобы не пропустить их новые релизы.')
        ])
      )
    );
  }

  return React.createElement('div', { className: 'site-content' },
    React.createElement('div', { className: 'container' }, [
      // Заголовок
      React.createElement('h1', { 
        key: 'title',
        className: 'text-lg md:text-xl lg:text-3xl font-bold mb-4 lg:mb-8' 
      }, 'Релизы отслеживаемых авторов'),
      
      // Фильтр
      React.createElement('div', { key: 'filter', className: 'releases-filter' },
        React.createElement('div', { className: 'filter-content' }, [
          React.createElement('div', { key: 'label', className: 'filter-label' }, 'Тип релизов:'),
          React.createElement('div', { key: 'dropdown-wrapper', className: 'dropdown-wrapper', 'data-dropdown-wrapper': true }, [
            React.createElement('button', {
              key: 'dropdown',
              type: 'button',
              role: 'combobox',
              'aria-expanded': isDropdownOpen,
              'aria-autocomplete': 'none',
              dir: 'ltr',
              'data-state': isDropdownOpen ? 'open' : 'closed',
              className: 'filter-dropdown',
              onClick: () => setIsDropdownOpen(!isDropdownOpen)
            }, [
              React.createElement('span', { key: 'text', className: 'dropdown-text' }, releaseType),
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
                className: 'dropdown-icon',
                'aria-hidden': 'true'
              }, React.createElement('path', { d: 'm6 9 6 6 6-6' }))
            ]),
            // Выпадающее меню
            isDropdownOpen ? React.createElement('div', {
              key: 'menu',
              className: 'dropdown-menu'
            }, React.createElement('ul', { className: 'dropdown-list' },
              releaseTypes.map(type => React.createElement('li', {
                key: type,
                className: `dropdown-item ${type === releaseType ? 'selected' : ''}`,
                onClick: () => handleReleaseTypeSelect(type)
              }, type))
            )) : null
          ])
        ])
      ),
      
      // Сетка релизов
      React.createElement('div', {
        key: 'grid',
        className: 'releases-grid mt-5'
      }, releases.map(renderReleaseCard)),
      
      // Пагинация
      React.createElement('div', {
        key: 'pagination',
        className: 'mt-10 col-span-full flex justify-center'
      }, renderPagination())
    ])
  );
}

export default FollowingReleasesPage;