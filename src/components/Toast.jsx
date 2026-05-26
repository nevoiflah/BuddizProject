import React from 'react';
import './Toast.css';

const Toast = ({ toasts }) => {
    if (!toasts.length) return null;
    return (
        <div className="toast-container" role="status" aria-live="polite" aria-atomic="false">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    {t.message}
                </div>
            ))}
        </div>
    );
};

export default Toast;
