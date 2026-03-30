import { useState, useEffect } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { LAMBDA_URLS } from '../constants/aws';
import { useMeta } from '../hooks/useMeta';
import { useApp } from '../context/AppContext';
import './Auth.css';

const ConfirmEmail = () => {
    useMeta({ title: 'Verify Email | Buddiz Beer', description: 'Enter your verification code to confirm your Buddiz account.' });
    const { showToast } = useApp();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
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
        try {
            await confirmSignUp({ username: email, confirmationCode: code });

            // Trigger SES Verification
            try {
                await fetch(LAMBDA_URLS.PAYPAL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "verifyUserIdentity", email: email })
                });
            } catch (verErr) {
                console.error("Verification trigger failed", verErr);
            }

            showToast("Account confirmed! Check your email for a verification link.", 'success');
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleResend = async () => {
        setMessage('');
        setError('');
        try {
            await resendSignUpCode({ username: email });
            setMessage('Code resent successfully!');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-fade-in">
                <div className="auth-card">
                    <h2>Verify Your Email</h2>
                    <p className="auth-subtitle">Enter the code sent to your email.</p>

                    {error && <div className="auth-error">{error}</div>}
                    {message && <div className="auth-success" style={{ color: 'green', marginBottom: '16px' }}>{message}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Verification Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                placeholder="123456"
                            />
                        </div>

                        <button type="submit" className="btn-primary btn-full">Verify Account</button>
                    </form>

                    <div className="auth-footer">
                        <p>Didn't receive code? <button onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }}>Resend</button></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmEmail;
