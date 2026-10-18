import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Hls from 'hls.js';
import dashjs from 'dashjs';
import { API_KEY } from '../api';
import { PLAYER_SOURCES, sourceUrl } from '../playerSources';
import { clearPlaybackProgress, getPlaybackProgress, savePlaybackProgress } from '../playbackStorage';
import './WatchPlayer.css';

const numberParam = (value, fallback) => Number.parseInt(value || '', 10) || fallback;

const WatchPlayer = () => {
  const { type, id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const dashRef = useRef(null);
  const [details, setDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [nextEpisode, setNextEpisode] = useState(null);
  const [showResume, setShowResume] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  const season = numberParam(params.get('season'), 1);
  const episode = numberParam(params.get('episode'), 1);
  const source = params.get('source') || 'vidsync';
  const youtubeKey = params.get('youtube');
  // A direct manifest must be supplied by a source you are authorised to use.
  const manifest = params.get('manifest');
  const introStart = Number(params.get('introStart'));
  const introEnd = Number(params.get('introEnd'));
  const identity = useMemo(() => ({ type, id, season: type === 'tv' ? season : null, episode: type === 'tv' ? episode : null }), [type, id, season, episode]);
  const isNativePlayback = Boolean(manifest);
  const embedUrl = useMemo(() => youtubeKey
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeKey)}?autoplay=1`
    : sourceUrl(source, type, id, season, episode), [source, type, id, season, episode, youtubeKey]);

  useEffect(() => {
    let alive = true;
    axios.get(`https://api.themoviedb.org/3/${type === 'tv' ? 'tv' : 'movie'}/${id}?api_key=${API_KEY}`)
      .then((response) => alive && setDetails(response.data))
      .catch((error) => console.warn('Unable to load player metadata:', error));
    return () => { alive = false; };
  }, [id, type]);

  useEffect(() => {
    if (type !== 'tv') return undefined;
    let alive = true;
    // This is deliberately fetched while the player is open: the following episode metadata is ready before a click.
    axios.get(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${API_KEY}`)
      .then((response) => {
        if (!alive) return;
        const list = response.data.episodes || [];
        setEpisodes(list);
        const currentIndex = list.findIndex((item) => item.episode_number === episode);
        setNextEpisode(currentIndex >= 0 ? list[currentIndex + 1] || null : null);
      })
      .catch((error) => console.warn('Unable to prefetch season metadata:', error));
    return () => { alive = false; };
  }, [episode, id, season, type]);

  useEffect(() => {
    if (!isNativePlayback) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;
    const previous = getPlaybackProgress(identity);
    setShowResume(Boolean(previous?.position > 15));
    const isDash = /\.mpd(?:$|[?#])/i.test(manifest);
    const isHls = /\.m3u8(?:$|[?#])/i.test(manifest);
    if (isDash) {
      dashRef.current = dashjs.MediaPlayer().create();
      dashRef.current.initialize(video, manifest, false);
    } else if (isHls && Hls.isSupported()) {
      hlsRef.current = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current.loadSource(manifest);
      hlsRef.current.attachMedia(video);
    } else {
      video.src = manifest;
    }
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      dashRef.current?.reset();
      dashRef.current = null;
    };
  }, [identity, isNativePlayback, manifest]);

  const goToEpisode = useCallback((next) => {
    if (!next) return;
    const nextParams = new URLSearchParams({ source, season: String(season), episode: String(next.episode_number) });
    navigate(`/watch/tv/${id}?${nextParams.toString()}`);
  }, [id, navigate, season, source]);

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.currentTime)) return;
    savePlaybackProgress(identity, { position: video.currentTime, duration: video.duration, title: details?.title || details?.name || 'Untitled' });
    if (Number.isFinite(video.duration)) setRemainingSeconds(Math.max(0, Math.ceil(video.duration - video.currentTime)));
  };

  const resume = () => {
    const previous = getPlaybackProgress(identity);
    if (videoRef.current && previous?.position) videoRef.current.currentTime = previous.position;
    setShowResume(false);
    videoRef.current?.play().catch(() => {});
  };

  const startOver = () => {
    clearPlaybackProgress(identity);
    if (videoRef.current) videoRef.current.currentTime = 0;
    setShowResume(false);
  };

  const onEnded = () => {
    clearPlaybackProgress(identity);
    goToEpisode(nextEpisode);
  };

  const canSkipIntro = isNativePlayback && Number.isFinite(introStart) && Number.isFinite(introEnd) && introEnd > introStart;
  const introVisible = canSkipIntro && videoRef.current && videoRef.current.currentTime >= introStart && videoRef.current.currentTime < introEnd;
  const title = details?.title || details?.name || 'Loading…';
  const availableSeasons = (details?.seasons || []).filter((item) => item.season_number >= 0 && item.episode_count > 0);

  const changeSeason = (nextSeason) => {
    navigate(`/watch/tv/${id}?${new URLSearchParams({ source, season: String(nextSeason), episode: '1' }).toString()}`);
  };

  return (
    <div className="watch-page">
      <header className="watch-header">
        <button type="button" className="watch-back" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <div>
          <Link to={type === 'tv' ? `/tvshows/${id}` : `/movies/${id}`}>{title}{type === 'trailer' ? ' — Trailer' : ''}</Link>
          {type === 'tv' ? <span className="watch-episode-label">Season {season}, Episode {episode}</span> : null}
        </div>
      </header>

      <main className={`watch-main ${type === 'tv' ? 'watch-main-tv' : ''}`}>
        <section className="watch-stage">
          {isNativePlayback ? (
            <>
              <video ref={videoRef} className="watch-video" controls playsInline onTimeUpdate={onTimeUpdate} onEnded={onEnded} />
              {showResume ? <div className="resume-card"><strong>Continue watching?</strong><button onClick={resume}>Resume</button><button onClick={startOver}>Start over</button></div> : null}
              {introVisible ? <button className="skip-intro" onClick={() => { videoRef.current.currentTime = introEnd; }}>Skip intro</button> : null}
              {nextEpisode && remainingSeconds !== null && remainingSeconds <= 30 && remainingSeconds > 0 ? <div className="up-next"><span>Up next: {nextEpisode.name || `Episode ${nextEpisode.episode_number}`}</span><button onClick={() => goToEpisode(nextEpisode)}>Play now</button></div> : null}
            </>
          ) : (
            <iframe className="watch-embed" src={embedUrl} title={`${title} player`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          )}
        </section>

        {type === 'tv' ? <aside className="episode-rail" aria-label="Episodes">
          <div className="episode-rail-heading">
            <strong>Episodes</strong>
            <label>
              <span className="sr-only">Season</span>
              <select value={season} onChange={(event) => changeSeason(event.target.value)}>
                {availableSeasons.map((item) => <option key={item.id} value={item.season_number}>{item.name || `Season ${item.season_number}`}</option>)}
              </select>
            </label>
          </div>
          <div className="episode-rail-list">
            {episodes.map((item) => {
              const selected = item.episode_number === episode;
              return <button
                key={item.id || item.episode_number}
                type="button"
                className={`episode-rail-item ${selected ? 'active' : ''}`}
                onClick={() => goToEpisode(item)}
              >
                {item.still_path ? <img src={`https://image.tmdb.org/t/p/w300${item.still_path}`} alt="" /> : <span className="episode-image-placeholder">Episode {item.episode_number}</span>}
                <span className="episode-rail-copy"><b>{item.episode_number}. {item.name || `Episode ${item.episode_number}`}</b><small>{item.runtime ? `${item.runtime} min` : item.air_date || ''}</small></span>
              </button>;
            })}
          </div>
        </aside> : null}

        <section className="watch-controls">
          <div>
            <h1>{title}</h1>
            {type === 'tv' ? <p>Season {season} · Episode {episode}{episodes.find((item) => item.episode_number === episode)?.name ? ` — ${episodes.find((item) => item.episode_number === episode).name}` : ''}</p> : null}
          </div>
          {!isNativePlayback && !youtubeKey ? <p className="watch-note">Embed players run on their own sites, so browser security prevents resume time, end detection, and automatic next-episode playback. Those work for authorised HLS/DASH manifests in the native player.</p> : null}
          {!youtubeKey ? <div className="watch-source-list" aria-label="Choose a player">
            {PLAYER_SOURCES.map((item) => <button key={item.id} className={item.id === source ? 'active' : ''} onClick={() => navigate(`/watch/${type}/${id}?${new URLSearchParams({ source: item.id, ...(type === 'tv' ? { season: String(season), episode: String(episode) } : {}) }).toString()}`)}>{item.label}</button>)}
          </div> : null}
        </section>
      </main>
    </div>
  );
};

export default WatchPlayer;
