import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from './Slider';
import { API_KEY } from '../api';
import './TVShowDetail.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Button from './Button';

const TVShowDetail = () => {
  const { id } = useParams();
  const [show, setShow] = useState({});
  const [cast, setCast] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [similarShows, setSimilarShows] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [currentServer, setCurrentServer] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const navigate = useNavigate();
  const videoSectionRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetchShowDetails();
      await fetchEpisodes(1); // Default to the first season
      setCurrentServer(`https://multiembed.mov/?video_id=${id}&tmdb=1&s=1&e=1`);
    };
  
    fetchData();
    window.scrollTo(0, 0);
  }, [id]); // Only include `id` as the dependency
  

  const fetchShowDetails = async () => {
    const showRes = await axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`);
    setShow(showRes.data);
    setSeasons(showRes.data.seasons);

    const castRes = await axios.get(`https://api.themoviedb.org/3/tv/${id}/credits?api_key=${API_KEY}`);
    setCast(castRes.data.cast.slice(0, 10));

    const videosRes = await axios.get(`https://api.themoviedb.org/3/tv/${id}/videos?api_key=${API_KEY}`);
    setRelatedVideos(videosRes.data.results.slice(0, 4));

    const similarShowsRes = await axios.get(`https://api.themoviedb.org/3/tv/${id}/similar?api_key=${API_KEY}`);
    setSimilarShows(similarShowsRes.data.results);
  };

  const fetchEpisodes = async (seasonNumber) => {
    const episodesRes = await axios.get(`https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`);
    setEpisodes(episodesRes.data.episodes);
  };

  const handleSeasonSelect = async (seasonNumber) => {
    setSelectedSeason(seasonNumber);
    await fetchEpisodes(seasonNumber);
    setSelectedEpisode(1);
    setCurrentServer(`https://multiembed.mov/?video_id=${id}&tmdb=1&s=${seasonNumber}&e=1`);
  };

  const handleEpisodeSelect = (episodeNumber) => {
    setSelectedEpisode(episodeNumber);
    setCurrentServer(`https://multiembed.mov/?video_id=${id}&tmdb=1&s=${selectedSeason}&e=${episodeNumber}`);
  };

  const handleServerChange = (serverUrl) => {
    setCurrentServer(serverUrl);
    videoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleItemClick = (id, type) => {
    navigate(`/tvshows/${id}`);
  };

  return (
    <div>
      <section className='backdrop-image' style={{
        background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(https://image.tmdb.org/t/p/original${show.backdrop_path}) no-repeat center center/cover`,
        padding: '100px', color: '#fff', paddingBottom: '60px'
      }}>
        <div style={{ display: 'flex'}} className='tvshow-details-div'>
          <img className='poster-image' src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} alt={show.name} style={{ width: '300px', borderRadius: '10px' }} />
          <div className='series-info' style={{ marginLeft: '20px' }}>
            <h1>{show.name}</h1>
            <div className="genres">
              {show.genres && show.genres.slice(0, 5).map((genre) => (
                <span key={genre.id} className="genres__item">{genre.name}</span>
              ))}
            </div>
            <p>{show.overview}</p>
            <Button className='btn-playnow' style={{ margin: '10px 0' }}>Play Now</Button>
          </div>
        </div>
      </section>

      <section className='cast-section'>
        <div className='cast-slider'>
          <h2>Cast</h2>
          <Swiper
            spaceBetween={10}
            slidesPerView={'auto'}
            breakpoints={{
              480: { slidesPerView: 3 },
              768: { slidesPerView: 5 },
              1024: { slidesPerView: 8 },
            }}
            loop={false}
          >
            {cast.map(member => (
              <SwiperSlide key={member.id}>
                <div style={{ margin: '10px' }}>
                  <img
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

      <section className='seasons-episode-sections'>
        <div className='seasons-list'>
          <h2>Seasons</h2>
          <Swiper
            spaceBetween={10}
            slidesPerView={'auto'}
            breakpoints={{
              480: { slidesPerView: 3 },
              768: { slidesPerView: 5 },
              1024: { slidesPerView: 8 },
            }}
            loop={false}
          >
            {seasons.map(season => (
              <SwiperSlide key={season.id} onClick={() => handleSeasonSelect(season.season_number)}>
                <div style={{ margin: '10px', cursor: 'pointer' }}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${season.poster_path}`}
                    alt={season.name}
                    style={{ borderRadius: '10px', width: '100%' }}
                  />
                  <p>{season.name}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className='episode-list'>
          <h2>Episodes</h2>
          {selectedSeason && (
            <Swiper
              spaceBetween={10}
              slidesPerView={'auto'}
              breakpoints={{
                480: { slidesPerView: 3 },
                768: { slidesPerView: 5 },
                1024: { slidesPerView: 8 },
              }}
              loop={false}
            >
              {episodes.map(episode => (
                <SwiperSlide key={episode.id} onClick={() => handleEpisodeSelect(episode.episode_number)}>
                  <div style={{ margin: '10px', cursor: 'pointer' }}>
                    <img
                      src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                      alt={episode.name}
                      style={{ borderRadius: '10px', width: '100%' }}
                    />
                    <p>{episode.name}</p>
                    <h3>Episode {episode.episode_number}</h3>
                  </div>       
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      <section className='server-section'>
        <div className='server-player'>
          <div ref={videoSectionRef} className="video-player">
            <iframe className='iframe-episode'
              src={currentServer}
              width="100%"
              height="500px"
              frameBorder="0"
              allowFullScreen
              title="Episode Player"
            ></iframe>
            <div className='server-buttons'>
              <Button onClick={() => handleServerChange(`https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${selectedSeason}&episode=${selectedEpisode}`)}>Server 1</Button>
              <Button onClick={() => handleServerChange(`https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`)}>Server 2</Button>
              <Button onClick={() => handleServerChange(`https://multiembed.mov/?video_id=${id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`)}>Server 3</Button>
              <Button onClick={() => handleServerChange(`https://moviesapi.club/tv/${id}-${selectedSeason}-${selectedEpisode}`)}>Server 4</Button>
              <Button onClick={() => handleServerChange(`https://player.smashy.stream/tv/${id}?s=${selectedSeason}&e=${selectedEpisode}`)}>Server 5</Button>
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
                title={video.name}
                className="video-iframe"
              ></iframe>
            </div>
          ))}
        </div>
      </section>

      <section className='similar-section'>
        <div className='similar-tvshows'>
          <h2>Similar TV Shows</h2>
          <Slider items={similarShows} onItemClick={handleItemClick} itemType="tv" />
        </div>
      </section>
    </div>
  );
};

export default TVShowDetail;