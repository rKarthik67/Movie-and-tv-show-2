import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import ark from '../assets/arkplay2.png'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

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

  const handleNavClick = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        {/* <img className="ark" src={ark} alt="" style={{width: '50px'}}/> */}
        ARK PLAY
      </div>
      <nav className="nav">
        <Link to="/" className="nav-link" onClick={(e) => handleNavClick(e, '/')}>Home</Link>
        <Link to="/movies" className="nav-link" onClick={(e) => handleNavClick(e, '/movies')}>Movies</Link>
        <Link to="/tvshows" className="nav-link" onClick={(e) => handleNavClick(e, '/tvshows')}>TV Shows</Link>
        {/* <Link to="/watchlist" className="nav-link" onClick={(e) => handleNavClick(e, '/watchlist')}>Watchlist</Link> */}
      </nav>
    </header>
  );
};

export default Header;