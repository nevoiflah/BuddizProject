import React, { useState } from 'react';
import { signOut, updatePassword, fetchAuthSession } from 'aws-amplify/auth';
import { useApp } from '../context/AppContext';
import { LogOut, Save, Lock, User, Edit2 } from 'lucide-react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import './Profile.css';

const Profile = () => {
    const { user, setUser } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [username, setUsername] = useState(user?.username || '');

    // Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    const handleLogout = async () => {
        try {
            await signOut();
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { credentials } = await fetchAuthSession();
            const client = new DynamoDBClient({ region: "eu-north-1", credentials });
            const docClient = DynamoDBDocumentClient.from(client);

            await docClient.send(new UpdateCommand({
                TableName: "BUDDIZ-Users",
                Key: { id: user.id },
                UpdateExpression: "set #n = :name, username = :username",
                ExpressionAttributeNames: { "#n": "name" },
                ExpressionAttributeValues: {
                    ":name": name,
                    ":username": username
                }
            }));

            // Update local context
            setUser({ ...user, name, username });
            setIsEditing(false);
            alert("Profile updated successfully!");

        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
        setLoading(false);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPasswordMessage('');
        try {
            await updatePassword({ oldPassword, newPassword });
            setPasswordMessage('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
        } catch (error) {
            console.error(error);
            setPasswordMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };

    if (!user) return null;

    return (
        <div className="profile-page container animate-fade-in">
            {/* Header */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-details">
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <span className="profile-badge">Buddiz Member</span>
                </div>
                <button onClick={handleLogout} className="btn-danger logout-btn">
                    Logout <LogOut size={18} style={{ marginLeft: '8px' }} />
                </button>
            </div>

            <div className="profile-sections">
                {/* Edit Profile Card */}
                <div className="profile-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Profile Details</h3>
                        <button
                            className="btn-icon"
                            onClick={() => setIsEditing(!isEditing)}
                            style={{ color: 'var(--color-primary)' }}
                        >
                            <Edit2 size={20} />
                        </button>
                    </div>

                    {!isEditing ? (
                        <div className="profile-info-view">
                            <div className="info-row">
                                <span className="label">Name</span>
                                <span className="value">{user.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Username</span>
                                <span className="value">{user.username || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Role</span>
                                <span className="value">{user.role}</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} className="profile-form">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    <Save size={16} style={{ marginRight: '8px' }} />
                                    Save
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Change Password Card */}
                <div className="profile-card">
                    <h3>Change Password</h3>
                    <form onSubmit={handleUpdatePassword} className="profile-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <div className="input-icon-wrapper">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <div className="input-icon-wrapper">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        {passwordMessage && (
                            <div className={`message ${passwordMessage.includes('Error') ? 'error' : 'success'}`}>
                                {passwordMessage}
                            </div>
                        )}
                        <button type="submit" className="btn-primary btn-full" disabled={loading} style={{ marginTop: '1rem' }}>
                            Update Password
                        </button>
                    </form>
                </div>

                <div className="profile-card">
                    <h3>Order History</h3>
                    <div className="empty-state">
                        <p className="text-muted">No recent orders.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
