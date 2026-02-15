/**
 * Componente de Todos os Produtos do WordPress
 * Lista produtos do WooCommerce com paginação
 */

import { useEffect } from 'react';
import { useProducts } from '@/hooks/useWordPress';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/data/products';
import type { WooCommerceProduct } from '@/types/wordpress';

interface WordPressProductsProps {
    onProductClick: (product: Product) => void;
    title?: string;
    perPage?: number;
    category?: string;
}

// Função para converter produto WordPress para formato local
function convertWPProductToLocal(wpProduct: WooCommerceProduct): Product {
    // Remove HTML tags from description
    const stripHtml = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    return {
        id: wpProduct.id.toString(),
        name: wpProduct.name,
        slug: wpProduct.slug,
        price: parseFloat(wpProduct.price),
        oldPrice: wpProduct.on_sale ? parseFloat(wpProduct.regular_price) : undefined,
        image: wpProduct.images[0]?.src || '/placeholder-product.jpg',
        images: wpProduct.images.map(img => img.src),
        badge: wpProduct.on_sale ? 'PROMO' : (wpProduct.featured ? 'DESTAQUE' : undefined),
        badgeColor: wpProduct.on_sale ? 'bg-red-500' : (wpProduct.featured ? 'bg-[#D4AF37]' : undefined),
        category: wpProduct.categories[0]?.name || 'Sem categoria',
        description: stripHtml(wpProduct.description),
        features: wpProduct.attributes.map(attr => `${attr.name}: ${attr.options.join(', ')}`),
        specifications: [
            { label: 'SKU', value: wpProduct.sku || 'N/A' },
            ...(wpProduct.dimensions.length && wpProduct.dimensions.width && wpProduct.dimensions.height
                ? [{ label: 'Dimensões', value: `${wpProduct.dimensions.length} × ${wpProduct.dimensions.width} × ${wpProduct.dimensions.height} cm` }]
                : []),
            ...(wpProduct.weight ? [{ label: 'Peso', value: `${wpProduct.weight} kg` }] : []),
            ...wpProduct.attributes.map(attr => ({
                label: attr.name,
                value: attr.options.join(', ')
            }))
        ],
        inStock: wpProduct.stock_status === 'instock',
        rating: parseFloat(wpProduct.average_rating) || 4.5,
        reviewCount: wpProduct.rating_count || 0,
        // Campos de variações
        hasVariations: wpProduct.type === 'variable',
        variationIds: wpProduct.variations || [],
        productType: wpProduct.type,
    };
}


export function WordPressProducts({
    onProductClick,
    title = 'Produtos',
    perPage = 10,
    category
}: WordPressProductsProps) {
    const { data: wpProducts, loading, error, refetch } = useProducts({
        per_page: perPage,
        category: category || undefined,
        orderby: 'date',
        order: 'desc'
    });

    // Log para debug
    useEffect(() => {
        if (wpProducts.length > 0) {
            console.log(`✅ ${title} carregados:`, wpProducts.length);
        }
    }, [wpProducts, title]);

    // Loading state
    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Montserrat' }}>
                            {title}
                        </h2>
                        <div className="w-16 h-1 bg-[#D4AF37] mx-auto" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
                        {[...Array(perPage)].map((_, i) => (
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
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Montserrat' }}>
                            {title}
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
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Montserrat' }}>
                            {title}
                        </h2>
                        <div className="w-16 h-1 bg-[#D4AF37] mx-auto" />
                    </div>
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">
                            Nenhum produto disponível no momento
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // Convert WordPress products to local format
    const localProducts = wpProducts.map(convertWPProductToLocal);

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Montserrat' }}>
                        {title}
                    </h2>
                    <div className="w-16 h-1 bg-[#D4AF37] mx-auto" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
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
