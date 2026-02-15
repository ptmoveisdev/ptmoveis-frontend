import { useState, useEffect } from 'react';
import type { WooCommerceVariation } from '@/types/wordpress';

const API_URL = import.meta.env.VITE_WOOCOMMERCE_API_URL?.replace(/\/$/, '') || '';
const CONSUMER_KEY = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY || '';
const CONSUMER_SECRET = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET || '';

interface UseProductVariationsResult {
    variations: WooCommerceVariation[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useProductVariations(productId: number | null): UseProductVariationsResult {
    const [variations, setVariations] = useState<WooCommerceVariation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVariations = async () => {
        if (!productId) {
            setVariations([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
            const url = `${API_URL}/products/${productId}/variations?per_page=100`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar variações: ${response.status} ${response.statusText}`);
            }

            const data: WooCommerceVariation[] = await response.json();
            setVariations(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            console.error('Erro ao buscar variações:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariations();
    }, [productId]);

    return {
        variations,
        loading,
        error,
        refetch: fetchVariations,
    };
}
