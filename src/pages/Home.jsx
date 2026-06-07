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
import './Home.css';

// Carbonation — fixed positions inside the lower glass; they rise and get
// clipped at the liquid surface (so they only show through real beer).
const BUBBLES = [
    { cx: 78,  cy: 296, r: 2.4, d: 0.0, dur: 4.2 },
    { cx: 92,  cy: 282, r: 1.8, d: 1.4, dur: 3.6 },
    { cx: 110, cy: 300, r: 2.8, d: 0.6, dur: 4.8 },
    { cx: 122, cy: 270, r: 1.6, d: 2.1, dur: 3.2 },
    { cx: 84,  cy: 250, r: 2.2, d: 1.0, dur: 4.4 },
    { cx: 104, cy: 240, r: 1.7, d: 2.6, dur: 3.8 },
    { cx: 118, cy: 228, r: 2.1, d: 0.3, dur: 5.0 },
    { cx: 90,  cy: 214, r: 1.5, d: 1.8, dur: 3.4 },
    { cx: 108, cy: 196, r: 2.0, d: 3.0, dur: 4.6 },
];

// ── Realistic pint glass. liquidY: 300 = empty, 44 = full. ─────────────────────
const GlassSVG = ({ liquidY, foamOpacity, id }) => (
    <svg className="glass-svg" viewBox="0 0 200 350" overflow="visible" aria-hidden="true">
        <defs>
            {/* Inner glass — clips beer, foam, bubbles to the tapered walls */}
            <clipPath id={`gc-${id}`}>
                <path d="M52,32 L70,304 Q100,318 130,304 L148,32 Z" />
            </clipPath>
            {/* Below-surface clip — bubbles only show through liquid */}
            <clipPath id={`surf-${id}`}>
                <motion.rect x="0" width="200" height="360" y={liquidY} />
            </clipPath>

            {/* Amber beer — lighter at top, deep toward the bottom */}
            <linearGradient id={`beer-${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0%"   stopColor="#FFD257" />
                <stop offset="24%"  stopColor="#F4A11C" />
                <stop offset="70%"  stopColor="#C6770F" />
                <stop offset="100%" stopColor="#8A4D08" />
            </linearGradient>
            {/* Liquid surface disc */}
            <radialGradient id={`beersurf-${id}`} cx="40%" cy="38%" r="64%">
                <stop offset="0%"   stopColor="rgba(255,231,128,0.78)" />
                <stop offset="100%" stopColor="rgba(150,70,8,0.16)" />
            </radialGradient>
            {/* Creamy foam */}
            <radialGradient id={`foam-${id}`} cx="42%" cy="30%" r="70%">
                <stop offset="0%"   stopColor="#FFFFFF" />
                <stop offset="58%"  stopColor="#FFFCF3" />
                <stop offset="100%" stopColor="#F3E7CC" />
            </radialGradient>
            {/* Clear glass body tint (so the empty glass still reads as glass) */}
            <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="1" y2="0.2">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.30)" />
                <stop offset="14%"  stopColor="rgba(214,234,247,0.06)" />
                <stop offset="52%"  stopColor="rgba(214,234,247,0.02)" />
                <stop offset="86%"  stopColor="rgba(255,255,255,0.07)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.22)" />
            </linearGradient>
            {/* Specular highlight strip */}
            <linearGradient id={`spec-${id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
            </linearGradient>
        </defs>

        {/* Contact shadow on the bar */}
        <ellipse cx="100" cy="332" rx="62" ry="9" fill="rgba(80,40,8,0.18)" />

        {/* Clear glass body */}
        <path d="M44,26 L64,308 Q100,324 136,308 L156,26 Z" fill={`url(#glass-${id})`} />

        {/* Beer + foam + bubbles, clipped to the inner glass */}
        <g clipPath={`url(#gc-${id})`}>
            <motion.rect x="0" y={liquidY} width="200" height="360" fill={`url(#beer-${id})`} />

            {/* Bubbles only within the liquid (below the surface) */}
            <g clipPath={`url(#surf-${id})`}>
                <motion.ellipse cx="100" cy={liquidY} rx="50" ry="8" fill={`url(#beersurf-${id})`} />
                {BUBBLES.map((b, i) => (
                    <circle
                        key={i}
                        className="beer-bubble"
                        cx={b.cx}
                        cy={b.cy}
                        r={b.r}
                        style={{ animationDelay: `${b.d}s`, animationDuration: `${b.dur}s` }}
                    />
                ))}
            </g>

            {/* Foam head riding the surface */}
            <motion.ellipse cx="100" cy={liquidY} rx="50" ry="14" fill={`url(#foam-${id})`} style={{ opacity: foamOpacity }} />
            <motion.ellipse cx="78"  cy={liquidY} rx="20" ry="11" fill="rgba(255,255,255,0.7)" style={{ opacity: foamOpacity }} />
            <motion.ellipse cx="120" cy={liquidY} rx="18" ry="10" fill="rgba(255,255,255,0.55)" style={{ opacity: foamOpacity }} />
            <motion.ellipse cx="100" cy={liquidY} rx="13" ry="8"  fill="rgba(255,255,255,0.85)" style={{ opacity: foamOpacity }} />
        </g>

        {/* Specular highlights on the glass */}
        <path d="M60,40 L74,300 L84,300 L72,40 Z" fill={`url(#spec-${id})`} opacity="0.5" transform="scale(-1,1) translate(-200,0)" />
        <path d="M62,44 L74,298 L80,298 L70,44 Z" fill="rgba(255,255,255,0.5)" />
        <path d="M128,52 L138,290 L142,290 L133,52 Z" fill="rgba(255,255,255,0.22)" />

        {/* Glass outline + rim + base */}
        <path d="M44,26 L64,308 Q100,324 136,308 L156,26" fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <ellipse cx="100" cy="26" rx="56" ry="8.5" fill="rgba(43,174,102,0.08)" stroke="var(--color-primary)" strokeWidth="2.2" />
        <ellipse cx="100" cy="26" rx="44" ry="5"   fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.35" />
        <ellipse cx="100" cy="308" rx="36" ry="7"  fill="none" stroke="var(--color-primary)" strokeWidth="1.6" opacity="0.5" />
    </svg>
);

// ── Story journey: glass is pinned beside you and fills as you scroll ──────────
const Journey = ({ t, reduced }) => {
    const journeyRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: journeyRef,
        offset: ['start start', 'end end'],
    });

    const liquidY     = useTransform(scrollYProgress, [0.08, 0.72], reduced ? [44, 44] : [300, 44]);
    const foamOpacity = useTransform(scrollYProgress, [0.34, 0.66], reduced ? [1, 1] : [0, 1]);
    const glowOpacity = useTransform(scrollYProgress, [0.08, 0.72], reduced ? [0.9, 0.9] : [0, 0.9]);
    const glassScale  = useTransform(scrollYProgress, [0, 0.72, 1], reduced ? [1, 1, 1] : [0.94, 1.04, 1.0]);

    const STAGES = [
        { n: '01', key: 'storyDream', eyebrow: true },
        { n: '02', key: 'storyBrew' },
        { n: '03', key: 'storyToday' },
    ];

    return (
        <div ref={journeyRef} className="journey">
            <div className="journey-visual">
                <motion.div className="journey-glow" style={{ opacity: glowOpacity }} aria-hidden="true" />
                <motion.div className="journey-glass" style={{ scale: glassScale }}>
                    <GlassSVG liquidY={liquidY} foamOpacity={foamOpacity} id="story" />
                </motion.div>
            </div>

            <div className="journey-content">
                {STAGES.map((s) => (
                    <section className="journey-block" key={s.n}>
                        {s.eyebrow && <h3 className="journey-eyebrow">{t('storyTitle')}</h3>}
                        <span className="journey-step">{s.n}</span>
                        <p className="journey-text">{t(s.key)}</p>
                    </section>
                ))}

                <section className="journey-block journey-finale">
                    <p className="journey-cheers">{t('cheersText')}</p>
                    <Link to="/catalogue" className="btn-primary journey-cta">{t('viewCatalogue')}</Link>
                </section>
            </div>
        </div>
    );
};

// ── Home page ─────────────────────────────────────────────────────────────────
const Home = () => {
    const { t } = useApp();
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

            <section ref={heroRef} className="hero-section">
                <div className="hero-glow" aria-hidden="true" />
                <div className="hero-content">
                    <motion.div className="hero-logo-wrapper animate-float" style={{ y: logoY }}>
                        <img src="/logo.jpeg" alt="Buddiz Beer logo" className="hero-logo" width="200" height="200" />
                    </motion.div>
                    <motion.h1 className="hero-title" style={{ y: contentY }}>{t('heroTitle')}</motion.h1>
                    <motion.h2 className="hero-subtitle" style={{ y: contentY }}>{t('heroSubtitle')}</motion.h2>
                    <motion.p className="hero-description" style={{ y: descY }}>{t('heroDescription')}</motion.p>
                    <motion.div className="hero-actions" style={{ y: descY }}>
                        <Link to="/catalogue" className="btn-primary hero-cta">{t('viewCatalogue')}</Link>
                    </motion.div>
                </div>

                <div className="hero-scroll-hint" aria-hidden="true">
                    <ChevronDown size={22} className="hint-chevron" />
                </div>
            </section>

            <section id="story">
                <Journey t={t} reduced={reduced} />
            </section>

        </div>
    );
};

export default Home;
