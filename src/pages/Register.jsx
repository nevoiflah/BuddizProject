import React, { useState } from 'react';
import { signUp } from 'aws-amplify/auth';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 1. Sign Up User in Cognito (Only send email as attribute if config restricts 'name')
            const { isSignUpComplete, userId, nextStep } = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email
                        // Removed 'name' as it might cause 400 if not enabled in User Pool
                    }
                }
            });

            console.log("Sign up success:", userId);

            // 2. Add User to DynamoDB (BUDDIZ-Users)
            // We need credentials to write to DynamoDB.
            // However, at this point, the user is NOT logged in yet (unauthenticated).
            // This is tricky. Authenticated role has write access. Unauth usually doesn't.
            // ERROR: We cannot write to DynamoDB here if we are not logged in.
            // Alternative: We can't write to DB yet. We must do it AFTER login.
            // BUT: We want the name to be saved.

            // Revised Strategy:
            // Just fix the 400 first by removing 'name'.
            // If the user logs in later, we might prompt for name or update it then?
            // Actually, let's try to send 'name' as 'given_name' or 'nickname'? 
            // AWS Exports says only 'EMAIL' is in signup_attributes (Required).
            // Let's rely on standard attributes being open.

            // Let's try sending NO attributes other than email first to verify the fix.
            navigate(`/confirm?email=${encodeURIComponent(email)}`);
        } catch (err) {
            console.error("Registration Error:", err);
            setError(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-fade-in">
                <div className="auth-card">
                    <h2>Join Buddiz</h2>
                    <p className="auth-subtitle">Create your account today</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" className="btn-primary btn-full">Sign Up</button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
