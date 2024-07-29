import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Slider from './Slider';
import { API_KEY } from '../api';
import './MovieDetail.css';  // Ensure CSS is imported
import Button from './Button';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState({});
    const [cast, setCast] = useState([]);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [currentServer, setCurrentServer] = useState(`https://multiembed.mov/?video_id=${id}&tmdb=1`);
    const videoSectionRef = useRef(null);
    const navigate = useNavigate();

    const fetchMovieDetails = useCallback(async () => {
        try {
            const movieRes = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
            setMovie(movieRes.data);

            const castRes = await axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`);
            setCast(castRes.data.cast.slice(0, 10));

            const videosRes = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
            setRelatedVideos(videosRes.data.results.slice(0, 4)); // Limit to 4 videos

            const similarMoviesRes = await axios.get(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}`);
            setSimilarMovies(similarMoviesRes.data.results);
        } catch (error) {
            console.error("Error fetching movie details:", error);
        }
    }, [id]);

    useEffect(() => {
        fetchMovieDetails();
        setCurrentServer(`https://multiembed.mov/?video_id=${id}&tmdb=1`);
        window.scrollTo(0, 0);
    }, [fetchMovieDetails, id]);

    const handleServerChange = (serverUrl) => {
        setCurrentServer(serverUrl);
        videoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePlayNowClick = () => {
        videoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handleItemClick = (id, type) => {
        navigate(`/movies/${id}`);
    };

    return (
        <div>
            <section className='backdrop-image' style={{
                background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path}) no-repeat center center/cover`,
                padding: '100px', paddingBottom: '60px',
                color: '#fff'
            }}>
                <div style={{ display: 'flex' }} className='movie-details-div'>
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className='poster-image' />
                    <div className='movie-info' style={{ marginLeft: '20px' }}>
                        <h1>{movie.title}</h1>
                        <div className="genres">
                            {movie.genres && movie.genres.slice(0, 5).map((genre, i) => (
                                <span key={i} className="genres__item" >{genre.name}</span>
                            ))}
                        </div>
                        <p>{movie.overview}</p>
                        <Button className='btn-playnow' onClick={handlePlayNowClick} style={{ margin: '10px 0' }}>Play Now</Button>
                    </div>
                </div>
            </section>

            <section className='cast-section'>
                <div className='cast-slider'>
                    <h2>Cast</h2>
                    <Swiper spaceBetween={10} slidesPerView={'auto'} loop={false} breakpoints={{
                        1024: { slidesPerView: 8, },
                        768: { slidesPerView: 5 },
                        480: { slidesPerView: 5 },
                    }}>
                        {cast.map(member => (
                            <SwiperSlide key={member.cast_id}>
                                <div style={{ margin: '10px' }}>
                                    <img className='cast-image'
                                        src={`https://image.tmdb.org/t/p/w500${member.profile_path}`}
                                        alt={member.name}
                                        style={{ borderRadius: '10px', width: '100%' }}
                                    />
                                    <p>{member.name}</p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>

            <section className='server-section'>
                <div className='server-player'>
                    <div ref={videoSectionRef} className="video-player">
                        <iframe className='iframe-movie'
                            src={currentServer}
                            width="100%"
                            height="500px"
                            frameBorder="0"
                            allowFullScreen
                            title="Movie Player"
                        ></iframe>
                        <div className="server-buttons">
                            <Button onClick={() => handleServerChange(`https://vidsrc.xyz/embed/movie/${id}`)}>Server 1</Button>
                            <Button onClick={() => handleServerChange(`https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`)}>Server 2</Button>
                            <Button onClick={() => handleServerChange(`https://multiembed.mov/?video_id=${id}&tmdb=1`)}>Server 3</Button>
                            <Button onClick={() => handleServerChange(`https://moviesapi.club/movie/${id}`)}>Server 4</Button>
                            <Button onClick={() => handleServerChange(`https://player.smashy.stream/movie/${id}`)}>Server 5</Button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="related-videos">
                <div className="videos-list">
                    <h2>Related Videos</h2>
                    {relatedVideos.map(video => (
                        <div key={video.id} className="video-item">
                            <h3 className="video-title">{video.name}</h3>
                            <iframe
                                src={`https://www.youtube.com/embed/${video.key}`}
                                frameBorder="0"
                                allowFullScreen
                                className="video-iframe"
                            ></iframe>
                        </div>
                    ))}
                </div>
            </section>

            <section className='similar-section'>
                <div className='similar-movies'>
                    <h2>Similar Movies</h2>
                    <Slider items={similarMovies} onItemClick={handleItemClick} itemType="movie" />
                </div>
            </section>
        </div>
    );
};

export default MovieDetail;
