export interface User {
    id?: string;
    name: string;
    email: string;
    username: string;
    role?: 'USER' | 'ADMIN';
    createdAt?: string;
}

export interface Product {
    id: string;
    name: string;
    name_he?: string;
    price: number;
    category: string;
    description?: string;
    description_he?: string;
    stock: number;
    abv?: number;
    style?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    total: string;
    status: 'PENDING_APPROVAL' | 'Paid' | 'Denied';
    createdAt: string;
    paypalOrderId: string;
    authorizationId: string;
    currency: string;
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

export type Language = 'en' | 'he';

export interface AppContextValue {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    favorites: Product[];
    toggleFavorite: (product: Product) => Promise<void>;
    removeFromFavorites: (productId: string) => void;
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    toasts: Toast[];
    showToast: (message: string, type?: 'success' | 'error') => void;
}
