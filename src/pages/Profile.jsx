import React, { useState, useEffect } from 'react';
import { signOut, updatePassword, fetchAuthSession } from 'aws-amplify/auth';
import { useApp } from '../context/AppContext';
import { LogOut, Save, Lock, User, Edit2 } from 'lucide-react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Profile.css';

const Profile = () => {
    const { user, setUser, t } = useApp();
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

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (user?.email) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { credentials } = await fetchAuthSession();
            const client = new DynamoDBClient({ region: "eu-north-1", credentials });
            const docClient = DynamoDBDocumentClient.from(client);

            const command = new ScanCommand({
                TableName: "BUDDIZ-Orders",
                FilterExpression: "userId = :email",
                ExpressionAttributeValues: {
                    ":email": user.email
                }
            });

            const response = await docClient.send(command);
            setOrders((response.Items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
        setOrdersLoading(false);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPasswordMessage('');
        try {
            await updatePassword({ oldPassword, newPassword });
            setPasswordMessage(t('passwordChangedSuccess') || 'Password changed successfully!');
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
                    <span className="profile-badge">
                        {user.role === 'ADMIN' ? t('adminBadge') : t('userBadge')}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                    <div className="desktop-lang-switch">
                        <LanguageSwitcher />
                    </div>
                    <button onClick={handleLogout} className="btn-danger logout-btn">
                        {t('logout')} <LogOut size={18} style={{ marginLeft: '8px' }} />
                    </button>
                </div>
            </div>

            <div className="profile-sections">
                {/* Edit Profile Card */}
                <div className="profile-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>{t('profileTitle')}</h3>
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
                                <span className="label text-muted">{t('fullNameLabel')}</span>
                                <span className="value">{user.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="label text-muted">Username</span>
                                <span className="value">{user.username || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label text-muted">Role</span>
                                <span className="value">{user.role}</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} className="profile-form">
                            <div className="form-group">
                                <label>{t('fullNameLabel')}</label>
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
                                    {t('saveChanges')}
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                                    {t('cancel')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Change Password Card */}
                <div className="profile-card">
                    <h3>{t('changePassword')}</h3>
                    <form onSubmit={handleUpdatePassword} className="profile-form">
                        <div className="form-group">
                            <label>{t('currentPassword')}</label>
                            <div className="input-icon-wrapper">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    placeholder={t('passwordPlaceholder')}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>{t('newPassword')}</label>
                            <div className="input-icon-wrapper">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder={t('passwordPlaceholder')}
                                />
                            </div>
                        </div>
                        {passwordMessage && (
                            <div className={`message ${passwordMessage.includes('Error') ? 'error' : 'success'}`}>
                                {passwordMessage}
                            </div>
                        )}
                        <button type="submit" className="btn-primary btn-full" disabled={loading} style={{ marginTop: '1rem' }}>
                            {t('updatePassword')}
                        </button>
                    </form>
                </div>

                <div className="profile-card">
                    <h3>{t('orderHistory') || 'Order History'}</h3>
                    {ordersLoading ? (
                        <div className="text-muted">Loading...</div>
                    ) : orders.length === 0 ? (
                        <div className="empty-state">
                            <p className="text-muted">{t('noRecentOrders') || 'No recent orders.'}</p>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.id || order.orderId} className="order-item" style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 'bold' }}>#{(order.id || order.orderId).substring(0, 8)}</span>
                                        <span className={`badge ${order.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{order.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <span>₪{order.total}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', marginTop: '4px', color: '#888' }}>
                                        {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
