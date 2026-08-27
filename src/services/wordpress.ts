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
    WooCommerceShippingZone,
    WooCommerceShippingLocation,
    WooCommerceShippingMethod,
} from '../types/wordpress';

// Configuração da API
const WORDPRESS_API_URL = import.meta.env.VITE_WORDPRESS_API_URL || 'http://localhost/wordpress/wp-json/wp/v2';
const WORDPRESS_BASE_URL = import.meta.env.VITE_WORDPRESS_BASE_URL || 'http://localhost/wordpress';
const WOOCOMMERCE_API_URL = import.meta.env.VITE_WOOCOMMERCE_API_URL || 'http://localhost/wordpress/wp-json/wc/v3';
const WOOCOMMERCE_CONSUMER_KEY = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY || '';
const WOOCOMMERCE_CONSUMER_SECRET = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET || '';
const WCCO_API_URL = import.meta.env.VITE_WCCO_API_URL || '';


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
export async function fetchWooCommerce<T>(
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



        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`,
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
    const mergedParams: ProductQueryParams = {
        orderby: 'menu_order',
        order: 'asc',
        ...params,
    };
    const { data, headers } = await fetchWooCommerce<WooCommerceProduct[]>('/products', mergedParams);
    const { total, totalPages } = extractPaginationInfo(headers);

    return {
        data,
        total,
        totalPages,
        currentPage: mergedParams.page || 1,
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

/**
 * Busca opções customizadas de categoria para um produto (Plugin WCCO)
 * 
 * IMPORTANTE: Este endpoint depende do plugin WooCommerce Category Options estar instalado
 * e configurado no WordPress. O plugin deve registrar o endpoint /wp-json/wcco/v1/options/{id}
 */
const wccoOptionsCache = new Map<number, any[]>();

export async function getProductCategoryOptions(productId: number): Promise<any[]> {
    // Cache simples em memória para evitar refetch em navegações dentro do SPA
    if (wccoOptionsCache.has(productId)) {
        return wccoOptionsCache.get(productId) as any[];
    }

    try {
        // Cria Basic Auth header (mesmo que para WooCommerce)
        const auth = btoa(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`);

        if (WCCO_API_URL) {
            const wccoUrl = `${WCCO_API_URL}/options/${productId}`;
            try {
                const response = await fetch(wccoUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${auth}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const normalized = Array.isArray(data) ? data : [];
                    wccoOptionsCache.set(productId, normalized);
                    return normalized;
                }
            } catch {
                // fallthrough to fallbacks
            }
        }

        // Fallback: tenta múltiplos endpoints possíveis
        const baseUrl = WORDPRESS_BASE_URL.replace(/\/$/, '');
        const possibleEndpoints = [
            `${baseUrl}/wp-json/wcco/v1/options/${productId}`,
            `${baseUrl}/wp-json/wc/v3/products/${productId}/category-options`,
            `${baseUrl}/wp-json/wp/v2/product-category-options/${productId}`,
        ];

        // Tenta cada endpoint
        for (const url of possibleEndpoints) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${auth}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const normalized = Array.isArray(data) ? data : [];
                    wccoOptionsCache.set(productId, normalized);
                    return normalized;
                }
            } catch {
                continue;
            }
        }

        return [];
    } catch {
        return [];
    }
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
 * Cria sessão HPP directamente no servidor com os dados da encomenda WooCommerce.
 * Não usa sessão KP intermédia — evita o erro "same device" da Klarna.
 * Devolve o URL https://pay.klarna.com/eu/hpp/payments/...
 */
export async function getKlarnaHppUrl(orderId: number): Promise<string> {
    const base = WORDPRESS_BASE_URL.replace(/\/$/, '');
    const response = await fetch(`${base}/wp-json/ptmoveis/v1/klarna-hpp-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Klarna HPP error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.hpp_url) throw new Error('Klarna HPP URL não foi retornado pelo servidor.');
    return data.hpp_url;
}

export interface ScalapayOrderData {
    totalAmount: { amount: string; currency: string };
    consumer: { phoneNumber: string; givenNames: string; surname: string; email: string };
    billing: { name: string; line1: string; suburb: string; postcode: string; countryCode: string; phoneNumber: string };
    shipping: { name: string; line1: string; suburb: string; postcode: string; countryCode: string; phoneNumber: string };
    items: Array<{ name: string; sku: string; quantity: number; price: { amount: string; currency: string } }>;
    merchant: { redirectConfirmUrl: string; redirectCancelUrl: string };
    merchantReference?: string;
    taxAmount?: { amount: string; currency: string };
    shippingAmount?: { amount: string; currency: string };
    discounts?: Array<{ displayName: string; amount: { amount: string; currency: string } }>;
    type?: string;
    product?: string;
    frequency?: { frequencyType: string; number: number };
}

/**
 * Cria sessão de checkout Scalapay para uma encomenda WooCommerce.
 * Chama o gateway Scalapay no WordPress via process_payment() e devolve o URL do portal.
 *
 * Requer endpoint WordPress: POST /wp-json/ptmoveis/v1/scalapay-checkout-url
 * Body:    { order_id: number, scalapay_order_data?: ScalapayOrderData }
 * Returns: { checkout_url: string }
 */
export async function getScalapayCheckoutUrl(orderId: number, scalapayOrderData?: ScalapayOrderData): Promise<string> {
    const base = WORDPRESS_BASE_URL.replace(/\/$/, '');
    const response = await fetch(`${base}/wp-json/ptmoveis/v1/scalapay-checkout-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, ...(scalapayOrderData && { scalapay_order_data: scalapayOrderData }) }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const detail = err.data?.scalapay_error ? ` (${JSON.stringify(err.data.scalapay_error)})` : '';
        throw new Error((err.message || `Scalapay error: ${response.status}`) + detail);
    }

    const data = await response.json();
    if (!data.checkout_url) throw new Error('URL de pagamento Scalapay não retornado pelo servidor.');
    return data.checkout_url;
}

/**
 * Confirma o pagamento Scalapay após redirect do portal (POST /v2/payments/capture).
 * Requer endpoint WordPress: POST /wp-json/ptmoveis/v1/scalapay-capture
 * Body:    { order_id: number, order_token: string }
 * Returns: { success: true }
 */
export async function captureScalapayPayment(orderId: number, orderToken: string, orderData?: any): Promise<void> {
    const base = WORDPRESS_BASE_URL.replace(/\/$/, '');
    const response = await fetch(`${base}/wp-json/ptmoveis/v1/scalapay-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, order_token: orderToken, order_data: orderData }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Scalapay capture error: ${response.status}`);
    }
}

/**
 * Processa o pagamento de uma encomenda APM (Multibanco, MBWay, etc.)
 * e devolve o URL de redirect real (PayPal / PPRO) para onde o utilizador deve ser enviado.
 *
 * Requer endpoint WordPress: POST /wp-json/ptmoveis/v1/process-payment
 * Body:    { order_id: number }
 * Returns: { redirect_url: string }
 */
export async function getApmRedirectUrl(orderId: number): Promise<string> {
    const base = WORDPRESS_BASE_URL.replace(/\/$/, '');
    const response = await fetch(`${base}/wp-json/ptmoveis/v1/process-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Erro ao processar pagamento: ${response.status}`);
    }
    const data = await response.json();
    if (!data.redirect_url) throw new Error('URL de pagamento não retornado pelo servidor.');
    return data.redirect_url;
}

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

/**
 * Busca uma encomenda pelo ID
 */
export async function getOrderById(orderId: number) {
    const { data } = await fetchWooCommerce<any>(`/orders/${orderId}`);
    return data;
}

/**
 * Busca encomendas pelo email do cliente
 */
export async function getOrdersByEmail(email: string): Promise<any[]> {
    const { data } = await fetchWooCommerce<any[]>('/orders', { search: email });
    // Filtrar localmente para garantir correspondência exata de email e não vazar de outros campos do search
    return (data || []).filter((order: any) => 
        order.billing?.email?.toLowerCase() === email.toLowerCase()
    );
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
// SHIPPING ZONES DO WOOCOMMERCE
// ============================================

/**
 * Busca zonas de entrega
 */
export async function getShippingZones(): Promise<WooCommerceShippingZone[]> {
    const { data } = await fetchWooCommerce<WooCommerceShippingZone[]>('/shipping/zones', {});
    return data;
}

/**
 * Busca locais de uma zona
 */
export async function getShippingZoneLocations(zoneId: number): Promise<WooCommerceShippingLocation[]> {
    const { data } = await fetchWooCommerce<WooCommerceShippingLocation[]>(`/shipping/zones/${zoneId}/locations`, {});
    return data;
}

/**
 * Busca métodos de entrega de uma zona
 */
export async function getShippingZoneMethods(zoneId: number): Promise<WooCommerceShippingMethod[]> {
    const { data } = await fetchWooCommerce<WooCommerceShippingMethod[]>(`/shipping/zones/${zoneId}/methods`, {});
    return data;
}

// ============================================
// SLIDES DO PLUGIN PT MOVEIS SLIDER
// ============================================

export interface PTMoveiSlide {
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    image_full?: { url: string; width: number; height: number; alt: string };
    image_mobile?: { url: string; width: number; height: number; alt: string };
    video_url?: string;
    video_embed?: string;
    link_text?: string;
    link_url?: string;
    sort_order?: number;
}

/**
 * Busca slides do plugin PT Moveis Slider
 */
export async function getSlides(): Promise<PTMoveiSlide[]> {
    const base = WORDPRESS_BASE_URL.replace(/\/$/, '');
    const response = await fetch(`${base}/wp-json/ptmoveis/v1/slides`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Erro ao buscar slides: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
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
