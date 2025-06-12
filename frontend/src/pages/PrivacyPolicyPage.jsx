import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const PrivacyPolicyPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={0} sx={{ 
        p: 4, 
        bgcolor: 'rgba(18, 18, 18, 0.8)', 
        color: 'white',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
          Политика обработки персональных данных
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            1. Общие положения
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            1.1. Настоящая Политика обработки персональных данных (далее — «Политика») определяет порядок обработки и защиты персональных данных пользователей сайта musicunity.com (далее — «Сайт»).
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            1.2. Настоящая Политика разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            1.3. Действие настоящей Политики распространяется на все персональные данные пользователей, которые обрабатываются ООО «MusicUnity» (далее — «Оператор»).
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            2. Цели обработки персональных данных
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            2.1. Оператор обрабатывает персональные данные пользователей в следующих целях:
          </Typography>
          <Typography component="div" variant="body1" sx={{ mb: 2, pl: 3 }}>
            <ul>
              <li>Регистрация пользователей на Сайте и предоставление доступа к его функционалу;</li>
              <li>Идентификация пользователей при использовании Сайта;</li>
              <li>Связь с пользователями в случае необходимости;</li>
              <li>Улучшение качества работы Сайта и его функционала;</li>
              <li>Таргетирование рекламных материалов;</li>
              <li>Проведение статистических и иных исследований на основе обезличенных данных.</li>
            </ul>
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            3. Перечень обрабатываемых персональных данных
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            3.1. Оператор обрабатывает следующие персональные данные пользователей:
          </Typography>
          <Typography component="div" variant="body1" sx={{ mb: 2, pl: 3 }}>
            <ul>
              <li>Имя пользователя (логин);</li>
              <li>Адрес электронной почты;</li>
              <li>Пароль (в зашифрованном виде);</li>
              <li>Информация о действиях пользователя на Сайте;</li>
              <li>IP-адрес, данные файлов cookie;</li>
              <li>Иная информация, предоставляемая пользователем при заполнении профиля.</li>
            </ul>
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            4. Порядок и условия обработки персональных данных
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            4.1. Обработка персональных данных осуществляется с согласия пользователя на обработку его персональных данных.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            4.2. Оператор осуществляет обработку персональных данных следующими способами:
          </Typography>
          <Typography component="div" variant="body1" sx={{ mb: 2, pl: 3 }}>
            <ul>
              <li>Сбор;</li>
              <li>Запись;</li>
              <li>Систематизация;</li>
              <li>Накопление;</li>
              <li>Хранение;</li>
              <li>Уточнение (обновление, изменение);</li>
              <li>Извлечение;</li>
              <li>Использование;</li>
              <li>Передача (распространение, предоставление, доступ);</li>
              <li>Обезличивание;</li>
              <li>Блокирование;</li>
              <li>Удаление;</li>
              <li>Уничтожение.</li>
            </ul>
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            4.3. Оператор принимает необходимые правовые, организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, предоставления, распространения, а также от иных неправомерных действий в отношении персональных данных.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            5. Права пользователей
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            5.1. Пользователь имеет право на:
          </Typography>
          <Typography component="div" variant="body1" sx={{ mb: 2, pl: 3 }}>
            <ul>
              <li>Получение информации, касающейся обработки его персональных данных;</li>
              <li>Уточнение своих персональных данных, их блокирование или уничтожение;</li>
              <li>Отзыв согласия на обработку персональных данных;</li>
              <li>Защиту своих прав и законных интересов, в том числе на возмещение убытков и компенсацию морального вреда в судебном порядке.</li>
            </ul>
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            6. Заключительные положения
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            6.1. Настоящая Политика может быть изменена без предварительного уведомления пользователей. Новая редакция Политики вступает в силу с момента ее размещения на Сайте.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            6.2. Вопросы, касающиеся настоящей Политики, обработки и защиты персональных данных, можно направлять по адресу: musciunity@mail.ru.
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.7)' }}>
            Дата последнего обновления: 01.06.2023
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicyPage; 