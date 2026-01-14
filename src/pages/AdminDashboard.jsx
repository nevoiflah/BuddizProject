import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from 'aws-amplify/auth';
import { Users, Package, ShoppingBag, Activity, Trash2, Shield, ShieldOff } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, t } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            // navigate('/'); 
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { credentials } = await fetchAuthSession();
            const client = new DynamoDBClient({ region: "eu-north-1", credentials });
            const docClient = DynamoDBDocumentClient.from(client);

            // Fetch Users
            const userScan = await docClient.send(new ScanCommand({ TableName: "BUDDIZ-Users" }));
            setUsers(userScan.Items || []);

            // Fetch Products
            const productScan = await docClient.send(new ScanCommand({ TableName: "BUDDIZ-Beers" }));
            setProducts(productScan.Items || []);

            // Fetch Orders
            try {
                const orderScan = await docClient.send(new ScanCommand({ TableName: "BUDDIZ-Orders" }));
                setOrders(orderScan.Items || []);
            } catch (e) {
                console.log("Orders table missing", e);
            }

        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
        setLoading(false);
    };

    const handleDeleteUser = async (userToDelete) => {
        if (!window.confirm(`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`)) return;

        try {
            // Call the Admin Delete Lambda
            const response = await fetch('https://nmmrf3d34rrguhcxcbqcxdtd640ouger.lambda-url.eu-north-1.on.aws/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userToDelete.email,
                    userId: userToDelete.id
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to delete user');
            }

            setUsers(users.filter(u => u.id !== userToDelete.id));
            alert("User deleted successfully from System (Auth & Data).");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert(`Failed to delete user: ${error.message}`);
        }
    };

    const handleToggleRole = async (userData) => {
        const newRole = userData.role === 'ADMIN' ? 'USER' : 'ADMIN';
        if (!window.confirm(`Promote ${userData.name} to ${newRole}?`)) return;

        try {
            const { credentials } = await fetchAuthSession();
            const client = new DynamoDBClient({ region: "eu-north-1", credentials });
            const docClient = DynamoDBDocumentClient.from(client);

            await docClient.send(new UpdateCommand({
                TableName: "BUDDIZ-Users",
                Key: { id: userData.id },
                UpdateExpression: "set #r = :role",
                ExpressionAttributeNames: { "#r": "role" },
                ExpressionAttributeValues: { ":role": newRole }
            }));

            setUsers(users.map(u => u.id === userData.id ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role.");
        }
    };

    const handleApproveOrder = async (order) => {
        if (!window.confirm(`Approve order ${order.id}? Payment will be captured.`)) return;
        setLoading(true);
        try {
            const LAMBDA_URL = "https://kxyras2cml.execute-api.eu-north-1.amazonaws.com/";
            const response = await fetch(LAMBDA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "approveOrder",
                    orderID: order.id,
                    userId: order.userId, // Added userId for Composite Key
                    paypalOrderId: order.paypalOrderId,
                    authorizationId: order.authorizationId
                })
            });
            const result = await response.json();
            if (result.status === "success") {
                alert("Order Approved!");
                fetchData(); // Refresh data
            } else {
                alert("Approval failed: " + JSON.stringify(result));
            }
        } catch (err) {
            console.error("Approve Error:", err);
            alert("Error approving order.");
        }
        setLoading(false);
    };

    const handleDenyOrder = async (order) => {
        if (!window.confirm(`Deny order ${order.id}? Payment will be voided.`)) return;
        setLoading(true);
        try {
            const LAMBDA_URL = "https://kxyras2cml.execute-api.eu-north-1.amazonaws.com/";
            const response = await fetch(LAMBDA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "denyOrder",
                    orderID: order.id,
                    userId: order.userId, // Added userId for Composite Key
                    authorizationId: order.authorizationId
                })
            });
            const result = await response.json();
            if (result.status === "success") {
                alert("Order Denied.");
                fetchData(); // Refresh data
            } else {
                alert("Denial failed: " + JSON.stringify(result));
            }
        } catch (err) {
            console.error("Deny Error:", err);
            alert("Error denying order.");
        }
        setLoading(false);
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            className={`admin-tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
        >
            <Icon size={20} />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="admin-page container animate-fade-in">
            <header className="admin-header">
                <div>
                    <h1>{t('adminDashboard')}</h1>
                    <p>{t('adminOverview')}</p>
                </div>
                <div className="admin-tabs">
                    <TabButton id="users" icon={Users} label={t('tabUsers')} />
                    <TabButton id="stock" icon={Package} label={t('tabStock')} />
                    <TabButton id="orders" icon={ShoppingBag} label={t('tabOrders')} />
                </div>
            </header>

            <div className="admin-content">
                {loading ? (
                    <div className="loading-state">{t('loadingData')}</div>
                ) : (
                    <>
                        {activeTab === 'users' && (
                            <div className="data-card">
                                <h3>{t('registeredUsers')} ({users.length})</h3>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>{t('colName')}</th>
                                                <th>{t('colEmail')}</th>
                                                <th>{t('colRole')}</th>
                                                <th>{t('colJoined')}</th>
                                                <th>{t('colActions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <div className="avatar-circle">{u.name?.charAt(0) || 'U'}</div>
                                                            {u.name || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td>{u.email}</td>
                                                    <td>
                                                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                                                            {u.role === 'ADMIN' ? t('adminBadge') : t('userBadge')}
                                                        </span>
                                                    </td>
                                                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                className="btn-icon"
                                                                title={u.role === 'ADMIN' ? "Demote to User" : "Promote to Admin"}
                                                                onClick={() => handleToggleRole(u)}
                                                                style={{ color: 'var(--color-primary)' }}
                                                            >
                                                                {u.role === 'ADMIN' ? <ShieldOff size={18} /> : <Shield size={18} />}
                                                            </button>
                                                            <button
                                                                className="btn-icon"
                                                                title="Delete User"
                                                                onClick={() => handleDeleteUser(u)}
                                                                style={{ color: '#e74c3c' }}
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stock' && (
                            <div className="data-card">
                                <h3>{t('productInventory')} ({products.length})</h3>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>{t('colProduct')}</th>
                                                <th>{t('colCategory')}</th>
                                                <th>{t('colPrice')}</th>
                                                <th>{t('colStock')}</th>
                                                <th>{t('colStatus')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.name}</td>
                                                    <td>{p.category}</td>
                                                    <td>₪{p.price}</td>
                                                    <td>{p.stock}</td>
                                                    <td>
                                                        <span className={`status-dot ${p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'danger'}`}></span>
                                                        {p.stock > 10 ? t('inStock') : p.stock > 0 ? t('lowStock') : t('outOfStock')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="data-card">
                                <h3>{t('recentOrders')} ({orders.length})</h3>
                                {orders.length === 0 ? (
                                    <div className="empty-state">{t('noOrdersFound')}</div>
                                ) : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>{t('colOrderId')}</th>
                                                <th>{t('colCustomer')}</th>
                                                <th>{t('colTotal')}</th>
                                                <th>{t('colStatus')}</th>
                                                <th>{t('colActions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(o => (
                                                <tr key={o.id || o.orderId}>
                                                    <td>
                                                        {(o.id || o.orderId || 'N/A').toString().substring(0, 8)}...
                                                        {o.status === 'PENDING_APPROVAL' && <span className="warning-dot" title="Pending Approval"></span>}
                                                    </td>
                                                    <td>{o.userId}</td>
                                                    <td>₪{o.total}</td>
                                                    <td>
                                                        <span className={`badge ${o.status === 'Paid' ? 'badge-success' :
                                                            o.status === 'PENDING_APPROVAL' ? 'badge-warning' :
                                                                'badge-danger'
                                                            }`}>
                                                            {o.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {o.status === 'PENDING_APPROVAL' && (
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    className="btn-icon"
                                                                    title="Approve Order"
                                                                    onClick={() => handleApproveOrder(o)}
                                                                    style={{ color: 'green' }}
                                                                >
                                                                    <Shield size={18} />
                                                                </button>
                                                                <button
                                                                    className="btn-icon"
                                                                    title="Deny Order"
                                                                    onClick={() => handleDenyOrder(o)}
                                                                    style={{ color: 'red' }}
                                                                >
                                                                    <ShieldOff size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
