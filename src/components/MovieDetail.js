import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Slider from './Slider';
import { API_KEY } from '../api';
import './MovieDetail.css';  // Ensure CSS is imported
import Button from './Button';
import BookmarkButton from './BookmarkButton';
import { isInWatchlist, toggleWatchlistItem } from '../watchlistStorage';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState({});
    const [cast, setCast] = useState([]);
    const [collection, setCollection] = useState({ name: '', parts: [] });
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [isWatchlisted, setIsWatchlisted] = useState(() => isInWatchlist('movie', id));
    const navigate = useNavigate();

    const fetchMovieDetails = useCallback(async () => {
        try {
            const movieRes = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
            setMovie(movieRes.data);

            const collectionInfo = movieRes.data.belongs_to_collection;
            if (collectionInfo?.id) {
                try {
                    const collectionRes = await axios.get(
                        `https://api.themoviedb.org/3/collection/${collectionInfo.id}?api_key=${API_KEY}`
                    );
                    setCollection({
                        name: collectionRes.data.name || collectionInfo.name || 'Collection',
                        parts: (collectionRes.data.parts || [])
                            .filter((part) => String(part.id) !== String(id))
                            .sort((first, second) => (first.release_date || '').localeCompare(second.release_date || '')),
                    });
                } catch (collectionError) {
                    console.warn('Unable to load movie collection:', collectionError);
                    setCollection({ name: '', parts: [] });
                }
            } else {
                setCollection({ name: '', parts: [] });
            }

            const castRes = await axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`);
            // Keep a browseable selection without rendering TMDB's entire
            // (often very large) credited cast list at once.
            setCast(castRes.data.cast.slice(0, 30));

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
        setIsWatchlisted(isInWatchlist('movie', id));
        window.scrollTo(0, 0);
    }, [fetchMovieDetails, id]);

    const handlePlayNowClick = () => {
        navigate(`/watch/movie/${id}?source=vidsync`);
    };

    const handleWatchlistToggle = () => {
        const added = toggleWatchlistItem('movie', {
            id,
            title: movie.title || 'Untitled Movie',
            posterPath: movie.poster_path,
        });
        setIsWatchlisted(added);
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
                    <div className='poster-bookmark-container'>
                        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className='poster-image' />
                        <BookmarkButton
                            isBookmarked={isWatchlisted}
                            onClick={handleWatchlistToggle}
                            className='poster-bookmark-button'
                        />
                    </div>
                    <div className='movie-info' style={{ marginLeft: '20px' }}>
                        <h1>{movie.title}</h1>
                        <div className="genres">
                            {movie.genres && movie.genres.slice(0, 5).map((genre, i) => (
                                <span key={i} className="genres__item" >{genre.name}</span>
                            ))}
                        </div>
                        <p>{movie.overview}</p>
                        <Button className='btn-playnow' onClick={handlePlayNowClick} style={{ margin: '10px 0' }}>Play Now</Button>
                        <BookmarkButton
                            isBookmarked={isWatchlisted}
                            onClick={handleWatchlistToggle}
                            className='detail-bookmark-button'
                        />
                    </div>
                </div>
            </section>

            {collection.parts.length > 0 ? (
                <section className='collection-section'>
                    <div className='collection-slider'>
                        <h2>{collection.name}</h2>
                        <p className='collection-description'>Connected movies in this official collection</p>
                        <Slider items={collection.parts} onItemClick={handleItemClick} itemType="movie" />
                    </div>
                </section>
            ) : null}

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
                                <Link to={`/people/${member.id}`} className="cast-member" style={{ margin: '10px' }}>
                                    <img className='cast-image'
                                        src={`https://image.tmdb.org/t/p/w500${member.profile_path}`}
                                        alt={member.name}
                                        style={{ borderRadius: '10px', width: '100%' }}
                                    />
                                    <p>{member.name}</p>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>

            <section className='server-section'>
                <div className='server-player'>
                    <div className="video-player">
                        <p>Open the dedicated player and choose a stream source there.</p>
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
                                title={video.name}
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
