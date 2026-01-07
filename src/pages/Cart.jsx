import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart } = useApp();

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cart.length === 0) {
        return (
            <div className="empty-page-container animate-fade-in">
                <h2>Your cart is empty</h2>
                <p className="text-muted mb-6">Looks like you haven't found your perfect brew yet.</p>
                <Link to="/catalogue" className="btn-primary">Browse Catalogue</Link>
            </div>
        );
    }

    return (
        <div className="cart-page container animate-fade-in">
            <h2 className="page-title">Your Cart</h2>
            <div className="cart-content">
                <div className="cart-items">
                    {cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-info">
                                <h3>{item.name}</h3>
                                <p>Qty: {item.quantity}</p>
                            </div>
                            <div className="cart-item-price">
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <button
                                className="btn-remove"
                                onClick={() => removeFromCart(item.id)}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping (Dog Delivery)</span>
                        <span>$5.00</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>${(total + 5).toFixed(2)}</span>
                    </div>
                    <button className="btn-primary btn-checkout">Proceed to Checkout</button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
