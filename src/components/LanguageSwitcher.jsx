import React from 'react';
import { useApp } from '../context/AppContext';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useApp();

    return (
        <div className="language-switcher" style={{ display: 'flex', gap: '8px' }}>
            <button
                type="button"
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
                style={{
                    opacity: language === 'en' ? 1 : 0.5,
                    fontWeight: language === 'en' ? 'bold' : 'normal',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'none',
                    border: '1px solid currentColor',
                    cursor: 'pointer'
                }}
            >
                EN
            </button>
            <button
                type="button"
                className={`lang-btn ${language === 'he' ? 'active' : ''}`}
                onClick={() => setLanguage('he')}
                style={{
                    opacity: language === 'he' ? 1 : 0.5,
                    fontWeight: language === 'he' ? 'bold' : 'normal',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'none',
                    border: '1px solid currentColor',
                    cursor: 'pointer'
                }}
            >
                HE
            </button>
        </div>
    );
};

export default LanguageSwitcher;
