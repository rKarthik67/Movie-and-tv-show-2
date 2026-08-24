import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Movies from './components/Movies';
import TVShows from './components/TVShows';
// import Watchlist from './components/Watchlist';
import MovieDetail from './components/MovieDetail';
import TVShowDetail from './components/TVShowDetail';
import TamilMovies from './components/TamilMovies';
import MalayalamMovies from './components/MalayalamMovies';
import TeluguMovies from './components/TeluguMovies';
import KannadaMovies from './components/KannadaMovies';
import HindiMovies from './components/HindiMovies';
import TopRatedMovies from './components/TopRatedMovies';
import TopRatedTvShows from './components/TopRatedTvShows';
import LanguageMovies from './components/LanguageMovies';
import PersonDetail from './components/PersonDetail';


function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tvshows" element={<TVShows />} />
            {/* <Route path="/watchlist" element={<Watchlist />} /> */}
            <Route path="/top-rated-movies" element={<TopRatedMovies />} />
            <Route path="/top-rated-tvshow" element={<TopRatedTvShows />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/tvshows/:id" element={<TVShowDetail />} />
            <Route path="/people/:id" element={<PersonDetail />} />
            <Route path="/tamil-movies" element={<TamilMovies />} />
            <Route path="/malayalam-movies" element={<MalayalamMovies />} />
            <Route path="/telugu-movies" element={<TeluguMovies />} />
            <Route path="/kannada-movies" element={<KannadaMovies />} />
            <Route path="/hindi-movies" element={<HindiMovies />} />
            <Route path="/korean-movies" element={<LanguageMovies languageCode="ko" title="Korean Movies" />} />
            <Route path="/japanese-movies" element={<LanguageMovies languageCode="ja" title="Japanese Movies" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
