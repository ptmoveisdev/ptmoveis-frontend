/**
 * Utilitários para WordPress REST API
 * Funções auxiliares para manipulação de dados do WordPress
 */

import type { WooCommerceProduct, WPPost, WPCategory } from '../types/wordpress';

/**
 * Formata preço brasileiro
 */
export function formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numPrice);
}

/**
 * Calcula desconto percentual
 */
export function calculateDiscount(regularPrice: string, salePrice: string): number {
    const regular = parseFloat(regularPrice);
    const sale = parseFloat(salePrice);

    if (regular === 0) return 0;

    return Math.round(((regular - sale) / regular) * 100);
}

/**
 * Remove tags HTML de uma string
 */
export function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Trunca texto com limite de caracteres
 */
export function truncateText(text: string, maxLength: number): string {
    const stripped = stripHtml(text);
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + '...';
}

/**
 * Formata data para formato brasileiro
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

/**
 * Formata data relativa (ex: "há 2 dias")
 */
export function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
        ano: 31536000,
        mês: 2592000,
        semana: 604800,
        dia: 86400,
        hora: 3600,
        minuto: 60,
    };

    for (const [name, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            return `há ${interval} ${name}${interval > 1 ? (name === 'mês' ? 'es' : 's') : ''}`;
        }
    }

    return 'agora mesmo';
}

/**
 * Obtém a primeira imagem de um produto
 */
export function getProductMainImage(product: WooCommerceProduct): string {
    return product.images[0]?.src || '/placeholder-product.jpg';
}

/**
 * Obtém todas as imagens de um produto
 */
export function getProductImages(product: WooCommerceProduct): string[] {
    return product.images.map(img => img.src);
}

/**
 * Verifica se produto está em estoque
 */
export function isInStock(product: WooCommerceProduct): boolean {
    return product.stock_status === 'instock';
}

/**
 * Verifica se produto está em promoção
 */
export function isOnSale(product: WooCommerceProduct): boolean {
    return product.on_sale;
}

/**
 * Obtém status de estoque formatado
 */
export function getStockStatus(product: WooCommerceProduct): {
    text: string;
    color: string;
    available: boolean;
} {
    switch (product.stock_status) {
        case 'instock':
            return {
                text: 'Em estoque',
                color: 'green',
                available: true,
            };
        case 'outofstock':
            return {
                text: 'Fora de estoque',
                color: 'red',
                available: false,
            };
        case 'onbackorder':
            return {
                text: 'Sob encomenda',
                color: 'orange',
                available: true,
            };
        default:
            return {
                text: 'Indisponível',
                color: 'gray',
                available: false,
            };
    }
}

/**
 * Obtém categorias de um produto como string
 */
export function getProductCategoriesText(product: WooCommerceProduct): string {
    return product.categories.map(cat => cat.name).join(', ');
}

/**
 * Obtém tags de um produto como string
 */
export function getProductTagsText(product: WooCommerceProduct): string {
    return product.tags.map(tag => tag.name).join(', ');
}

/**
 * Filtra produtos por categoria
 */
export function filterProductsByCategory(
    products: WooCommerceProduct[],
    categorySlug: string
): WooCommerceProduct[] {
    if (!categorySlug) return products;
    return products.filter(product =>
        product.categories.some(cat => cat.slug === categorySlug)
    );
}

/**
 * Filtra produtos por faixa de preço
 */
export function filterProductsByPrice(
    products: WooCommerceProduct[],
    minPrice?: number,
    maxPrice?: number
): WooCommerceProduct[] {
    return products.filter(product => {
        const price = parseFloat(product.price);
        if (minPrice !== undefined && price < minPrice) return false;
        if (maxPrice !== undefined && price > maxPrice) return false;
        return true;
    });
}

/**
 * Ordena produtos por preço
 */
export function sortProductsByPrice(
    products: WooCommerceProduct[],
    order: 'asc' | 'desc' = 'asc'
): WooCommerceProduct[] {
    return [...products].sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return order === 'asc' ? priceA - priceB : priceB - priceA;
    });
}

/**
 * Ordena produtos por data
 */
export function sortProductsByDate(
    products: WooCommerceProduct[],
    order: 'asc' | 'desc' = 'desc'
): WooCommerceProduct[] {
    return [...products].sort((a, b) => {
        const dateA = new Date(a.date_created).getTime();
        const dateB = new Date(b.date_created).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
}

/**
 * Busca produtos por termo
 */
export function searchProducts(
    products: WooCommerceProduct[],
    searchTerm: string
): WooCommerceProduct[] {
    if (!searchTerm) return products;

    const term = searchTerm.toLowerCase();

    return products.filter(product => {
        const name = product.name.toLowerCase();
        const description = stripHtml(product.description).toLowerCase();
        const shortDescription = stripHtml(product.short_description).toLowerCase();
        const categories = getProductCategoriesText(product).toLowerCase();
        const tags = getProductTagsText(product).toLowerCase();

        return (
            name.includes(term) ||
            description.includes(term) ||
            shortDescription.includes(term) ||
            categories.includes(term) ||
            tags.includes(term)
        );
    });
}

/**
 * Obtém imagem destacada de um post
 */
export function getPostFeaturedImage(post: WPPost): string | null {
    if (post._embedded?.['wp:featuredmedia']?.[0]) {
        return post._embedded['wp:featuredmedia'][0].source_url;
    }
    return null;
}

/**
 * Obtém categorias de um post
 */
export function getPostCategories(post: WPPost): WPCategory[] {
    if (post._embedded?.['wp:term']?.[0]) {
        return post._embedded['wp:term'][0];
    }
    return [];
}

/**
 * Obtém excerpt de um post sem HTML
 */
export function getPostExcerpt(post: WPPost, maxLength: number = 150): string {
    return truncateText(post.excerpt.rendered, maxLength);
}

/**
 * Gera slug a partir de texto
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim();
}

/**
 * Constrói URL de query com parâmetros
 */
export function buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                searchParams.append(key, value.join(','));
            } else {
                searchParams.append(key, String(value));
            }
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Agrupa produtos por categoria
 */
export function groupProductsByCategory(
    products: WooCommerceProduct[]
): Record<string, WooCommerceProduct[]> {
    const grouped: Record<string, WooCommerceProduct[]> = {};

    products.forEach(product => {
        product.categories.forEach(category => {
            if (!grouped[category.slug]) {
                grouped[category.slug] = [];
            }
            grouped[category.slug].push(product);
        });
    });

    return grouped;
}

/**
 * Calcula estatísticas de produtos
 */
export function calculateProductStats(products: WooCommerceProduct[]) {
    const prices = products.map(p => parseFloat(p.price));

    return {
        total: products.length,
        inStock: products.filter(p => p.stock_status === 'instock').length,
        onSale: products.filter(p => p.on_sale).length,
        featured: products.filter(p => p.featured).length,
        averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
    };
}

/**
 * Valida URL de imagem
 */
export function isValidImageUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(urlObj.pathname);
    } catch {
        return false;
    }
}

/**
 * Obtém placeholder de imagem
 */
export function getImagePlaceholder(width: number = 400, height: number = 400): string {
    return `https://via.placeholder.com/${width}x${height}/f5f5f5/999999?text=Sem+Imagem`;
}

/**
 * Formata atributos de produto
 */
export function formatProductAttributes(product: WooCommerceProduct): Record<string, string> {
    const attributes: Record<string, string> = {};

    product.attributes.forEach(attr => {
        attributes[attr.name] = attr.options.join(', ');
    });

    return attributes;
}

/**
 * Verifica se produto é novo (últimos 30 dias)
 */
export function isNewProduct(product: WooCommerceProduct, days: number = 30): boolean {
    const productDate = new Date(product.date_created);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - productDate.getTime()) / (1000 * 60 * 60 * 24));

    return diffInDays <= days;
}

/**
 * Obtém badge do produto (Novo, Promoção, Destaque, etc.)
 */
export function getProductBadge(product: WooCommerceProduct): {
    text: string;
    color: string;
} | null {
    if (product.on_sale) {
        const discount = calculateDiscount(product.regular_price, product.price);
        return {
            text: `-${discount}%`,
            color: 'red',
        };
    }

    if (product.featured) {
        return {
            text: 'Destaque',
            color: 'orange',
        };
    }

    if (isNewProduct(product)) {
        return {
            text: 'Novo',
            color: 'blue',
        };
    }

    return null;
}

/**
 * Formata dimensões do produto
 */
export function formatProductDimensions(product: WooCommerceProduct): string | null {
    const { length, width, height } = product.dimensions;

    if (!length && !width && !height) return null;

    return `${length || '?'} × ${width || '?'} × ${height || '?'} cm`;
}

/**
 * Formata peso do produto
 */
export function formatProductWeight(product: WooCommerceProduct): string | null {
    if (!product.weight) return null;

    return `${product.weight} kg`;
}
