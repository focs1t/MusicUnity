/**
 * @typedef {Object} LoginRequest
 * @property {string} username - Имя пользователя
 * @property {string} password - Пароль
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} username - Имя пользователя
 * @property {string} password - Пароль
 * @property {string} email - Email пользователя
 * @property {string} [firstName] - Имя
 * @property {string} [lastName] - Фамилия
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token - JWT токен
 * @property {UserDTO} user - Данные пользователя
 */

/**
 * @typedef {Object} UserDTO
 * @property {number} id - ID пользователя
 * @property {string} username - Имя пользователя
 * @property {string} email - Email
 * @property {string} [firstName] - Имя
 * @property {string} [lastName] - Фамилия
 * @property {string} [avatarUrl] - URL аватара
 * @property {string[]} roles - Роли пользователя
 * @property {boolean} blocked - Заблокирован ли пользователь
 * @property {Date} createdAt - Дата создания
 * @property {Date} updatedAt - Дата обновления
 */

/**
 * @typedef {Object} AuthorDTO
 * @property {number} id - ID автора
 * @property {string} name - Имя автора
 * @property {string} [description] - Описание
 * @property {string} [avatarUrl] - URL аватара
 * @property {number} followersCount - Количество подписчиков
 * @property {number} releasesCount - Количество релизов
 * @property {Date} createdAt - Дата создания
 * @property {Date} updatedAt - Дата обновления
 */

/**
 * @typedef {Object} CreateAuthorRequest
 * @property {string} name - Имя автора
 * @property {string} [description] - Описание
 * @property {string} [avatarUrl] - URL аватара
 */

/**
 * @typedef {Object} ReleaseDTO
 * @property {number} id - ID релиза
 * @property {string} title - Название
 * @property {string} [description] - Описание
 * @property {string} coverUrl - URL обложки
 * @property {string} type - Тип релиза (SINGLE, EP, ALBUM)
 * @property {AuthorDTO[]} authors - Авторы
 * @property {GenreDTO[]} genres - Жанры
 * @property {number} likesCount - Количество лайков
 * @property {number} reviewsCount - Количество отзывов
 * @property {Date} releaseDate - Дата релиза
 * @property {Date} createdAt - Дата создания
 * @property {Date} updatedAt - Дата обновления
 */

/**
 * @typedef {Object} CreateReleaseRequest
 * @property {string} title - Название
 * @property {string} [description] - Описание
 * @property {string} coverUrl - URL обложки
 * @property {string} type - Тип релиза (SINGLE, EP, ALBUM)
 * @property {number[]} authorIds - ID авторов
 * @property {number[]} genreIds - ID жанров
 * @property {Date} releaseDate - Дата релиза
 */

/**
 * @typedef {Object} GenreDTO
 * @property {number} id - ID жанра
 * @property {string} name - Название жанра
 * @property {Date} createdAt - Дата создания
 * @property {Date} updatedAt - Дата обновления
 */

/**
 * @typedef {Object} ReviewDTO
 * @property {number} id - ID отзыва
 * @property {string} content - Текст отзыва
 * @property {number} rating - Оценка (1-5)
 * @property {UserDTO} user - Автор отзыва
 * @property {ReleaseDTO} release - Релиз
 * @property {number} likesCount - Количество лайков
 * @property {Date} createdAt - Дата создания
 * @property {Date} updatedAt - Дата обновления
 */

/**
 * @typedef {Object} CreateReviewRequest
 * @property {string} content - Текст отзыва
 * @property {number} rating - Оценка (1-5)
 * @property {number} releaseId - ID релиза
 */

/**
 * @typedef {Object} LikeDTO
 * @property {number} id - ID лайка
 * @property {string} type - Тип лайка (LIKE, DISLIKE)
 * @property {UserDTO} user - Пользователь
 * @property {ReviewDTO} review - Отзыв
 * @property {Date} createdAt - Дата создания
 */

/**
 * @typedef {Object} ReportDTO
 * @property {number} id - ID жалобы
 * @property {string} reason - Причина жалобы
 * @property {string} status - Статус (PENDING, IN_PROGRESS, RESOLVED, REJECTED)
 * @property {UserDTO} reporter - Пользователь, создавший жалобу
 * @property {UserDTO} [moderator] - Модератор
 * @property {ReviewDTO} review - Отзыв
 * @property {Date} createdAt - Дата создания
 * @property {Date} updatedAt - Дата обновления
 */

/**
 * @typedef {Object} CreateReportRequest
 * @property {string} reason - Причина жалобы
 * @property {number} reviewId - ID отзыва
 */

/**
 * @typedef {Object} AuditDTO
 * @property {number} id - ID записи аудита
 * @property {string} action - Тип действия
 * @property {string} details - Детали действия
 * @property {UserDTO} user - Пользователь
 * @property {Date} createdAt - Дата создания
 */

/**
 * @typedef {Object} FileUploadResponse
 * @property {string} key - Ключ файла в хранилище
 * @property {string} url - URL для доступа к файлу
 */

/**
 * @typedef {Object} PageResponse
 * @property {Array} content - Массив элементов
 * @property {number} totalPages - Общее количество страниц
 * @property {number} totalElements - Общее количество элементов
 * @property {number} size - Размер страницы
 * @property {number} number - Номер текущей страницы
 */ 