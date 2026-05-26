import React, { useState, useEffect } from 'react';
import { signIn, signOut } from 'aws-amplify/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMeta } from '../hooks/useMeta';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Auth.css';

const COGNITO_ERROR_MAP = {
    NotAuthorizedException: 'Incorrect email or password. Please try again.',
    UserNotFoundException: 'No account found with that email.',
    UserNotConfirmedException: 'Please verify your email before signing in.',
    PasswordResetRequiredException: 'Your password needs to be reset. Check your email.',
    TooManyRequestsException: 'Too many attempts. Please wait a moment and try again.',
    NetworkError: 'Network error. Please check your connection.',
};

const friendlyError = (err) =>
    COGNITO_ERROR_MAP[err.name] || err.message || 'Something went wrong. Please try again.';

const Login = () => {
    useMeta({ title: 'Sign In | Buddiz Beer', description: 'Sign in to your Buddiz account to order craft beer.' });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser, user, t } = useApp();

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signOut();
            const { isSignedIn, nextStep } = await signIn({ username: email, password });
            if (isSignedIn) {
                navigate('/');
                window.location.reload();
            }
        } catch (err) {
            console.error('Login Error:', err);
            if (err.name === 'UserNotConfirmedException') {
                navigate(`/confirm?email=${encodeURIComponent(email)}`);
                return;
            }
            setError(friendlyError(err));
        } finally {
            setLoading(false);
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

                    {error && <div className="auth-error" role="alert">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="form-group">
                            <label htmlFor="login-email">{t('emailLabel')}</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t('emailPlaceholder')}
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="login-password">{t('passwordLabel')}</label>
                            <div className="password-wrapper">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder={t('passwordPlaceholder')}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(v => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`btn-primary btn-full${loading ? ' btn-submit-loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? t('loading') || 'Signing in…' : t('loginBtn')}
                        </button>
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
