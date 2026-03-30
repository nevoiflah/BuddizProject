import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useMeta } from '../hooks/useMeta';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getAllProducts, getAllOrders, updateUserRole, deleteUser, approveOrder, denyOrder } from '../services/adminService';
import { Users, Package, ShoppingBag, Trash2, Shield, ShieldOff } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, t, showToast } = useApp();
    useMeta({ title: 'Admin Dashboard | Buddiz Beer', description: 'Manage users, inventory and orders on the Buddiz admin panel.' });
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState(null);

    const confirm = (message, onConfirm) => setPending({ message, onConfirm });

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            // navigate('/'); 
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedUsers, fetchedProducts, fetchedOrders] = await Promise.allSettled([
                getAllUsers(),
                getAllProducts(),
                getAllOrders(),
            ]);

            if (fetchedUsers.status === 'fulfilled') setUsers(fetchedUsers.value);
            if (fetchedProducts.status === 'fulfilled') setProducts(fetchedProducts.value);
            if (fetchedOrders.status === 'fulfilled') setOrders(fetchedOrders.value);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
        setLoading(false);
    };

    const handleDeleteUser = (userToDelete) => {
        confirm(`Delete ${userToDelete.name}? This cannot be undone.`, async () => {
            try {
                await deleteUser(userToDelete.email, userToDelete.id);
                setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
                showToast("User deleted successfully.", 'success');
            } catch (error) {
                console.error("Error deleting user:", error);
                showToast(`Failed to delete user: ${error.message}`, 'error');
            }
        });
    };

    const handleToggleRole = (userData) => {
        const newRole = userData.role === 'ADMIN' ? 'USER' : 'ADMIN';
        confirm(`Change ${userData.name}'s role to ${newRole}?`, async () => {
            try {
                await updateUserRole(userData.id, newRole);
                setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, role: newRole } : u));
                showToast(`Role updated to ${newRole}.`, 'success');
            } catch (error) {
                console.error("Error updating role:", error);
                showToast("Failed to update role.", 'error');
            }
        });
    };

    const handleApproveOrder = (order) => {
        confirm(`Approve order ${order.id?.toString().substring(0, 8)}…? Payment will be captured.`, async () => {
            setLoading(true);
            try {
                const result = await approveOrder(order);
                if (result.status === "success") {
                    showToast("Order approved!", 'success');
                    fetchData();
                } else {
                    showToast("Approval failed.", 'error');
                }
            } catch (err) {
                console.error("Approve Error:", err);
                showToast("Error approving order.", 'error');
            }
            setLoading(false);
        });
    };

    const handleDenyOrder = (order) => {
        confirm(`Deny order ${order.id?.toString().substring(0, 8)}…? Payment will be voided.`, async () => {
            setLoading(true);
            try {
                const result = await denyOrder(order);
                if (result.status === "success") {
                    showToast("Order denied.", 'success');
                    fetchData();
                } else {
                    showToast("Denial failed.", 'error');
                }
            } catch (err) {
                console.error("Deny Error:", err);
                showToast("Error denying order.", 'error');
            }
            setLoading(false);
        });
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

            {pending && (
                <div className="confirm-bar">
                    <span>{pending.message}</span>
                    <div className="confirm-bar-actions">
                        <button className="btn-confirm" onClick={() => { pending.onConfirm(); setPending(null); }}>Confirm</button>
                        <button className="btn-cancel" onClick={() => setPending(null)}>Cancel</button>
                    </div>
                </div>
            )}

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
