/**
 * ScalapayWidget
 * Renderiza o widget dinâmico de pagamento fracionado da Scalapay.
 * Este componente exige que o script do Scalapay esteja carregado no index.html.
 */

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'scalapay-widget': any;
        }
    }
}

interface ScalapayWidgetProps {
    /** 
     * Seletor CSS do elemento HTML que contém o valor total a ler pelo widget.
     * Exemplo: "#product-price" ou ".cart-total"
     */
    amountSelector: string;
    
    /** 
     * Tipo de página onde o widget está embutido. 
     * Opcional, mas útil na página de checkout passando "checkout"
     */
    type?: 'product' | 'cart' | 'checkout';
    
    /** Opcional: Para controlar a exibição se o meio de pagamento estiver selecionado (útil no checkout) */
    visible?: boolean;
}

export function ScalapayWidget({ amountSelector, type, visible = true }: ScalapayWidgetProps) {
    // INFO: Temporarily disabled globally as requested by merchant until API approval is confirmed.
    return null;

    // TODO: Num ambiente de produção, substituir "integration" pelo token de live e remover o "environment"
    const merchantToken = import.meta.env.VITE_SCALAPAY_TOKEN || '8KDS3SPEL';
    const isIntegration = import.meta.env.VITE_SCALAPAY_ENV === 'integration' || !import.meta.env.VITE_SCALAPAY_TOKEN;

    const widgetProps: any = {
        'amount-selectors': `["${amountSelector}"]`,
        'merchant-token': merchantToken,
    };

    if (isIntegration) {
        widgetProps['environment'] = 'integration';
    }

    if (type) {
        widgetProps['type'] = type;
    }

    return (
        <div className="mt-3 scalapay-widget-container">
            {/* @ts-ignore: Web component ignorado pelo TS */}
            <scalapay-widget {...widgetProps}></scalapay-widget>
        </div>
    );
}
