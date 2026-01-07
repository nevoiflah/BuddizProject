import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import logo from '../assets/BuddizLogo.jpeg';
import './Home.css';

const Home = () => {
    const { user } = useApp();

    return (
        <div className="home-page animate-fade-in">
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-logo-wrapper animate-float">
                        <img src={logo} alt="Buddiz Beer" className="hero-logo" />
                    </div>
                    <h1 className="hero-title">Buddiz</h1>
                    <h2 className="hero-subtitle">Let The Dog Out.</h2>
                    <p className="hero-description">
                        Premium craft brewed for the best moments with your best friends.
                    </p>
                    <div className="hero-actions">
                        {user ? (
                            <Link to="/catalogue" className="btn-primary">View Catalogue</Link>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Link to="/login" className="btn-primary">Login</Link>
                                <Link to="/register" className="btn-secondary">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section id="story" className="story-section container">
                <h3 className="section-title">Where it all began</h3>
                <div className="story-content">
                    <p>
                        It started with a simple idea: good beer and good dogs. Buddiz was born from a passion for craft brewing and the joy of seeing our furry friends run free.
                    </p>
                    <p>
                        Every bottle is crafted with the same loyalty and energy that our dogs bring to our lives. Let the dog out, cracked open a cold one, and enjoy the moment.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Home;
