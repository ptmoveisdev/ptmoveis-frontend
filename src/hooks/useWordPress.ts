/**
 * React Hooks para WordPress REST API
 * Hooks personalizados para consumir dados do WordPress
 */

import { useState, useEffect, useCallback } from 'react';
import type {
    WPPost,
    WPCategory,
    WooCommerceProduct,
    WooCommerceCategory,
    ProductQueryParams,
    CategoryQueryParams,
} from '../types/wordpress';
import {
    getPosts,
    getPostBySlug,
    getCategories,
    getCategoryBySlug,
    getProducts,
    getProductBySlug,
    getProductCategories,
    getProductCategoryBySlug,
    WordPressAPIError,
} from '../services/wordpress';

// Estado genérico para hooks
interface UseWordPressState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

interface UseWordPressPaginatedState<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    total: number;
    totalPages: number;
    currentPage: number;
    refetch: () => void;
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
}

// ============================================
// HOOKS PARA POSTS
// ============================================

/**
 * Hook para buscar posts com paginação
 */
export function usePosts(params: {
    page?: number;
    per_page?: number;
    categories?: number[];
    tags?: number[];
    search?: string;
    _embed?: boolean;
} = {}): UseWordPressPaginatedState<WPPost> {
    const [state, setState] = useState<{
        data: WPPost[];
        loading: boolean;
        error: string | null;
        total: number;
        totalPages: number;
        currentPage: number;
    }>({
        data: [],
        loading: true,
        error: null,
        total: 0,
        totalPages: 0,
        currentPage: params.page || 1,
    });

    const fetchData = useCallback(async (page: number) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const result = await getPosts({ ...params, page });
            setState({
                data: result.data,
                loading: false,
                error: null,
                total: result.total,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            });
        } catch (error) {
            const message = error instanceof WordPressAPIError
                ? error.message
                : 'Erro ao carregar posts';
            setState((prev) => ({
                ...prev,
                loading: false,
                error: message,
            }));
        }
    }, [params.per_page, params.categories, params.tags, params.search, params._embed]);

    useEffect(() => {
        fetchData(state.currentPage);
    }, [fetchData]);

    return {
        ...state,
        refetch: () => fetchData(state.currentPage),
        nextPage: () => {
            if (state.currentPage < state.totalPages) {
                fetchData(state.currentPage + 1);
            }
        },
        prevPage: () => {
            if (state.currentPage > 1) {
                fetchData(state.currentPage - 1);
            }
        },
        goToPage: (page: number) => {
            if (page >= 1 && page <= state.totalPages) {
                fetchData(page);
            }
        },
    };
}

/**
 * Hook para buscar um post por slug
 */
export function usePostBySlug(slug: string): UseWordPressState<WPPost> {
    const [state, setState] = useState<{
        data: WPPost | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        setState({ data: null, loading: true, error: null });
        try {
            const post = await getPostBySlug(slug);
            setState({ data: post, loading: false, error: null });
        } catch (error) {
            const message = error instanceof WordPressAPIError
                ? error.message
                : 'Erro ao carregar post';
            setState({ data: null, loading: false, error: message });
        }
    }, [slug]);

    useEffect(() => {
        if (slug) {
            fetchData();
        }
    }, [fetchData, slug]);

    return { ...state, refetch: fetchData };
}

/**
 * Hook para buscar um post por ID (Comentado pois não está sendo usado e getPostById não foi importado)
 */
/*
export function usePostById(id: number): UseWordPressState<WPPost> {
    // ... implementation removed to avoid unused import error
}
*/

// ============================================
// HOOKS PARA CATEGORIAS
// ============================================

/**
 * Hook para buscar categorias
 */
export function useCategories(params: {
    page?: number;
    per_page?: number;
    hide_empty?: boolean;
} = {}): UseWordPressPaginatedState<WPCategory> {
    const [state, setState] = useState<{
        data: WPCategory[];
        loading: boolean;
        error: string | null;
        total: number;
        totalPages: number;
        currentPage: number;
    }>({
        data: [],
        loading: true,
        error: null,
        total: 0,
        totalPages: 0,
        currentPage: params.page || 1,
    });

    const fetchData = useCallback(async (page: number) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const result = await getCategories({ ...params, page });
            setState({
                data: result.data,
                loading: false,
                error: null,
                total: result.total,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            });
        } catch (error) {
            const message = error instanceof WordPressAPIError
                ? error.message
                : 'Erro ao carregar categorias';
            setState((prev) => ({
                ...prev,
                loading: false,
                error: message,
            }));
        }
    }, [params.per_page, params.hide_empty]);

    useEffect(() => {
        fetchData(state.currentPage);
    }, [fetchData]);

    return {
        ...state,
        refetch: () => fetchData(state.currentPage),
        nextPage: () => {
            if (state.currentPage < state.totalPages) {
                fetchData(state.currentPage + 1);
            }
        },
        prevPage: () => {
            if (state.currentPage > 1) {
                fetchData(state.currentPage - 1);
            }
        },
        goToPage: (page: number) => {
            if (page >= 1 && page <= state.totalPages) {
                fetchData(page);
            }
        },
    };
}

/**
 * Hook para buscar uma categoria por slug
 */
export function useCategoryBySlug(slug: string): UseWordPressState<WPCategory> {
    const [state, setState] = useState<{
        data: WPCategory | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        setState({ data: null, loading: true, error: null });
        try {
            const category = await getCategoryBySlug(slug);
            setState({ data: category, loading: false, error: null });
        } catch (error) {
            const message = error instanceof WordPressAPIError
                ? error.message
                : 'Erro ao carregar categoria';
            setState({ data: null, loading: false, error: message });
        }
    }, [slug]);

    useEffect(() => {
        if (slug) {
            fetchData();
        }
    }, [fetchData, slug]);

    return { ...state, refetch: fetchData };
}

// ============================================
// HOOKS PARA PRODUTOS WOOCOMMERCE
// ============================================

/**
 * Hook para buscar produtos com paginação
 */
export function useProducts(
    params: ProductQueryParams = {}
): UseWordPressPaginatedState<WooCommerceProduct> {
    const [state, setState] = useState<{
        data: WooCommerceProduct[];
        loading: boolean;
        error: string | null;
        total: number;
        totalPages: number;
        currentPage: number;
    }>({
        data: [],
        loading: true,
        error: null,
        total: 0,
        totalPages: 0,
        currentPage: params.page || 1,
    });

    const fetchData = useCallback(async (page: number) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const result = await getProducts({ ...params, page });
            setState({
                data: result.data,
                loading: false,
                error: null,
                total: result.total,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            });
        } catch (error) {
            const message = error instanceof WordPressAPIError
                ? error.message
                : 'Erro ao carregar produtos';
            setState((prev) => ({
                ...prev,
                loading: false,
                error: message,
            }));
        }
    }, [JSON.stringify(params)]);

    useEffect(() => {
        fetchData(state.currentPage);
    }, [fetchData]);

    return {
        ...state,
        refetch: () => fetchData(state.currentPage),
        nextPage: () => {
            if (state.currentPage < state.totalPages) {
                fetchData(state.currentPage + 1);
            }
        },
        prevPage: () => {
            if (state.currentPage > 1) {
                fetchData(state.currentPage - 1);
            }
        },
        goToPage: (page: number) => {
            if (page >= 1 && page <= state.totalPages) {
                fetchData(page);
            }
        },
    };
}

/**
 * Hook para buscar um produto por slug
 */
export function useProductBySlug(slug: string): UseWordPressState<WooCommerceProduct> {
    const [state, setState] = useState<{
        data: WooCommerceProduct | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        setState({ data: null, loading: true, error: null });
        try {
            const product = await getProductBySlug(slug);
            setState({ data: product, loading: false, error: null });
        } catch (error) {
            const message = error instanceof WordPressAPIError
                ? error.message
                : 'Erro ao carregar produto';
            setState({ data: null, loading: false, error: message });
        }
    }, [slug]);

    useEffect(() => {
        if (slug) {
            fetchData();
        }
    }, [fetchData, slug]);

    return { ...state, refetch: fetchData };
}

/**
 * Hook para buscar produtos em destaque
 */
export function useFeaturedProducts(
    params: Omit<ProductQueryParams, 'featured'> = {}
): UseWordPressPaginatedState<WooCommerceProduct> {
    return useProducts({ ...params, featured: true });
}

/**
 * Hook para buscar produtos em promoção
 */
export function useOnSaleProducts(
    params: Omit<ProductQueryParams, 'on_sale'> = {}
): UseWordPressPaginatedState<WooCommerceProduct> {
    return useProducts({ ...params, on_sale: true });
}

/**
 * Hook para buscar produtos por categoria
 */
export function useProductsByCategory(
    categorySlug: string,
    params: Omit<ProductQueryParams, 'category'> = {}
): UseWordPressPaginatedState<WooCommerceProduct> {
    return useProducts({ ...params, category: categorySlug });
}

// ============================================
// HOOKS PARA CATEGORIAS DE PRODUTOS
// ============================================

/**
 * Hook para buscar categorias de produtos
 */
export function useProductCategories(
    params: CategoryQueryParams = {}
): UseWordPressPaginatedState<WooCommerceCategory> {
    const [state, setState] = useState<{
        data: WooCommerceCategory[];
        loading: boolean;
        error: string | null;
        total: number;
        totalPages: number;
        currentPage: number;
    }>({
        data: [],
        loading: true,
        error: null,
        total: 0,
        totalPages: 0,
        currentPage: params.page || 1,
    });

    const fetchData = useCallback(async (page: number) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const result = await getProductCategories({ ...params, page });
            setState({
                data: result.data,
                loading: false,
                error: null,
                total: result.total,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            });
        } catch (error) {
            const message = error instanceof WordPressAPIError
                ? error.message
                : 'Erro ao carregar categorias';
            setState((prev) => ({
                ...prev,
                loading: false,
                error: message,
            }));
        }
    }, [JSON.stringify(params)]);

    useEffect(() => {
        fetchData(state.currentPage);
    }, [fetchData]);

    return {
        ...state,
        refetch: () => fetchData(state.currentPage),
        nextPage: () => {
            if (state.currentPage < state.totalPages) {
                fetchData(state.currentPage + 1);
            }
        },
        prevPage: () => {
            if (state.currentPage > 1) {
                fetchData(state.currentPage - 1);
            }
        },
        goToPage: (page: number) => {
            if (page >= 1 && page <= state.totalPages) {
                fetchData(page);
            }
        },
    };
}

/**
 * Hook para buscar uma categoria de produto por slug
 */
export function useProductCategoryBySlug(slug: string): UseWordPressState<WooCommerceCategory> {
    const [state, setState] = useState<{
        data: WooCommerceCategory | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        setState({ data: null, loading: true, error: null });
        try {
            const category = await getProductCategoryBySlug(slug);
            setState({ data: category, loading: false, error: null });
        } catch (error) {
            const message = error instanceof WordPressAPIError
                ? error.message
                : 'Erro ao carregar categoria';
            setState({ data: null, loading: false, error: message });
        }
    }, [slug]);

    useEffect(() => {
        if (slug) {
            fetchData();
        }
    }, [fetchData, slug]);

    return { ...state, refetch: fetchData };
}
