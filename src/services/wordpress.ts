/**
 * WordPress REST API Service - VERSÃO CORRIGIDA
 * Serviço para comunicação com WordPress como headless CMS
 * 
 * CORREÇÃO: Usa Basic Auth para WooCommerce em ambiente local
 */

import type {
    WPPost,
    WPCategory,
    WPTag,
    WPMedia,
    WooCommerceProduct,
    WooCommerceCategory,
    ProductQueryParams,
    CategoryQueryParams,
    WPPaginatedResponse,
    WPError,
    WooCommerceOrderPayload,
    WooCommerceOrderResponse,
} from '../types/wordpress';

// Configuração da API
const WORDPRESS_API_URL = import.meta.env.VITE_WORDPRESS_API_URL || 'http://localhost/wordpress/wp-json/wp/v2';
const WORDPRESS_BASE_URL = import.meta.env.VITE_WORDPRESS_BASE_URL || 'http://localhost/wordpress';
const WOOCOMMERCE_API_URL = import.meta.env.VITE_WOOCOMMERCE_API_URL || 'http://localhost/wordpress/wp-json/wc/v3';
const WOOCOMMERCE_CONSUMER_KEY = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY || '';
const WOOCOMMERCE_CONSUMER_SECRET = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET || '';

/**
 * Classe de erro customizada para WordPress API
 */
export class WordPressAPIError extends Error {
    public code: string;
    public status: number;

    constructor(
        message: string,
        code: string,
        status: number
    ) {
        super(message);
        this.name = 'WordPressAPIError';
        this.code = code;
        this.status = status;
    }
}

/**
 * Função auxiliar para fazer requisições à API do WordPress
 */
async function fetchWordPress<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        const url = `${WORDPRESS_API_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error: WPError = await response.json();
            throw new WordPressAPIError(
                error.message || 'Erro ao buscar dados do WordPress',
                error.code || 'unknown_error',
                error.data?.status || response.status
            );
        }

        const data = await response.json();
        return data as T;
    } catch (error) {
        if (error instanceof WordPressAPIError) {
            throw error;
        }
        throw new WordPressAPIError(
            'Erro de conexão com o WordPress',
            'connection_error',
            0
        );
    }
}

/**
 * Função auxiliar para fazer requisições à API do WooCommerce
 * CORRIGIDA: Usa Basic Auth em vez de query parameters
 */
async function fetchWooCommerce<T>(
    endpoint: string,
    params: Record<string, any> = {},
    options: RequestInit = {}
): Promise<{ data: T; headers: Headers }> {
    try {
        // Converte parâmetros para query string (apenas se for GET)
        const isGet = !options.method || options.method.toUpperCase() === 'GET';
        let url = `${WOOCOMMERCE_API_URL}${endpoint}`;

        if (isGet && Object.keys(params).length > 0) {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
            const queryString = queryParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        // Cria Basic Auth header
        const auth = btoa(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`);

        console.log('🔍 Fazendo requisição WooCommerce:', {
            url: url.replace(WOOCOMMERCE_CONSUMER_KEY, 'KEY_HIDDEN').replace(WOOCOMMERCE_CONSUMER_SECRET, 'SECRET_HIDDEN'),
            endpoint,
            method: options.method || 'GET',
            ...(isGet ? { params } : { body: options.body ? JSON.parse(options.body as string) : undefined })
        });

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ...options.headers,
            },
        });

        if (!response.ok) {
            let error: WPError;
            try {
                error = await response.json();
            } catch {
                error = {
                    code: 'http_error',
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    data: { status: response.status }
                };
            }

            console.error('❌ Erro WooCommerce:', error);

            throw new WordPressAPIError(
                error.message || 'Erro ao buscar dados do WooCommerce',
                error.code || 'unknown_error',
                error.data?.status || response.status
            );
        }

        const data = await response.json();
        console.log('✅ Resposta WooCommerce:', Array.isArray(data) ? `${data.length} itens` : 'objeto');

        return { data: data as T, headers: response.headers };
    } catch (error) {
        if (error instanceof WordPressAPIError) {
            throw error;
        }
        console.error('❌ Erro de conexão WooCommerce:', error);
        throw new WordPressAPIError(
            'Erro de conexão com o WooCommerce',
            'connection_error',
            0
        );
    }
}

/**
 * Extrai informações de paginação dos headers
 */
function extractPaginationInfo(headers: Headers) {
    return {
        total: parseInt(headers.get('X-WP-Total') || '0', 10),
        totalPages: parseInt(headers.get('X-WP-TotalPages') || '0', 10),
    };
}

// ============================================
// POSTS DO WORDPRESS
// ============================================

/**
 * Busca todos os posts
 */
export async function getPosts(params: {
    page?: number;
    per_page?: number;
    categories?: number[];
    tags?: number[];
    search?: string;
    _embed?: boolean;
} = {}): Promise<WPPaginatedResponse<WPPost>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.categories) queryParams.append('categories', params.categories.join(','));
    if (params.tags) queryParams.append('tags', params.tags.join(','));
    if (params.search) queryParams.append('search', params.search);
    if (params._embed) queryParams.append('_embed', 'true');

    const endpoint = `/posts?${queryParams}`;
    const response = await fetch(`${WORDPRESS_API_URL}${endpoint}`);
    const data = await response.json();
    const { total, totalPages } = extractPaginationInfo(response.headers);

    return {
        data,
        total,
        totalPages,
        currentPage: params.page || 1,
    };
}

/**
 * Busca um post por slug
 */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
    const posts = await fetchWordPress<WPPost[]>(`/posts?slug=${slug}&_embed=true`);
    return posts.length > 0 ? posts[0] : null;
}

/**
 * Busca um post por ID
 */
export async function getPostById(id: number): Promise<WPPost> {
    return fetchWordPress<WPPost>(`/posts/${id}?_embed=true`);
}

// ============================================
// CATEGORIAS DO WORDPRESS
// ============================================

/**
 * Busca todas as categorias
 */
export async function getCategories(params: {
    page?: number;
    per_page?: number;
    hide_empty?: boolean;
} = {}): Promise<WPPaginatedResponse<WPCategory>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.hide_empty !== undefined) queryParams.append('hide_empty', params.hide_empty.toString());

    const endpoint = `/categories?${queryParams}`;
    const response = await fetch(`${WORDPRESS_API_URL}${endpoint}`);
    const data = await response.json();
    const { total, totalPages } = extractPaginationInfo(response.headers);

    return {
        data,
        total,
        totalPages,
        currentPage: params.page || 1,
    };
}

/**
 * Busca uma categoria por ID
 */
export async function getCategoryById(id: number): Promise<WPCategory> {
    return fetchWordPress<WPCategory>(`/categories/${id}`);
}

/**
 * Busca uma categoria por slug
 */
export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
    const categories = await fetchWordPress<WPCategory[]>(`/categories?slug=${slug}`);
    return categories.length > 0 ? categories[0] : null;
}

// ============================================
// TAGS DO WORDPRESS
// ============================================

/**
 * Busca todas as tags
 */
export async function getTags(params: {
    page?: number;
    per_page?: number;
} = {}): Promise<WPPaginatedResponse<WPTag>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());

    const endpoint = `/tags?${queryParams}`;
    const response = await fetch(`${WORDPRESS_API_URL}${endpoint}`);
    const data = await response.json();
    const { total, totalPages } = extractPaginationInfo(response.headers);

    return {
        data,
        total,
        totalPages,
        currentPage: params.page || 1,
    };
}

// ============================================
// MEDIA DO WORDPRESS
// ============================================

/**
 * Busca uma mídia por ID
 */
export async function getMediaById(id: number): Promise<WPMedia> {
    return fetchWordPress<WPMedia>(`/media/${id}`);
}

// ============================================
// PRODUTOS DO WOOCOMMERCE
// ============================================

/**
 * Busca todos os produtos
 */
export async function getProducts(
    params: ProductQueryParams = {}
): Promise<WPPaginatedResponse<WooCommerceProduct>> {
    const { data, headers } = await fetchWooCommerce<WooCommerceProduct[]>('/products', params);
    const { total, totalPages } = extractPaginationInfo(headers);

    return {
        data,
        total,
        totalPages,
        currentPage: params.page || 1,
    };
}

/**
 * Busca um produto por ID
 */
export async function getProductById(id: number): Promise<WooCommerceProduct> {
    const { data } = await fetchWooCommerce<WooCommerceProduct>(`/products/${id}`, {});
    return data;
}

/**
 * Busca um produto por slug
 */
export async function getProductBySlug(slug: string): Promise<WooCommerceProduct | null> {
    const { data } = await fetchWooCommerce<WooCommerceProduct[]>('/products', { slug });
    return data.length > 0 ? data[0] : null;
}

/**
 * Busca produtos em destaque
 */
export async function getFeaturedProducts(
    params: Omit<ProductQueryParams, 'featured'> = {}
): Promise<WPPaginatedResponse<WooCommerceProduct>> {
    return getProducts({ ...params, featured: true });
}

/**
 * Busca produtos em promoção
 */
export async function getOnSaleProducts(
    params: Omit<ProductQueryParams, 'on_sale'> = {}
): Promise<WPPaginatedResponse<WooCommerceProduct>> {
    return getProducts({ ...params, on_sale: true });
}

/**
 * Busca produtos por categoria
 */
export async function getProductsByCategory(
    categorySlug: string,
    params: Omit<ProductQueryParams, 'category'> = {}
): Promise<WPPaginatedResponse<WooCommerceProduct>> {
    return getProducts({ ...params, category: categorySlug });
}

// ============================================
// CATEGORIAS DO WOOCOMMERCE
// ============================================

/**
 * Busca todas as categorias de produtos
 */
export async function getProductCategories(
    params: CategoryQueryParams = {}
): Promise<WPPaginatedResponse<WooCommerceCategory>> {
    const { data, headers } = await fetchWooCommerce<WooCommerceCategory[]>('/products/categories', params);
    const { total, totalPages } = extractPaginationInfo(headers);

    return {
        data,
        total,
        totalPages,
        currentPage: params.page || 1,
    };
}

/**
 * Busca uma categoria de produto por ID
 */
export async function getProductCategoryById(id: number): Promise<WooCommerceCategory> {
    const { data } = await fetchWooCommerce<WooCommerceCategory>(`/products/categories/${id}`, {});
    return data;
}

/**
 * Busca uma categoria de produto por slug
 */
export async function getProductCategoryBySlug(slug: string): Promise<WooCommerceCategory | null> {
    const { data } = await fetchWooCommerce<WooCommerceCategory[]>('/products/categories', { slug });
    return data.length > 0 ? data[0] : null;
}

// ============================================
// ORDERS DO WOOCOMMERCE
// ============================================

/**
 * Cria uma nova encomenda no WooCommerce
 */
export async function createWooCommerceOrder(
    orderData: WooCommerceOrderPayload
): Promise<WooCommerceOrderResponse> {
    const { data } = await fetchWooCommerce<WooCommerceOrderResponse>('/orders', {}, {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
    return data;
}

// ============================================
// PAYMENT GATEWAYS DO WOOCOMMERCE
// ============================================

/**
 * Busca os métodos de pagamento ativos no WooCommerce
 */
export async function getPaymentGateways(): Promise<any[]> {
    const { data } = await fetchWooCommerce<any[]>('/payment_gateways', {});
    return data.filter((gateway) => gateway.enabled);
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Verifica se a API do WordPress está acessível
 */
export async function checkWordPressConnection(): Promise<boolean> {
    try {
        await fetch(WORDPRESS_BASE_URL);
        return true;
    } catch {
        return false;
    }
}

/**
 * Verifica se a API do WooCommerce está configurada
 */
export function isWooCommerceConfigured(): boolean {
    return !!(WOOCOMMERCE_CONSUMER_KEY && WOOCOMMERCE_CONSUMER_SECRET);
}

/**
 * Retorna as URLs configuradas
 */
export function getAPIConfig() {
    return {
        wordpressApiUrl: WORDPRESS_API_URL,
        wordpressBaseUrl: WORDPRESS_BASE_URL,
        woocommerceApiUrl: WOOCOMMERCE_API_URL,
        woocommerceConfigured: isWooCommerceConfigured(),
    };
}
