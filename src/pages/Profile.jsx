import React from 'react';
import { signOut } from 'aws-amplify/auth';
import { useApp } from '../context/AppContext';
import { LogOut } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, setUser } = useApp();

    const handleLogout = async () => {
        try {
            await signOut();
            setUser(null);
            window.location.href = '/'; // Hard reload to clear state and reset app
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    if (!user) return null; // Should be handled by protected route, but safety check

    // Mock Data if no user (fallback, though we guard above)
    const profile = user || {
        name: 'Guest',
        email: 'guest@example.com',
        loyaltyPoints: 0
    };

    return (
        <div className="profile-page container animate-fade-in">
            <div className="profile-header">
                <div className="profile-avatar">
                    {profile.name ? profile.name.charAt(0) : 'U'}
                </div>
                <div className="profile-details">
                    <h2>{profile.name}</h2>
                    <p>{profile.email}</p>
                    <span className="badge">Buddiz Member</span>
                </div>
                <button onClick={handleLogout} className="btn-danger" style={{ marginLeft: 'auto' }}>
                    Logout <LogOut size={18} style={{ marginLeft: '8px' }} />
                </button>
            </div>

            <div className="profile-sections">
                <div className="profile-card">
                    <h3>Loyalty Stats</h3>
                    <div className="stat-row">
                        <span>Points</span>
                        <span className="stat-value">{profile.loyaltyPoints}</span>
                    </div>
                    <div className="stat-row">
                        <span>Status</span>
                        <span className="stat-value">Gold Retriever</span>
                    </div>
                </div>

                <div className="profile-card">
                    <h3>Order History</h3>
                    <div className="empty-state" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                        <p className="text-muted">No recent orders.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
