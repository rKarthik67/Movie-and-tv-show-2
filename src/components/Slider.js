import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import BookmarkButton from './BookmarkButton';
import { getWatchlist, toggleWatchlistItem } from '../watchlistStorage';
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
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                className="swiper-slide-img"
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

export default Slider;
