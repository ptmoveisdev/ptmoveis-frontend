import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '@/data/products';

interface FavoritesContextType {
    favorites: Product[];
    toggleFavorite: (product: Product) => void;
    isFavorite: (productId: string) => boolean;
    clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<Product[]>([]);

    useEffect(() => {
        const storedFavorites = localStorage.getItem('ptmoveis_favorites');
        if (storedFavorites) {
            try {
                setFavorites(JSON.parse(storedFavorites));
            } catch (error) {
                console.error('Failed to parse favorites from localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ptmoveis_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (product: Product) => {
        setFavorites(prev => {
            const exists = prev.some(p => p.id === product.id);
            if (exists) {
                return prev.filter(p => p.id !== product.id);
            } else {
                return [...prev, product];
            }
        });
    };

    const isFavorite = (productId: string) => {
        return favorites.some(p => p.id === productId);
    };

    const clearFavorites = () => {
        setFavorites([]);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
