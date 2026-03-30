import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { getUserProfile } from '../services/userService';
import { getFavorites, addFavorite, removeFavorite } from '../services/favoritesService';
import type { AppContextValue, User, Product } from '../types';

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const { cart, addToCart, removeFromCart, clearCart } = useCart();
    const { language, setLanguage, t } = useLanguage();
    const { toasts, showToast } = useToast();

    const [favorites, setFavorites] = useState<Product[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.removeItem('buddiz_favorites');
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const currentUser = await getCurrentUser();
            const attributes = await fetchUserAttributes();

            const [profileResult, favsResult] = await Promise.allSettled([
                getUserProfile(),
                getFavorites(),
            ]);

            if (profileResult.status === 'rejected') {
                console.error("Error fetching user profile:", profileResult.reason);
            }
            if (favsResult.status === 'rejected') {
                console.error("Error fetching favorites:", favsResult.reason);
            }

            const dbUser = profileResult.status === 'fulfilled' ? (profileResult.value ?? {}) : {};
            if (favsResult.status === 'fulfilled') {
                setFavorites(favsResult.value);
            }

            setUser({
                name: attributes.name || (dbUser as User).name || currentUser.username,
                email: attributes.email!,
                username: currentUser.username,
                ...(dbUser as User),
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            if (!message.includes('authenticated')) {
                console.error("Error in checkUser:", err);
            }
            setUser(null);
        }
        setLoading(false);
    }

    const toggleFavorite = async (product: Product) => {
        const isFav = favorites.find(f => f.id === product.id);
        if (isFav) {
            setFavorites(prev => prev.filter(item => item.id !== product.id));
            removeFavorite(product.id).catch(err =>
                console.error("Error removing favorite:", err)
            );
        } else {
            setFavorites(prev => [...prev, product]);
            addFavorite(product).catch(err =>
                console.error("Error adding favorite:", err)
            );
        }
    };

    const removeFromFavorites = (productId: string) => {
        const product = favorites.find(f => f.id === productId);
        if (product) toggleFavorite(product);
    };

    return (
        <AppContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            favorites,
            toggleFavorite,
            removeFromFavorites,
            user,
            setUser,
            loading,
            language,
            setLanguage,
            t,
            toasts,
            showToast,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextValue => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
};
