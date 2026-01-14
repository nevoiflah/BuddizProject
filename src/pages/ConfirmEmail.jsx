import React, { useState, useEffect } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

const ConfirmEmail = () => {
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
            const LAMBDA_URL = "https://kxyras2cml.execute-api.eu-north-1.amazonaws.com/";
            try {
                await fetch(LAMBDA_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "verifyUserIdentity", email: email })
                });
            } catch (verErr) {
                console.error("Verification trigger failed", verErr);
            }

            // Success! Redirect to login (or show message)
            alert("Account confirmed! IMPORTANT: Please check your email and click the AWS verification link to receive order updates.");
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
