import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Beer, ShoppingCart, PawPrint, User, Shield, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './BottomNav.css';

const BottomNav = () => {
    const { cart, user, t } = useApp();

    return (
        <nav className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Home size={24} />
                <span>{t('navHome')}</span>
            </NavLink>
            <NavLink to="/catalogue" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Beer size={24} />
                <span>{t('navBrews')}</span>
            </NavLink>
            {user ? (
                <>
                    <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <div className="icon-container">
                            <ShoppingCart size={24} />
                            {cart.reduce((total, item) => total + item.quantity, 0) > 0 &&
                                <span className="badge">
                                    {cart.reduce((total, item) => total + item.quantity, 0)}
                                </span>
                            }
                        </div>
                        <span>{t('navCart')}</span>
                    </NavLink>
                    <NavLink to="/favorites" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <PawPrint size={24} />
                        <span>{t('navFavorites')}</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <User size={24} />
                        <span>{t('navProfile')}</span>
                    </NavLink>
                    {user.role === 'ADMIN' && (
                        <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <Shield size={24} />
                            <span>{t('navAdmin')}</span>
                        </NavLink>
                    )}
                </>
            ) : (
                <>
                    <NavLink to="/login" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <LogIn size={24} />
                        <span>{t('loginBtn')}</span>
                    </NavLink>
                    <NavLink to="/register" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <UserPlus size={24} />
                        <span>{t('signUpBtn')}</span>
                    </NavLink>
                </>
            )}
        </nav >
    );
};

export default BottomNav;
