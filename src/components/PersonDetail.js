import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { API_KEY } from '../api';
import BookmarkButton from './BookmarkButton';
import { getWatchlist, toggleWatchlistItem } from '../watchlistStorage';
import './PersonDetail.css';

const PersonDetail = () => {
  const { id } = useParams();
  const [person, setPerson] = useState({});
  const [credits, setCredits] = useState([]);
  const [activeCreditTab, setActiveCreditTab] = useState('movie');
  const [bookmarkedIds, setBookmarkedIds] = useState({ movie: new Set(), tv: new Set() });

  useEffect(() => {
    const refreshBookmarks = () => {
      setBookmarkedIds({
        movie: new Set(getWatchlist('movie').map((item) => String(item.id))),
        tv: new Set(getWatchlist('tv').map((item) => String(item.id))),
      });
    };

    refreshBookmarks();
    window.addEventListener('ark-play-watchlist-updated', refreshBookmarks);
    window.addEventListener('storage', refreshBookmarks);

    return () => {
      window.removeEventListener('ark-play-watchlist-updated', refreshBookmarks);
      window.removeEventListener('storage', refreshBookmarks);
    };
  }, []);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const [personResponse, creditsResponse] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}`),
          axios.get(`https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${API_KEY}`),
        ]);

        setPerson(personResponse.data);
        setCredits(creditsResponse.data.cast
          .filter((credit) => credit.poster_path && (credit.media_type === 'movie' || credit.media_type === 'tv'))
          .sort((first, second) => {
            const firstDate = first.release_date || first.first_air_date || '';
            const secondDate = second.release_date || second.first_air_date || '';
            return secondDate.localeCompare(firstDate);
          }));
      } catch (error) {
        console.error('Error fetching person details:', error);
      }
    };

    fetchPerson();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBookmarkToggle = (credit) => {
    const type = credit.media_type;
    const added = toggleWatchlistItem(type, {
      id: credit.id,
      title: credit.title || credit.name || `Untitled ${type === 'movie' ? 'Movie' : 'TV Show'}`,
      posterPath: credit.poster_path,
    });

    setBookmarkedIds((currentIds) => {
      const updatedIds = new Set(currentIds[type]);
      if (added) {
        updatedIds.add(String(credit.id));
      } else {
        updatedIds.delete(String(credit.id));
      }
      return { ...currentIds, [type]: updatedIds };
    });
  };

  const renderCreditSection = (title, type) => {
    const sectionCredits = credits.filter((credit) => credit.media_type === type);

    return (
      <section className="person-credit-section">
        <h2>{title}</h2>
        {sectionCredits.length ? (
          <div className="person-credit-grid">
            {sectionCredits.map((credit) => {
              const isMovie = type === 'movie';
              const creditTitle = isMovie ? credit.title : credit.name;
              const releaseDate = isMovie ? credit.release_date : credit.first_air_date;
              return (
                <article className="person-credit-card media-grid-card" key={`${type}-${credit.id}-${credit.character || ''}`}>
                  <Link to={isMovie ? `/movies/${credit.id}` : `/tvshows/${credit.id}`}>
                    <img src={`https://image.tmdb.org/t/p/w500${credit.poster_path}`} alt={creditTitle} />
                    <div>
                      <h3>{creditTitle}</h3>
                      <p>{isMovie ? 'Movie' : 'TV Show'}{releaseDate ? ` - ${releaseDate.slice(0, 4)}` : ''}</p>
                      {credit.character && <p className="person-character">as {credit.character}</p>}
                    </div>
                  </Link>
                  <BookmarkButton
                    isBookmarked={bookmarkedIds[type].has(String(credit.id))}
                    onClick={() => handleBookmarkToggle(credit)}
                    className="card-bookmark-button"
                  />
                </article>
              );
            })}
          </div>
        ) : <p className="person-empty">No {type === 'movie' ? 'movie' : 'TV show'} credits with artwork are available.</p>}
      </section>
    );
  };

  return (
    <div className="person-page">
      <section className="person-header">
        {person.profile_path ? <img src={`https://image.tmdb.org/t/p/w500${person.profile_path}`} alt={person.name} className="person-profile" /> : <div className="person-profile person-profile-placeholder">No photo available</div>}
        <div className="person-summary">
          <p className="person-eyebrow">Actor / Actress Info</p>
          <h1>{person.name}</h1>
          {person.birthday && <p><strong>Born:</strong> {person.birthday}{person.place_of_birth ? ` - ${person.place_of_birth}` : ''}</p>}
          {person.known_for_department && <p><strong>Known for:</strong> {person.known_for_department}</p>}
          {person.biography ? <p className="person-biography">{person.biography}</p> : <p className="person-biography">Biography is not available yet.</p>}
        </div>
      </section>

      <section className="person-credits">
        <h2>Acting Credits</h2>
        <div className="person-credit-tabs" role="tablist" aria-label="Acting credit type">
          <button
            type="button"
            role="tab"
            aria-selected={activeCreditTab === 'movie'}
            className={activeCreditTab === 'movie' ? 'active' : ''}
            onClick={() => setActiveCreditTab('movie')}
          >
            Movies
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCreditTab === 'tv'}
            className={activeCreditTab === 'tv' ? 'active' : ''}
            onClick={() => setActiveCreditTab('tv')}
          >
            TV Shows
          </button>
        </div>
        {renderCreditSection(activeCreditTab === 'movie' ? 'Movies' : 'TV Shows', activeCreditTab)}
      </section>
    </div>
  );
};

export default PersonDetail;
