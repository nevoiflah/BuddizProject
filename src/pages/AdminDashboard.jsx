import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from 'aws-amplify/auth';
import { Users, Package, ShoppingBag, Activity, Trash2, Shield, ShieldOff } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useApp();
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

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            const { credentials } = await fetchAuthSession();
            const client = new DynamoDBClient({ region: "eu-north-1", credentials });
            const docClient = DynamoDBDocumentClient.from(client);

            await docClient.send(new DeleteCommand({
                TableName: "BUDDIZ-Users",
                Key: { id: userId }
            }));

            setUsers(users.filter(u => u.id !== userId));
            alert("User deleted successfully.");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
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
                    <h1>Admin Dashboard</h1>
                    <p>Overview of system activity</p>
                </div>
                <div className="admin-tabs">
                    <TabButton id="users" icon={Users} label="Users" />
                    <TabButton id="stock" icon={Package} label="Stock" />
                    <TabButton id="orders" icon={ShoppingBag} label="Orders" />
                </div>
            </header>

            <div className="admin-content">
                {loading ? (
                    <div className="loading-state">Loading data...</div>
                ) : (
                    <>
                        {activeTab === 'users' && (
                            <div className="data-card">
                                <h3>Registered Users ({users.length})</h3>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Joined</th>
                                                <th>Actions</th>
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
                                                            {u.role || 'USER'}
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
                                                                onClick={() => handleDeleteUser(u.id)}
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
                                <h3>Product Inventory ({products.length})</h3>
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Price</th>
                                                <th>Stock Level</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.name}</td>
                                                    <td>{p.category}</td>
                                                    <td>${p.price}</td>
                                                    <td>{p.stock}</td>
                                                    <td>
                                                        <span className={`status-dot ${p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'danger'}`}></span>
                                                        {p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'}
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
                                <h3>Recent Orders ({orders.length})</h3>
                                {orders.length === 0 ? (
                                    <div className="empty-state">No orders found.</div>
                                ) : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Total</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(o => (
                                                <tr key={o.orderId}>
                                                    <td>{o.orderId.substring(0, 8)}...</td>
                                                    <td>{o.userId}</td>
                                                    <td>${o.total}</td>
                                                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
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
