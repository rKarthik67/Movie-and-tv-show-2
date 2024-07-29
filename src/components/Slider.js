import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './Slider.css';

const Slider = ({ items, onItemClick, itemType }) => {
  return (
    <Swiper
      spaceBetween={10}
      slidesPerView={4}
      grabCursor={true}
      breakpoints={{
        1024: { slidesPerView: 8 },
        768: { slidesPerView: 2 },
        480: { slidesPerView: 2 },
      }}
    >
      {items.map(item => (
        <SwiperSlide key={item.id} onClick={() => onItemClick(item.id, itemType)}>
          <div>
            <img
              src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
              alt={item.title || item.name}
              className="swiper-slide-img"
            />
            <h3 className="swiper-slide-title">{item.title || item.name}</h3>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Slider;
