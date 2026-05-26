import { useState, useEffect } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LAMBDA_URLS } from '../constants/aws';
import { useMeta } from '../hooks/useMeta';
import { useApp } from '../context/AppContext';
import './Auth.css';

const COGNITO_ERROR_MAP = {
    CodeMismatchException: 'That code is incorrect. Please check and try again.',
    ExpiredCodeException: 'That code has expired. Click "Resend" to get a new one.',
    TooManyFailedAttemptsException: 'Too many failed attempts. Please request a new code.',
    TooManyRequestsException: 'Too many requests. Please wait a moment.',
    LimitExceededException: 'Attempt limit exceeded. Please try again later.',
};

const friendlyError = (err) =>
    COGNITO_ERROR_MAP[err.name] || err.message || 'Something went wrong. Please try again.';

const ConfirmEmail = () => {
    useMeta({ title: 'Verify Email | Buddiz Beer', description: 'Enter your verification code to confirm your Buddiz account.' });
    const { showToast } = useApp();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailParam = queryParams.get('email');
        if (emailParam) setEmail(emailParam);
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await confirmSignUp({ username: email, confirmationCode: code });
            try {
                await fetch(LAMBDA_URLS.PAYPAL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'verifyUserIdentity', email })
                });
            } catch (verErr) {
                console.error('Verification trigger failed', verErr);
            }
            showToast('Account confirmed! You can now sign in.', 'success');
            navigate('/login');
        } catch (err) {
            setError(friendlyError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setLoading(true);
        try {
            await resendSignUpCode({ username: email });
            showToast('Verification code resent. Check your inbox.', 'success');
        } catch (err) {
            setError(friendlyError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-fade-in">
                <div className="auth-card">
                    <h2>Verify Your Email</h2>
                    <p className="auth-subtitle">Enter the 6-digit code sent to your email.</p>

                    {error && <div className="auth-error" role="alert">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="form-group">
                            <label htmlFor="confirm-email">Email Address</label>
                            <input
                                id="confirm-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-code">Verification Code</label>
                            <input
                                id="confirm-code"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                placeholder="123456"
                                autoComplete="one-time-code"
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn-primary btn-full${loading ? ' btn-submit-loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Verifying…' : 'Verify Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResend}
                                disabled={loading}
                                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Resend
                            </button>
                        </p>
                        <p style={{ marginTop: '12px' }}>
                            <Link to="/login">← Back to Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmEmail;
