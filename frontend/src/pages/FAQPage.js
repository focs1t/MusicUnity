import React, { useState } from 'react';
import './FAQPage.css';

const FAQPage = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData = [
    {
      category: "Общие вопросы",
      questions: [
        {
          question: "Что такое MusicUnity?",
          answer: "MusicUnity — это платформа для любителей музыки, где пользователи могут писать рецензии на релизы, ставить оценки, добавлять альбомы в избранное и открывать новую музыку. Мы стремимся создать сообщество, где каждый может поделиться своим мнением о музыке."
        },
        {
          question: "Нужна ли регистрация для использования сайта?",
          answer: "Для просмотра релизов и чтения рецензий регистрация не требуется. Однако для написания рецензий, добавления оценок, создания избранного и подписки на исполнителей необходимо зарегистрироваться."
        },
        {
          question: "Бесплатно ли использование MusicUnity?",
          answer: "Да, MusicUnity полностью бесплатен для всех пользователей. Мы не взимаем плату за регистрацию или использование любых функций платформы."
        }
      ]
    },
    {
      category: "Рецензии и оценки",
      questions: [
        {
          question: "Как написать рецензию?",
          answer: "Перейдите на страницу релиза, который хотите оценить, и нажмите кнопку 'Написать рецензию'. Вы можете оценить релиз по четырем критериям: рифмы, структура, стиль и общее впечатление, а также оставить развернутый комментарий."
        },

        {
          question: "Что означают оценки по разным критериям?",
          answer: "Рифмы — качество текста и рифмовки; Структура — композиция и построение треков; Стиль — оригинальность и подача; Общее впечатление — ваша общая оценка релиза. Каждый критерий оценивается по шкале от 1 до 10."
        },
        {
          question: "Можно ли поставить оценку без написания рецензии?",
          answer: "Да, вы можете оставить быструю оценку релиза без развернутого комментария. Для этого используйте функцию быстрой оценки на странице релиза."
        }
      ]
    },
    {
      category: "Аккаунт и профиль",
      questions: [
        {
          question: "Как зарегистрироваться?",
          answer: "Нажмите кнопку 'Регистрация' в верхней части сайта, заполните форму с вашим именем пользователя, email и паролем. После подтверждения email вы сможете полноценно пользоваться всеми функциями сайта."
        },
        {
          question: "Забыл пароль, что делать?",
          answer: "На странице входа нажмите 'Забыли пароль?', введите ваш email, и мы отправим инструкции по восстановлению пароля."
        },
        {
          question: "Можно ли изменить имя пользователя?",
          answer: "В настоящее время изменение имени пользователя недоступно. Если у вас есть веские причины для смены имени, обратитесь в службу поддержки через форму обратной связи."
        },
        {
          question: "Как удалить аккаунт?",
          answer: "Для удаления аккаунта обратитесь в службу поддержки через форму обратной связи. Мы обработаем ваш запрос в течение 24 часов."
        }
      ]
    },
    {
      category: "Функциональность",
      questions: [
        {
          question: "Как добавить релиз в избранное?",
          answer: "На странице релиза нажмите на иконку сердца рядом с названием. Релиз будет добавлен в ваш список избранного, который можно просмотреть в профиле."
        },
        {
          question: "Как подписаться на исполнителя?",
          answer: "Перейдите на страницу исполнителя и нажмите кнопку 'Подписаться'. Вы будете получать уведомления о новых релизах этого артиста."
        },
        {
          question: "Как найти конкретный релиз или исполнителя?",
          answer: "Используйте поиск в верхней части сайта. Вы можете искать по названию релиза или имени исполнителя. Также доступны фильтры для более точного поиска."
        },
        {
          question: "Что означают разные типы релизов?",
          answer: "Альбом — полноформатный релиз (обычно 8+ треков); EP — мини-альбом (3-7 треков); Сингл — один или несколько треков (обычно 1-2)."
        }
      ]
    },
    {
      category: "Техническая поддержка",
      questions: [
        {
          question: "Сайт работает медленно, что делать?",
          answer: "Попробуйте очистить кэш браузера, отключить расширения или использовать другой браузер. Если проблема сохраняется, сообщите нам через форму обратной связи."
        },
        {
          question: "Не могу загрузить изображение, в чем проблема?",
          answer: "Убедитесь, что размер файла не превышает 5 МБ и формат изображения поддерживается (JPG, PNG, GIF). Также проверьте стабильность интернет-соединения."
        },
        {
          question: "Как сообщить об ошибке или баге?",
          answer: "Используйте форму обратной связи, выберите тему 'Сообщить об ошибке' и подробно опишите проблему. Приложите скриншоты, если это поможет понять суть проблемы."
        },

      ]
    }
  ];

  let itemIndex = 0;

  return (
    <div className="faq-page-container">
      <main>
        <div className="container">
          <div className="faq-hero">
            <h1 className="faq-title">Часто задаваемые вопросы</h1>
            <p className="faq-subtitle">
              Найдите ответы на самые популярные вопросы о MusicUnity
            </p>
          </div>

          <div className="faq-content">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="faq-category">
                <h2 className="category-title">{category.category}</h2>
                <div className="faq-items">
                  {category.questions.map((item, questionIndex) => {
                    const currentIndex = itemIndex++;
                    const isOpen = openItems.has(currentIndex);
                    
                    return (
                      <div key={questionIndex} className="faq-item">
                        <button
                          className={`faq-question ${isOpen ? 'open' : ''}`}
                          onClick={() => toggleItem(currentIndex)}
                        >
                          <span className="question-text">{item.question}</span>
                          <svg
                            className={`chevron ${isOpen ? 'rotated' : ''}`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                          </svg>
                        </button>
                        <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                          <div className="answer-content">
                            <p>{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="faq-footer">
            <div className="help-section">
              <h3 className="help-title">Не нашли ответ на свой вопрос?</h3>
              <p className="help-description">
                Свяжитесь с нами через форму обратной связи, и мы поможем решить вашу проблему
              </p>
              <a href="/contact" className="help-button">
                Связаться с поддержкой
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQPage; 