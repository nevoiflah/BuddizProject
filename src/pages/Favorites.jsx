import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, PawPrint, Beer, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Catalogue.css';
import './Favorites.css';

import productImg from '../assets/BuddizProduct.png';
import ipaImg from '../assets/ipa_style.png';
import lagerImg from '../assets/lager_style.png';
import stoutImg from '../assets/stout_style.png';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from "aws-amplify/auth";

const Favorites = () => {
    const { favorites, toggleFavorite, addToCart, user, t, language } = useApp();
    const navigate = useNavigate();

    const [freshFavorites, setFreshFavorites] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const getStyleImage = (style) => {
        if (!style) return productImg;
        const s = style.toLowerCase();
        if (s.includes('ipa')) return ipaImg;
        if (s.includes('lager')) return lagerImg;
        if (s.includes('stout')) return stoutImg;
        return productImg;
    };

    React.useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchFreshData = async () => {
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
                const allBeers = response.Items || [];

                const userFavIds = new Set(favorites.map(f => f.id));
                const hydratedFavs = allBeers.filter(beer => userFavIds.has(beer.id));

                setFreshFavorites(hydratedFavs);
            } catch (err) {
                console.error("Error fetching fresh favorites data:", err);
                setFreshFavorites(favorites);
            } finally {
                setLoading(false);
            }
        };

        fetchFreshData();
    }, [user, navigate, favorites]);

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
                {freshFavorites.length === 0 ? (
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
                        {freshFavorites.map(beer => {
                            const isComingSoon = beer.description === "Coming Soon";
                            const isFavorited = true; // They are in the favorites page
                            
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
                                            className={`fav-btn-bubble ${isFavorited ? 'active' : ''}`}
                                            onClick={() => toggleFavorite(beer)}
                                            aria-label="Toggle Favorite"
                                        >
                                            <PawPrint size={20} fill={isFavorited ? "white" : "none"} />
                                        </button>
                                    </div>

                                    <div className="product-info">
                                        <div className="style-tag">{beer.style || "Craft Beer"}</div>
                                        <h3 className="product-name">{beer.name}</h3>
                                        
                                        <div className="product-meta">
                                            <span className="price-tag">₪{beer.price.toFixed(2)}</span>
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
