import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import logo from '../assets/BuddizLogo.jpeg';
import imgDream from '../assets/story_milestone_1_dream_1773317636628.png';
import imgBrew from '../assets/story_milestone_2_brew_1773317658671.png';
import imgToday from '../assets/story_milestone_3_today_v2_1773318977847.png';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Home.css';

const Home = () => {
    const { user, t } = useApp();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    // Remove class when out of view to re-trigger on scroll up
                    entry.target.classList.remove('in-view');
                }
            });
        }, { threshold: 0.2 });

        const items = document.querySelectorAll('.roadmap-item');
        items.forEach(item => observer.observe(item));

        return () => items.forEach(item => observer.unobserve(item));
    }, []);

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
                                <div className="home-lang-switch">
                                    <LanguageSwitcher />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section id="story" className="story-section container">
                <h3 className="section-title">{t('storyTitle')}</h3>
                <div className="roadmap-container">
                    <div className="roadmap-line"></div>
                    
                    <div className="roadmap-item left">
                        <div className="roadmap-content">
                            <p>{t('storyDream')}</p>
                        </div>
                        <div className="roadmap-point"></div>
                        <div className="roadmap-image-container">
                            <img src={imgDream} alt="The Dream" className="roadmap-image" />
                        </div>
                    </div>

                    <div className="roadmap-item right">
                        <div className="roadmap-image-container">
                            <img src={imgBrew} alt="The First Brew" className="roadmap-image" />
                        </div>
                        <div className="roadmap-point"></div>
                        <div className="roadmap-content">
                            <p>{t('storyBrew')}</p>
                        </div>
                    </div>

                    <div className="roadmap-item left">
                        <div className="roadmap-content">
                            <p>{t('storyToday')}</p>
                        </div>
                        <div className="roadmap-point"></div>
                        <div className="roadmap-image-container">
                            <img src={imgToday} alt="Buddiz Today" className="roadmap-image" />
                        </div>
                    </div>
                </div>
                
                <div className="roadmap-cta" style={{ textAlign: 'center', marginTop: 'var(--spacing-2xl)' }}>
                    <Link to="/catalogue" className="btn-primary roadmap-cta-btn" style={{ padding: '16px 32px', fontSize: '1.2rem', borderRadius: '50px' }}>
                        <span>{t('navBrews')}</span>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
