import { NavLink } from 'react-router-dom';
import { ShoppingCart, PawPrint, User, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LanguageSwitcher from './LanguageSwitcher';
import './TopNav.css';

const TopNav = () => {
    const { cart, user, t } = useApp();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="top-nav">
            <div className="top-nav-inner container">
                <NavLink to="/" className="top-nav-logo" aria-label="Buddiz home">
                    <img src="/logo.jpeg" alt="" className="top-nav-logo-img" aria-hidden="true" />
                    <span className="top-nav-logo-text">BUDDIZ</span>
                </NavLink>

                <nav className="top-nav-links" aria-label="Main navigation">
                    <NavLink to="/" end className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
                        {t('navHome')}
                    </NavLink>
                    <NavLink to="/catalogue" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
                        {t('navBrews')}
                    </NavLink>
                    {user && (
                        <>
                            <NavLink to="/favorites" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
                                {t('navFavorites')}
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="top-nav-actions">
                    {user ? (
                        <>
                            <NavLink
                                to="/cart"
                                className={({ isActive }) => `top-nav-icon-btn${isActive ? ' active' : ''}`}
                                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
                            >
                                <ShoppingCart size={20} aria-hidden="true" />
                                {cartCount > 0 && <span className="top-nav-badge" aria-hidden="true">{cartCount}</span>}
                            </NavLink>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) => `top-nav-icon-btn${isActive ? ' active' : ''}`}
                                aria-label="Profile"
                            >
                                <User size={20} aria-hidden="true" />
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
                                {t('loginBtn')}
                            </NavLink>
                            <NavLink to="/register" className="top-nav-cta">
                                {t('signUpBtn')}
                            </NavLink>
                        </>
                    )}
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
};

export default TopNav;
