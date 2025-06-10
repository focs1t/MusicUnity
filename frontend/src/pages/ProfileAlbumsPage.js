import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { userApi } from '../shared/api/user';
import './ReleasesPage.css';

/**
 * Страница с альбомами пользователя
 */
function ProfileAlbumsPage() {
  const [releases, setReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Размер страницы
  const pageSize = 12;
  
  /**
   * Загрузка альбомов пользователя
   */
  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Загружаем избранные релизы пользователя
        const response = await userApi.getFavoriteReleases(userId, currentPage, pageSize);
        
        // Фильтруем только альбомы
        const albumReleases = response.content.filter(release => {
          const releaseTypeUpper = release.type?.toUpperCase();
          return releaseTypeUpper === 'ALBUM';
        });
        
        setReleases(albumReleases);
        setTotalPages(response.totalPages);
        setTotalElements(albumReleases.length);
      } catch (err) {
        console.error('Ошибка при загрузке альбомов:', err);
        setError('Не удалось загрузить альбомы. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchReleases();
    }
  }, [currentPage, pageSize, userId]);

  // Загрузка информации о пользователе
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userApi.getUserDetails(userId);
        setUserDetails(userData);
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Получение номера страницы из URL при загрузке
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pageParam = queryParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10) - 1); // URL использует 1-based индекс
    }
  }, [location.search]);
  
  /**
   * Обработчик изменения страницы
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    navigate(`/profile/${userId}/albums?page=${newPage + 1}`); // URL использует 1-based индекс
    window.scrollTo(0, 0);
  };
  
  /**
   * Отображение типа релиза в виде значка
   */
  const getReleaseTypeIcon = (type) => {
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
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    // Определяем диапазон видимых страниц
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Корректируем начальную страницу если диапазон слишком мал
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Добавляем кнопку "Предыдущая" если не на первой странице
    if (currentPage > 0) {
      pages.push(
        React.createElement('li', { key: 'prev' }, 
          React.createElement('a', {
            href: `/profile/${userId}/albums?page=${currentPage}`,
            'aria-label': 'Перейти на предыдущую страницу',
            className: 'pagination-button prev-next',
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
    
    // Показываем первую страницу если она не в диапазоне
    if (startPage > 0) {
      pages.push(
        React.createElement('li', { key: 1 }, 
          React.createElement('a', {
            href: `/profile/${userId}/albums?page=1`,
            className: 'pagination-button',
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(0);
            }
          }, '1')
        )
      );
    }
    
    // Показываем страницы в диапазоне
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        React.createElement('li', { key: i + 1 }, 
          React.createElement('a', {
            href: `/profile/${userId}/albums?page=${i + 1}`,
            className: `pagination-button ${i === currentPage ? 'active' : ''}`,
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(i);
            }
          }, (i + 1).toString())
        )
      );
    }
    
    // Показываем последнюю страницу если она не в диапазоне
    if (endPage < totalPages - 1) {
      pages.push(
        React.createElement('li', { key: totalPages }, 
          React.createElement('a', {
            href: `/profile/${userId}/albums?page=${totalPages}`,
            className: 'pagination-button',
            onClick: (e) => {
              e.preventDefault();
              handlePageChange(totalPages - 1);
            }
          }, totalPages.toString())
        )
      );
    }

    // Добавляем кнопку "Следующая" если не на последней странице
    if (currentPage < totalPages - 1) {
      pages.push(
        React.createElement('li', { key: 'next' }, 
          React.createElement('a', {
            href: `/profile/${userId}/albums?page=${currentPage + 2}`,
            'aria-label': 'Перейти на следующую страницу',
            className: 'pagination-button prev-next',
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
      }, React.createElement('ul', { className: 'pagination-list' }, pages))
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
                className: 'inline-flex size-7 text-xs items-center font-semibold justify-center border-2 border-userColor rounded-full px-0 text-center simple-review-rating'
              }, formatRating(release.simpleReviewRating)) : null
          ])
        ) : null
    ]);
  };

  // Основной рендер страницы
  return React.createElement('div', { className: 'site-content min-[1024px]:max-[1500px]:px-6 mb-[30px] lg:mb-[80px] mt-[20px] lg:mt-[30px]' },
    React.createElement('main', {}, [
      React.createElement('div', { key: 'header', className: 'container' }, 
        React.createElement('h1', { key: 'title', className: 'text-lg md:text-xl lg:text-3xl font-bold mb-4 lg:mb-8' }, 
          `Альбомы${userDetails?.username ? ` пользователя ${userDetails.username}` : ''}`
        )
      ),
      
      // Контент с релизами
      React.createElement('div', { key: 'content', className: 'container mt-5' },
        React.createElement('div', {},
          React.createElement('div', { className: 'releases-grid' },
            isLoading ? 
              React.createElement('div', { className: 'col-span-full text-center py-8' }, 'Загрузка...') :
            error ? 
              React.createElement('div', { className: 'col-span-full text-center py-8 text-red-500' }, error) :
            releases.length === 0 ?
              React.createElement('div', { className: 'col-span-full text-center py-8' }, 'Нет избранных альбомов') :
            releases.map(release => renderReleaseCard(release))
          )
        )
      ),
      
      // Пагинация
      React.createElement('div', { key: 'pagination', className: 'col-span-full' }, renderPagination())
    ])
  );
}

export default ProfileAlbumsPage; 