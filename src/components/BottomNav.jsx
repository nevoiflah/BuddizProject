import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Beer, ShoppingCart, Heart, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './BottomNav.css';

const BottomNav = () => {
    const { cart } = useApp();

    return (
        <nav className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/catalogue" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Beer size={24} />
                <span>Brews</span>
            </NavLink>
            <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <div className="icon-container">
                    <ShoppingCart size={24} />
                    {cart.reduce((total, item) => total + item.quantity, 0) > 0 &&
                        <span className="badge">
                            {cart.reduce((total, item) => total + item.quantity, 0)}
                        </span>
                    }
                </div>
                <span>Cart</span>
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Heart size={24} />
                <span>Favs</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <User size={24} />
                <span>Profile</span>
            </NavLink>
        </nav >
    );
};

export default BottomNav;
