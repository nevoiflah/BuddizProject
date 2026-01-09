import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from 'aws-amplify/auth';
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, clearCart, user, language, t } = useApp();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const getProductVal = (product, field) => {
        if (language === 'he') {
            return product[`${field}_he`] || product[field];
        }
        return product[field];
    };

    const handleCheckout = async () => {
        if (!user) {
            alert("Please login to complete your purchase!");
            navigate('/login');
            return;
        }

        if (cart.length === 0) return;

        setIsCheckingOut(true);
        try {
            const { credentials } = await fetchAuthSession();
            const client = new DynamoDBClient({ region: "eu-north-1", credentials });
            const docClient = DynamoDBDocumentClient.from(client);

            // 1. Deduct Stock for each item
            // We do this sequentially to ensure we can catch errors per item
            for (const item of cart) {
                try {
                    await docClient.send(new UpdateCommand({
                        TableName: "BUDDIZ-Beers",
                        Key: { id: item.id },
                        UpdateExpression: "set stock = stock - :qty",
                        ConditionExpression: "stock >= :qty",
                        ExpressionAttributeValues: {
                            ":qty": item.quantity
                        }
                    }));
                } catch (err) {
                    if (err.name === 'ConditionalCheckFailedException') {
                        throw new Error(`Not enough stock for ${item.name}`);
                    }
                    throw err;
                }
            }

            // 2. Create Order
            const orderId = crypto.randomUUID();
            const orderTotal = (total + 5).toFixed(2);

            const newOrder = {
                orderId: orderId,
                userId: user.email || user.username, // Using email as consistent ID
                items: cart,
                total: orderTotal,
                status: 'Processing',
                createdAt: new Date().toISOString()
            };

            await docClient.send(new PutCommand({
                TableName: "BUDDIZ-Orders",
                Item: newOrder
            }));

            clearCart();
            alert("Order placed successfully! 🍺");
            navigate('/profile');

        } catch (error) {
            console.error("Checkout failed:", error);
            alert(`Failed to place order: ${error.message}`);
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
                        <span>{t('subtotal')}</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>{t('shipping')}</span>
                        <span>$5.00</span>
                    </div>
                    <div className="summary-row total">
                        <span>{t('total')}</span>
                        <span>${(total + 5).toFixed(2)}</span>
                    </div>
                    <button
                        className="btn-primary btn-checkout"
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                    >
                        {isCheckingOut ? t('processing') : t('checkout')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
