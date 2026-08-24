import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { API_KEY } from '../api';
import bg from '../assets/footer-bg.jpg';
import Button, { OutlineButton } from './Button';
import './Movies.css';

const LanguageMovies = ({ languageCode, title }) => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [years, setYears] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [includeAdult, setIncludeAdult] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
        setGenres(response.data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
    setYears(Array.from({ length: new Date().getFullYear() - 1980 + 1 }, (_, index) => 1980 + index));
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get('search') || '';
    const genreFilter = searchParams.get('genres') || '';
    const yearFilter = searchParams.get('years') || '';
    const adultFilter = searchParams.get('adult') === 'true';
    const pageParam = parseInt(searchParams.get('page'), 10) || 1;

    setQuery(searchQuery);
    setSelectedGenres(genreFilter.split(',').filter(Boolean));
    setSelectedYears(yearFilter.split(',').filter(Boolean));
    setIncludeAdult(adultFilter);

    const fetchMovies = async () => {
      try {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=${languageCode}&sort_by=popularity.desc&include_adult=${adultFilter}&include_video=false&page=${pageParam}&with_genres=${genreFilter}${searchQuery ? `&with_text_query=${encodeURIComponent(searchQuery)}` : ''}${yearFilter ? `&primary_release_year=${yearFilter}` : ''}`;
        const response = await axios.get(url);
        // TMDB normally honors include_adult, but filter locally as a second safeguard.
        setMovies(response.data.results.filter((movie) => adultFilter || !movie.adult));
        setTotalPages(response.data.total_pages);
        setPage(pageParam);
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
      }
    };

    fetchMovies();
  }, [languageCode, searchParams, title]);

  const updateSearch = (nextPage = 1) => {
    setSearchParams({
      search: query,
      genres: selectedGenres.join(','),
      years: selectedYears.join(','),
      adult: includeAdult.toString(),
      page: nextPage,
    });
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres((current) => current.includes(genreId)
      ? current.filter((id) => id !== genreId)
      : [...current, genreId]);
  };

  const toggleYear = (year) => {
    const value = year.toString();
    setSelectedYears((current) => current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]);
  };

  const handleAdultChange = (checked) => {
    setSearchParams({
      search: query,
      genres: selectedGenres.join(','),
      years: selectedYears.join(','),
      adult: checked.toString(),
      page: 1,
    });
  };

  const pages = Array.from(
    { length: Math.min(10, totalPages - Math.max(1, page - 4) + 1) },
    (_, index) => Math.max(1, page - 4) + index,
  );

  return (
    <div className="movies-page">
      <div className="background-section" style={{ backgroundImage: `url(${bg})` }}>
        <div className="content-container"><h2>{title}</h2></div>
      </div>
      <div className="search-bar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && updateSearch()} placeholder={`Search ${title}...`} />
        <Button className="small" onClick={() => updateSearch()}>Search</Button>
        <OutlineButton className="small" onClick={() => setFiltersOpen((open) => !open)}>Filters</OutlineButton>
      </div>
      <div className={`filters-container ${filtersOpen ? 'active' : ''}`}>
        <div className="filters-grid">
          <h3>Genres:</h3>
          {genres.map((genre) => <label key={genre.id}><input type="checkbox" checked={selectedGenres.includes(genre.id.toString())} onChange={() => toggleGenre(genre.id.toString())} />{genre.name}</label>)}
          <h3>Year:</h3>
          {years.map((year) => <label key={year}><input type="checkbox" checked={selectedYears.includes(year.toString())} onChange={() => toggleYear(year)} />{year}</label>)}
          <h3>Adults:</h3>
          <label><input type="checkbox" checked={includeAdult} onChange={(event) => handleAdultChange(event.target.checked)} />Include Adult Content</label>
        </div>
      </div>
      <div className="grid-view">
        {movies.map((movie) => <Link key={movie.id} to={`/movies/${movie.id}`}><img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} /><h3>{movie.title}</h3></Link>)}
      </div>
      <div className="pagination-container">
        {pages[0] > 1 && <button className="pagination-arrow" onClick={() => updateSearch(pages[0] - 1)}>&laquo;</button>}
        {pages.map((pageNumber) => <button key={pageNumber} className={`pagination-button ${pageNumber === page ? 'active' : ''}`} onClick={() => updateSearch(pageNumber)}>{pageNumber}</button>)}
        {pages[pages.length - 1] < totalPages && <button className="pagination-arrow" onClick={() => updateSearch(pages[pages.length - 1] + 1)}>&raquo;</button>}
      </div>
    </div>
  );
};

export default LanguageMovies;
