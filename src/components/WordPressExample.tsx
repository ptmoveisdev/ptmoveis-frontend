/**
 * Exemplo de uso da integração com WordPress
 * Este componente demonstra como usar os hooks e serviços do WordPress
 */

import { useProducts, useProductCategories } from '../hooks/useWordPress';
import type { WooCommerceProduct } from '../types/wordpress';

export default function WordPressExample() {
    // Buscar produtos com paginação
    const {
        data: products,
        loading: productsLoading,
        error: productsError,
        currentPage,
        totalPages,
        nextPage,
        prevPage,
    } = useProducts({ per_page: 12 });

    // Buscar categorias
    const {
        data: categories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useProductCategories({ per_page: 100 });

    if (productsLoading || categoriesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando produtos...</p>
                </div>
            </div>
        );
    }

    if (productsError || categoriesError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <h2 className="text-red-800 font-semibold mb-2">Erro ao carregar dados</h2>
                    <p className="text-red-600">{productsError || categoriesError}</p>
                    <p className="text-sm text-red-500 mt-4">
                        Verifique se o WordPress está configurado corretamente no arquivo .env
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Produtos do WordPress
                </h1>
                <p className="text-gray-600">
                    Integração com WooCommerce REST API
                </p>
            </div>

            {/* Categorias */}
            {categories.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Categorias
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-500 transition-colors"
                            >
                                {category.name}
                                <span className="ml-2 text-sm text-gray-500">
                                    ({category.count || 0})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid de Produtos */}
            {products.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Anterior
                            </button>
                            <span className="text-gray-600">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">
                        Nenhum produto encontrado
                    </p>
                </div>
            )}
        </div>
    );
}

// Componente de Card de Produto
function ProductCard({ product }: { product: WooCommerceProduct }) {
    const mainImage = product.images[0]?.src || '/placeholder-product.jpg';
    const isOnSale = product.on_sale;
    const price = parseFloat(product.price);
    const regularPrice = parseFloat(product.regular_price);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Imagem do Produto */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {isOnSale && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Promoção
                    </div>
                )}
                {product.featured && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Destaque
                    </div>
                )}
            </div>

            {/* Informações do Produto */}
            <div className="p-4">
                {/* Categorias */}
                {product.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {product.categories.map((category) => (
                            <span
                                key={category.id}
                                className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                            >
                                {category.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Nome do Produto */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                </h3>

                {/* Descrição Curta */}
                {product.short_description && (
                    <div
                        className="text-sm text-gray-600 mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: product.short_description }}
                    />
                )}

                {/* Preço */}
                <div className="flex items-center gap-2 mb-4">
                    {isOnSale ? (
                        <>
                            <span className="text-2xl font-bold text-orange-600">
                                R$ {price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                                R$ {regularPrice.toFixed(2)}
                            </span>
                        </>
                    ) : (
                        <span className="text-2xl font-bold text-gray-900">
                            R$ {price.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Status de Estoque */}
                <div className="mb-4">
                    {product.stock_status === 'instock' ? (
                        <span className="text-sm text-green-600 font-medium">
                            ✓ Em estoque
                        </span>
                    ) : product.stock_status === 'outofstock' ? (
                        <span className="text-sm text-red-600 font-medium">
                            ✗ Fora de estoque
                        </span>
                    ) : (
                        <span className="text-sm text-orange-600 font-medium">
                            ⚠ Sob encomenda
                        </span>
                    )}
                </div>

                {/* Botão de Ação */}
                <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                    Ver Detalhes
                </button>
            </div>
        </div>
    );
}
