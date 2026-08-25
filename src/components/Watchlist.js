import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookmarkButton from './BookmarkButton';
import { getWatchlist, removeWatchlistItem } from '../watchlistStorage';
import './Watchlist.css';

const WatchlistSection = ({ title, type, items, onRemove }) => (
  <section className="watchlist-section">
    <h2>{title}</h2>
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

  return (
    <div className="watchlist-page">
      <div className="watchlist-heading">
        <h1>My Watchlist</h1>
        <p>Bookmarks are saved in this browser.</p>
      </div>
      <WatchlistSection title="Movies" type="movie" items={watchlists.movie} onRemove={handleRemove} />
      <WatchlistSection title="TV Shows" type="tv" items={watchlists.tv} onRemove={handleRemove} />
    </div>
  );
};

export default Watchlist;
