import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { API_KEY } from '../api';
import Button from './Button';
import BookmarkButton from './BookmarkButton';
import { getWatchlist, toggleWatchlistItem } from '../watchlistStorage';
import { getFilter, getFilterName } from '../platformFilters';
import './Platforms.css';

const PlatformResults = () => {
  const { filterType, filterId } = useParams();
  const [searchParams] = useSearchParams();
  const [mediaType, setMediaType] = useState('movie');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [selectedLogo, setSelectedLogo] = useState('');
  const region = searchParams.get('region') || 'IN';
  const selectedFilter = getFilter(filterType, filterId);
  const filterName = searchParams.get('name') || getFilterName(filterType, filterId);

  useEffect(() => {
    let isActive = true;

    const loadSelectedLogo = async () => {
      if (selectedFilter?.commonsLogo) {
        setSelectedLogo(selectedFilter.commonsLogo);
        return;
      }

      try {
        if (filterType === 'provider') {
          const response = await axios.get(`https://api.themoviedb.org/3/watch/providers/movie?api_key=${API_KEY}`);
          const provider = response.data.results.find((item) => String(item.provider_id) === String(filterId));
          if (isActive) setSelectedLogo(provider?.logo_path ? `https://image.tmdb.org/t/p/original${provider.logo_path}` : '');
        } else {
          const response = await axios.get(`https://api.themoviedb.org/3/company/${filterId}?api_key=${API_KEY}`);
          if (isActive) setSelectedLogo(response.data.logo_path ? `https://image.tmdb.org/t/p/original${response.data.logo_path}` : '');
        }
      } catch (logoError) {
        console.error('Error loading selected platform logo:', logoError);
        if (isActive) setSelectedLogo('');
      }
    };

    loadSelectedLogo();
    return () => { isActive = false; };
  }, [filterId, filterType, selectedFilter]);

  useEffect(() => {
    const refreshBookmarks = () => {
      const watchlistType = mediaType === 'movie' ? 'movie' : 'tv';
      setBookmarkedIds(new Set(getWatchlist(watchlistType).map((item) => String(item.id))));
    };
    refreshBookmarks();
    window.addEventListener('ark-play-watchlist-updated', refreshBookmarks);
    window.addEventListener('storage', refreshBookmarks);
    return () => {
      window.removeEventListener('ark-play-watchlist-updated', refreshBookmarks);
      window.removeEventListener('storage', refreshBookmarks);
    };
  }, [mediaType]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError('');
      const parameter = filterType === 'provider'
        ? `with_watch_providers=${filterId}&watch_region=${region}&with_watch_monetization_types=flatrate`
        : `with_companies=${filterId}`;
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/discover/${mediaType}?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}&${parameter}`);
        setResults(response.data.results);
        setTotalPages(response.data.total_pages);
      } catch (requestError) {
        console.error('Error fetching platform titles:', requestError);
        setResults([]);
        setError('Unable to load titles for this selection. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [filterId, filterType, mediaType, page, region]);

  const changeMediaType = (type) => {
    setMediaType(type);
    setPage(1);
  };

  const handleBookmarkToggle = (item) => {
    const watchlistType = mediaType === 'movie' ? 'movie' : 'tv';
    const added = toggleWatchlistItem(watchlistType, { id: item.id, title: item.title || item.name || 'Untitled', posterPath: item.poster_path });
    setBookmarkedIds((currentIds) => {
      const updatedIds = new Set(currentIds);
      if (added) updatedIds.add(String(item.id));
      else updatedIds.delete(String(item.id));
      return updatedIds;
    });
  };

  const routeBase = mediaType === 'movie' ? 'movies' : 'tvshows';
  const totalDisplayPages = 10;
  const startPage = Math.max(1, page - 4);
  const endPage = Math.min(totalPages, startPage + totalDisplayPages - 1);
  const pageNumbers = Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, index) => startPage + index);

  return (
    <div className="platform-results-page">
      <div className="platform-results-header">
        <div className="selected-platform-brand">
          <div className={`selected-platform-logo ${filterType}-logo`}>
            {selectedLogo ? <img src={selectedLogo} alt={`${filterName} logo`} /> : <span>{filterName}</span>}
          </div>
          <div>
            <p className="selected-platform-type">{filterType === 'provider' ? 'Streaming platform' : 'Production house'}</p>
            <h1>{filterName}</h1>
            {filterType === 'provider' && <p>Availability in {region}</p>}
          </div>
        </div>
        <div className="platform-tabs">
          <Button className={mediaType === 'movie' ? 'platform-tab active' : 'platform-tab'} onClick={() => changeMediaType('movie')}>Movies</Button>
          <Button className={mediaType === 'tv' ? 'platform-tab active' : 'platform-tab'} onClick={() => changeMediaType('tv')}>TV Shows</Button>
        </div>
      </div>
      {isLoading && <p className="platform-status">Loading titles…</p>}
      {error && <p className="platform-status">{error}</p>}
      {!isLoading && !error && results.length === 0 && <p className="platform-status">No titles found for this selection.</p>}
      <div className="platform-results-grid">
        {results.map((item) => (
          <div className="media-grid-card" key={item.id}>
            <Link to={`/${routeBase}/${item.id}`}>
              {item.poster_path ? <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title || item.name} /> : <div className="platform-no-poster">No poster available</div>}
              <h3>{item.title || item.name}</h3>
            </Link>
            <BookmarkButton isBookmarked={bookmarkedIds.has(String(item.id))} onClick={() => handleBookmarkToggle(item)} className="card-bookmark-button" />
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination-container platform-pagination">
          {startPage > 1 && <button className="pagination-arrow" onClick={() => setPage(startPage - 1)}>&laquo;</button>}
          {pageNumbers.map((pageNumber) => <button key={pageNumber} className={`pagination-button ${pageNumber === page ? 'active' : ''}`} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}
          {endPage < totalPages && <button className="pagination-arrow" onClick={() => setPage(endPage + 1)}>&raquo;</button>}
        </div>
      )}
    </div>
  );
};

export default PlatformResults;
