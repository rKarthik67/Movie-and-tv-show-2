import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TrailerModal from './TrailerModal';
import { API_KEY } from '../api';
import Button, { OutlineButton } from './Button';
import './HeroSlide.css';

const HeroSlide = ({ movies }) => {
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [trailerUrl, setTrailerUrl] = React.useState('');
  const navigate = useNavigate();

  const openModal = (movieId) => {
    axios
      .get(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`)
      .then((res) => {
        const trailer = res.data.results.find((video) => video.type === 'Trailer');
        setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`);
        setModalIsOpen(true);
      });
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setTrailerUrl('');
  };

  const handleWatchNow = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  return (
    <>
      <Swiper
        modules={[Autoplay]}
        grabCursor={true}
        spaceBetween={0}
        slidesPerView={1}
        // autoplay={{ delay: 3000 }}
        autoplay={false}
      >
        {movies.map((movie) => (
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
                      <OutlineButton onClick={() => openModal(movie.id)} className="btn-watchtrailer">
                        Watch Trailer
                      </OutlineButton>
                    </div>
                  </div>
                  <div className='hero-slide__item__content__poster'>
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
      <TrailerModal isOpen={modalIsOpen} onRequestClose={closeModal} trailerUrl={trailerUrl} />
    </>
  );
};

export default HeroSlide;
