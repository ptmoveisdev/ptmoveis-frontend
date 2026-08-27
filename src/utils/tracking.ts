// Eventos de e-commerce para o dataLayer (GTM/GA4/Google Ads) e Meta Pixel.
declare global {
    interface Window {
        dataLayer: any[];
        fbq?: (...args: any[]) => void;
    }
}

interface TrackItem {
    item_id: string;
    item_name: string;
    price: number;
    quantity?: number;
}

function pushEcommerce(event: string, ecommerce: Record<string, any>) {
    window.dataLayer = window.dataLayer || [];
    // Limpa o objeto ecommerce anterior antes de cada evento (recomendação GA4).
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event, ecommerce });
}

export function trackViewItem(item: TrackItem) {
    pushEcommerce('view_item', {
        currency: 'EUR',
        value: item.price,
        items: [{ ...item, quantity: item.quantity ?? 1 }],
    });
    window.fbq?.('track', 'ViewContent', {
        value: item.price,
        currency: 'EUR',
        content_ids: [item.item_id],
        content_name: item.item_name,
        content_type: 'product',
    });
}

export function trackAddToCart(item: TrackItem) {
    const value = item.price * (item.quantity ?? 1);
    pushEcommerce('add_to_cart', {
        currency: 'EUR',
        value,
        items: [{ ...item, quantity: item.quantity ?? 1 }],
    });
    window.fbq?.('track', 'AddToCart', {
        value,
        currency: 'EUR',
        content_ids: [item.item_id],
        content_name: item.item_name,
        content_type: 'product',
    });
}

export function trackBeginCheckout(items: TrackItem[], value: number) {
    pushEcommerce('begin_checkout', {
        currency: 'EUR',
        value,
        items: items.map(i => ({ ...i, quantity: i.quantity ?? 1 })),
    });
    window.fbq?.('track', 'InitiateCheckout', {
        value,
        currency: 'EUR',
        content_ids: items.map(i => i.item_id),
        content_type: 'product',
        num_items: items.reduce((sum, i) => sum + (i.quantity ?? 1), 0),
    });
}

export function trackWhatsAppClick(source: string) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'whatsapp_click', click_source: source });
    window.fbq?.('track', 'Contact', { content_category: 'whatsapp', content_name: source });
}

export function trackPhoneClick(source: string) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'phone_click', click_source: source });
    window.fbq?.('track', 'Contact', { content_category: 'phone', content_name: source });
}

export function trackPurchase(params: {
    transactionId: string;
    value: number;
    currency?: string;
    shipping?: number;
    items: TrackItem[];
}) {
    // Evita contar a mesma encomenda 2x (ex: utilizador atualiza a página de sucesso).
    const dedupeKey = `ptmoveis_purchase_tracked_${params.transactionId}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, '1');

    pushEcommerce('purchase', {
        transaction_id: params.transactionId,
        value: params.value,
        currency: params.currency ?? 'EUR',
        shipping: params.shipping,
        items: params.items.map(i => ({ ...i, quantity: i.quantity ?? 1 })),
    });
    window.fbq?.('track', 'Purchase', {
        value: params.value,
        currency: params.currency ?? 'EUR',
        content_ids: params.items.map(i => i.item_id),
        content_type: 'product',
    });
}
