// Constrói o URL do WhatsApp com o texto pré-preenchido, sempre com um sufixo que
// identifica a origem do clique (para o CRM conseguir ligar a conversa à campanha).
const WHATSAPP_NUMBER = '351939076117';

const REF_CODES: Record<string, string> = {
    floating_button: 'FB',
    footer: 'FT',
    cart_checkout: 'CC',
    checkout_finalizar: 'CF',
};

export function buildWhatsAppUrl(clickSource: string, baseText: string): string {
    const ref = REF_CODES[clickSource] ?? clickSource.toUpperCase();

    let clickId = '';
    try {
        const gclid = localStorage.getItem('ptmoveis_gclid');
        const fbclid = localStorage.getItem('ptmoveis_fbclid');
        if (gclid) clickId = ` g:${gclid}`;
        else if (fbclid) clickId = ` f:${fbclid}`;
    } catch (e) { /* localStorage indisponível */ }

    const suffix = `[ref ${ref}${clickId}]`;
    const fullText = `${baseText}\n\n${suffix}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullText)}`;
}
