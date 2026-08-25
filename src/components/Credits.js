import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_KEY } from '../api';
import Button from './Button';
import './Credits.css';

const CREDIT_FILTERS = [
  { id: 'all', label: 'All people', matches: () => true },
  { id: 'actor', label: 'Actors', matches: (person) => person.known_for_department === 'Acting' && person.gender === 2 },
  { id: 'actress', label: 'Actresses', matches: (person) => person.known_for_department === 'Acting' && person.gender === 1 },
  { id: 'writer', label: 'Writers', matches: (person) => person.known_for_department === 'Writing' },
  { id: 'director', label: 'Directors', matches: (person) => person.known_for_department === 'Directing' },
];

const getRandomPages = () => [...new Set(Array.from({ length: 4 }, () => Math.floor(Math.random() * 500) + 1))];
const ADULT_PREFERENCE_KEY = 'ark-play:credits-include-adult';

const Credits = () => {
  const [people, setPeople] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [includeAdult, setIncludeAdult] = useState(() => window.localStorage.getItem(ADULT_PREFERENCE_KEY) === 'true');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRandomPeople = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSearchResults(null);

    try {
      const responses = await Promise.all(
        getRandomPages().map((page) => axios.get(`https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}&language=en-US&page=${page}&include_adult=${includeAdult}`))
      );
      const uniquePeople = [...new Map(
        responses.flatMap((response) => response.data.results).map((person) => [person.id, person])
      ).values()];
      setPeople(uniquePeople);
    } catch (requestError) {
      console.error('Error loading credits:', requestError);
      setError('Unable to load people right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [includeAdult]);

  useEffect(() => {
    loadRandomPeople();
  }, [loadRandomPeople]);

  useEffect(() => {
    window.localStorage.setItem(ADULT_PREFERENCE_KEY, includeAdult.toString());
  }, [includeAdult]);

  useEffect(() => {
    const toggleAdultContent = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setIncludeAdult((current) => !current);
      }
    };

    window.addEventListener('keydown', toggleAdultContent);
    return () => window.removeEventListener('keydown', toggleAdultContent);
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    const searchTerm = query.trim();

    if (!searchTerm) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(searchTerm)}&include_adult=${includeAdult}`);
      setSearchResults(response.data.results);
    } catch (requestError) {
      console.error('Error searching people:', requestError);
      setError('Unable to search people right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedFilter = CREDIT_FILTERS.find((filter) => filter.id === activeFilter);
  const sourcePeople = searchResults || people;
  const visiblePeople = sourcePeople.filter(selectedFilter.matches);

  return (
    <div className="credits-page">
      <section className="credits-heading">
        <p className="credits-eyebrow">Behind every great story</p>
        <h1>Credits</h1>
        <p>Discover actors, actresses, writers, and directors.</p>
      </section>

      <div className="credits-controls">
        <form className="credits-search" onSubmit={handleSearch}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search actors, directors, writers..."
            aria-label="Search people"
          />
          <Button className="small" type="submit">Search</Button>
        </form>
        <Button className="small credits-refresh" onClick={loadRandomPeople}>Show random people</Button>
      </div>

      <div className="credits-filters" role="group" aria-label="Filter people by profession">
        {CREDIT_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={activeFilter === filter.id ? 'active' : ''}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? <p className="credits-message">Loading people...</p> : null}
      {!isLoading && error ? <p className="credits-message">{error}</p> : null}
      {!isLoading && !error && visiblePeople.length === 0 ? <p className="credits-message">No people found for this filter.</p> : null}

      {!isLoading && !error && visiblePeople.length > 0 ? (
        <div className="credits-grid">
          {visiblePeople.map((person) => (
            <Link key={person.id} to={`/people/${person.id}`} className="credit-person-card">
              {person.profile_path ? (
                <img src={`https://image.tmdb.org/t/p/w500${person.profile_path}`} alt={person.name} />
              ) : (
                <div className="credit-person-placeholder">No photo available</div>
              )}
              <h2>{person.name}</h2>
              <p>{person.known_for_department || 'Film & TV'}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Credits;
