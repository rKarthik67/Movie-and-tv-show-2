import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BookmarkButton from './BookmarkButton';
import './PosterGridCard.css';

/// A fixed 2:3 frame prevents grid reflow while TMDB artwork is loading.
/// The entrance class is added only after the image is ready, so the chosen
/// poster animation is actually visible instead of finishing behind a blank.
const PosterGridCard = ({ to, posterPath, title, subtitle, isBookmarked, onBookmarkToggle, linkStyle }) => {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const imageUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;

  return (
    <div className="media-grid-card">
      <Link to={to} style={linkStyle}>
        {!ready && <div className="poster-loading-boundary">{failed ? <div className="poster-fallback">No poster available</div> : <div className="poster-skeleton" aria-hidden="true" />}</div>}
        {imageUrl && !failed ? (
          <img className={ready ? 'poster-ready-image' : 'poster-pending-image'} src={imageUrl} alt={title} onLoad={() => setReady(true)} onError={() => setFailed(true)} />
        ) : null}
        <h3>{title}{subtitle ? ` ${subtitle}` : ''}</h3>
      </Link>
      <BookmarkButton isBookmarked={isBookmarked} onClick={onBookmarkToggle} className="card-bookmark-button" />
    </div>
  );
};

export default PosterGridCard;
