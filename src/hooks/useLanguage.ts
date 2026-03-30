import { useState, useEffect } from 'react';
import { translations } from '../constants/translations';
import type { Language } from '../types';

export function useLanguage() {
    const [language, setLanguage] = useState<Language>(
        () => (localStorage.getItem('buddiz_language') as Language) || 'en'
    );

    useEffect(() => {
        localStorage.setItem('buddiz_language', language);
        document.dir = language === 'he' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: string): string =>
        (translations as Record<Language, Record<string, string>>)[language][key] || key;

    return { language, setLanguage, t };
}
