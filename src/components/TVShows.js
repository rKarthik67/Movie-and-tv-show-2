import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { API_KEY } from '../api';
import bg from '../assets/footer-bg.jpg';
import Button, { OutlineButton } from './Button';
import BookmarkButton from './BookmarkButton';
import { getWatchlist, toggleWatchlistItem } from '../watchlistStorage';
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
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [minimumSeasons, setMinimumSeasons] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    const refreshBookmarks = () => {
      setBookmarkedIds(new Set(getWatchlist('tv').map((item) => String(item.id))));
    };

    refreshBookmarks();
    window.addEventListener('ark-play-watchlist-updated', refreshBookmarks);
    window.addEventListener('storage', refreshBookmarks);

    return () => {
      window.removeEventListener('ark-play-watchlist-updated', refreshBookmarks);
      window.removeEventListener('storage', refreshBookmarks);
    };
  }, []);

  useEffect(() => {
    fetchGenres();
    fetchLanguages();
    fetchYears();
    const searchQuery = searchParams.get('search') || '';
    const genreFilter = searchParams.get('genres') || '';
    const yearFilter = searchParams.get('years') || '';
    const languageFilter = searchParams.get('language') || '';
    const seasonFilter = searchParams.get('seasons') || '';
    const pageParam = parseInt(searchParams.get('page')) || 1;
    setQuery(searchQuery);
    setSelectedGenres(genreFilter.split(',').filter(Boolean));
    setSelectedYears(yearFilter.split(',').filter(Boolean));
    setSelectedLanguage(languageFilter);
    setMinimumSeasons(seasonFilter);
    fetchShows(pageParam, searchQuery, genreFilter, yearFilter, languageFilter);
  }, [searchParams]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}`);
      setGenres(response.data.genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/configuration/languages?api_key=${API_KEY}`);
      setLanguages(response.data.filter((language) => language.iso_639_1 && language.iso_639_1 !== 'ko' && language.iso_639_1 !== 'ja'));
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const fetchYears = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => 1980 + i);
    setYears(years);
  };

  const fetchShows = async (page, query = '', genreIds = '', yearIds = '', language = '') => {
    try {
      const genreFilter = [genreIds, language === 'anime' ? '16' : ''].filter(Boolean).join(',');
      const languageFilter = language ? `&with_original_language=${language === 'anime' ? 'ja' : language}` : '';
      const url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}&with_genres=${genreFilter}${query ? `&with_text_query=${encodeURIComponent(query)}` : ''}${yearIds ? `&first_air_date_year=${yearIds}` : ''}${languageFilter}`;
      const res = await axios.get(url);
      const showsWithSeasonCounts = await Promise.all(
        res.data.results.map(async (show) => {
          try {
            const details = await axios.get(`https://api.themoviedb.org/3/tv/${show.id}?api_key=${API_KEY}`);
            return { ...show, number_of_seasons: details.data.number_of_seasons };
          } catch (error) {
            console.error(`Error fetching season count for ${show.name}:`, error);
            return show;
          }
        })
      );
      setShows(showsWithSeasonCounts);
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
      language: selectedLanguage,
      seasons: minimumSeasons,
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

  const handleLanguageChange = (language) => {
    setSearchParams({
      search: query,
      genres: selectedGenres.join(','),
      years: selectedYears.join(','),
      language,
      seasons: minimumSeasons,
      page: 1
    });
  };

  const handleMinimumSeasonsChange = (seasons) => {
    setSearchParams({
      search: query,
      genres: selectedGenres.join(','),
      years: selectedYears.join(','),
      language: selectedLanguage,
      seasons,
      page: 1
    });
  };

  const toggleFilters = () => {
    setFiltersOpen((open) => !open);
  };

  const changePage = (newPage) => {
    setSearchParams({
      search: query,
      genres: selectedGenres.join(','),
      years: selectedYears.join(','),
      language: selectedLanguage,
      seasons: minimumSeasons,
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

  const handleBookmarkToggle = (show) => {
    const added = toggleWatchlistItem('tv', {
      id: show.id,
      title: show.name || 'Untitled TV Show',
      posterPath: show.poster_path,
    });

    setBookmarkedIds((currentIds) => {
      const updatedIds = new Set(currentIds);
      if (added) {
        updatedIds.add(String(show.id));
      } else {
        updatedIds.delete(String(show.id));
      }
      return updatedIds;
    });
  };

  const visibleShows = shows.filter((show) => (
    !minimumSeasons || Number(show.number_of_seasons) >= Number(minimumSeasons)
  ));

  const formatSeasonCount = (count) => (
    `${count} ${count === 1 ? 'season' : 'seasons'}`
  );

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
        <select className="tv-language-select" value={selectedLanguage} onChange={(event) => handleLanguageChange(event.target.value)} aria-label="Filter TV shows by language">
          <option value="">All languages</option>
          <option value="ko">Korean TV Shows</option>
          <option value="ja">Japanese TV Shows</option>
          <option value="anime">Anime TV Shows</option>
          <optgroup label="Other languages">
            {languages.map((language) => <option key={language.iso_639_1} value={language.iso_639_1}>{language.english_name} ({language.iso_639_1})</option>)}
          </optgroup>
        </select>
      </div>
      <div className={`filters-container ${filtersOpen ? 'active' : ''}`}>
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
          <h3>Seasons:</h3>
          <label>
            <input
              type="radio"
              name="minimum-seasons"
              value=""
              checked={!minimumSeasons}
              onChange={() => handleMinimumSeasonsChange('')}
            />
            All seasons
          </label>
          {[1, 3, 5, 7, 9].map((seasons) => (
            <label key={seasons}>
              <input
                type="radio"
                name="minimum-seasons"
                value={seasons}
                checked={minimumSeasons === seasons.toString()}
                onChange={() => handleMinimumSeasonsChange(seasons.toString())}
              />
              {seasons}+ seasons
            </label>
          ))}
        </div>
      </div>
      <div className='grid-view'>
        {visibleShows.map(show => (
          <div className="media-grid-card" key={show.id}>
            <Link to={`/tvshows/${show.id}`} style={{ margin: '10px' }}>
              <img src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} alt={show.name} style={{ borderRadius: '10px' }} />
              <h3>{show.name} ({formatSeasonCount(show.number_of_seasons ?? 0)})</h3>
            </Link>
            <BookmarkButton
              isBookmarked={bookmarkedIds.has(String(show.id))}
              onClick={() => handleBookmarkToggle(show)}
              className="card-bookmark-button"
            />
          </div>
        ))}
      </div>
      {renderPagination()}
    </div>
  );
};

export default TVShows;
