import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Catalogue.css';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from 'aws-amplify/auth';

import productImg from '../assets/BuddizProduct.png';
import ipaImg from '../assets/ipa_style.png';
import lagerImg from '../assets/lager_style.png';
import stoutImg from '../assets/stout_style.png';
import { ShoppingCart, PawPrint, SlidersHorizontal, Beer, Filter } from 'lucide-react';

const Catalogue = () => {
    const { addToCart, toggleFavorite, favorites, t, language, user } = useApp();
    const [beers, setBeers] = useState([]);
    const [filteredBeers, setFilteredBeers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBeers();
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [beers, activeFilter, sortBy]);

    const fetchBeers = async () => {
        try {
            const { credentials } = await fetchAuthSession();
            const client = new DynamoDBClient({
                region: "eu-north-1",
                credentials
            });
            const docClient = DynamoDBDocumentClient.from(client);

            const command = new ScanCommand({
                TableName: "BUDDIZ-Beers"
            });

            const response = await docClient.send(command);
            setBeers(response.Items || []);
        } catch (err) {
            console.error("Error fetching beers:", err);
            setBeers([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let result = [...beers];

        // Filtering
        if (activeFilter !== 'all') {
            result = result.filter(beer => {
                const style = (beer.style || '').toLowerCase();
                if (activeFilter === 'ipa') return style.includes('ipa');
                if (activeFilter === 'lager') return style.includes('lager') || style.includes('pilsner');
                if (activeFilter === 'stout') return style.includes('stout') || style.includes('porter');
                return true;
            });
        }

        // Sorting
        if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
        else if (sortBy === 'abv-desc') {
            const getABV = (s) => parseFloat(s.replace('%', '')) || 0;
            result.sort((a, b) => getABV(b.abv) - getABV(a.abv));
        }

        setFilteredBeers(result);
    };

    const getStyleImage = (style) => {
        const s = (style || '').toLowerCase();
        if (s.includes('ipa')) return ipaImg;
        if (s.includes('lager') || s.includes('pilsner')) return lagerImg;
        if (s.includes('stout') || s.includes('porter')) return stoutImg;
        return productImg;
    };

    const isFav = (id) => user && favorites.some(item => item.id === id);

    const getProductVal = (product, field) => {
        if (language === 'he') {
            return product[`${field}_he`] || product[field];
        }
        return product[field];
    };

    if (loading) return (
        <div className="catalogue-loading">
            <div className="beer-loader"></div>
            <p>{t('loadingBrews')}</p>
        </div>
    );

    return (
        <div className="catalogue-page animate-fade-in">
            {/* Hero Section */}
            <section className="catalogue-hero">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <h1 className="hero-title">{t('catalogueHeroTitle')}</h1>
                </div>
            </section>

            <div className="container">
                {/* Filter & Sort Bar */}
                <div className="catalogue-controls">
                    <div className="filter-group">
                        <button 
                            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            {t('filterAll')}
                        </button>
                        <button 
                            className={`filter-btn ${activeFilter === 'ipa' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('ipa')}
                        >
                            {t('filterIPA')}
                        </button>
                        <button 
                            className={`filter-btn ${activeFilter === 'lager' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('lager')}
                        >
                            {t('filterLager')}
                        </button>
                        <button 
                            className={`filter-btn ${activeFilter === 'stout' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('stout')}
                        >
                            {t('filterStout')}
                        </button>
                    </div>

                    <div className="sort-group">
                        <SlidersHorizontal size={18} className="sort-icon" />
                        <select 
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="default">{t('sortBy')}</option>
                            <option value="price-asc">{t('priceLowHigh')}</option>
                            <option value="price-desc">{t('priceHighLow')}</option>
                            <option value="abv-desc">{t('abvHighLow')}</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="product-grid">
                    {filteredBeers.map(beer => {
                        const isComingSoon = beer.description === "Coming Soon";
                        return (
                            <div key={beer.id} className={`product-card ${isComingSoon ? 'is-coming-soon' : ''}`}>
                                <div className="product-image-wrapper">
                                    <img src={getStyleImage(beer.style)} alt={beer.name} className="product-image" />
                                    {isComingSoon && <div className="coming-soon-badge">{t('comingSoon')}</div>}
                                    <button
                                        className={`fav-btn-bubble ${isFav(beer.id) ? 'active' : ''}`}
                                        onClick={() => {
                                            if (!user) {
                                                navigate('/login');
                                                return;
                                            }
                                            toggleFavorite(beer);
                                        }}
                                    >
                                        <PawPrint size={18} fill={isFav(beer.id) ? "currentColor" : "none"} />
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
                                            if (!user) {
                                                if (window.confirm("Please login to add items to cart.")) {
                                                    navigate('/login');
                                                }
                                                return;
                                            }
                                            addToCart(beer);
                                        }}
                                    >
                                        <ShoppingCart size={18} />
                                        <span>{isComingSoon ? t('comingSoon') : t('addToCart')}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Catalogue;
