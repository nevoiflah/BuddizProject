import React from 'react';
import loadingDog from '../assets/loading-dog.png';
import './Loader.css';

const Loader = ({ fullScreen = true }) => {
    return (
        <div className={`loader-container ${fullScreen ? 'loader-fullscreen' : ''}`}>
            <img src={loadingDog} alt="Loading..." className="loader-dog" />
            <div className="loader-text">Fetching the best brew...</div>
        </div>
    );
};

export default Loader;
