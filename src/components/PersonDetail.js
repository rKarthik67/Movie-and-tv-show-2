import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { API_KEY } from '../api';
import './PersonDetail.css';

const PersonDetail = () => {
  const { id } = useParams();
  const [person, setPerson] = useState({});
  const [credits, setCredits] = useState([]);

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
        {credits.length ? (
          <div className="person-credit-grid">
            {credits.map((credit) => {
              const isMovie = credit.media_type === 'movie';
              const title = isMovie ? credit.title : credit.name;
              const releaseDate = isMovie ? credit.release_date : credit.first_air_date;
              return (
                <Link key={`${credit.media_type}-${credit.id}-${credit.character || ''}`} to={isMovie ? `/movies/${credit.id}` : `/tvshows/${credit.id}`} className="person-credit-card">
                  <img src={`https://image.tmdb.org/t/p/w500${credit.poster_path}`} alt={title} />
                  <div>
                    <h3>{title}</h3>
                    <p>{isMovie ? 'Movie' : 'TV Show'}{releaseDate ? ` - ${releaseDate.slice(0, 4)}` : ''}</p>
                    {credit.character && <p className="person-character">as {credit.character}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : <p className="person-empty">No acting credits with artwork are available.</p>}
      </section>
    </div>
  );
};

export default PersonDetail;
