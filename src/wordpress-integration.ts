/**
 * WordPress Integration - Index
 * Exportações centralizadas para facilitar imports
 */

// ============================================
// TIPOS
// ============================================
export type {
    WPMedia,
    WPCategory,
    WPTag,
    WPPost,
    WooCommerceImage,
    WooCommerceCategory,
    WooCommerceTag,
    WooCommerceAttribute,
    WooCommerceProduct,
    ProductQueryParams,
    CategoryQueryParams,
    WPPaginatedResponse,
    WPError,
} from './types/wordpress';

// ============================================
// SERVIÇOS
// ============================================
export {
    WordPressAPIError,
    getPosts,
    getPostBySlug,
    getPostById,
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    getTags,
    getMediaById,
    getProducts,
    getProductById,
    getProductBySlug,
    getFeaturedProducts,
    getOnSaleProducts,
    getProductsByCategory,
    getProductCategories,
    getProductCategoryById,
    getProductCategoryBySlug,
    checkWordPressConnection,
    isWooCommerceConfigured,
    getAPIConfig,
} from './services/wordpress';

// ============================================
// HOOKS
// ============================================
export {
    usePosts,
    usePostBySlug,
    usePostById,
    useCategories,
    useCategoryBySlug,
    useProducts,
    useProductBySlug,
    useFeaturedProducts,
    useOnSaleProducts,
    useProductsByCategory,
    useProductCategories,
    useProductCategoryBySlug,
} from './hooks/useWordPress';

// ============================================
// UTILITÁRIOS
// ============================================
export {
    formatPrice,
    calculateDiscount,
    stripHtml,
    truncateText,
    formatDate,
    formatRelativeDate,
    getProductMainImage,
    getProductImages,
    isInStock,
    isOnSale,
    getStockStatus,
    getProductCategoriesText,
    getProductTagsText,
    filterProductsByCategory,
    filterProductsByPrice,
    sortProductsByPrice,
    sortProductsByDate,
    searchProducts,
    getPostFeaturedImage,
    getPostCategories,
    getPostExcerpt,
    generateSlug,
    buildQueryString,
    groupProductsByCategory,
    calculateProductStats,
    isValidImageUrl,
    getImagePlaceholder,
    formatProductAttributes,
    isNewProduct,
    getProductBadge,
    formatProductDimensions,
    formatProductWeight,
} from './utils/wordpress';

// ============================================
// COMPONENTES
// ============================================
export { default as WordPressExample } from './components/WordPressExample';
export { default as WordPressTest } from './components/WordPressTest';
