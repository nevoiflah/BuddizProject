import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import './Catalogue.css';
import { Heart, ShoppingCart, Beer } from 'lucide-react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from 'aws-amplify/auth';

const Catalogue = () => {
    const { addToCart, toggleFavorite, favorites } = useApp();
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
    // Removed duplicate useApp call

    const isFav = (id) => favorites.some(item => item.id === id);

    if (loading) return <div className="loader">Loading Brews...</div>;

    return (
        <div className="catalogue-page container animate-fade-in">
            <h2 className="page-title">Our Brews</h2>
            <div className="product-grid">
                {beers.map(beer => (
                    <div key={beer.id} className="product-card">
                        <div className="product-image-placeholder">
                            <Beer size={40} color="var(--color-primary)" />
                        </div>
                        <div className="product-info">
                            <h3 className="product-name">{beer.name}</h3>
                            <p className="product-style">{beer.style} • {beer.abv}</p>
                            <p className="product-desc">{beer.description}</p>
                            <div className="product-price">${beer.price.toFixed(2)}</div>
                            <div className="product-actions">
                                <button
                                    className="btn-primary"
                                    onClick={() => addToCart(beer)}
                                >
                                    <ShoppingCart size={18} style={{ marginRight: '8px' }} /> Add to Cart
                                </button>
                                <button
                                    className={`btn-icon ${isFav(beer.id) ? 'active' : ''}`}
                                    onClick={() => toggleFavorite(beer)}
                                >
                                    <Heart size={20} fill={isFav(beer.id) ? "currentColor" : "none"} />
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
