import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Здесь будет API запрос для отправки формы
      // Пока что имитируем отправку
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-container">
      <main>
        <div className="container">
          <div className="contact-hero">
            <h1 className="contact-title">Обратная связь</h1>
            <p className="contact-subtitle">
              Есть вопросы, предложения или нашли ошибку? Мы всегда рады услышать от вас!
            </p>
          </div>

          <div className="contact-content">
            <div className="contact-info">
              <h2 className="info-title">Свяжитесь с нами</h2>
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <div className="method-content">
                    <h3 className="method-title">Email</h3>
                    <p className="method-description">musicunity@mail.ru</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="method-content">
                    <h3 className="method-title">Время ответа</h3>
                    <p className="method-description">Обычно отвечаем в течение 24 часов</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div className="method-content">
                    <h3 className="method-title">Поддержка</h3>
                    <p className="method-description">Техническая поддержка и помощь пользователям</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-section">
              <h2 className="form-title">Отправить сообщение</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Имя *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Тема *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Выберите тему</option>
                    <option value="bug">Сообщить об ошибке</option>
                    <option value="feature">Предложить функцию</option>
                    <option value="account">Проблемы с аккаунтом</option>
                    <option value="content">Вопросы по контенту</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Сообщение *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="6"
                    required
                    placeholder="Опишите ваш вопрос или предложение подробно..."
                  ></textarea>
                </div>

                {submitStatus === 'success' && (
                  <div className="status-message success">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="status-message error">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                    </svg>
                    Произошла ошибка при отправке сообщения. Попробуйте еще раз.
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Отправляем...
                    </>
                  ) : (
                    'Отправить сообщение'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage; 