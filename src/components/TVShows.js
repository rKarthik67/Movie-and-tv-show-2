import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { API_KEY } from '../api';
import bg from '../assets/footer-bg.jpg';
import Button, { OutlineButton } from './Button';
import './TVShows.css';

const TVShows = () => {
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    fetchGenres();
    fetchYears();
    const searchQuery = searchParams.get('search') || '';
    const genreFilter = searchParams.get('genres') || '';
    const yearFilter = searchParams.get('years') || '';
    const pageParam = parseInt(searchParams.get('page')) || 1;
    setQuery(searchQuery);
    setSelectedGenres(genreFilter.split(',').filter(Boolean));
    setSelectedYears(yearFilter.split(',').filter(Boolean));
    fetchShows(pageParam, searchQuery, genreFilter, yearFilter);
  }, [searchParams]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}`);
      setGenres(response.data.genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchYears = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => 1980 + i);
    setYears(years);
  };

  const fetchShows = async (page, query = '', genreIds = '', yearIds = '') => {
    try {
      const url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}&with_genres=${genreIds}${query ? `&with_text_query=${query}` : ''}${yearIds ? `&first_air_date_year=${yearIds}` : ''}`;
      const res = await axios.get(url);
      setShows(res.data.results);
      setTotalPages(res.data.total_pages);
      setPage(page);
    } catch (error) {
      console.error("Error fetching TV shows:", error);
    }
  };

  const handleSearch = () => {
    setSearchParams({
      search: query,
      genres: selectedGenres.join(','),
      years: selectedYears.join(','),
      page: 1
    });
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleYearChange = (year) => {
    setSelectedYears(prev =>
      prev.includes(year.toString())
        ? prev.filter(id => id !== year.toString())
        : [...prev, year.toString()]
    );
  };

  const toggleFilters = () => {
    const filtersContainer = document.querySelector('.filters-container');
    filtersContainer.classList.toggle('active');
  };

  const changePage = (newPage) => {
    setSearchParams({
      search: query,
      genres: selectedGenres.join(','),
      years: selectedYears.join(','),
      page: newPage
    });
  };

  const renderPagination = () => {
    let pages = [];
    const totalDisplayPages = 10;
    const startPage = Math.max(1, page - 4);
    const endPage = Math.min(totalPages, startPage + totalDisplayPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => changePage(i)}
          className={`pagination-button ${i === page ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        {startPage > 1 && (
          <button className="pagination-arrow" onClick={() => changePage(startPage - 1)}>
            &laquo;
          </button>
        )}
        {pages}
        {endPage < totalPages && (
          <button className="pagination-arrow" onClick={() => changePage(endPage + 1)}>
            &raquo;
          </button>
        )}
      </div>
    );
  };

  return (
    <div className='tvshows-page'>
      <div className='background-section' style={{ backgroundImage: `url(${bg})` }}>
        <div className='content-container'>
          <h2>TV Shows</h2>
        </div>
      </div>
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for TV Shows..."
        />
        <Button className="small" onClick={handleSearch}>Search</Button>
        <OutlineButton className="small" onClick={toggleFilters}>Filters</OutlineButton>
      </div>
      <div className="filters-container">
        <div className="filters-grid">
          <h3>Genres:</h3>
          {genres.map(genre => (
            <label key={genre.id}>
              <input
                type="checkbox"
                value={genre.id}
                checked={selectedGenres.includes(genre.id.toString())}
                onChange={() => handleGenreChange(genre.id.toString())}
              />
              {genre.name}
            </label>
          ))}
          <h3>Years:</h3>
          {years.map(year => (
            <label key={year}>
              <input
                type="checkbox"
                value={year}
                checked={selectedYears.includes(year.toString())}
                onChange={() => handleYearChange(year)}
              />
              {year}
            </label>
          ))}
        </div>
      </div>
      <div className='grid-view'>
        {shows.map(show => (
          <Link key={show.id} to={`/tvshows/${show.id}`} style={{ margin: '10px' }}>
            <img src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} alt={show.name} style={{ borderRadius: '10px' }} />
            <h3>{show.name}</h3>
          </Link>
        ))}
      </div>
      {renderPagination()}
    </div>
  );
};

export default TVShows;