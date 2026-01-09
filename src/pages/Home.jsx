import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import logo from '../assets/BuddizLogo.jpeg';
import './Home.css';

const Home = () => {
    const { user, t } = useApp();

    return (
        <div className="home-page animate-fade-in">
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-logo-wrapper animate-float">
                        <img src={logo} alt="Buddiz Beer" className="hero-logo" />
                    </div>
                    <h1 className="hero-title">{t('heroTitle')}</h1>
                    <h2 className="hero-subtitle">{t('heroSubtitle')}</h2>
                    <p className="hero-description">
                        {t('heroDescription')}
                    </p>
                    <div className="hero-actions">
                        {user ? (
                            <Link to="/catalogue" className="btn-primary">{t('viewCatalogue')}</Link>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Link to="/login" className="btn-primary">{t('loginBtn')}</Link>
                                <Link to="/register" className="btn-secondary">{t('signUpBtn')}</Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section id="story" className="story-section container">
                <h3 className="section-title">{t('storyTitle')}</h3>
                <div className="story-content">
                    <p>{t('storyText1')}</p>
                    <p>{t('storyText2')}</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
