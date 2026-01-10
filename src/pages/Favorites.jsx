import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, PawPrint, Beer } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Catalogue.css'; // Reusing catalogue styles for product grid
import productImg from '../assets/BuddizProduct.png';

const Favorites = () => {
    const { favorites, removeFromFavorites, addToCart } = useApp();

    return (
        <div className="page-container animate-fade-in" style={{ padding: 'var(--spacing-md)' }}>
            {favorites.length === 0 ? (
                <div className="empty-page-container">
                    <PawPrint size={64} className="text-muted mb-4" />
                    <h2>No favorites yet</h2>
                    <p className="text-muted mb-6">Save your favorite brews here to find them easily later.</p>
                    <Link to="/catalogue" className="btn-primary">Explore Brews</Link>
                </div>
            ) : (
                <div className="product-grid">
                    {favorites.map(beer => (
                        <div key={beer.id} className="product-card">
                            <div className="product-image-placeholder">
                                <img src={productImg} alt={beer.name} className="product-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="product-info">
                                <h3>{beer.name}</h3>
                                <p className="product-brewery">{beer.brewery}</p>
                                <p className="product-price">₪{beer.price.toFixed(2)}</p>
                                <div className="product-actions">
                                    <button onClick={() => addToCart(beer)} className="btn-primary">
                                        <ShoppingCart size={18} style={{ marginRight: '8px' }} /> Add
                                    </button>
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
