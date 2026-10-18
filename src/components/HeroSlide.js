import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { API_KEY } from '../api';
import Button, { OutlineButton } from './Button';
import './HeroSlide.css';

const HeroSlide = ({ movies }) => {
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0);
  const navigate = useNavigate();

  const openTrailer = (movieId) => {
    // Fetch only the public TMDB trailer identifier, then use the dedicated player route.
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`)
      .then((response) => response.json())
      .then((data) => {
        const trailer = (data.results || []).find((video) => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer?.key) navigate(`/watch/trailer/${movieId}?youtube=${encodeURIComponent(trailer.key)}`);
      })
      .catch(() => {});
  };

  const handleWatchNow = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  const handleSlideChange = (swiper) => {
    setActiveSlideIndex(swiper.activeIndex);
  };

  return (
    <>
      <Swiper
        modules={[Autoplay]}
        grabCursor={true}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 4000 }}
        onSlideChange={handleSlideChange}
      >
        {movies.map((movie, index) => (
          <SwiperSlide key={movie.id}>
            {({ isActive }) => (
              <div
                className={`hero-slide__item ${isActive ? 'active' : ''}`}
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                }}
              >
                <div className='hero-slide__item__content container'>
                  <div className='hero-slide__item__content__info'>
                    <h2 className='movieTitle'>{movie.title}</h2>
                    <div className='overview'>{movie.overview}</div>
                    <div className='btn'>
                      <Button onClick={() => handleWatchNow(movie.id)} className="btn-watchnow">
                        Watch Now
                      </Button>
                      <OutlineButton onClick={() => openTrailer(movie.id)} className="btn-watchtrailer">
                        Watch Trailer
                      </OutlineButton>
                    </div>
                  </div>
                  <div 
                    className={`hero-slide__item__content__poster animate__animated ${activeSlideIndex === index ? 'animate__zoomIn' : ''}`}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                    />
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default HeroSlide;
