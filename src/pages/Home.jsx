import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    motion,
    useScroll,
    useTransform,
    useReducedMotion,
} from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMeta } from '../hooks/useMeta';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Home.css';

// ── Beer Glass SVG ────────────────────────────────────────────────────────────
const GlassSVG = ({ liquidY, foamOpacity, id }) => (
    <svg width="140" height="240" viewBox="0 0 90 160" overflow="visible" aria-hidden="true">
        <defs>
            <clipPath id={`gc-${id}`}>
                <polygon points="9,3 81,3 73,152 17,152" />
            </clipPath>
            <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#FFE066" />
                <stop offset="45%"  stopColor="#F4A832" />
                <stop offset="100%" stopColor="#B85C10" />
            </linearGradient>
            <linearGradient id={`sheen-${id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
                <stop offset="40%"  stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
        </defs>

        {/* Beer fill + foam, clipped to glass shape */}
        <g clipPath={`url(#gc-${id})`}>
            <motion.rect x="0" y={liquidY} width="90" height="160" fill={`url(#bg-${id})`} />
            {/* Foam */}
            <motion.ellipse
                cx="45" cy={liquidY} rx="35" ry="10"
                fill="rgba(255,250,230,0.93)"
                style={{ opacity: foamOpacity }}
            />
            {/* Glass sheen */}
            <polygon points="9,3 81,3 73,152 17,152" fill={`url(#sheen-${id})`} />
        </g>

        {/* Glass outline */}
        <polygon
            points="9,3 81,3 73,152 17,152"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
        />
        {/* Rim */}
        <line x1="9" y1="3" x2="81" y2="3"
            stroke="var(--color-primary)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Handle */}
        <path
            d="M 73 32 Q 108 32 108 78 Q 108 124 73 124"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
    </svg>
);

// ── Toast Scroll section ──────────────────────────────────────────────────────
const ToastScroll = ({ t, reduced }) => {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });

    // Left glass: slides in from left early, then nudges center for clink
    const lx = useTransform(scrollYProgress,
        [0,    0.18,  0.65,  0.78],
        reduced ? [-120, -120, -120, -120] : [-380, -130, -130, -62]);

    // Right glass: enters later, slides to meet left glass
    const rx = useTransform(scrollYProgress,
        [0,    0.42,  0.68,  0.78],
        reduced ? [120, 120, 120, 120] : [380, 380, 130, 62]);

    // Tilt toward each other at the clink
    const lRot = useTransform(scrollYProgress, [0.70, 0.78, 0.85], reduced ? [0,0,0] : [0, -10, -4]);
    const rRot = useTransform(scrollYProgress, [0.70, 0.78, 0.85], reduced ? [0,0,0] : [0,  10,  4]);

    // Both glasses lift slightly for the toast
    const liftY = useTransform(scrollYProgress, [0.70, 0.78, 0.85], reduced ? [0,0,0] : [0, -20, -14]);

    // Beer fill — y attribute in SVG (152=empty, 14=full)
    const liquidY    = useTransform(scrollYProgress, [0.25, 0.70], [152, 14]);
    const foamOpacity = useTransform(scrollYProgress, [0.38, 0.60], [0, 1]);

    // Glow intensifies as glass fills
    const glassGlow = useTransform(scrollYProgress, [0.25, 0.70],
        ['drop-shadow(0 0 0px rgba(244,168,50,0))',
         'drop-shadow(0 0 18px rgba(244,168,50,0.35))']);

    // Clink splash
    const splashOpacity = useTransform(scrollYProgress, [0.74, 0.79, 0.87], [0, 0.85, 0]);
    const splashScale   = useTransform(scrollYProgress, [0.74, 0.87], [0.05, 2.6]);

    // CHEERS badge
    const cheersOpacity = useTransform(scrollYProgress, [0.74, 0.83], [0, 1]);
    const cheersScale   = useTransform(scrollYProgress, [0.74, 0.87], [0.3, 1]);
    const cheersY       = useTransform(scrollYProgress, [0.74, 0.87], [32, 0]);

    // Shop CTA fades in after CHEERS
    const ctaOpacity = useTransform(scrollYProgress, [0.82, 0.88], [0, 1]);
    const ctaY       = useTransform(scrollYProgress, [0.82, 0.88], [16, 0]);

    // Stage labels
    const s1o = useTransform(scrollYProgress, [0,    0.07,  0.26, 0.36], [0, 1, 1, 0]);
    const s2o = useTransform(scrollYProgress, [0.30, 0.40,  0.62, 0.72], [0, 1, 1, 0]);
    const s3o = useTransform(scrollYProgress, [0.66, 0.76,  1.0,  1.0 ], [0, 1, 1, 1]);

    // Scroll hint — fades out immediately on scroll
    const hintOpacity = useTransform(scrollYProgress, [0, 0.07], [1, 0]);

    return (
        <div ref={sectionRef} className="toast-scroll-section">
            <div className="toast-sticky">

                <h3 className="section-title">{t('storyTitle')}</h3>

                {/* Changing stage label */}
                <div className="toast-label-area">
                    <motion.div className="toast-label" style={{ opacity: s1o }}>
                        <span className="toast-step">01</span>
                        <p>{t('storyDream')}</p>
                    </motion.div>
                    <motion.div className="toast-label" style={{ opacity: s2o }}>
                        <span className="toast-step">02</span>
                        <p>{t('storyBrew')}</p>
                    </motion.div>
                    <motion.div className="toast-label" style={{ opacity: s3o }}>
                        <span className="toast-step">03</span>
                        <p>{t('storyToday')}</p>
                    </motion.div>
                </div>

                {/* Glasses + clink arena */}
                <div className="toast-arena">
                    {/* Golden splash at clink */}
                    <div className="clink-splash-wrap">
                        <motion.div
                            className="clink-splash"
                            style={{ opacity: splashOpacity, scale: splashScale }}
                            aria-hidden="true"
                        />
                    </div>

                    {/* Left glass */}
                    <motion.div
                        className="glass-wrap"
                        style={{ x: lx, rotate: lRot, y: liftY, filter: glassGlow }}
                    >
                        <GlassSVG liquidY={liquidY} foamOpacity={foamOpacity} id="left" />
                    </motion.div>

                    {/* Right glass */}
                    <motion.div
                        className="glass-wrap"
                        style={{ x: rx, rotate: rRot, y: liftY, filter: glassGlow }}
                    >
                        <GlassSVG liquidY={liquidY} foamOpacity={foamOpacity} id="right" />
                    </motion.div>

                    {/* CHEERS */}
                    <motion.p
                        className="cheers-badge"
                        style={{ opacity: cheersOpacity, scale: cheersScale, y: cheersY }}
                    >
                        CHEERS!
                    </motion.p>
                </div>

                {/* Shop CTA after cheers */}
                <motion.div
                    className="toast-cta"
                    style={{ opacity: ctaOpacity, y: ctaY }}
                >
                    <Link to="/catalogue" className="btn-primary">{t('viewCatalogue')}</Link>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    className="scroll-hint"
                    style={{ opacity: hintOpacity }}
                    aria-hidden="true"
                >
                    <span>Scroll to explore our story</span>
                    <ChevronDown size={22} className="hint-chevron" />
                </motion.div>

            </div>
        </div>
    );
};

// ── Home page ─────────────────────────────────────────────────────────────────
const Home = () => {
    const { user, t } = useApp();
    useMeta({
        title: 'Buddiz Beer | Craft Beer Delivered',
        description: 'Discover Buddiz – premium craft beers delivered. Shop IPA, Lager, Stout and more.',
    });

    const heroRef = useRef(null);
    const reduced = useReducedMotion();

    const { scrollYProgress: heroProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const logoY    = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0, -100]);
    const contentY = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0,  -55]);
    const descY    = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0,  -25]);

    return (
        <div className="home-page animate-fade-in">

            {/* ── HERO ──────────────────────────────────────────── */}
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

            {/* ── STORY / TOAST SCROLL ──────────────────────────── */}
            <section id="story">
                <ToastScroll t={t} reduced={reduced} />
            </section>

        </div>
    );
};

export default Home;
