import React from 'react';
import TurnedInTwoToneIcon from '@mui/icons-material/TurnedInTwoTone';
import Button from './Button';
import './BookmarkButton.css';

const BookmarkButton = ({ isBookmarked, onClick, className = '' }) => {
  const label = isBookmarked ? 'Remove bookmark' : 'Add bookmark';

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  };

  return (
    <Button
      className={`bookmark-button ${isBookmarked ? 'is-bookmarked' : ''} ${className}`}
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      <svg className="bookmark-gradient-definitions" aria-hidden="true">
        <defs>
          <linearGradient id="ark-bookmark-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a42cff" />
            <stop offset="100%" stopColor="#28c8f7" />
          </linearGradient>
        </defs>
      </svg>
      <TurnedInTwoToneIcon className="bookmark-icon" />
    </Button>
  );
};

export default BookmarkButton;
