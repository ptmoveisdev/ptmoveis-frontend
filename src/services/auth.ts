import { fetchWooCommerce } from './wordpress';

const WORDPRESS_BASE_URL = import.meta.env.VITE_WORDPRESS_BASE_URL || 'http://localhost/wordpress';
const JWT_AUTH_ENDPOINT = `${WORDPRESS_BASE_URL}/wp-json/jwt-auth/v1/token`;

export interface UserAuthResponse {
    token: string;
    user_email: string;
    user_nicename: string;
    user_display_name: string;
}

export interface UserProfile {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    username: string;
    billing: {
        first_name: string;
        last_name: string;
        company: string;
        address_1: string;
        address_2: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        email: string;
        phone: string;
    };
    shipping: {
        first_name: string;
        last_name: string;
        company: string;
        address_1: string;
        address_2: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
}

export async function login(username: string, password: string): Promise<UserAuthResponse> {
    const response = await fetch(JWT_AUTH_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
        if (data.code === 'rest_no_route') {
            throw new Error('O servidor não suporta login (Plugin JWT ausente). Por favor, contacte o suporte.');
        }
        throw new Error(data.message || 'Credenciais inválidas. Por favor, tente novamente.');
    }

    return data;
}

/**
 * Registra um novo utilizador no WooCommerce usando a API do WooCommerce via Basic Auth
 * Nota: Isto funciona em ambiente Headless onde temos o Consumer Key no frontend
 */
export async function registerCustomer(email: string, first_name: string, last_name: string, password?: string): Promise<UserProfile> {
    const payload = {
        email,
        first_name,
        last_name,
        username: email,
        ...(password ? { password } : {})
    };

    try {
        const { data } = await fetchWooCommerce<UserProfile>('/customers', {}, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return data;
    } catch (error: any) {
        console.error("Erro ao registrar cliente:", error);
        throw new Error(error.message || 'Erro ao criar conta. Email já existe ou dados incorretos.');
    }
}

/**
 * Busca o perfil do cliente no WooCommerce via API (pelo email)
 */
export async function getCustomerProfileByEmail(email: string): Promise<UserProfile | null> {
    try {
        const { data } = await fetchWooCommerce<UserProfile[]>('/customers', { email });
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error("Erro ao buscar perfil do cliente:", error);
        return null;
    }
}

export async function getCustomerOrders(customerId: number) {
    try {
        const { data } = await fetchWooCommerce<any[]>('/orders', { customer: customerId });
        return data;
    } catch (error) {
        console.error("Erro ao buscar encomendas do cliente:", error);
        return [];
    }
}
