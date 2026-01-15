import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import waitingDog from '../assets/waiting-dog.png';
import './OrderPending.css';

const OrderPending = () => {
    const { t } = useApp();

    return (
        <div className="order-pending-container animate-fade-in">
            <div className="order-card">
                <div className="image-wrapper animate-float">
                    <img src={waitingDog} alt="Waiting Dog" className="waiting-dog-img" />
                </div>

                <h1 className="pending-title">
                    {t?.orderReceived || "Order Received"}
                </h1>

                <div className="pending-status">
                    <span className="status-dot pulsing"></span>
                    <span className="status-text">{t?.waitingForApproval || "Waiting for Approval"}</span>
                </div>

                <p className="pending-message">
                    {t?.orderPendingMessage || "Thank you for your order! We are currently reviewing your details. You will receive a confirmation invoice to your email as soon as the order is approved."}
                </p>

                <div className="actions">
                    <Link to="/catalogue" className="btn-primary">
                        {t?.continueShopping || "Continue Shopping"}
                    </Link>
                    <Link to="/profile" className="btn-secondary">
                        {t?.viewOrders || "View My Orders"}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderPending;
