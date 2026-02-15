import { useState, useEffect } from 'react';
import { useProductCategories, useProducts } from '@/hooks/useWordPress';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/data/products';
import type { WooCommerceProduct } from '@/types/wordpress';
import { Filter, X, ChevronLeft } from 'lucide-react';

interface AllProductsPageProps {
    onBack: () => void;
    onProductClick: (product: Product) => void;
    initialSearchQuery?: string;
}

// Function to convert WordPress product to local format
function convertWPProductToLocal(wpProduct: WooCommerceProduct): Product {
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


export function AllProductsPage({ onBack, onProductClick, initialCategoryId, initialSearchQuery = '' }: AllProductsPageProps & { initialCategoryId?: number | null }) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialCategoryId || null);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    useEffect(() => {
        if (initialCategoryId !== undefined) {
            setSelectedCategoryId(initialCategoryId);
        }
    }, [initialCategoryId]);

    useEffect(() => {
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    // Fetch Categories
    const {
        data: categories,
        loading: categoriesLoading
    } = useProductCategories({
        per_page: 20,
        hide_empty: true
    });

    // Fetch Products
    const {
        data: wpProducts,
        loading: productsLoading,
        error: productsError
    } = useProducts({
        per_page: 50, // Fetch a good amount
        category: selectedCategoryId ? selectedCategoryId.toString() : undefined,
        search: searchQuery || undefined,
        orderby: 'date', // Or 'title'
        order: 'desc'
    });

    const localProducts = wpProducts.map(convertWPProductToLocal);

    const selectedCategoryName = searchQuery
        ? `Resultados para "${searchQuery}"`
        : selectedCategoryId
            ? categories.find(c => c.id === selectedCategoryId)?.name
            : 'Todos os Produtos';

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12"> {/* Added pt-20 to account for fixed header if needed, but App.tsx handles header separately. Check if header is sticky over this. App.tsx header is sticky. */}

            {/* Header of the section */}
            <div className="bg-white shadow-sm mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <button
                                onClick={onBack}
                                className="flex items-center text-gray-500 hover:text-[#D4AF37] transition-colors mb-2"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Voltar à Página Inicial
                            </button>
                            <h1 className="text-3xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                                {selectedCategoryName}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {productsLoading ? 'Carregando produtos...' : `${localProducts.length} produtos encontrados`}
                            </p>
                        </div>

                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setIsMobileFiltersOpen(true)}
                            className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4" />
                            Filtrar por Categoria
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar (Desktop) */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h3 className="font-semibold text-lg text-[#1E3A5F] mb-4">Categorias</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setSelectedCategoryId(null);
                                        // setSearchQuery(''); // Optional: clear search when clicking "All Categories"? Maybe not if refining search.
                                        // For now, let's keep search if it exists, or just clear it? Usually clicking a category clears search.
                                        // Let's clear search to allow browsing.
                                        // actually we need a way to clear search in this component or just accept that selecting a category overrides search?
                                        // The useProducts hook uses both. If both are present, it tries to find products in that category matching that search.
                                        // But users might want to clear search.
                                        // Let's make "Todas as Categorias" clear everything just to be safe/simple navigation.
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${selectedCategoryId === null && !searchQuery
                                        ? 'bg-[#1E3A5F] text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    Todas as Categorias
                                </button>

                                {categoriesLoading ? (
                                    <div className="space-y-2">
                                        <div className="h-8 bg-gray-100 rounded animate-pulse" />
                                        <div className="h-8 bg-gray-100 rounded animate-pulse" />
                                        <div className="h-8 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                ) : (
                                    categories.map(category => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategoryId(category.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm flex justify-between items-center ${selectedCategoryId === category.id
                                                ? 'bg-[#1E3A5F] text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span>{category.name}</span>
                                            <span className={`text-xs ${selectedCategoryId === category.id ? 'text-white/70' : 'text-gray-400'}`}>
                                                ({category.count})
                                            </span>
                                        </button>
                                    ))
                                )}

                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="w-full text-left px-3 py-2 rounded-lg transition-colors text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 mt-4"
                                    >
                                        <X className="w-4 h-4" />
                                        Limpar Busca
                                    </button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {productsLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                                        <div className="aspect-[4/5] bg-gray-200" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : productsError ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                                <p className="text-red-600 mb-2">Erro ao carregar produtos</p>
                                <p className="text-sm text-gray-500">{productsError}</p>
                            </div>
                        ) : localProducts.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <p className="text-gray-500 text-lg">Nenhum produto encontrado nesta categoria.</p>
                                <button
                                    onClick={() => setSelectedCategoryId(null)}
                                    className="mt-4 text-[#D4AF37] hover:underline"
                                >
                                    Ver todos os produtos
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                                {localProducts.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        index={index}
                                        onViewDetails={onProductClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)} />
                    <div className="relative w-4/5 max-w-xs bg-white h-full shadow-xl flex flex-col p-6 overflow-y-auto animate-slide-in-right">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-[#1E3A5F]">Filtrar por</h3>
                            <button onClick={() => setIsMobileFiltersOpen(false)}>
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    setSelectedCategoryId(null);
                                    setIsMobileFiltersOpen(false);
                                }}
                                className={`w-full text-left px-3 py-3 rounded-lg transition-colors text-sm ${selectedCategoryId === null
                                    ? 'bg-[#1E3A5F] text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Todas as Categorias
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setSelectedCategoryId(category.id);
                                        setIsMobileFiltersOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors text-sm flex justify-between items-center ${selectedCategoryId === category.id
                                        ? 'bg-[#1E3A5F] text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <span>{category.name}</span>
                                    <span className={`text-xs ${selectedCategoryId === category.id ? 'text-white/70' : 'text-gray-400'}`}>
                                        ({category.count})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
