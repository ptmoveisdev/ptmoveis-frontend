/**
 * useKlarnaPayments
 * Hook para gerenciar o ciclo de vida do Klarna Payments SDK.
 *
 * Fluxo:
 * 1. Chama o endpoint WordPress custom para obter o client_token
 * 2. Inicializa o SDK Klarna com o token
 * 3. Carrega o widget no container #klarna-container
 * 4. Expõe `authorize()` para ser chamado no onSubmit do checkout
 */

import { useState, useCallback, useRef } from 'react';

// Tipos para o SDK Klarna (não há pacote @types/klarna oficial)
declare global {
    interface Window {
        Klarna?: {
            Payments: {
                init: (options: { client_token: string }) => void;
                load: (
                    options: { container: string; payment_method_category?: string },
                    data: Record<string, unknown>,
                    callback: (response: { show_form: boolean; error?: unknown }) => void
                ) => void;
                authorize: (
                    options: { auto_finalize?: boolean },
                    data: Record<string, unknown>,
                    callback: (response: {
                        approved: boolean;
                        authorization_token?: string;
                        error?: unknown;
                        show_form?: boolean;
                    }) => void
                ) => void;
            };
        };
    }
}

interface BillingData {
    given_name: string;
    family_name: string;
    email: string;
    phone: string;
    street_address: string;
    city: string;
    postal_code: string;
    country: string;
}

interface UseKlarnaPaymentsReturn {
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
    initializeKlarna: (total: number) => Promise<void>;
    authorize: (billing: BillingData) => Promise<string>;
}

const KLARNA_TOKEN_URL = import.meta.env.VITE_KLARNA_TOKEN_URL || '';

export function useKlarnaPayments(): UseKlarnaPaymentsReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initializedRef = useRef(false);

    const waitForKlarnaSdk = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (window.Klarna?.Payments) {
                resolve();
                return;
            }
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (window.Klarna?.Payments) {
                    clearInterval(interval);
                    resolve();
                } else if (attempts > 40) {
                    clearInterval(interval);
                    reject(new Error('Klarna SDK não carregou após 4 segundos.'));
                }
            }, 100);
        });
    };

    const initializeKlarna = useCallback(async (total: number) => {
        if (initializedRef.current) return;

        setIsLoading(true);
        setIsReady(false);
        setError(null);

        try {
            // 1. Busca o client_token no WordPress
            const response = await fetch(KLARNA_TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ total }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Erro ${response.status} ao criar sessão Klarna`);
            }

            const { client_token } = await response.json();

            if (!client_token) {
                throw new Error('client_token não retornado pelo servidor.');
            }

            // 2. Aguarda o SDK estar disponível
            await waitForKlarnaSdk();

            // 3. Inicializa o SDK
            window.Klarna!.Payments.init({ client_token });

            // 4. Carrega o widget no container
            await new Promise<void>((resolve, reject) => {
                window.Klarna!.Payments.load(
                    { container: '#klarna-container', payment_method_category: 'pay_later' },
                    {},
                    (res) => {
                        if (res.show_form) {
                            resolve();
                        } else {
                            reject(new Error('Klarna não disponível para este perfil de compra.'));
                        }
                    }
                );
            });

            initializedRef.current = true;
            setIsReady(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido ao inicializar Klarna.';
            setError(message);
            console.error('❌ useKlarnaPayments:', message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const authorize = useCallback((billing: BillingData): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!window.Klarna?.Payments) {
                reject(new Error('SDK Klarna não está carregado.'));
                return;
            }

            window.Klarna.Payments.authorize(
                { auto_finalize: true },
                {
                    billing_address: {
                        given_name: billing.given_name,
                        family_name: billing.family_name,
                        email: billing.email,
                        phone: billing.phone,
                        street_address: billing.street_address,
                        city: billing.city,
                        postal_code: billing.postal_code,
                        country: billing.country,
                    },
                },
                (res) => {
                    if (res.approved && res.authorization_token) {
                        resolve(res.authorization_token);
                    } else {
                        reject(new Error('Autorização Klarna não aprovada.'));
                    }
                }
            );
        });
    }, []);

    return { isLoading, isReady, error, initializeKlarna, authorize };
}
