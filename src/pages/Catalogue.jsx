import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
    useMotionTemplate,
    useReducedMotion,
} from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useMeta } from '../hooks/useMeta';
import './Catalogue.css';
import { getBeers } from '../services/beerService';

import productImg from '../assets/BuddizProduct.png';
import ipaImg from '../assets/ipa_style.jpg';
import lagerImg from '../assets/lager_style.jpg';
import stoutImg from '../assets/stout_style.jpg';
import { ShoppingCart, PawPrint, SlidersHorizontal } from 'lucide-react';

// ── 3D Tilt Card ─────────────────────────────────────────────────────────────
const TiltCard = ({ children, className }) => {
    const reduced = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [9, -9]),  { stiffness: 200, damping: 22 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9,  9]), { stiffness: 200, damping: 22 });

    const glareX = useTransform(x, [-0.5, 0.5], [15, 85]);
    const glareY = useTransform(y, [-0.5, 0.5], [15, 85]);
    const glare  = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.14) 0%, transparent 55%)`;

    const handleMouseMove = (e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width  - 0.5);
        y.set((e.clientY - r.top)  / r.height - 0.5);
    };

    const handleMouseLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            className={`product-card ${className || ''}`}
            style={{
                transformPerspective: 900,
                rotateX: reduced ? 0 : rotateX,
                rotateY: reduced ? 0 : rotateY,
                transformStyle: 'preserve-3d',
            }}
            whileHover={reduced ? {} : { y: -10, transition: { type: 'spring', stiffness: 250, damping: 22 } }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {!reduced && (
                <motion.div
                    className="card-glare"
                    style={{ background: glare }}
                    aria-hidden="true"
                />
            )}
        </motion.div>
    );
};

// ── Catalogue page ────────────────────────────────────────────────────────────
const Catalogue = () => {
    const { addToCart, toggleFavorite, favorites, t, language, user } = useApp();
    useMeta({ title: 'Catalogue | Buddiz Beer', description: 'Browse our full range of craft beers. Filter by style, sort by price or ABV.' });
    const [beers, setBeers] = useState([]);
    const [filteredBeers, setFilteredBeers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const navigate = useNavigate();

    useEffect(() => { fetchBeers(); }, []);
    useEffect(() => { applyFiltersAndSort(); }, [beers, activeFilter, sortBy]);

    const fetchBeers = async () => {
        try {
            setBeers(await getBeers());
        } catch (err) {
            console.error('Error fetching beers:', err);
            setBeers([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let result = [...beers];
        if (activeFilter !== 'all') {
            result = result.filter(beer => {
                const style = (beer.style || '').toLowerCase();
                if (activeFilter === 'ipa')   return style.includes('ipa');
                if (activeFilter === 'lager') return style.includes('lager') || style.includes('pilsner');
                if (activeFilter === 'stout') return style.includes('stout') || style.includes('porter');
                return true;
            });
        }
        if (sortBy === 'price-asc')  result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
        if (sortBy === 'abv-desc') {
            const abv = s => parseFloat(s.replace('%', '')) || 0;
            result.sort((a, b) => abv(b.abv) - abv(a.abv));
        }
        setFilteredBeers(result);
    };

    const getStyleImage = (style) => {
        const s = (style || '').toLowerCase();
        if (s.includes('ipa'))                          return ipaImg;
        if (s.includes('lager') || s.includes('pilsner')) return lagerImg;
        if (s.includes('stout') || s.includes('porter'))  return stoutImg;
        return productImg;
    };

    const isFav = (id) => user && favorites.some(item => item.id === id);

    const getProductVal = (product, field) =>
        language === 'he' ? (product[`${field}_he`] || product[field]) : product[field];

    if (loading) return (
        <div className="catalogue-loading">
            <div className="beer-loader"></div>
            <p>{t('loadingBrews')}</p>
        </div>
    );

    return (
        <div className="catalogue-page animate-fade-in">
            <section className="catalogue-hero">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <h1 className="hero-title">{t('catalogueHeroTitle')}</h1>
                    <p className="hero-subtitle">{t('catalogueHeroDescription')}</p>
                </div>
            </section>

            <div className="container">
                <div className="catalogue-controls">
                    <div className="filter-group">
                        {['all', 'ipa', 'lager', 'stout'].map(f => (
                            <button
                                key={f}
                                className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                                onClick={() => setActiveFilter(f)}
                            >
                                {t(`filter${f.charAt(0).toUpperCase() + f.slice(1)}`) || f}
                            </button>
                        ))}
                    </div>
                    <div className="sort-group">
                        <SlidersHorizontal size={18} className="sort-icon" aria-hidden="true" />
                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort beers"
                        >
                            <option value="default">{t('sortBy')}</option>
                            <option value="price-asc">{t('priceLowHigh')}</option>
                            <option value="price-desc">{t('priceHighLow')}</option>
                            <option value="abv-desc">{t('abvHighLow')}</option>
                        </select>
                    </div>
                </div>

                <div className="product-grid">
                    {filteredBeers.map(beer => {
                        const isComingSoon = beer.description === 'Coming Soon';
                        return (
                            <TiltCard
                                key={beer.id}
                                className={isComingSoon ? 'is-coming-soon' : ''}
                            >
                                <div className="product-image-wrapper">
                                    <img
                                        src={getStyleImage(beer.style)}
                                        alt={beer.name}
                                        className="product-image"
                                    />
                                    {isComingSoon && (
                                        <div className="coming-soon-badge">{t('comingSoon')}</div>
                                    )}
                                    <button
                                        className={`fav-btn-bubble ${isFav(beer.id) ? 'active' : ''}`}
                                        aria-label={isFav(beer.id) ? 'Remove from favorites' : 'Add to favorites'}
                                        onClick={() => {
                                            if (!user) { navigate('/login'); return; }
                                            toggleFavorite(beer);
                                        }}
                                    >
                                        <PawPrint size={18} fill={isFav(beer.id) ? 'currentColor' : 'none'} />
                                    </button>
                                </div>
                                <div className="product-info">
                                    <div className="style-tag">{getProductVal(beer, 'style')}</div>
                                    <h3 className="product-name">{getProductVal(beer, 'name')}</h3>
                                    <div className="product-meta">
                                        <span className="abv-tag">{beer.abv} ABV</span>
                                        <span className="price-tag">₪{beer.price.toFixed(2)}</span>
                                    </div>
                                    <p className="product-desc">{getProductVal(beer, 'description')}</p>
                                    <button
                                        className="buy-btn"
                                        disabled={isComingSoon}
                                        onClick={() => {
                                            if (isComingSoon) return;
                                            if (!user) { navigate('/login'); return; }
                                            addToCart(beer);
                                        }}
                                    >
                                        <ShoppingCart size={18} aria-hidden="true" />
                                        <span>{isComingSoon ? t('comingSoon') : t('addToCart')}</span>
                                    </button>
                                </div>
                            </TiltCard>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Catalogue;
