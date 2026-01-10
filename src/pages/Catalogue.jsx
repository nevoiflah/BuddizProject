import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import './Catalogue.css';
import { PawPrint, ShoppingCart, Beer } from 'lucide-react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from 'aws-amplify/auth';

import productImg from '../assets/BuddizProduct.png';

const Catalogue = () => {
    const { addToCart, toggleFavorite, favorites, t, language } = useApp();
    const [beers, setBeers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBeers();
    }, []);

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
            // Fallback to mock if fetch fails (e.g. auth issue)
            setBeers([]);
        } finally {
            setLoading(false);
        }
    };

    const isFav = (id) => favorites.some(item => item.id === id);

    // Helper to get translated product fields
    const getProductVal = (product, field) => {
        if (language === 'he') {
            return product[`${field}_he`] || product[field];
        }
        return product[field];
    };

    if (loading) return <div className="loader">{t('loadingBrews')}</div>;

    return (
        <div className="catalogue-page container animate-fade-in">
            <h2 className="page-title">{t('ourBrews')}</h2>
            <div className="product-grid">
                {beers.map(beer => (
                    <div key={beer.id} className="product-card">
                        <div className="product-image-placeholder">
                            <img src={productImg} alt={beer.name} className="product-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="product-info">
                            <h3 className="product-name">{getProductVal(beer, 'name')}</h3>
                            <p className="product-style">{getProductVal(beer, 'style')} • {beer.abv}</p>
                            <p className="product-desc">{getProductVal(beer, 'description')}</p>
                            <div className="product-price">₪{beer.price.toFixed(2)}</div>
                            <div className="product-actions">
                                <button
                                    className="btn-primary"
                                    onClick={() => addToCart(beer)}
                                >
                                    <ShoppingCart size={18} style={{ marginRight: '8px' }} /> {t('addToCart')}
                                </button>
                                <button
                                    className={`btn-icon ${isFav(beer.id) ? 'active' : ''}`}
                                    onClick={() => toggleFavorite(beer)}
                                >
                                    <PawPrint size={20} fill={isFav(beer.id) ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Catalogue;
