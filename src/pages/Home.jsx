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

// ── Beer Mug SVG ──────────────────────────────────────────────────────────────
const GlassSVG = ({ liquidY, foamOpacity, id }) => (
    <svg width="150" height="240" viewBox="0 0 130 200" overflow="visible" aria-hidden="true">
        <defs>
            {/* Inner glass clip — beer lives here */}
            <clipPath id={`gc-${id}`}>
                <polygon points="22,16 98,16 87,170 33,170" />
            </clipPath>
            {/* Rich amber beer gradient */}
            <linearGradient id={`beer-${id}`} x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#FFE566" />
                <stop offset="35%"  stopColor="#F09820" />
                <stop offset="100%" stopColor="#A34510" />
            </linearGradient>
            {/* Glass body — subtle translucent tint */}
            <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.28)" />
                <stop offset="18%"  stopColor="rgba(255,255,255,0.09)" />
                <stop offset="55%"  stopColor="rgba(200,235,255,0.03)" />
                <stop offset="82%"  stopColor="rgba(255,255,255,0.07)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.20)" />
            </linearGradient>
            {/* Left highlight strip */}
            <linearGradient id={`hl-${id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
            </linearGradient>
        </defs>

        {/* Beer fill + foam, clipped to inner glass */}
        <g clipPath={`url(#gc-${id})`}>
            <motion.rect x="0" y={liquidY} width="130" height="200" fill={`url(#beer-${id})`} />
            {/* Foam — main creamy body */}
            <motion.ellipse
                cx="60" cy={liquidY} rx="37" ry="12"
                fill="rgba(255,252,240,0.96)"
                style={{ opacity: foamOpacity }}
            />
            {/* Foam — bright centre highlight */}
            <motion.ellipse
                cx="55" cy={liquidY} rx="18" ry="6"
                fill="rgba(255,255,255,0.60)"
                style={{ opacity: foamOpacity }}
            />
            {/* Foam — right bubble cluster */}
            <motion.ellipse
                cx="74" cy={liquidY} rx="10" ry="5"
                fill="rgba(255,255,255,0.38)"
                style={{ opacity: foamOpacity }}
            />
        </g>

        {/* Glass body tint */}
        <polygon
            points="12,6 108,6 96,178 24,178"
            fill={`url(#glass-${id})`}
        />

        {/* Left-edge highlight strip */}
        <polygon
            points="24,16 36,16 29,170 24,170"
            fill={`url(#hl-${id})`}
        />

        {/* Outer glass outline */}
        <polygon
            points="12,6 108,6 96,178 24,178"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
        />

        {/* Rim ellipse — 3-D depth */}
        <ellipse
            cx="60" cy="6" rx="48" ry="7"
            fill="rgba(43,174,102,0.08)"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
        />
        {/* Inner rim ring */}
        <ellipse
            cx="60" cy="6" rx="38" ry="5"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            opacity="0.35"
        />

        {/* Handle — outer (solid, brand colour) */}
        <path
            d="M 96 54 Q 132 54 132 102 Q 132 150 96 150"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="11"
            strokeLinecap="round"
        />
        {/* Handle — inner (glass highlight) */}
        <path
            d="M 96 54 Q 132 54 132 102 Q 132 150 96 150"
            fill="none"
            stroke="rgba(200,235,255,0.22)"
            strokeWidth="5"
            strokeLinecap="round"
        />

        {/* Base ellipse */}
        <ellipse
            cx="60" cy="178" rx="36" ry="5"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            opacity="0.65"
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

    // Left glass: slides in early, then nudges to clink position
    const lx = useTransform(scrollYProgress,
        [0,    0.18,  0.55,  0.68],
        reduced ? [-120, -120, -120, -120] : [-380, -130, -130, -62]);

    // Right glass: enters mid-story, slides to meet left glass
    const rx = useTransform(scrollYProgress,
        [0,    0.40,  0.58,  0.68],
        reduced ? [120, 120, 120, 120] : [380, 380, 130, 62]);

    // Tilt tops TOWARD each other at the clink (positive = clockwise)
    const lRot = useTransform(scrollYProgress, [0.60, 0.68, 0.74], reduced ? [0,0,0] : [0,  14,  6]);
    const rRot = useTransform(scrollYProgress, [0.60, 0.68, 0.74], reduced ? [0,0,0] : [0, -14, -6]);

    // Both glasses lift slightly for the toast
    const liftY = useTransform(scrollYProgress, [0.60, 0.68, 0.74], reduced ? [0,0,0] : [0, -22, -15]);

    // Beer fill — y attribute in SVG (170=empty, 14=full)
    const liquidY     = useTransform(scrollYProgress, [0.18, 0.60], [170, 14]);
    const foamOpacity = useTransform(scrollYProgress, [0.30, 0.52], [0, 1]);

    // Glow intensifies as glass fills
    const glassGlow = useTransform(scrollYProgress, [0.18, 0.60],
        ['drop-shadow(0 0 0px rgba(244,168,50,0))',
         'drop-shadow(0 0 22px rgba(244,168,50,0.42))']);

    // Clink splash
    const splashOpacity = useTransform(scrollYProgress, [0.64, 0.68, 0.75], [0, 0.85, 0]);
    const splashScale   = useTransform(scrollYProgress, [0.64, 0.76], [0.05, 2.6]);

    // CHEERS text in label zone (replaces stage labels)
    const cheersOpacity = useTransform(scrollYProgress, [0.70, 0.76], [0, 1]);
    const cheersY       = useTransform(scrollYProgress, [0.70, 0.76], [14, 0]);

    // Shop CTA fades in after CHEERS
    const ctaOpacity = useTransform(scrollYProgress, [0.72, 0.78], [0, 1]);
    const ctaY       = useTransform(scrollYProgress, [0.72, 0.78], [18, 0]);

    // Stage labels
    const s1o = useTransform(scrollYProgress, [0,    0.06,  0.20, 0.28], [0, 1, 1, 0]);
    const s2o = useTransform(scrollYProgress, [0.22, 0.30,  0.44, 0.50], [0, 1, 1, 0]);
    const s3o = useTransform(scrollYProgress, [0.48, 0.56,  0.66, 0.72], [0, 1, 1, 0]);

    // Scroll hint — fades out as soon as user starts scrolling
    const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

    return (
        <div ref={sectionRef} className="toast-scroll-section">
            <div className="toast-sticky">

                <h3 className="section-title">{t('storyTitle')}</h3>

                {/* Stage labels + CHEERS — same overlay zone */}
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
                    {/* CHEERS — absolute overlay, appears in same space as labels */}
                    <motion.p
                        className="cheers-badge"
                        style={{ opacity: cheersOpacity, y: cheersY }}
                    >
                        {t('cheersText')}
                    </motion.p>
                </div>

                {/* Glasses arena */}
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
                </div>

                {/* Shop CTA — appears after CHEERS */}
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
                    <span>{t('scrollHint')}</span>
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
