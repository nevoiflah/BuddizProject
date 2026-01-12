import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, clearCart, user, language, t } = useApp();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const getProductVal = (product, field) => {
        if (language === 'he') {
            return product[`${field}_he`] || product[field];
        }
        return product[field];
    };

    const LAMBDA_URL = "https://xelq5cmvtj.execute-api.eu-north-1.amazonaws.com/";

    const createOrder = async (data, actions) => {
        if (!user) {
            alert("Please login to complete your purchase!");
            navigate('/login');
            return;
        }
        try {
            const response = await fetch(LAMBDA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "createOrder",
                    cart: cart
                })
            });
            const order = await response.json();
            return order.id;
        } catch (err) {
            console.error("Create Order Error:", err);
            throw err;
        }
    };

    const onApprove = async (data, actions) => {
        setIsCheckingOut(true);
        try {
            const response = await fetch(LAMBDA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "captureOrder",
                    orderID: data.orderID,
                    userEmail: user.email || user.username,
                    cart: cart
                })
            });
            const result = await response.json();

            if (result.status === "success") {
                clearCart();
                alert(t?.paymentSuccess || "Payment Successful! 🍺");
                navigate('/profile');
            } else {
                console.error("Capture failed:", result);
                alert("Payment failed. Please try again.");
            }
        } catch (err) {
            console.error("Capture Error:", err);
            alert("An error occurred during payment.");
        }
        setIsCheckingOut(false);
    };

    if (cart.length === 0) {
        return (
            <div className="empty-page-container animate-fade-in">
                <h2>{t('cartEmpty')}</h2>
                <p className="text-muted mb-6">{t('cartEmptySub')}</p>
                <Link to="/catalogue" className="btn-primary">{t('browseCatalogue')}</Link>
            </div>
        );
    }

    return (
        <div className="cart-page container animate-fade-in">
            <h2 className="page-title">{t('yourCart')}</h2>
            <div className="cart-content">
                <div className="cart-items">
                    {cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-info">
                                <h3>{getProductVal(item, 'name')}</h3>
                                <p>{t('qty')}: {item.quantity}</p>
                            </div>
                            <div className="cart-item-price">
                                ₪{(item.price * item.quantity).toFixed(2)}
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
                        <span>{t('subtotal')}</span>
                        <span>₪{total.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>{t('shipping')}</span>
                        <span>₪5.00</span>
                    </div>
                    <div className="summary-row total">
                        <span>{t('total')}</span>
                        <span>₪{(total + 5).toFixed(2)}</span>
                    </div>

                    <div style={{ marginTop: '20px', position: 'relative', zIndex: 1 }}>
                        <PayPalScriptProvider
                            key={language}
                            options={{
                                "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
                                currency: "ILS",
                                locale: language === 'he' ? 'he_IL' : 'en_US'
                            }}
                        >
                            <PayPalButtons
                                createOrder={createOrder}
                                onApprove={onApprove}
                                style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                                disabled={isCheckingOut || !user}
                            />
                        </PayPalScriptProvider>
                        {!user && <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '10px' }}>Please login to pay</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
