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
            alert(t('profileUpdateSuccess'));

        } catch (error) {
            console.error("Error updating profile:", error);
            alert(t('profileUpdateFail'));
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
        <div className="profile-page-v2 animate-fade-in">
            {/* Immersive Hero Header */}
            <header className="profile-hero">
                <div className="hero-overlay"></div>
                <div className="container hero-inner">
                    <div className="hero-top">
                        <div className="hero-avatar-wrapper">
                            <div className="profile-avatar-v2">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </div>
                        <div className="hero-info">
                            <h1 className="hero-name">{user.name}</h1>
                            <p className="hero-email">{user.email}</p>
                            <div className="hero-badges">
                                <span className="profile-badge-v2">
                                    {user.role === 'ADMIN' ? t('adminBadge') : t('userBadge')}
                                </span>
                            </div>
                        </div>
                        <div className="hero-actions-v2">
                            <LanguageSwitcher />
                            <button onClick={handleLogout} className="logout-btn-v2">
                                <LogOut size={20} />
                                <span>{t('logout')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container profile-content-v2">
                <div className="profile-grid">
                    {/* Security & Settings */}
                    <aside className="profile-sidebar">
                        {/* Change Password Card */}
                        <div className="glass-card profile-card-v2">
                            <h3 className="card-title-v2">
                                <Lock size={18} className="title-icon" />
                                {t('changePassword')}
                            </h3>
                            <form onSubmit={handleUpdatePassword} className="profile-form-v2">
                                <div className="form-group-v2">
                                    <label>{t('currentPassword')}</label>
                                    <div className="input-with-icon">
                                        <Lock size={16} className="field-icon" />
                                        <input
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                            placeholder={t('passwordPlaceholder')}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-v2">
                                    <label>{t('newPassword')}</label>
                                    <div className="input-with-icon">
                                        <Lock size={16} className="field-icon" />
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
                                    <div className={`message-v2 ${passwordMessage.includes('Error') ? 'error' : 'success'}`}>
                                        {passwordMessage}
                                    </div>
                                )}
                                <button type="submit" className="btn-primary-v2 w-full" disabled={loading}>
                                    {t('updatePassword')}
                                </button>
                            </form>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="profile-main">
                        {/* Profile Info Card */}
                        <div className="glass-card profile-card-v2">
                            <div className="card-header-v2">
                                <h3 className="card-title-v2">
                                    <User size={18} className="title-icon" />
                                    {t('profileTitle')}
                                </h3>
                                <button
                                    className="edit-toggle-btn"
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    {isEditing ? t('cancel') : <Edit2 size={18} />}
                                </button>
                            </div>

                            {!isEditing ? (
                                <div className="info-display-v2">
                                    <div className="display-row">
                                        <label>{t('fullNameLabel')}</label>
                                        <span>{user.name}</span>
                                    </div>
                                    <div className="display-row">
                                        <label>{t('username')}</label>
                                        <span>{user.username || 'N/A'}</span>
                                    </div>
                                    <div className="display-row">
                                        <label>{t('role')}</label>
                                        <span className="role-tag">{user.role}</span>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateProfile} className="profile-form-v2">
                                    <div className="form-group-v2">
                                        <label>{t('fullNameLabel')}</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group-v2">
                                        <label>{t('username')}</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary-v2" disabled={loading}>
                                        <Save size={16} />
                                        {t('saveChanges')}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Order History Card */}
                        <div className="glass-card profile-card-v2">
                            <h3 className="card-title-v2">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Save size={18} className="title-icon" style={{ transform: 'rotate(90deg)' }} />
                                    {t('orderHistory')}
                                </div>
                            </h3>
                            {ordersLoading ? (
                                <div className="loading-v2">{t('loading')}</div>
                            ) : orders.length === 0 ? (
                                <div className="empty-history-v2">
                                    <p>{t('noOrders')}</p>
                                </div>
                            ) : (
                                <div className="orders-list-v2">
                                    {orders.map(order => (
                                        <div key={order.id || order.orderId} className="order-row-v2">
                                            <div className="order-meta-v2">
                                                <span className="order-id">#{(order.id || order.orderId).substring(0, 8)}</span>
                                                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="order-details-v2">
                                                <div className="order-items-summary">
                                                    {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                                                </div>
                                                <div className="order-footer-v2">
                                                    <span className="order-total">₪{order.total}</span>
                                                    <span className={`status-pill ${order.status?.toLowerCase().replace('_', '-')}`}>
                                                        {order.status === 'PENDING_APPROVAL' 
                                                            ? t('orderStatusPending') 
                                                            : order.status === 'Paid' 
                                                                ? t('orderStatusPaid') 
                                                                : t('orderStatusFailed')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Profile;
