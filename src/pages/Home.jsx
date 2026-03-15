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
        const handleScroll = () => {
            const storySection = document.getElementById('story');
            const roadmapContainer = document.querySelector('.roadmap-container');
            
            if (roadmapContainer) {
                const rect = roadmapContainer.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // Calculate progress: 0 when top enters bottom of screen, 1 when bottom leaves top of screen
                // We want to fill as the user scrolls through the roadmap items specifically
                const start = rect.top - windowHeight * 0.5;
                const end = rect.height;
                const progress = Math.min(Math.max(-start / end, 0), 1);
                
                document.documentElement.style.setProperty('--roadmap-fill', `${progress * 100}%`);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, { threshold: 0.15 });

        const items = document.querySelectorAll('.roadmap-item, .roadmap-cta');
        items.forEach(item => observer.observe(item));

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            items.forEach(item => observer.unobserve(item));
            window.removeEventListener('scroll', handleScroll);
        };
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
                        <div className="roadmap-point milestone-dream">
                            <svg viewBox="0 0 24 24" className="milestone-icon">
                                <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7M9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1H9v1z"/>
                            </svg>
                        </div>
                        <div className="roadmap-image-container">
                            <img src={imgDream} alt="The Dream" className="roadmap-image" />
                        </div>
                    </div>

                    <div className="roadmap-item right">
                        <div className="roadmap-image-container">
                            <img src={imgBrew} alt="The First Brew" className="roadmap-image" />
                        </div>
                        <div className="roadmap-point milestone-brew">
                            <svg viewBox="0 0 24 24" className="milestone-icon">
                                <path fill="currentColor" d="M7,2H17L16,5H19V21H5V5H8L7,2M9,4L9.67,6H14.33L15,4H9M7,7V19H17V7H7M10,10H12V17H10V10M13,10H15V15H13V10Z"/>
                            </svg>
                        </div>
                        <div className="roadmap-content">
                            <p>{t('storyBrew')}</p>
                        </div>
                    </div>

                    <div className="roadmap-item left">
                        <div className="roadmap-content">
                            <p>{t('storyToday')}</p>
                        </div>
                        <div className="roadmap-point milestone-today">
                            <svg viewBox="0 0 24 24" className="milestone-icon">
                                <path fill="currentColor" d="M4 2h15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1m13 2v4h1V4h-1M6 8v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8H6m2 2h2v5H8v-5m4 0h2v3h-2v-3z"/>
                            </svg>
                        </div>
                        <div className="roadmap-image-container">
                            <img src={imgToday} alt="Buddiz Today" className="roadmap-image" />
                        </div>
                    </div>
                </div>
                
                <div className="roadmap-cta">
                    <Link to="/catalogue" className="beer-glass-btn">
                        <div className="glass-inner">
                            <div className="beer-fill">
                                <div className="bubbles-container">
                                    <div className="bubble"></div>
                                    <div className="bubble"></div>
                                    <div className="bubble"></div>
                                    <div className="bubble"></div>
                                    <div className="bubble"></div>
                                    <div className="bubble"></div>
                                    <div className="bubble"></div>
                                    <div className="bubble"></div>
                                    <div className="bubble"></div>
                                </div>
                            </div>
                            <span className="btn-text">{t('navBrews')}</span>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
