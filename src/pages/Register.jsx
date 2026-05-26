import React, { useState } from 'react';
import { signUp } from 'aws-amplify/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMeta } from '../hooks/useMeta';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Auth.css';

const COGNITO_ERROR_MAP = {
    UsernameExistsException: 'An account with that email already exists.',
    InvalidPasswordException: 'Password must be at least 8 characters with uppercase, lowercase, and a number.',
    InvalidParameterException: 'Please check your details and try again.',
    TooManyRequestsException: 'Too many attempts. Please wait a moment and try again.',
    NetworkError: 'Network error. Please check your connection.',
};

const friendlyError = (err) => {
    if (err.name === 'UsernameExistsException' || err.message?.includes('already exists')) {
        return COGNITO_ERROR_MAP.UsernameExistsException;
    }
    return COGNITO_ERROR_MAP[err.name] || err.message || 'Something went wrong. Please try again.';
};

const Register = () => {
    useMeta({ title: 'Create Account | Buddiz Beer', description: 'Join Buddiz to start ordering premium craft beers delivered to your door.' });
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [birthdate, setBirthdate] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useApp();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const today = new Date();
        const birthDateObj = new Date(birthdate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) age--;

        if (age < 18) {
            setError(t('alreadyAbove18'));
            return;
        }

        setLoading(true);
        try {
            await signUp({
                username: email,
                password,
                options: {
                    userAttributes: { email, birthdate }
                }
            });
            navigate(`/confirm?email=${encodeURIComponent(email)}`);
        } catch (err) {
            console.error('Registration Error:', err);
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
                        <h2>{t('joinBuddiz')}</h2>
                        <LanguageSwitcher />
                    </div>
                    <p className="auth-subtitle">{t('createAccount')}</p>

                    {error && <div className="auth-error" role="alert">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="form-group">
                            <label htmlFor="reg-name">{t('fullNameLabel')}</label>
                            <input
                                id="reg-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder={t('fullNamePlaceholder')}
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reg-email">{t('emailLabel')}</label>
                            <input
                                id="reg-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t('emailPlaceholder')}
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reg-password">{t('passwordLabel')}</label>
                            <div className="password-wrapper">
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder={t('passwordPlaceholder')}
                                    autoComplete="new-password"
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

                        <div className="form-group">
                            <label htmlFor="reg-dob">{t('dob')}</label>
                            <input
                                id="reg-dob"
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                required
                                autoComplete="bday"
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn-primary btn-full${loading ? ' btn-submit-loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? t('loading') || 'Creating account…' : t('signUpBtn')}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>{t('alreadyHaveAccount')} <Link to="/login">{t('loginBtn')}</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
