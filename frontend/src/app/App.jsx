import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from '../widgets/Sidebar';
import { ROUTES } from '../shared/config/routes';

// Заглушки для страниц
const Home = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Главная страница</div>;
const News = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Новости</div>;
const FAQ = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Часто задаваемые вопросы</div>;
const About = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>О нас</div>;
const Top100 = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>ТОП-100 пользователей</div>;
const AlbumValue = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Ценность альбомов</div>;
const Rating = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Рейтинг</div>;
const RztAwards = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Премия РЗТ</div>;
const Freshmen = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Фрешмены</div>;
const Playlists = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Плейлисты</div>;
const AuthorLikes = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Авторские лайки</div>;
const AuthorComments = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Авторские комментарии</div>;
const AuthorsVerified = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Зарегистрированные авторы</div>;
const Authors = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Авторы</div>;
const Reviews = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Рецензии</div>;
const Releases = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Релизы</div>;
const Contact = () => <div style={{ marginLeft: '4rem', padding: '2rem' }}>Обратная связь</div>;

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main>
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.NEWS} element={<News />} />
            <Route path={ROUTES.FAQ} element={<FAQ />} />
            <Route path={ROUTES.ABOUT} element={<About />} />
            <Route path={ROUTES.TOP_100} element={<Top100 />} />
            <Route path={ROUTES.ALBUM_VALUE} element={<AlbumValue />} />
            <Route path={ROUTES.RATING} element={<Rating />} />
            <Route path={ROUTES.RZT_AWARDS} element={<RztAwards />} />
            <Route path={ROUTES.FRESHMEN} element={<Freshmen />} />
            <Route path={ROUTES.PLAYLISTS} element={<Playlists />} />
            <Route path={ROUTES.AUTHOR_LIKES} element={<AuthorLikes />} />
            <Route path={ROUTES.AUTHOR_COMMENTS} element={<AuthorComments />} />
            <Route path={ROUTES.AUTHORS_VERIFIED} element={<AuthorsVerified />} />
            <Route path={ROUTES.AUTHORS} element={<Authors />} />
            <Route path={ROUTES.REVIEWS} element={<Reviews />} />
            <Route path={ROUTES.RELEASES} element={<Releases />} />
            <Route path={ROUTES.CONTACT} element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 