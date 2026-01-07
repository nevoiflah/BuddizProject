import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import loaderDog from '../assets/loading-dog.png'; // Reusing dog asset as logo placeholder if needed

const AdminDashboard = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [products, setProducts] = useState([
        { id: '1', name: 'Golden Retriever Ale', price: 9.99, stock: 20 },
        { id: '2', name: 'Husky IPA', price: 11.50, stock: 15 },
        { id: '3', name: 'Pug Porter', price: 8.75, stock: 5 },
    ]);

    useEffect(() => {
        // Simple protection: Redirect if not admin (mock check for now)
        // In real app, check user.groups or attributes
        if (!user || user.email !== 'nevo.iflah6@gmail.com') {
            // navigate('/'); // Uncomment for security
        }
    }, [user, navigate]);

    return (
        <div className="page-container animate-fade-in" style={{ padding: '2rem' }}>
            <h1 style={{ color: 'var(--color-primary)' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Welcome, {user?.name || 'Admin'}!</p>

            <div style={{ marginTop: '2rem', background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h3>Product Management</h3>
                <div style={{ marginTop: '1rem' }}>
                    <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        <span>Name</span>
                        <span>Price</span>
                        <span>Stock</span>
                        <span>Actions</span>
                    </div>
                    {products.map(p => (
                        <div key={p.id} className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderTop: '1px solid var(--color-border)' }}>
                            <span>{p.name}</span>
                            <span>${p.price}</span>
                            <span>{p.stock}</span>
                            <span>
                                <button className="btn-sm" style={{ marginRight: '0.5rem', background: 'var(--color-secondary)', color: 'var(--color-text-main)' }}>Edit</button>
                                <button className="btn-sm" style={{ background: '#e74c3c', color: '#fff' }}>Delete</button>
                            </span>
                        </div>
                    ))}
                </div>
                <button className="btn-primary" style={{ marginTop: '1rem' }}>+ Add New Beer</button>
            </div>

            <div style={{ marginTop: '2rem', background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h3>Recent Orders</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>No orders yet.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
