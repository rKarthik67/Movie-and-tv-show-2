import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import LiveTvRoundedIcon from '@mui/icons-material/LiveTvRounded';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const links = [
    ['/', 'Home', <HomeRoundedIcon />], ['/movies', 'Movies', <MovieRoundedIcon />],
    ['/tvshows', 'TV Shows', <LiveTvRoundedIcon />], ['/platforms', 'Platforms', <AppsRoundedIcon />],
    ['/credits', 'Credits', <ContactsRoundedIcon />],
    ['/watchlist', 'Watchlist', <BookmarkRoundedIcon />], ['/settings', 'Settings', <SettingsRoundedIcon />],
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        ARK<span>PLAY</span>
      </div>
      <nav className="nav">
        {links.map(([path, label, icon]) => (
          <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {icon}<span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Header;
