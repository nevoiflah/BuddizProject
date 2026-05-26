import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    motion,
    useScroll,
    useTransform,
    useReducedMotion,
} from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useMeta } from '../hooks/useMeta';
import imgDream from '../assets/story_milestone_1_dream_1773317636628.png';
import imgBrew from '../assets/story_milestone_2_brew_1773317658671.png';
import imgToday from '../assets/story_milestone_3_today_v2_1773318977847.png';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Home.css';

const Home = () => {
    const { user, t } = useApp();
    useMeta({ title: 'Buddiz Beer | Craft Beer Delivered', description: 'Discover Buddiz – premium craft beers delivered. Shop IPA, Lager, Stout and more.' });

    const heroRef = useRef(null);
    const rafRef = useRef(null);
    const reduced = useReducedMotion();

    // ── Hero parallax ──────────────────────────────────────────────
    const { scrollYProgress: heroProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const logoY    = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0, -100]);
    const contentY = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0,  -55]);
    const descY    = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0,  -25]);

    // ── Roadmap line fill (scroll-linked CSS var) ──────────────────
    useEffect(() => {
        const handleScroll = () => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(() => {
                const container = document.querySelector('.roadmap-container');
                if (container) {
                    const rect = container.getBoundingClientRect();
                    const progress = Math.min(Math.max(-(rect.top - window.innerHeight * 0.5) / rect.height, 0), 1);
                    document.documentElement.style.setProperty('--roadmap-fill', `${progress * 100}%`);
                }
                rafRef.current = null;
            });
        };

        // Keep IntersectionObserver only for milestone-point CSS pulse + mobile beer fill
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('in-view', entry.isIntersecting);
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.roadmap-item, .roadmap-cta').forEach(el => observer.observe(el));
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            document.querySelectorAll('.roadmap-item, .roadmap-cta').forEach(el => observer.unobserve(el));
            window.removeEventListener('scroll', handleScroll);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // ── Roadmap slide-up variants ──────────────────────────────────
    const makeSlide = (delay = 0) => ({
        initial:     { opacity: 0, y: reduced ? 0 : 40 },
        whileInView: { opacity: 1, y: 0 },
        transition:  { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
    });

    return (
        <div className="home-page animate-fade-in">
            {/* ── HERO ────────────────────────────────────────────── */}
            <section ref={heroRef} className="hero-section">
                <div className="hero-content">
                    <motion.div className="hero-logo-wrapper animate-float" style={{ y: logoY }}>
                        <img
                            src="/logo.jpeg"
                            alt="Buddiz Beer logo"
                            className="hero-logo"
                            width="200"
                            height="200"
                        />
                    </motion.div>
                    <motion.h1 className="hero-title" style={{ y: contentY }}>
                        {t('heroTitle')}
                    </motion.h1>
                    <motion.h2 className="hero-subtitle" style={{ y: contentY }}>
                        {t('heroSubtitle')}
                    </motion.h2>
                    <motion.p className="hero-description" style={{ y: descY }}>
                        {t('heroDescription')}
                    </motion.p>
                    <motion.div className="hero-actions" style={{ y: descY }}>
                        {user ? (
                            <Link to="/catalogue" className="btn-primary">{t('viewCatalogue')}</Link>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="home-lang-switch"><LanguageSwitcher /></div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* ── STORY / ROADMAP ─────────────────────────────────── */}
            <section id="story" className="story-section container">
                <h3 className="section-title">{t('storyTitle')}</h3>

                <div className="roadmap-container">
                    <div className="roadmap-line"></div>

                    {/* Item 1 – left */}
                    <motion.div
                        className="roadmap-item left"
                        {...makeSlide(0)}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <div className="roadmap-content"><p>{t('storyDream')}</p></div>
                        <div className="roadmap-point milestone-dream">
                            <svg viewBox="0 0 24 24" className="milestone-icon" aria-hidden="true">
                                <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7M9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1H9v1z"/>
                            </svg>
                        </div>
                        <div className="roadmap-image-container">
                            <img src={imgDream} alt="The Dream — founding story" className="roadmap-image" width="400" height="300" />
                        </div>
                    </motion.div>

                    {/* Item 2 – right */}
                    <motion.div
                        className="roadmap-item right"
                        {...makeSlide(0.1)}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <div className="roadmap-image-container">
                            <img src={imgBrew} alt="The First Brew — first batch" className="roadmap-image" width="400" height="300" />
                        </div>
                        <div className="roadmap-point milestone-brew">
                            <svg viewBox="0 0 24 24" className="milestone-icon" aria-hidden="true">
                                <path fill="currentColor" d="M7,2H17L16,5H19V21H5V5H8L7,2M9,4L9.67,6H14.33L15,4H9M7,7V19H17V7H7M10,10H12V17H10V10M13,10H15V15H13V10Z"/>
                            </svg>
                        </div>
                        <div className="roadmap-content"><p>{t('storyBrew')}</p></div>
                    </motion.div>

                    {/* Item 3 – left */}
                    <motion.div
                        className="roadmap-item left"
                        {...makeSlide(0.15)}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <div className="roadmap-content"><p>{t('storyToday')}</p></div>
                        <div className="roadmap-point milestone-today">
                            <svg viewBox="0 0 24 24" className="milestone-icon" aria-hidden="true">
                                <path fill="currentColor" d="M4 2h15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1m13 2v4h1V4h-1M6 8v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8H6m2 2h2v5H8v-5m4 0h2v3h-2v-3z"/>
                            </svg>
                        </div>
                        <div className="roadmap-image-container">
                            <img src={imgToday} alt="Buddiz Today — current state" className="roadmap-image" width="400" height="300" />
                        </div>
                    </motion.div>
                </div>

                {/* Beer glass CTA – wobble on entry */}
                <motion.div
                    className="roadmap-cta"
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{
                        opacity: 1,
                        scale: 1,
                        rotate: reduced ? 0 : [0, -7, 5, -3, 2, 0],
                    }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
                >
                    <Link to="/catalogue" className="beer-glass-btn" aria-label="Browse our brews">
                        <div className="glass-inner">
                            <div className="beer-fill">
                                <div className="bubbles-container" aria-hidden="true">
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
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
