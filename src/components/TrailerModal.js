import React from 'react';
import './TrailerModal.css';

const TrailerModal = ({ isOpen, onRequestClose, trailerUrl }) => {
  if (!isOpen) return null;

  return (
    <div className='trailer-modal'>
      <div className='trailer-modal__content'>
        <button className='trailer-modal__close' onClick={onRequestClose}>X</button>
        <iframe
          width="800"
          height="450"
          src={trailerUrl}
          title="Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default TrailerModal;
