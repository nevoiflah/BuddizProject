import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Beer, ShoppingCart, PawPrint, User, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './BottomNav.css';

const BottomNav = () => {
    const { cart, user, t } = useApp();

    return (
        <nav className="bottom-nav" aria-label="Main navigation">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} end>
                <Home size={24} aria-hidden="true" />
                <span>{t('navHome')}</span>
            </NavLink>
            <NavLink to="/catalogue" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Beer size={24} aria-hidden="true" />
                <span>{t('navBrews')}</span>
            </NavLink>
            {user ? (
                <>
                    <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <div className="icon-container" aria-hidden="true">
                            <ShoppingCart size={24} />
                            {cart.reduce((total, item) => total + item.quantity, 0) > 0 &&
                                <span className="badge" aria-hidden="true">
                                    {cart.reduce((total, item) => total + item.quantity, 0)}
                                </span>
                            }
                        </div>
                        <span>{t('navCart')}</span>
                    </NavLink>
                    <NavLink to="/favorites" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <PawPrint size={24} aria-hidden="true" />
                        <span>{t('navFavorites')}</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <User size={24} aria-hidden="true" />
                        <span>{t('navProfile')}</span>
                    </NavLink>
                </>
            ) : (
                <>
                    <NavLink to="/login" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <LogIn size={24} aria-hidden="true" />
                        <span>{t('loginBtn')}</span>
                    </NavLink>
                    <NavLink to="/register" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <UserPlus size={24} aria-hidden="true" />
                        <span>{t('signUpBtn')}</span>
                    </NavLink>
                </>
            )}
        </nav>
    );
};

export default BottomNav;
