import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
    id: string; // Pode ser "ID_PRODUTO" ou "ID_PRODUTO-ID_VARIACAO"
    productId: string; // ID original do produto
    name: string;
    price: number;
    oldPrice?: number;
    image: string;
    quantity: number;
    badge?: string;
    badgeColor?: string;
    selectedAttributes?: string; // Ex: "Cor: Azul, Tecido: T1"
    variationId?: number;
    customOptions?: { name: string; value: string; price: number }[];
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

    const addToCart = (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
        setItems(prevItems => {
            // Criar um ID único para o item no carrinho
            // Se tiver variação, o ID será "PRODUTO-VARIACAO", se não, apenas "PRODUTO"
            // Mas para garantir compatibilidade, vamos usar a lógica de comparação

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

            // Remove a propriedade quantity do produto antes de espalhar se ele existir
            const { quantity, ...productWithoutQuantity } = product as any;
            return [...prevItems, { ...productWithoutQuantity, quantity: qtyToAdd }];
        });
    };

    const removeFromCart = (id: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
