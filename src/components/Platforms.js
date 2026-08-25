import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { API_KEY } from '../api';
import bg from '../assets/footer-bg.jpg';
import { OTT_PLATFORMS, PRODUCTION_HOUSES } from '../platformFilters';
import './Platforms.css';

const FilterSlider = ({ title, filters, filterType, region, logos }) => (
  <section className="platform-slider-section">
    <h2>{title}</h2>
    <Swiper className="platform-swiper" spaceBetween={14} slidesPerView="auto" grabCursor>
      {filters.map((filter) => (
        <SwiperSlide key={`${filterType}-${filter.id}-${filter.name}`}>
          <Link className="platform-card" to={`/platforms/${filterType}/${filter.id}?name=${encodeURIComponent(filter.name)}&region=${region}`}>
            <div className={`platform-logo ${filterType}-logo`}>
              {filter.commonsLogo || logos[filter.id] ? <img src={filter.commonsLogo || `https://image.tmdb.org/t/p/original${logos[filter.id]}`} alt={`${filter.name} logo`} /> : <span>{filter.name}</span>}
            </div>
            <h3>{filter.name}</h3>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

const Platforms = () => {
  const [region, setRegion] = useState('IN');
  const [providerLogos, setProviderLogos] = useState({});
  const [companyLogos, setCompanyLogos] = useState({});

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const providersResponse = await axios.get(`https://api.themoviedb.org/3/watch/providers/movie?api_key=${API_KEY}`);
        setProviderLogos(Object.fromEntries(providersResponse.data.results.map((provider) => [provider.provider_id, provider.logo_path])));

        const companyResponses = await Promise.allSettled(PRODUCTION_HOUSES.map(async (company) => {
          const response = await axios.get(`https://api.themoviedb.org/3/company/${company.id}?api_key=${API_KEY}`);
          return [company.id, response.data.logo_path];
        }));
        setCompanyLogos(Object.fromEntries(companyResponses
          .filter((result) => result.status === 'fulfilled' && result.value[1])
          .map((result) => result.value)));
      } catch (error) {
        console.error('Error loading platform logos:', error);
      }
    };

    fetchLogos();
  }, []);

  return (
    <div className="platforms-page">
      <div className="platforms-hero" style={{ backgroundImage: `url(${bg})` }}>
        <div><h1>Platforms</h1><p>Choose an OTT platform or production house to browse its movies and TV shows.</p></div>
      </div>
      <div className="platforms-content">
        <div className="platform-region">
          <label htmlFor="platform-region">Streaming region</label>
          <select id="platform-region" value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="IN">India</option><option value="US">United States</option><option value="GB">United Kingdom</option><option value="CA">Canada</option><option value="AU">Australia</option>
          </select>
        </div>
        <FilterSlider title="OTT Platforms" filters={OTT_PLATFORMS} filterType="provider" region={region} logos={providerLogos} />
        <FilterSlider title="Production Houses" filters={PRODUCTION_HOUSES} filterType="company" region={region} logos={companyLogos} />
      </div>
    </div>
  );
};

export default Platforms;
