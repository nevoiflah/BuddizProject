import { useApp } from '../context/AppContext';
import { useMeta } from '../hooks/useMeta';
import { ShoppingCart, PawPrint } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Catalogue.css';
import './Favorites.css';

import productImg from '../assets/BuddizProduct.png';
import ipaImg from '../assets/ipa_style.jpg';
import lagerImg from '../assets/lager_style.jpg';
import stoutImg from '../assets/stout_style.jpg';

const Favorites = () => {
    const { favorites, toggleFavorite, addToCart, user, loading, t } = useApp();
    useMeta({ title: 'My Favorites | Buddiz Beer', description: 'Your saved favorite beers – add to cart or discover something new.' });
    const navigate = useNavigate();

    if (!user && !loading) {
        navigate('/login');
        return null;
    }

    const getStyleImage = (style) => {
        if (!style) return productImg;
        const s = style.toLowerCase();
        if (s.includes('ipa')) return ipaImg;
        if (s.includes('lager')) return lagerImg;
        if (s.includes('stout')) return stoutImg;
        return productImg;
    };

    if (loading) {
        return (
            <div className="catalogue-loading">
                <div className="beer-loader"></div>
                <p>{t('loading')}...</p>
            </div>
        );
    }

    return (
        <div className="catalogue-page animate-fade-in">
            <header className="favorites-hero">
                <h1>{t('favoritesHeroTitle')}</h1>
                <p>{t('favoritesHeroSubtitle')}</p>
            </header>

            <div className="favorites-container">
                {favorites.length === 0 ? (
                    <div className="empty-favorites animate-fade-in">
                        <div className="empty-icon-wrapper">
                            <PawPrint size={48} />
                        </div>
                        <h2>{t('noFavoritesTitle')}</h2>
                        <p>{t('noFavoritesSub')}</p>
                        <Link to="/catalogue" className="explore-btn">
                            {t('exploreBrews')}
                        </Link>
                    </div>
                ) : (
                    <div className="product-grid">
                        {favorites.map(beer => {
                            const isComingSoon = beer.description === "Coming Soon";

                            return (
                                <div key={beer.id} className="product-card">
                                    <div className="product-image-wrapper">
                                        <img
                                            src={getStyleImage(beer.style)}
                                            alt={beer.name}
                                            className="product-image"
                                        />
                                        {isComingSoon && <div className="coming-soon-badge">{t('comingSoon')}</div>}

                                        <button
                                            className="fav-btn-bubble active"
                                            onClick={() => toggleFavorite(beer)}
                                            aria-label="Toggle Favorite"
                                        >
                                            <PawPrint size={20} fill="white" />
                                        </button>
                                    </div>

                                    <div className="product-info">
                                        <div className="style-tag">{beer.style || "Craft Beer"}</div>
                                        <h3 className="product-name">{beer.name}</h3>

                                        <div className="product-meta">
                                            <span className="price-tag">₪{Number(beer.price).toFixed(2)}</span>
                                            <span className="abv-tag">{beer.abv}% ABV</span>
                                        </div>

                                        <p className="product-desc">{beer.description}</p>

                                        <button
                                            className="buy-btn"
                                            disabled={isComingSoon}
                                            onClick={() => !isComingSoon && addToCart(beer)}
                                        >
                                            <ShoppingCart size={20} />
                                            {isComingSoon ? t('comingSoon') : t('addToCart')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
