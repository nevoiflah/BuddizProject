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

// ── Beer Mug SVG — proper 3-D look ───────────────────────────────────────────
// viewBox 0 0 130 205 rendered at 140×225.
// Depth comes from: rim ellipse at top, liquid-surface ellipse, left-edge
// highlight lines, radial foam domes, and a hollow handle.
const GlassSVG = ({ liquidY, foamOpacity, id }) => (
    <svg
        className="glass-svg"
        viewBox="0 0 130 205"
        overflow="visible"
        aria-hidden="true"
    >
        <defs>
            {/* Inner glass clip */}
            <clipPath id={`gc-${id}`}>
                <polygon points="24,18 96,18 86,168 34,168" />
            </clipPath>

            {/* Beer body — warm amber, darker toward sides & bottom */}
            <linearGradient id={`beer-${id}`} x1="0.15" y1="0" x2="0.85" y2="1">
                <stop offset="0%"   stopColor="#FFE15A" />
                <stop offset="30%"  stopColor="#F09A20" />
                <stop offset="78%"  stopColor="#B85C10" />
                <stop offset="100%" stopColor="#7A3408" />
            </linearGradient>

            {/* Beer surface — radial highlight gives depth to the liquid disc */}
            <radialGradient id={`beersurf-${id}`} cx="38%" cy="40%" r="62%">
                <stop offset="0%"   stopColor="rgba(255,228,80,0.72)" />
                <stop offset="100%" stopColor="rgba(160,70,8,0.18)" />
            </radialGradient>

            {/* Glass body — bright edges, almost clear in the middle */}
            <linearGradient id={`glassbody-${id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.38)" />
                <stop offset="10%"  stopColor="rgba(255,255,255,0.11)" />
                <stop offset="48%"  stopColor="rgba(200,228,255,0.03)" />
                <stop offset="88%"  stopColor="rgba(255,255,255,0.09)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.26)" />
            </linearGradient>

            {/* Foam — milky white with warm cream at edges */}
            <radialGradient id={`foam-${id}`} cx="42%" cy="32%" r="68%">
                <stop offset="0%"   stopColor="rgba(255,255,255,1.00)" />
                <stop offset="55%"  stopColor="rgba(255,252,240,0.96)" />
                <stop offset="100%" stopColor="rgba(238,226,205,0.85)" />
            </radialGradient>
        </defs>

        {/* ── Beer + foam (clipped to inner glass) ── */}
        <g clipPath={`url(#gc-${id})`}>
            {/* Beer body */}
            <motion.rect
                x="0" y={liquidY} width="130" height="210"
                fill={`url(#beer-${id})`}
            />
            {/* Liquid surface — ellipse gives the "inside a cylinder" depth */}
            <motion.ellipse
                cx="60" cy={liquidY} rx="36" ry="9"
                fill={`url(#beersurf-${id})`}
            />

            {/* Foam — four overlapping domes for puffy 3-D look */}
            <motion.ellipse cx="60" cy={liquidY} rx="36" ry="13"
                fill={`url(#foam-${id})`}
                style={{ opacity: foamOpacity }} />
            <motion.ellipse cx="44" cy={liquidY} rx="16" ry="10"
                fill="rgba(255,255,255,0.68)"
                style={{ opacity: foamOpacity }} />
            <motion.ellipse cx="75" cy={liquidY} rx="14" ry="9"
                fill="rgba(255,255,255,0.54)"
                style={{ opacity: foamOpacity }} />
            <motion.ellipse cx="60" cy={liquidY} rx="10" ry="7"
                fill="rgba(255,255,255,0.82)"
                style={{ opacity: foamOpacity }} />
        </g>

        {/* ── Glass body shading ── */}
        <polygon
            points="14,8 106,8 96,176 24,176"
            fill={`url(#glassbody-${id})`}
        />

        {/* Primary left-edge highlight — the crisp line that reads as glass */}
        <line x1="25" y1="19" x2="34" y2="167"
            stroke="rgba(255,255,255,0.65)" strokeWidth="3.5" strokeLinecap="round" />
        {/* Soft secondary left glow */}
        <line x1="31" y1="22" x2="39" y2="164"
            stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" />
        {/* Right-edge reflection */}
        <line x1="86" y1="22" x2="96" y2="164"
            stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" />

        {/* ── Glass outline ── */}
        <polygon
            points="14,8 106,8 96,176 24,176"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinejoin="round"
        />

        {/* ── Top rim — crucial cylinder illusion ── */}
        <ellipse cx="60" cy="8" rx="46" ry="7"
            fill="rgba(43,174,102,0.10)"
            stroke="var(--color-primary)" strokeWidth="2.2" />
        {/* Inner rim ring (depth) */}
        <ellipse cx="60" cy="8" rx="36" ry="4.5"
            fill="none"
            stroke="var(--color-primary)" strokeWidth="1.2" opacity="0.38" />

        {/* ── Handle: outer solid → bg-colour hollow → inner highlight ── */}
        <path d="M 96,54 Q 134,54 134,103 Q 134,152 96,152"
            fill="none" stroke="var(--color-primary)"
            strokeWidth="13" strokeLinecap="round" />
        {/* Hollow core — uses page background so it reads as a real handle */}
        <path d="M 96,54 Q 134,54 134,103 Q 134,152 96,152"
            fill="none" stroke="var(--color-bg)"
            strokeWidth="7" strokeLinecap="round" />
        {/* Highlight gloss on handle */}
        <path d="M 96,54 Q 134,54 134,103 Q 134,152 96,152"
            fill="none" stroke="rgba(255,255,255,0.22)"
            strokeWidth="3" strokeLinecap="round" />

        {/* ── Base ellipse ── */}
        <ellipse cx="60" cy="176" rx="36" ry="5"
            fill="none"
            stroke="var(--color-primary)" strokeWidth="1.8" opacity="0.60" />
    </svg>
);

// ── Toast Scroll section ──────────────────────────────────────────────────────
const ToastScroll = ({ t, reduced }) => {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });

    // Left glass: enters early, then nudges to clink position
    const lx = useTransform(scrollYProgress,
        [0,    0.18,  0.60,  0.76],
        reduced ? [-120, -120, -120, -120] : [-380, -130, -130, -62]);

    // Right glass: enters mid-story, slides to meet left glass
    const rx = useTransform(scrollYProgress,
        [0,    0.40,  0.64,  0.76],
        reduced ? [120, 120, 120, 120] : [380, 380, 130, 62]);

    // Tilt tops TOWARD each other (left +, right −)
    const lRot = useTransform(scrollYProgress, [0.68, 0.76, 0.83], reduced ? [0,0,0] : [0,  14,  6]);
    const rRot = useTransform(scrollYProgress, [0.68, 0.76, 0.83], reduced ? [0,0,0] : [0, -14, -6]);

    // Lift for the toast
    const liftY = useTransform(scrollYProgress, [0.68, 0.76, 0.83], reduced ? [0,0,0] : [0, -22, -15]);

    // Beer fill — SVG y (168=empty, 14=full)
    const liquidY     = useTransform(scrollYProgress, [0.18, 0.62], [168, 14]);
    const foamOpacity = useTransform(scrollYProgress, [0.32, 0.56], [0, 1]);

    // Amber glow around glasses as they fill
    const glassGlow = useTransform(scrollYProgress, [0.18, 0.62],
        ['drop-shadow(0 0 0px rgba(244,168,50,0))',
         'drop-shadow(0 0 22px rgba(244,168,50,0.45))']);

    // Clink splash
    const splashOpacity = useTransform(scrollYProgress, [0.72, 0.77, 0.85], [0, 0.85, 0]);
    const splashScale   = useTransform(scrollYProgress, [0.72, 0.85], [0.05, 2.6]);

    // CHEERS — in the label zone, replaces stage 3 as it fades
    const cheersOpacity = useTransform(scrollYProgress, [0.78, 0.87], [0, 1]);
    const cheersY       = useTransform(scrollYProgress, [0.78, 0.87], [14, 0]);

    // CTA — starts at 0.90, reaches full opacity exactly at progress=1.0 (page bottom)
    // This means View Catalogue becoming fully visible = end of scrolling
    const ctaOpacity = useTransform(scrollYProgress, [0.90, 1.0], [0, 1]);
    const ctaY       = useTransform(scrollYProgress, [0.90, 1.0], [18, 0]);

    // Stage labels (each fades in then out, leaving room for the next)
    const s1o = useTransform(scrollYProgress, [0,    0.06,  0.22, 0.30], [0, 1, 1, 0]);
    const s2o = useTransform(scrollYProgress, [0.24, 0.32,  0.50, 0.58], [0, 1, 1, 0]);
    const s3o = useTransform(scrollYProgress, [0.54, 0.62,  0.72, 0.78], [0, 1, 1, 0]);

    return (
        <div ref={sectionRef} className="toast-scroll-section">
            <div className="toast-sticky">

                <h3 className="section-title">{t('storyTitle')}</h3>

                {/* Text zone: stage labels + CHEERS all share one overlay area */}
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
                    <motion.p className="cheers-badge" style={{ opacity: cheersOpacity, y: cheersY }}>
                        {t('cheersText')}
                    </motion.p>
                </div>

                {/* Glasses arena (no stray elements outside) */}
                <div className="toast-arena">
                    <div className="clink-splash-wrap">
                        <motion.div
                            className="clink-splash"
                            style={{ opacity: splashOpacity, scale: splashScale }}
                            aria-hidden="true"
                        />
                    </div>

                    <motion.div
                        className="glass-wrap"
                        initial={{ x: reduced ? -120 : -380 }}
                        style={{ x: lx, rotate: lRot, y: liftY, filter: glassGlow }}
                    >
                        <GlassSVG liquidY={liquidY} foamOpacity={foamOpacity} id="left" />
                    </motion.div>

                    <motion.div
                        className="glass-wrap"
                        initial={{ x: reduced ? 120 : 380 }}
                        style={{ x: rx, rotate: rRot, y: liftY, filter: glassGlow }}
                    >
                        <GlassSVG liquidY={liquidY} foamOpacity={foamOpacity} id="right" />
                    </motion.div>
                </div>

                {/* CTA — appears after CHEERS, fully visible = end of scroll */}
                <motion.div className="toast-cta" initial={{ opacity: 0 }} style={{ opacity: ctaOpacity, y: ctaY }}>
                    <Link to="/catalogue" className="btn-primary">{t('viewCatalogue')}</Link>
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

            <section ref={heroRef} className="hero-section">
                <div className="hero-scroll-hint" aria-hidden="true">
                    <span>{t('scrollHint')}</span>
                    <ChevronDown size={20} className="hint-chevron" />
                </div>
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

            <section id="story">
                <ToastScroll t={t} reduced={reduced} />
            </section>

        </div>
    );
};

export default Home;
