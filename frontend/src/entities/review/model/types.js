/**
 * Модель отзыва
 * @typedef {Object} Review
 * @property {number} reviewId - ID отзыва
 * @property {number} userId - ID пользователя
 * @property {number} releaseId - ID релиза
 * @property {string} title - Заголовок отзыва
 * @property {string} content - Содержание отзыва
 * @property {number} rhymeImagery - Оценка рифмы и образности (1-10)
 * @property {number} structureRhythm - Оценка структуры и ритма (1-10)
 * @property {number} styleExecution - Оценка стиля и исполнения (1-10)
 * @property {number} individuality - Оценка индивидуальности (1-10)
 * @property {number} vibe - Оценка вайба (1-10)
 * @property {number} averageScore - Средний балл
 * @property {number} likesCount - Количество лайков
 * @property {number} authorLikesCount - Количество лайков от авторов
 * @property {boolean} isDeleted - Флаг удаления
 * @property {string} createdAt - Дата создания
 */ 