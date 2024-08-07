import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HeroSlide from './HeroSlide';
import Slider from './Slider';  // Ensure Slider component is imported
import { API_KEY } from '../api';
import './Home.css';
import { Link } from 'react-router-dom';
import { OutlineButton } from './Button';

const Home = () => {
  const [currentlyReleasedMovies, setCurrentlyReleasedMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [tvShows, setTVShows] = useState([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState([]);
  const navigate = useNavigate();
  const [heroSlideCurrReleasedMovies, setHeroSlideCurrReleasedMovies] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const heroSlideMovies = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}`);
    setHeroSlideCurrReleasedMovies(heroSlideMovies.data.results.slice(0, 4));

    const currentMoviesRes = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}`);
    setCurrentlyReleasedMovies(currentMoviesRes.data.results);

    const topMoviesRes = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}`);
    setTopRatedMovies(topMoviesRes.data.results);

    const showsRes = await axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`);
    setTVShows(showsRes.data.results);

    const topShowsRes = await axios.get(`https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}`);
    setTopRatedTVShows(topShowsRes.data.results);
  };

  const handleItemClick = (id, type) => {
    if (type === 'movie') {
      navigate(`/movies/${id}`);
    } else if (type === 'tv') {
      navigate(`/tvshows/${id}`);
    }
  };

  return (
    <div>
      <HeroSlide movies={heroSlideCurrReleasedMovies} />

      <div className='section-div'>
        <section>
          <div className='type-section'>
            <h2>Trending Movies</h2>
            <Link to="/movies">
              <OutlineButton className="small-for-home-page">View more</OutlineButton>
            </Link>
          </div>
          <Slider items={currentlyReleasedMovies} onItemClick={handleItemClick} itemType="movie" />
        </section>

        <section>
          <div className='type-section'>
            <h2>Top Rated Movies</h2>
            <Link to="/movies">
              <OutlineButton className="small-for-home-page">View more</OutlineButton>
            </Link>
          </div>
          <Slider items={topRatedMovies} onItemClick={handleItemClick} itemType="movie" />
        </section>

        <section>
          <div className='type-section'>
            <h2>TV Shows</h2>
            <Link to="/tvshows">
              <OutlineButton className="small-for-home-page">View more</OutlineButton>
            </Link>
          </div>
          <Slider items={tvShows} onItemClick={handleItemClick} itemType="tv" />
        </section>

        <section>
          <div className='type-section'>
            <h2>Top Rated TV Shows</h2>
            <Link to="/tvshows">
              <OutlineButton className="small-for-home-page">View more</OutlineButton>
            </Link>
          </div>
          <Slider items={topRatedTVShows} onItemClick={handleItemClick} itemType="tv" />
        </section>
      </div>
    </div>
  );
};

export default Home;
