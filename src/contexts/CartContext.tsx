import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
    id: string; // Pode ser "ID_PRODUTO" ou "ID_PRODUTO-ID_VARIACAO"
    productId: string; // ID original do produto
    name: string;
    slug?: string; // WooCommerce product slug (used as SKU in Scalapay)
    price: number; // preço unitário (base + extras por unidade)
    oldPrice?: number;
    image: string;
    quantity: number;
    badge?: string;
    badgeColor?: string;
    selectedAttributes?: string; // Ex: "Cor: Azul, Tecido: T1"
    variationId?: number;
    customOptions?: { name: string; value: string; price: number; multiply_qty?: boolean; mode?: 'add' | 'replace' }[];
    /** Extras de preço fixo (não multiplicados pela quantidade) */
    flatExtras?: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem('@ptmoveis:cart');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('@ptmoveis:cart', JSON.stringify(items));
    }, [items]);

    const addToCart = useCallback((product: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
        setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item =>
                item.productId === product.productId &&
                item.variationId === product.variationId &&
                item.selectedAttributes === product.selectedAttributes &&
                JSON.stringify(item.customOptions || []) === JSON.stringify(product.customOptions || [])
            );

            const qtyToAdd = product.quantity || 1;

            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += qtyToAdd;
                return newItems;
            }

            const { quantity, ...productWithoutQuantity } = product as any;
            return [...prevItems, { ...productWithoutQuantity, quantity: qtyToAdd }];
        });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity <= 0) {
            setItems(prevItems => prevItems.filter(item => item.id !== id));
            return;
        }
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    // price já inclui os extras por unidade; flatExtras é cobrado uma vez por item de carrinho
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity + (item.flatExtras ?? 0), 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
