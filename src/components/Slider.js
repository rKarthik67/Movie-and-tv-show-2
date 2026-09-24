import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import BookmarkButton from './BookmarkButton';
import { getWatchlist, toggleWatchlistItem } from '../watchlistStorage';
import './PosterGridCard.css';
import './Slider.css';

const Slider = ({ items, onItemClick, itemType }) => {
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    const refreshBookmarks = () => {
      setBookmarkedIds(new Set(getWatchlist(itemType).map((item) => String(item.id))));
    };

    refreshBookmarks();
    window.addEventListener('ark-play-watchlist-updated', refreshBookmarks);
    window.addEventListener('storage', refreshBookmarks);

    return () => {
      window.removeEventListener('ark-play-watchlist-updated', refreshBookmarks);
      window.removeEventListener('storage', refreshBookmarks);
    };
  }, [itemType]);

  const handleBookmarkToggle = (item) => {
    const added = toggleWatchlistItem(itemType, {
      id: item.id,
      title: item.title || item.name || 'Untitled',
      posterPath: item.poster_path,
    });

    setBookmarkedIds((currentIds) => {
      const updatedIds = new Set(currentIds);
      if (added) {
        updatedIds.add(String(item.id));
      } else {
        updatedIds.delete(String(item.id));
      }
      return updatedIds;
    });
  };

  return (
    <Swiper
      spaceBetween={10}
      slidesPerView={4}
      grabCursor={true}
      breakpoints={{
        1024: { slidesPerView: 6.45 },
        768: { slidesPerView: 2 },
        480: { slidesPerView: 2 },
      }}
    >
      {items.map(item => (
        <SwiperSlide key={item.id} onClick={() => onItemClick(item.id, itemType)}>
          <div className="slider-card">
            <div className="slider-poster-container">
              <SliderPoster
                posterPath={item.poster_path}
                title={item.title || item.name}
              />
              <BookmarkButton
                isBookmarked={bookmarkedIds.has(String(item.id))}
                onClick={() => handleBookmarkToggle(item)}
                className="card-bookmark-button"
              />
            </div>
            <h3 className="swiper-slide-title">{item.title || item.name}</h3>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

// This returns the original direct <img> once loaded. The boundary exists
// only while the remote poster is downloading, so it never changes slider
// sizing, poster position, or bookmark placement in the finished card.
const SliderPoster = ({ posterPath, title }) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <div className="slider-poster-loading poster-fallback">No poster available</div>;
  }

  return (
    <>
      {!isReady && <div className="slider-poster-loading"><div className="poster-skeleton" aria-hidden="true" /></div>}
      <img
        src={`https://image.tmdb.org/t/p/w500${posterPath}`}
        alt={title}
        className={isReady ? 'swiper-slide-img poster-ready-image' : 'swiper-slide-img poster-pending-image'}
        onLoad={() => setIsReady(true)}
        onError={() => setHasError(true)}
      />
    </>
  );
};

export default Slider;
