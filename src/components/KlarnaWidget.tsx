/**
 * KlarnaWidget
 * Componente que renderiza o container do widget Klarna Payments.
 * O SDK injeta o iframe dentro de #klarna-container.
 */

import { Loader2, AlertCircle } from 'lucide-react';

interface KlarnaWidgetProps {
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
}

export function KlarnaWidget({ isLoading, isReady, error }: KlarnaWidgetProps) {
    return (
        <div className="mt-4 space-y-3">
            {/* Estados de loading e erro */}
            {isLoading && (
                <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>A carregar opções de pagamento Klarna…</span>
                </div>
            )}

            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Container onde o SDK Klarna injeta o iframe do widget */}
            <div
                id="klarna-container"
                className={isReady ? 'block' : 'hidden'}
            />

            {isReady && (
                <p className="text-xs text-gray-400 text-center">
                    Pagamento processado com segurança pela Klarna
                </p>
            )}
        </div>
    );
}
