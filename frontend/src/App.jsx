import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './widgets/Sidebar';
import { Header } from './widgets/Header';
import { Footer } from './widgets/Footer';
import { ROUTES } from './shared/config/routes';
import './index.css';

// Импорт страницы Top100Page
import Top100Page from './pages/Top100Page';

// Заглушки для страниц
const Home = () => <div>Главная страница</div>;
const FAQ = () => <div>Часто задаваемые вопросы</div>;
const About = () => <div>О нас</div>;
const Rating = () => <div>Рейтинг</div>;
const AuthorLikes = () => <div>Авторские лайки</div>;
const AuthorsVerified = () => <div>Зарегистрированные авторы</div>;
const Authors = () => <div>Авторы</div>;
const Reviews = () => <div>Рецензии</div>;
const Releases = () => <div>Релизы</div>;
const Contact = () => <div>Обратная связь</div>;

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="lg:pl-[55px] flex flex-col h-full min-h-screen">
          <Header />
          <main className="content">
            <Routes>
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.FAQ} element={<FAQ />} />
              <Route path={ROUTES.ABOUT} element={<About />} />
              <Route path={ROUTES.TOP_100} element={<Top100Page />} />
              <Route path={ROUTES.RATING} element={<Rating />} />
              <Route path={ROUTES.AUTHOR_LIKES} element={<AuthorLikes />} />
              <Route path={ROUTES.AUTHORS_VERIFIED} element={<AuthorsVerified />} />
              <Route path={ROUTES.AUTHORS} element={<Authors />} />
              <Route path={ROUTES.REVIEWS} element={<Reviews />} />
              <Route path={ROUTES.RELEASES} element={<Releases />} />
              <Route path={ROUTES.CONTACT} element={<Contact />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App; 