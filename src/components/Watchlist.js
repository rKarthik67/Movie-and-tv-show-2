import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookmarkButton from './BookmarkButton';
import { getWatchlist, removeWatchlistItem } from '../watchlistStorage';
import './Watchlist.css';

const WATCHLIST_SORT_KEY = 'ark-play:watchlist-sort';
const sortChoices = [
  ['added-desc', 'Date added — newest first'],
  ['added-asc', 'Date added — oldest first'],
  ['title-asc', 'Title — A to Z'],
  ['rating-desc', 'Rating — highest first'],
];

const addedAt = (item) => {
  const value = Date.parse(item.addedAt || '');
  return Number.isFinite(value) ? value : 0;
};
const sortItems = (items, sort) => items
  .map((item, index) => ({ item, index }))
  .sort((a, b) => {
    if (sort === 'added-asc') return addedAt(a.item) - addedAt(b.item) || a.index - b.index;
    if (sort === 'title-asc') return (a.item.title || '').localeCompare(b.item.title || '') || a.index - b.index;
    if (sort === 'rating-desc') return Number(b.item.voteAverage || 0) - Number(a.item.voteAverage || 0) || a.index - b.index;
    return addedAt(b.item) - addedAt(a.item) || a.index - b.index;
  })
  .map(({ item }) => item);

const WatchlistSection = ({ type, items, onRemove }) => (
  <section className="watchlist-section">
    {items.length === 0 ? (
      <p className="watchlist-empty">No {type === 'movie' ? 'movies' : 'TV shows'} bookmarked yet.</p>
    ) : (
      <div className="watchlist-grid">
        {items.map((item) => (
          <article className="watchlist-card media-grid-card" key={item.id}>
            <Link to={`/${type === 'movie' ? 'movies' : 'tvshows'}/${item.id}`}>
              {item.posterPath ? (
                <img src={`https://image.tmdb.org/t/p/w500${item.posterPath}`} alt={item.title} />
              ) : (
                <div className="watchlist-no-poster">No poster available</div>
              )}
              <h3>{item.title}</h3>
            </Link>
            <BookmarkButton isBookmarked onClick={() => onRemove(type, item.id)} className="card-bookmark-button" />
          </article>
        ))}
      </div>
    )}
  </section>
);

const Watchlist = () => {
  const [watchlists, setWatchlists] = useState({ movie: [], tv: [] });
  const [activeTab, setActiveTab] = useState('movie');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(() => localStorage.getItem(WATCHLIST_SORT_KEY) || 'added-desc');

  const refreshWatchlists = useCallback(() => {
    setWatchlists({ movie: getWatchlist('movie'), tv: getWatchlist('tv') });
  }, []);

  useEffect(() => {
    refreshWatchlists();
    window.addEventListener('ark-play-watchlist-updated', refreshWatchlists);
    window.addEventListener('storage', refreshWatchlists);

    return () => {
      window.removeEventListener('ark-play-watchlist-updated', refreshWatchlists);
      window.removeEventListener('storage', refreshWatchlists);
    };
  }, [refreshWatchlists]);

  const handleRemove = (type, id) => {
    removeWatchlistItem(type, id);
    refreshWatchlists();
  };

  const shownItems = sortItems(watchlists[activeTab].filter((item) => {
    const search = query.trim().toLowerCase();
    if (!search) return true;
    return item.title?.toLowerCase().includes(search) ||
      String(item.releaseDate || '').includes(search);
  }), sort);

  const handleSortChange = (event) => {
    const nextSort = event.target.value;
    setSort(nextSort);
    localStorage.setItem(WATCHLIST_SORT_KEY, nextSort);
  };

  return (
    <div className="watchlist-page">
      <div className="watchlist-heading">
        <h1>My Watchlist</h1>
        <p>Newest additions appear first.</p>
      </div>
      <div className="watchlist-tabs" role="tablist" aria-label="Watchlist type">
        <button className={`watchlist-tab ${activeTab === 'movie' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'movie'} onClick={() => setActiveTab('movie')}>Movies <span>{watchlists.movie.length}</span></button>
        <button className={`watchlist-tab ${activeTab === 'tv' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'tv'} onClick={() => setActiveTab('tv')}>TV Shows <span>{watchlists.tv.length}</span></button>
      </div>
      <label className="watchlist-sort"><span>Sort by</span><select value={sort} onChange={handleSortChange}>{sortChoices.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <div className="watchlist-search">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your watchlist" aria-label="Search your watchlist" />
        {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
      </div>
      {shownItems.length === 0 && query.trim() ? (
        <p className="watchlist-empty">No matching titles in your watchlist.</p>
      ) : <WatchlistSection type={activeTab} items={shownItems} onRemove={handleRemove} />}
    </div>
  );
};

export default Watchlist;
