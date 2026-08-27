/**
 * Componente de Produtos em Destaque do WordPress
 * Substitui os produtos locais por produtos do WooCommerce
 */

import { useMemo } from 'react';
import { useProducts } from '@/hooks/useWordPress';
import { ProductCard } from '@/components/ProductCard';
import { convertWPProductToLocal } from '@/utils/productUtils';
import type { Product } from '@/data/products';

interface WordPressFeaturedProductsProps {
    onProductClick: (product: Product) => void;
}

export function WordPressFeaturedProducts({ onProductClick }: WordPressFeaturedProductsProps) {
    // Busca 50 produtos para ter uma amostra maior para aleatoriedade
    const { data: allProducts, loading, error, refetch } = useProducts({ per_page: 50 });

    // Seleciona 10 produtos aleatórios do conjunto retornado
    const wpProducts = useMemo(() => {
        if (!allProducts || allProducts.length === 0) return [];
        // Cria uma cópia e embaralha
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        // Retorna os 10 primeiros
        return shuffled.slice(0, 10);
    }, [allProducts]);


    // Loading state
    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Montserrat' }}>
                            Destaques
                        </h2>
                        <div className="w-16 h-1 bg-[#D4AF37] mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Montserrat' }}>
                            Destaques
                        </h2>
                        <div className="w-16 h-1 bg-[#D4AF37] mx-auto" />
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar produtos</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={refetch}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // Empty state
    if (wpProducts.length === 0) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Montserrat' }}>
                            Destaques
                        </h2>
                        <div className="w-16 h-1 bg-[#D4AF37] mx-auto" />
                    </div>
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">
                            Nenhum produto em destaque no momento
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // Convert WordPress products to local format
    const localProducts = wpProducts.map(convertWPProductToLocal);

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Montserrat' }}>
                        Destaques
                    </h2>
                    <div className="w-16 h-1 bg-[#D4AF37] mx-auto" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
                    {localProducts.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            onViewDetails={onProductClick}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
