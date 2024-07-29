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
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/tvshows/:id" element={<TVShowDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
