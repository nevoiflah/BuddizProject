import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, PawPrint, Beer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Catalogue.css'; // Reusing catalogue styles for product grid
import productImg from '../assets/BuddizProduct.png';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from "aws-amplify/auth";

const Favorites = () => {
    const { favorites, removeFromFavorites, addToCart, user, t } = useApp();
    const navigate = useNavigate();

    const [freshFavorites, setFreshFavorites] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

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

                // Fetch all beers to get fresh descriptions
                const command = new ScanCommand({
                    TableName: "BUDDIZ-Beers"
                });

                const response = await docClient.send(command);
                const allBeers = response.Items || [];

                // Filter allBeers to keep only those that are in the user's favorites list
                // We use the ID from the context favorites to find the fresh object
                const userFavIds = new Set(favorites.map(f => f.id));
                const hydratedFavs = allBeers.filter(beer => userFavIds.has(beer.id));

                setFreshFavorites(hydratedFavs);
            } catch (err) {
                console.error("Error fetching fresh favorites data:", err);
                // Fallback to stale data if fetch fails
                setFreshFavorites(favorites);
            } finally {
                setLoading(false);
            }
        };

        fetchFreshData();
    }, [user, navigate, favorites]);

    if (loading) return <div className="loader">{t('loading')}</div>;

    return (
        <div className="page-container animate-fade-in" style={{ padding: 'var(--spacing-md)' }}>
            {freshFavorites.length === 0 ? (
                <div className="empty-page-container">
                    <PawPrint size={64} className="text-muted mb-4" />
                    <h2>No favorites yet</h2>
                    <p className="text-muted mb-6">Save your favorite brews here to find them easily later.</p>
                    <Link to="/catalogue" className="btn-primary">Explore Brews</Link>
                </div>
            ) : (
                <div className="product-grid">
                    {freshFavorites.map(beer => (
                        <div key={beer.id} className="product-card">
                            <div className="product-image-placeholder">
                                <img src={productImg} alt={beer.name} className="product-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="product-info">
                                <h3>{beer.name}</h3>
                                <p className="product-brewery">{beer.brewery}</p>
                                <p className="product-price">₪{beer.price.toFixed(2)}</p>
                                <div className="product-actions">
                                    {(() => {
                                        const isComingSoon = beer.description === "Coming Soon";
                                        return (
                                            <button
                                                className="btn-primary"
                                                disabled={isComingSoon}
                                                style={isComingSoon ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                                onClick={() => {
                                                    if (!isComingSoon) addToCart(beer);
                                                }}
                                            >
                                                <ShoppingCart size={18} style={{ marginRight: '8px' }} />
                                                {isComingSoon ? t('comingSoon') : t('addToCart')}
                                            </button>
                                        );
                                    })()}
                                    <button onClick={() => removeFromFavorites(beer.id)} className="btn-icon active">
                                        <PawPrint size={20} fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;
