import React, { useState, useEffect } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser, user, t } = useApp();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { isSignedIn, nextStep } = await signIn({ username: email, password });
            if (isSignedIn) {
                // Force reload to update context or use setUser
                window.location.href = '/';
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (err.name === 'UserNotConfirmedException') {
                navigate(`/confirm?email=${encodeURIComponent(email)}`);
                return;
            }
            setError(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-fade-in">
                <div className="auth-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>{t('welcomeBack')}</h2>
                        <LanguageSwitcher />
                    </div>
                    <p className="auth-subtitle">{t('loginSubtitle')}</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>{t('emailLabel')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t('emailPlaceholder')}
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('passwordLabel')}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder={t('passwordPlaceholder')}
                            />
                        </div>

                        <button type="submit" className="btn-primary btn-full">{t('loginBtn')}</button>
                    </form>

                    <div className="auth-footer">
                        <p>{t('dontHaveAccount')} <Link to="/register">{t('signUpBtn')}</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
