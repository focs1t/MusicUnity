/**
 * Утилиты для валидации форм
 */

/**
 * Проверка корректности электронной почты
 * @param {string} email - Проверяемый email
 * @returns {boolean} - Результат проверки
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Проверяет соответствие пароля требованиям:
 * - Минимум 8 символов
 * - Наличие строчной буквы
 * - Наличие заглавной буквы
 * - Наличие цифры
 * 
 * @param {string} password - Проверяемый пароль
 * @returns {Object} - Результат проверки с отдельными флагами для каждого требования
 */
export const validatePassword = (password) => {
  return {
    isMinLength: password.length >= 8,
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasDigit: /\d/.test(password),
    isValid: password.length >= 8 && /[a-z]/.test(password) && 
            /[A-Z]/.test(password) && /\d/.test(password)
  };
};

/**
 * Возвращает текст ошибки для невалидного пароля
 * @param {Object} passwordValidation - Результат проверки пароля из функции validatePassword
 * @returns {string} - Текст ошибки или пустая строка, если пароль валидный
 */
export const getPasswordErrorMessage = (passwordValidation) => {
  if (passwordValidation.isValid) {
    return '';
  }
  
  const errors = [];
  
  if (!passwordValidation.isMinLength) {
    errors.push('минимум 8 символов');
  }
  if (!passwordValidation.hasLowerCase) {
    errors.push('строчную букву');
  }
  if (!passwordValidation.hasUpperCase) {
    errors.push('заглавную букву');
  }
  if (!passwordValidation.hasDigit) {
    errors.push('цифру');
  }
  
  return `Пароль должен содержать ${errors.join(', ')}`;
};

/**
 * Проверка совпадения паролей
 * @param {string} password - Основной пароль
 * @param {string} confirmPassword - Подтверждение пароля
 * @returns {boolean} - Результат проверки
 */
export const doPasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
}; 