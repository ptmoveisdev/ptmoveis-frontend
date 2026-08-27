import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ChevronLeft, ShoppingBag, CreditCard, Smartphone, Banknote, Search, Loader2 } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart, type CartItem } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { createWooCommerceOrder, getPaymentGateways, getKlarnaHppUrl, getApmRedirectUrl, getScalapayCheckoutUrl, type ScalapayOrderData } from '@/services/wordpress';
import { fetchAllShippingZones, matchShippingZoneWithMethod, type EnrichedShippingZone } from '@/utils/shipping';
import { ScalapayWidget } from '@/components/ScalapayWidget';
import { trackBeginCheckout } from '@/utils/tracking';


const GatewayIcon = ({ id }: { id: string }) => {
    if (id.includes('paypal')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a2.008 2.008 0 0 0-1.967 1.688l-1.385 8.784-.046.33a.64.64 0 0 0 .63.74H10.19a.636.636 0 0 0 .627-.541l.889-5.65c.081-.518.525-.9 1.05-.9h.244c4.332 0 7.625-1.742 8.604-6.756.241-1.229.074-2.731-.382-4.609z" />
            </svg>
        );
    }
    if (id.includes('scalapay')) {
        return <img src="/scalapay-logo-black.svg" alt="Scalapay" className="h-5 sm:h-7 w-auto" />;
    }
    if (id.includes('card') || id.includes('stripe')) return <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />;
    if (id.includes('mbway')) return <Smartphone className="w-6 h-6 sm:w-8 sm:h-8" />;
    if (id.includes('multibanco')) return <Banknote className="w-6 h-6 sm:w-8 sm:h-8" />;

    // Default fallback
    return <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />;
};

// Persistência de dados do checkout no localStorage
const CHECKOUT_STORAGE_KEY = 'ptmoveis_checkout_data';

const getSavedCheckoutData = (): Partial<CheckoutFormData> => {
    try {
        const saved = localStorage.getItem(CHECKOUT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
};

const saveCheckoutData = (data: Partial<CheckoutFormData>) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { paymentMethod: _, ...rest } = data;
        localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(rest));
    } catch {}
};

interface LineItemPayload {
    product_id: number;
    variation_id?: number;
    quantity: number;
    subtotal: string;
    total: string;
    meta_data?: Array<{ key: string; value: any }>;
}

interface FeeLinePayload {
    name: string;
    total: string;
    tax_status: string;
}

export function prepareWooCommerceCart(items: CartItem[]): { line_items: LineItemPayload[], fee_lines: FeeLinePayload[] } {
    const line_items: LineItemPayload[] = [];
    const feeMap = new Map<string, number>();

    items.forEach(item => {
        const perUnitExtras = item.customOptions?.reduce((sum, opt) => {
            if (opt.price > 0 && opt.mode !== 'replace' && opt.multiply_qty) {
                return sum + opt.price;
            }
            return sum;
        }, 0) ?? 0;

        const baseUnitPrice = Math.max(0, item.price - perUnitExtras);
        const quantity = item.quantity;
        const lineItemTotal = baseUnitPrice * quantity;

        const lineItem: LineItemPayload = {
            product_id: typeof item.id === 'string' ? parseInt(item.id.split('-')[0], 10) : Number(item.id),
            quantity,
            subtotal: lineItemTotal.toFixed(2),
            total: lineItemTotal.toFixed(2),
        };

        if (item.variationId) {
            lineItem.variation_id = item.variationId;
        }

        if (item.customOptions && item.customOptions.length > 0) {
            lineItem.meta_data = item.customOptions.map(opt => ({
                key: opt.name,
                value: opt.price > 0 ? `${opt.value} (+${opt.price} €)` : opt.value,
            }));
        }

        line_items.push(lineItem);

        if (item.customOptions) {
            item.customOptions.forEach(opt => {
                if (opt.price > 0 && opt.mode !== 'replace') {
                    const feeTotal = opt.multiply_qty ? (opt.price * quantity) : opt.price;
                    const currentVal = feeMap.get(opt.name) ?? 0;
                    feeMap.set(opt.name, currentVal + feeTotal);
                }
            });
        }
    });

    const fee_lines = Array.from(feeMap.entries()).map(([name, total]) => ({
        name,
        total: total.toFixed(2),
        tax_status: 'none',
    }));

    return { line_items, fee_lines };
}

// Schema de validação
const checkoutSchema = z.object({
    firstName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    lastName: z.string().min(2, 'O sobrenome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(9, 'Telefone inválido').max(15, 'Telefone muito longo'),
    nif: z.string().optional().refine(val => !val || /^[0-9]{9}$/.test(val), {
        message: 'NIF inválido (9 dígitos)'
    }),
    address: z.string().min(5, 'Endereço inválido'),
    doorNumber: z.string().optional(),
    city: z.string().min(2, 'Cidade inválida'),
    postalCode: z.string().regex(/^[0-9]{4}-[0-9]{3}$/, 'Formato inválido (XXXX-XXX)'),
    paymentMethod: z.string().min(1, 'Selecione um método de pagamento')
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gateways, setGateways] = useState<any[]>([]);
    const [isLoadingGateways, setIsLoadingGateways] = useState(true);
    const [showCardFields, setShowCardFields] = useState(false);
    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [shippingZones, setShippingZones] = useState<EnrichedShippingZone[]>([]);
    const [isLoadingShipping, setIsLoadingShipping] = useState(true);

    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

    // Dispara begin_checkout uma vez, quando a página abre com itens no carrinho
    React.useEffect(() => {
        if (items.length === 0) return;
        trackBeginCheckout(
            items.map(item => ({ item_id: item.productId, item_name: item.name, price: item.price, quantity: item.quantity })),
            totalPrice
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch payment gateways once on mount
    React.useEffect(() => {
        if (import.meta.env.SSR) return;

        const fetchGateways = async () => {
            try {
                let gw = await getPaymentGateways();
                // Remove gateways do plugin Klarna (substituídos pelo nosso fluxo HPP)
                // Remove duplicates e gateways não usados; scalapay é adicionado manualmente abaixo
                gw = gw.filter((g: any) => !['ppcp-card-button-gateway', 'klarna_payments', 'klarna-payments', 'kco', 'scalapay'].includes(g.id));
                gw = [
                    ...gw,
                    // { id: 'klarna-payments', title: 'Klarna', method_title: 'Pague depois ou em prestações' }, // OCULTO — aguarda decisão do cliente
                    { id: 'scalapay', title: 'Scalapay', method_title: 'Pague em 3 ou 4 prestações sem juros' },
                    { id: 'whatsapp', title: 'WhatsApp', method_title: 'Pagamento manual via WhatsApp' }
                ];
                setGateways(gw);
            } catch (error) {
                toast.error("Erro ao carregar os métodos de pagamento.");
            } finally {
                setIsLoadingGateways(false);
            }
        };
        fetchGateways();
    }, []);

    // Fetch shipping zones once on mount
    React.useEffect(() => {
        const fetchZones = async () => {
            setIsLoadingShipping(true);
            const zones = await fetchAllShippingZones();
            setShippingZones(zones);
            setIsLoadingShipping(false);
        };
        fetchZones();
    }, []);


    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isValid }
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            ...getSavedCheckoutData(),
            paymentMethod: 'whatsapp'
        },
        mode: 'onChange'
    });

    React.useEffect(() => {
        if (user) {
            setValue('firstName', user.billing?.first_name || user.first_name || '', { shouldValidate: true });
            setValue('lastName', user.billing?.last_name || user.last_name || '', { shouldValidate: true });
            setValue('email', user.billing?.email || user.email || '', { shouldValidate: true });
            if (user.billing?.phone) setValue('phone', user.billing.phone, { shouldValidate: true });
            if (user.billing?.address_1) setValue('address', user.billing.address_1, { shouldValidate: true });
            if (user.billing?.city) setValue('city', user.billing.city, { shouldValidate: true });
            if (user.billing?.postcode) setValue('postalCode', user.billing.postcode, { shouldValidate: true });
        }
    }, [user, setValue]);

    // Salva os dados do formulário no localStorage sempre que mudam
    React.useEffect(() => {
        const subscription = watch((value) => {
            saveCheckoutData(value as Partial<CheckoutFormData>);
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const selectedPaymentMethod = watch('paymentMethod');
    const currentPostalCode = watch('postalCode');

    // Reset card fields visibility when payment method changes
    React.useEffect(() => { setShowCardFields(false); }, [selectedPaymentMethod]);

    // Traduzir títulos dos gateways que vêm em inglês do plugin PayPal PPCP
    const translateGateway = (gateway: any) => {
        const titleMap: Record<string, { title: string; method_title: string }> = {
            'ppcp-credit-card-gateway': { title: 'Cartão de Débito ou Crédito', method_title: 'Processamento Avançado de Cartões' },
            'ppcp-gateway':             { title: 'PayPal', method_title: 'Pague com a sua conta PayPal' },
            'ppcp-multibanco':          { title: 'Multibanco', method_title: 'Referência gerada pelo PayPal' },
        };
        const override = titleMap[gateway.id];
        if (!override) return gateway;
        return { ...gateway, title: override.title, method_title: override.method_title };
    };

    // APMs via PayPal SDK que não fazem capture imediato (pagamento diferido)
    const APM_SOURCES = ['multibanco', 'mbway', 'mybank', 'blik', 'giropay', 'sofort', 'ideal', 'eps', 'bancontact', 'p24'];

    // Mapear os métodos de pagamento do WooCommerce (ppcp-*) para funding sources do react-paypal-js
    const getPayPalFundingSource = (gatewayId: string): string | null => {
        switch (gatewayId) {
            case 'ppcp-credit-card-gateway': return "card";
            case 'ppcp-gateway':
            case 'paypal':
                return "paypal";
            default:
                // ppcp-multibanco e outros APMs: fluxo WooCommerce (cria encomenda → sucesso)
                // O plugin PPCP envia a referência Multibanco por email e/ou via webhook
                return null;
        }
    };
    const currentFundingSource = getPayPalFundingSource(selectedPaymentMethod);

    // Calculate dynamic shipping based on postal code
    const matchedShippingMethod = matchShippingZoneWithMethod(currentPostalCode, shippingZones);
    // Cost may be absent on free-shipping or simple flat-rate methods — treat missing as 0
    const dynamicShippingCost = matchedShippingMethod !== null
        ? (parseFloat(matchedShippingMethod.settings?.cost?.value || '0') || 0)
        : null;
    const isShippingCalculated = matchedShippingMethod !== null;

    const finalTotal = totalPrice + (dynamicShippingCost || 0);

    // Format postal code automatically (e.g., 4000123 -> 4000-123)
    const formatPostalCode = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 4) return numbers;
        return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}`;
    };

    // Format phone automatically (+351 XXX XXX XXX or XXX XXX XXX)
    const formatPhone = (value: string) => {
        let cleaned = value.replace(/[^\d+]/g, '');
        if (cleaned.indexOf('+') > 0) {
            cleaned = cleaned.replace(/\+/g, '');
        }

        if (cleaned.startsWith('+351')) {
            const rest = cleaned.slice(4);
            if (rest.length === 0) return '+351 ';
            if (rest.length <= 3) return `+351 ${rest}`;
            if (rest.length <= 6) return `+351 ${rest.slice(0, 3)} ${rest.slice(3)}`;
            return `+351 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 9)}`;
        }

        if (!cleaned.startsWith('+')) {
            const rest = cleaned;
            if (rest.length <= 3) return rest;
            if (rest.length <= 6) return `${rest.slice(0, 3)} ${rest.slice(3)}`;
            return `${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 9)}`;
        }

        return cleaned;
    };

    const handleCepSearch = async () => {
        const cep = watch('postalCode');
        if (!cep || cep.length < 8) {
            toast.error('Por favor, insira um código postal válido (XXXX-XXX).');
            return;
        }

        // Check localStorage cache first to avoid hitting rate-limited APIs repeatedly
        const CACHE_KEY = `cep_cache_${cep}`;
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { street, city } = JSON.parse(cached) as { street: string; city: string };
                if (street) setValue('address', street, { shouldValidate: true, shouldDirty: true });
                if (city) setValue('city', city, { shouldValidate: true, shouldDirty: true });
                toast.success('Morada preenchida com sucesso!');
                return;
            }
        } catch {
            // ignore cache errors
        }

        setIsLoadingCep(true);

        let resolvedStreet = '';
        let resolvedCity = '';

        // --- API 1: GeoAPI (primary) ---
        try {
            const response = await fetch(`https://json.geoapi.pt/cp/${cep}`);
            if (response.ok) {
                const data = await response.json();
                const hasError = data.msg?.includes('limit') || data.Erro || data.Error
                    || (typeof data === 'string' && data.includes('Error'))
                    || (Array.isArray(data) && data.length === 0);
                if (!hasError) {
                    resolvedStreet = data.arteria || (data.ruas && data.ruas.length > 0 ? data.ruas[0] : '') || data['Designação Postal'] || '';
                    resolvedCity = data.Localidade || data.municipio || data.Concelho || '';
                }
            }
        } catch {
            // fall through to next API
        }

        // --- API 2: Nominatim / OpenStreetMap (first fallback, no rate limits for light use) ---
        if (!resolvedCity) {
            try {
                const nominatimUrl = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(cep)}&countrycodes=pt&format=json&limit=1&addressdetails=1`;
                const nomRes = await fetch(nominatimUrl, {
                    headers: { 'Accept-Language': 'pt' }
                });
                if (nomRes.ok) {
                    const nomData = await nomRes.json();
                    if (Array.isArray(nomData) && nomData.length > 0) {
                        const addr = nomData[0].address || {};
                        resolvedCity = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
                        if (!resolvedStreet) {
                            resolvedStreet = addr.road || addr.pedestrian || '';
                        }
                    }
                }
            } catch {
                // fall through to next API
            }
        }

        // --- API 3: Zippopotam.us (second fallback) ---
        // Expects code without dash: 4000001
        if (!resolvedCity) {
            try {
                const cepNoHyphen = cep.replace('-', '');
                const zipRes = await fetch(`https://api.zippopotam.us/PT/${cepNoHyphen}`);
                if (zipRes.ok) {
                    const zipData = await zipRes.json();
                    if (zipData.places && zipData.places.length > 0) {
                        resolvedCity = zipData.places[0]['place name'] || '';
                    }
                }
            } catch {
                // all APIs exhausted
            }
        }

        setIsLoadingCep(false);

        if (resolvedStreet || resolvedCity) {
            if (resolvedStreet) setValue('address', resolvedStreet, { shouldValidate: true, shouldDirty: true });
            if (resolvedCity) setValue('city', resolvedCity, { shouldValidate: true, shouldDirty: true });

            // Cache for future lookups
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({ street: resolvedStreet, city: resolvedCity }));
            } catch { /* ignore */ }

            if (resolvedStreet) {
                toast.success('Morada preenchida com sucesso!');
            } else {
                toast.success('Localidade preenchida. Por favor, complete a morada manualmente.', { duration: 5000 });
            }
        } else {
            toast.error('Não foi possível encontrar a morada. Por favor, preencha manualmente os campos.');
        }
    };

    const createOrder = (_data: any, actions: any) => {
        const formData = watch();
        return actions.order.create({
            payer: {
                name: {
                    given_name: formData.firstName,
                    surname: formData.lastName
                },
                email_address: formData.email,
                address: {
                    address_line_1: formData.address,
                    admin_area_2: formData.city,
                    postal_code: formData.postalCode,
                    country_code: 'PT'
                }
            },
            purchase_units: [
                {
                    amount: {
                        value: finalTotal.toFixed(2),
                        currency_code: 'EUR'
                    },
                    description: 'Encomenda PT Móveis',
                    shipping: {
                        name: {
                            full_name: `${formData.firstName} ${formData.lastName}`
                        },
                        address: {
                            address_line_1: formData.address,
                            admin_area_2: formData.city,
                            postal_code: formData.postalCode,
                            country_code: 'PT'
                        }
                    }
                }
            ]
        });
    };

    const onApprove = async (_data: any, actions: any) => {
        // APMs (Multibanco, etc.) têm pagamento diferido — não fazem capture imediato
        const isApm = APM_SOURCES.includes(_data.paymentSource ?? currentFundingSource ?? '');

        try {
            setIsSubmitting(true);

            // Só faz capture para pagamentos imediatos (cartão, PayPal wallet)
            const captureId = isApm ? _data.orderID : (await actions.order.capture()).id;

            const formData = watch();
            const { line_items, fee_lines } = prepareWooCommerceCart(items);
            const wooOrder = await createWooCommerceOrder({
                payment_method: selectedPaymentMethod,
                payment_method_title:
                    selectedPaymentMethod === 'ppcp-multibanco' ? 'Multibanco' :
                    selectedPaymentMethod === 'ppcp-credit-card-gateway' ? 'Cartões Bancários' : 'PayPal',
                set_paid: !isApm,
                billing: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    address_1: formData.address,
                    city: formData.city,
                    postcode: formData.postalCode,
                    country: 'PT',
                    email: formData.email,
                    phone: formData.phone,
                },
                shipping: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    address_1: formData.address,
                    city: formData.city,
                    postcode: formData.postalCode,
                    country: 'PT',
                },
                line_items,
                fee_lines,
                shipping_lines: [{
                    method_id: matchedShippingMethod ? matchedShippingMethod.method_id : 'flat_rate',
                    instance_id: matchedShippingMethod ? matchedShippingMethod.id.toString() : undefined,
                    method_title: matchedShippingMethod ? matchedShippingMethod.title : 'Envio',
                    total: (dynamicShippingCost || 0).toFixed(2),
                }],
                meta_data: [
                    { key: '_nif', value: formData.nif || '' },
                    { key: '_paypal_order_id', value: _data.orderID },
                    ...(isApm ? [] : [{ key: '_paypal_transaction_id', value: captureId }]),
                ]
            });

            toast.success(isApm ? 'Referência gerada! Siga as instruções para concluir o pagamento.' : 'Pagamento concluído com sucesso!');
            clearCart();
            navigate('/encomenda-concluida', { state: { orderId: String(wooOrder.id), total: finalTotal } });

        } catch (error) {
            toast.error('Ocorreu um erro ao processar seu pedido. Por favor, contacte o suporte.', {
                description: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = async (data: CheckoutFormData) => {
        if (items.length === 0) return;

        if (currentFundingSource) {
            toast.info("Por favor, clique no botão do PayPal/Cartão para concluir o pagamento.");
            return;
        }

        // Fluxo Klarna — usa o gateway configurado no WordPress (HPP/redirecionamento)
        if (data.paymentMethod === 'klarna-payments') {
            setIsSubmitting(true);
            try {
                const { line_items, fee_lines } = prepareWooCommerceCart(items);
                const orderData: any = {
                    payment_method: 'klarna_payments',
                    payment_method_title: 'Klarna',
                    set_paid: false,
                    billing: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        address_1: data.address,
                        city: data.city,
                        postcode: data.postalCode,
                        country: 'PT',
                        email: data.email,
                        phone: data.phone,
                    },
                    shipping: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        address_1: data.address,
                        city: data.city,
                        postcode: data.postalCode,
                        country: 'PT',
                    },
                    line_items,
                    fee_lines,
                    shipping_lines: [{
                        method_id: matchedShippingMethod ? matchedShippingMethod.method_id : 'flat_rate',
                        instance_id: matchedShippingMethod ? matchedShippingMethod.id.toString() : undefined,
                        method_title: matchedShippingMethod ? matchedShippingMethod.title : 'Envio',
                        total: (dynamicShippingCost || 0).toFixed(2),
                    }],
                    meta_data: [
                        { key: '_nif', value: data.nif || '' },
                        { key: '_klarna_flow', value: 'hpp_redirect' },
                    ]
                };

                // 1. Criar encomenda WooCommerce
                const response = await createWooCommerceOrder(orderData);

                try {
                    localStorage.setItem(
                        'klarna_pending_order',
                        JSON.stringify({ orderId: String(response.id), total: parseFloat(response.total) })
                    );
                } catch {
                    // ignore storage errors
                }

                // 2. Criar sessão HPP directamente no servidor (sem sessão KP intermédia)
                const hppUrl = await getKlarnaHppUrl(response.id);

                // 3. Redirecionar para https://pay.klarna.com/eu/hpp/payments/...
                window.location.href = hppUrl;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Erro ao processar pagamento Klarna.';
                toast.error(msg);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // Fluxo Scalapay — cria encomenda WooCommerce e redireciona para o portal de pagamento Scalapay
        if (data.paymentMethod === 'scalapay') {
            const scalapayProduct = 'pay-in-3';
            setIsSubmitting(true);
            try {
                // Normaliza o número de telefone: remove espaços e garante indicativo +351
                const rawPhone = (data.phone || '').replace(/\s+/g, '');
                const formattedPhone = rawPhone.startsWith('+')
                    ? rawPhone
                    : `+351${rawPhone.replace(/^00351/, '').replace(/^351/, '')}`;

                const fullName = `${data.firstName} ${data.lastName}`;
                const fullAddress = data.doorNumber
                    ? `${data.address}, ${data.doorNumber}`
                    : data.address;

                const { line_items, fee_lines } = prepareWooCommerceCart(items);
                const orderData: any = {
                    payment_method: 'scalapay',
                    payment_method_title: 'Scalapay',
                    set_paid: false,
                    billing: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        address_1: fullAddress,
                        city: data.city,
                        postcode: data.postalCode,
                        country: 'PT',
                        email: data.email,
                        phone: formattedPhone,
                    },
                    shipping: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        address_1: fullAddress,
                        city: data.city,
                        postcode: data.postalCode,
                        country: 'PT',
                        phone: formattedPhone,
                    },
                    line_items,
                    fee_lines,
                    shipping_lines: [{
                        method_id: matchedShippingMethod ? matchedShippingMethod.method_id : 'flat_rate',
                        instance_id: matchedShippingMethod ? matchedShippingMethod.id.toString() : undefined,
                        method_title: matchedShippingMethod ? matchedShippingMethod.title : 'Envio',
                        total: (dynamicShippingCost || 0).toFixed(2),
                    }],
                    meta_data: [
                        { key: '_nif', value: data.nif || '' },
                        { key: '_scalapay_flow', value: 'redirect' },
                    ]
                };

                const response = await createWooCommerceOrder(orderData);

                // Payload pré-formatado para o Scalapay CREATE ORDER (POST /v2/orders)
                const origin = window.location.origin;
                const scalapayOrderData: ScalapayOrderData = {
                    totalAmount: { amount: finalTotal.toFixed(2), currency: 'EUR' },
                    consumer: {
                        phoneNumber: formattedPhone,
                        givenNames: data.firstName,
                        surname: data.lastName,
                        email: data.email,
                    },
                    billing: {
                        name: fullName,
                        line1: fullAddress,
                        suburb: data.city,
                        postcode: data.postalCode,
                        countryCode: 'PT',
                        phoneNumber: formattedPhone,
                    },
                    shipping: {
                        name: fullName,
                        line1: fullAddress,
                        suburb: data.city,
                        postcode: data.postalCode,
                        countryCode: 'PT',
                        phoneNumber: formattedPhone,
                    },
                    items: items.map(item => {
                        const itemTotal = item.price * item.quantity + (item.flatExtras ?? 0);
                        const unitPrice = itemTotal / item.quantity;
                        return {
                            name: item.name,
                            sku: item.name,
                            quantity: item.quantity,
                            price: { amount: unitPrice.toFixed(2), currency: 'EUR' },
                        };
                    }),
                    merchant: {
                        redirectConfirmUrl: `${origin}/encomenda-concluida`,
                        redirectCancelUrl: `${origin}/checkout`,
                    },
                    merchantReference: String(response.id),
                    taxAmount: { amount: '0.00', currency: 'EUR' },
                    shippingAmount: { amount: (dynamicShippingCost || 0).toFixed(2), currency: 'EUR' },
                    type: 'online',
                    product: scalapayProduct,
                };

                try {
                    localStorage.setItem(
                        'scalapay_pending_order',
                        JSON.stringify({ orderId: String(response.id), total: parseFloat(response.total), orderData: scalapayOrderData })
                    );
                } catch {
                    // ignore storage errors
                }

                const checkoutUrl = await getScalapayCheckoutUrl(response.id, scalapayOrderData);
                window.location.href = checkoutUrl;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Erro ao processar pagamento Scalapay.';
                toast.error(msg);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // For WhatsApp, we keep the manual flow
        if (data.paymentMethod === 'whatsapp') {
            setIsSubmitting(true);
            try {
                const phoneNumber = '351939076117';

                let message = `*NOVA ENCOMENDA - PT Móveis*\n\n`;
                message += `*DADOS DO CLIENTE*\n`;
                message += `Nome: ${data.firstName} ${data.lastName}\n`;
                message += `Email: ${data.email}\n`;
                message += `Telefone: ${data.phone}\n`;
                if (data.nif) message += `NIF: ${data.nif}\n`;

                message += `\n*MORADA DE ENTREGA*\n`;
                message += `${data.address}\n`;
                message += `${data.postalCode} ${data.city}\n`;

                message += `\n*ARTIGOS*\n`;
                items.forEach(item => {
                    message += `- ${item.quantity}x ${item.name}`;
                    if (item.selectedAttributes) message += ` (${item.selectedAttributes})`;
                    message += ` - ${item.price.toFixed(2)} €\n`;
                    if (item.customOptions && item.customOptions.length > 0) {
                        item.customOptions.forEach((opt: any) => {
                            message += `  * ${opt.name}: ${opt.value}${opt.price > 0 ? ` (+${opt.price.toFixed(2)} €)` : ''}\n`;
                        });
                    }
                    if (item.flatExtras && item.flatExtras > 0) {
                        message += `  * Opções Fixas: +${item.flatExtras.toFixed(2)} €\n`;
                    }
                });

                message += `\n*RESUMO*\n`;
                message += `Subtotal: ${totalPrice.toFixed(2)} €\n`;
                message += `Portes: ${dynamicShippingCost === null ? 'A calcular' : `${dynamicShippingCost.toFixed(2)} €`}\n`;
                message += `*TOTAL: ${finalTotal.toFixed(2)} €*\n`;

                const encodedMessage = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

                clearCart();
                window.open(whatsappUrl, '_blank');
                navigate('/encomenda-concluida', { state: { orderId: 'whatsapp', total: finalTotal } });
                return;

            } catch (error) {
                toast.error('Ocorreu um erro ao processar seu pedido.');
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedGateway = gateways.find(g => g.id === selectedPaymentMethod);
            const { line_items, fee_lines } = prepareWooCommerceCart(items);

            const orderData = {
                payment_method: selectedGateway?.id || selectedPaymentMethod,
                payment_method_title: selectedGateway?.title || selectedPaymentMethod,
                set_paid: false, // Standard payments wait for gateway processing
                billing: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    address_1: data.address,
                    city: data.city,
                    postcode: data.postalCode,
                    country: 'PT',
                    email: data.email,
                    phone: data.phone,
                },
                shipping: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    address_1: data.address,
                    city: data.city,
                    postcode: data.postalCode,
                    country: 'PT',
                },
                line_items,
                fee_lines,
                shipping_lines: [
                    {
                        method_id: matchedShippingMethod ? matchedShippingMethod.method_id : 'flat_rate',
                        instance_id: matchedShippingMethod ? matchedShippingMethod.id.toString() : undefined,
                        method_title: matchedShippingMethod ? matchedShippingMethod.title : 'Envio',
                        total: (dynamicShippingCost || 0).toFixed(2),
                    }
                ],
                meta_data: [
                    {
                        key: '_nif',
                        value: data.nif || ''
                    }
                ]
            };

            const response = await createWooCommerceOrder(orderData);

            if (response.payment_url) {
                // Chamar endpoint WordPress que processa o pagamento e devolve o URL real (PayPal/PPRO)
                // O utilizador é redirecionado diretamente para a página de pagamento, sem passar pelo WordPress
                const redirectUrl = await getApmRedirectUrl(response.id);
                clearCart();
                window.location.href = redirectUrl;
                return;
            }

            clearCart();
            toast.success('Encomenda criada com sucesso!');
            navigate('/encomenda-concluida', { state: { orderId: String(response.id), total: parseFloat(response.total) } });

        } catch (error) {
            toast.error('Ocorreu um erro ao criar a encomenda.', {
                description: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 flex flex-col items-center justify-center p-4">
                <Helmet>
                    <title>Checkout | PT Móveis</title>
                </Helmet>
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat' }}>Carrinho Vazio</h2>
                <p className="text-gray-500 mb-6 text-center max-w-md">Para prosseguir com o pagamento, adicione produtos ao seu carrinho de compras.</p>
                <Button onClick={() => navigate('/produtos')} className="bg-[#1E3A5F] hover:bg-[#2E5A8F]">
                    Continuar a comprar
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gray-50 pt-24 lg:pt-32 pb-20">
            <Helmet>
                <title>Checkout | PT Móveis</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <PayPalScriptProvider options={{
                clientId: paypalClientId,
                currency: "EUR",
                intent: "capture",
                components: "buttons,funding-eligibility,card-fields"
            }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 hover:text-[#D4AF37] transition-colors mb-4 lg:mb-6"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Voltar
                    </button>

                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F] mb-6 lg:mb-8" style={{ fontFamily: 'Montserrat' }}>Finalizar Compra</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full max-w-full">

                        {/* Formulário Principal */}
                        <div className="lg:col-span-7 xl:col-span-8 bg-white p-5 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 order-2 lg:order-1">
                            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">

                                {/* Informações Pessoais */}
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-sm">1</span>
                                        Dados Pessoais
                                    </h2>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Nome *</label>
                                            <input
                                                {...register('firstName')}
                                                className={`w-full p-3 rounded-xl border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                placeholder="João"
                                            />
                                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Sobrenome *</label>
                                            <input
                                                {...register('lastName')}
                                                className={`w-full p-3 rounded-xl border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                placeholder="Silva"
                                            />
                                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-medium text-gray-700">Email *</label>
                                            <input
                                                {...register('email')}
                                                type="email"
                                                className={`w-full p-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                placeholder="joao.silva@exemplo.pt"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Telefone *</label>
                                            <Controller
                                                name="phone"
                                                control={control}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                                                        maxLength={16}
                                                        className={`w-full p-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                        placeholder="+351 912 345 678"
                                                    />
                                                )}
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                NIF
                                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">Opcional</span>
                                            </label>
                                            <input
                                                {...register('nif')}
                                                maxLength={9}
                                                className={`w-full p-3 rounded-xl border ${errors.nif ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                placeholder="123456789"
                                            />
                                            {errors.nif && <p className="text-red-500 text-xs mt-1">{errors.nif.message}</p>}
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                {/* Endereço de Entrega */}
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-sm">2</span>
                                        Morada de Entrega
                                    </h2>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2 sm:col-span-2">
                                            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-xl mb-2 flex items-start gap-2 sm:gap-3">
                                                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs sm:text-sm font-medium text-blue-900">Verifique a taxa de entrega</p>
                                                    <p className="text-xs sm:text-sm text-blue-700 mt-0.5 sm:mt-1 hidden sm:block">Busque pelo seu código postal primeiro para preencher sua morada e calcular a taxa de envio da sua região.</p>
                                                    <p className="text-xs text-blue-700 mt-0.5 sm:hidden">Insira o código postal para calcular o envio.</p>
                                                </div>
                                            </div>
                                            <label className="text-sm font-medium text-gray-700">Código Postal *</label>
                                            <Controller
                                                name="postalCode"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex gap-2">
                                                        <input
                                                            {...field}
                                                            onChange={(e) => field.onChange(formatPostalCode(e.target.value))}
                                                            maxLength={8}
                                                            className={`w-full min-w-0 p-3 rounded-xl border ${errors.postalCode ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                            placeholder="4000-123"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={handleCepSearch}
                                                            disabled={isLoadingCep}
                                                            className="bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white whitespace-nowrap px-3 sm:px-6 rounded-xl shrink-0 h-[50px]"
                                                        >
                                                            {isLoadingCep ? (
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Search className="w-4 h-4 sm:mr-2" />
                                                                    <span className="hidden sm:inline">Buscar morada</span>
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            />
                                            {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-medium text-gray-700">Rua / Avenida *</label>
                                            <input
                                                {...register('address')}
                                                className={`w-full p-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                placeholder="Rua da Alegria"
                                            />
                                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Nº de Porta</label>
                                            <input
                                                {...register('doorNumber')}
                                                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                                                placeholder="123, 4º Esq"
                                            />
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-medium text-gray-700">Localidade *</label>
                                            <input
                                                {...register('city')}
                                                className={`w-full p-3 rounded-xl border ${errors.city ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                placeholder="Porto"
                                            />
                                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                                        </div>
                                    </div>
                                </section>

                                {/* Método de Pagamento */}
                                <hr className="border-gray-100" />
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-sm">3</span>
                                        Método de Pagamento
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {isLoadingGateways ? (
                                            <div className="col-span-full py-8 flex justify-center text-gray-400">
                                                <span className="w-8 h-8 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            gateways.map((gateway) => (
                                                <label key={gateway.id} className={`cursor-pointer rounded-xl border p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition-all ${selectedPaymentMethod === gateway.id ? 'border-[#1E3A5F] bg-[#1E3A5F]/5 ring-2 ring-[#1E3A5F]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                                                    <input type="radio" value={gateway.id} {...register('paymentMethod')} className="sr-only" />
                                                    <div className="text-[#1E3A5F]">
                                                        {gateway.id === 'klarna-payments' ? (
                                                            // Klarna official pink 'K' logo
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="#FFB3C7">
                                                                <path d="M20 0H4C1.8 0 0 1.8 0 4v16c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V4c0-2.2-1.8-4-4-4zm-8.4 17.5h-2.1V6.5h2.1v11zm4.3 0h-2V15c0-1.4-.6-2.7-1.7-3.6l1.4-1.5c1.5 1.2 2.3 3 2.3 4.9v2.7zm1.6-8.6c-.8-.9-1.7-1.6-2.8-2.1l1-1.8c1.4.7 2.6 1.7 3.5 2.9l-1.7 1z" />
                                                            </svg>
                                                        ) : gateway.id === 'whatsapp' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M11.944 0A12 12 0 0 0 4.5 20.66l-1.22 4.46a.5.5 0 0 0 .61.61l4.46-1.22A12 12 0 1 0 11.944 0zm0 21.9a9.92 9.92 0 0 1-5.07-1.39l-.36-.21-3.23.88.88-3.23-.21-.36a9.94 9.94 0 1 1 8-15.63 9.87 9.87 0 0 1 5.6 15.11 9.92 9.92 0 0 1-5.61 4.83zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.18.2-.35.23-.65.08a8.21 8.21 0 0 1-2.42-1.5 8.98 8.98 0 0 1-1.68-2.09c-.18-.3.02-.46.16-.61.13-.13.3-.35.45-.52.15-.18.2-.29.3-.49.1-.2.05-.38-.03-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.08-.79.35-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.09 3.2 5.07 4.48.71.3 1.26.48 1.69.62.71.22 1.36.19 1.87.11.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.08-.12-.27-.2-.57-.35z" />
                                                            </svg>
                                                        ) : (
                                                            <GatewayIcon id={gateway.id} />
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-gray-900 font-montserrat text-center text-xs sm:text-sm">{translateGateway(gateway).title}</span>
                                                    <span className="text-[10px] sm:text-xs text-gray-500 text-center leading-tight line-clamp-2">{translateGateway(gateway).method_title || 'Pagamento seguro'}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                <div className="pt-4">
                                    {selectedPaymentMethod === 'whatsapp' ? (
                                        <Button
                                            type="submit"
                                            form="checkout-form"
                                            disabled={isSubmitting || isLoadingShipping || !isShippingCalculated}
                                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 sm:py-6 rounded-xl text-base sm:text-lg relative disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    A processar...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M11.944 0A12 12 0 0 0 4.5 20.66l-1.22 4.46a.5.5 0 0 0 .61.61l4.46-1.22A12 12 0 1 0 11.944 0zm0 21.9a9.92 9.92 0 0 1-5.07-1.39l-.36-.21-3.23.88.88-3.23-.21-.36a9.94 9.94 0 1 1 8-15.63 9.87 9.87 0 0 1 5.6 15.11 9.92 9.92 0 0 1-5.61 4.83zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.18.2-.35.23-.65.08a8.21 8.21 0 0 1-2.42-1.5 8.98 8.98 0 0 1-1.68-2.09c-.18-.3.02-.46.16-.61.13-.13.3-.35.45-.52.15-.18.2-.29.3-.49.1-.2.05-.38-.03-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.08-.79.35-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.09 3.2 5.07 4.48.71.3 1.26.48 1.69.62.71.22 1.36.19 1.87.11.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.08-.12-.27-.2-.57-.35z" />
                                                    </svg>
                                                    Finalizar no WhatsApp
                                                </span>
                                            )}
                                        </Button>
                                    ) : selectedPaymentMethod === 'klarna-payments' ? (
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-500 text-center">
                                                Será redirecionado para a página segura da Klarna após confirmar a encomenda.
                                            </p>
                                            <Button
                                                type="submit"
                                                form="checkout-form"
                                                disabled={isSubmitting || isLoadingShipping || !isShippingCalculated || !isValid}
                                                className="w-full font-bold py-4 sm:py-6 rounded-xl text-base sm:text-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                style={{ backgroundColor: '#FFB3C7', color: '#1a1a1a' }}
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                                                        A processar com Klarna…
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2 font-semibold">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#1a1a1a">
                                                            <path d="M20 0H4C1.8 0 0 1.8 0 4v16c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V4c0-2.2-1.8-4-4-4zm-8.4 17.5h-2.1V6.5h2.1v11zm4.3 0h-2V15c0-1.4-.6-2.7-1.7-3.6l1.4-1.5c1.5 1.2 2.3 3 2.3 4.9v2.7zm1.6-8.6c-.8-.9-1.7-1.6-2.8-2.1l1-1.8c1.4.7 2.6 1.7 3.5 2.9l-1.7 1z" />
                                                        </svg>
                                                        Pagar com Klarna
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    ) : selectedPaymentMethod === 'scalapay' ? (
                                        <div className="space-y-3">
                                            <Button
                                                type="submit"
                                                form="checkout-form"
                                                disabled={isSubmitting || isLoadingShipping || !isShippingCalculated || !isValid}
                                                className="w-full font-bold py-4 sm:py-6 rounded-xl text-base sm:text-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed border hover:bg-gray-50"
                                                style={{ backgroundColor: '#ffffff', color: '#1a1a1a', borderColor: '#e5e7eb' }}
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-700 rounded-full animate-spin" />
                                                        A processar com Scalapay…
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2 font-semibold">
                                                        <img src="/scalapay-logo-black.svg" alt="Scalapay" style={{ height: 36, width: 'auto' }} />
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    ) : currentFundingSource ? (
                                        <div className="space-y-3">
                                            {!isValid ? (
                                                <Button
                                                    type="button"
                                                    onClick={() => handleSubmit(onSubmit)()}
                                                    className="w-full bg-[#00457C] hover:bg-[#00335c] text-white font-bold py-4 sm:py-6 rounded-xl text-base sm:text-lg relative"
                                                >
                                                    <span className="flex items-center justify-center gap-2">
                                                        Preencha os dados para pagar com {currentFundingSource === 'card' ? 'Cartão' : 'PayPal'}
                                                    </span>
                                                </Button>
                                            ) : currentFundingSource === 'card' && !showCardFields ? (
                                                <Button
                                                    type="button"
                                                    disabled={isSubmitting || isLoadingShipping || !isShippingCalculated}
                                                    onClick={() => setShowCardFields(true)}
                                                    className="w-full bg-[#1C1E21] hover:bg-[#3a3d42] text-white font-bold py-4 sm:py-6 rounded-xl text-base sm:text-lg flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    <CreditCard className="w-5 h-5" />
                                                    Pagar com Cartão
                                                </Button>
                                            ) : (
                                                <div className="w-full max-w-full overflow-hidden">
                                                    <PayPalButtons
                                                        key={currentFundingSource}
                                                        fundingSource={currentFundingSource as any}
                                                        style={{ layout: "vertical", shape: "rect", label: "pay" }}
                                                        createOrder={createOrder}
                                                        onApprove={onApprove}
                                                        disabled={isSubmitting || isLoadingShipping || !isValid || !isShippingCalculated}
                                                        forceReRender={[currentFundingSource, finalTotal, isValid, dynamicShippingCost]}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Button
                                            type="submit"
                                            form="checkout-form"
                                            disabled={isSubmitting || isLoadingShipping || !selectedPaymentMethod || !isShippingCalculated}
                                            className="w-full bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white font-bold py-4 sm:py-6 rounded-xl text-base sm:text-lg relative transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    A processar...
                                                </span>
                                            ) : isLoadingShipping ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    A calcular envio...
                                                </span>
                                            ) : !isShippingCalculated ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    Calcule a taxa de envio
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    Finalizar Encomenda
                                                </span>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Resumo do Pedido */}
                        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 order-1 lg:order-2 mb-6 lg:mb-0">
                            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 lg:gap-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-montserrat">Resumo do Pedido</h2>

                                <div className="space-y-4 max-h-[40vh] lg:max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                                {item.selectedAttributes && (
                                                    <p className="text-xs text-gray-500 truncate">{item.selectedAttributes}</p>
                                                )}
                                                {item.customOptions && item.customOptions.length > 0 && (
                                                    <div className="mt-0.5 flex flex-col gap-0.5">
                                                        {item.customOptions.map((opt: any, idx: number) => (
                                                            <p key={idx} className="text-xs text-gray-500 truncate">
                                                                {opt.name}: {opt.value} {opt.price > 0 && `(+${opt.price.toFixed(2)} €)`}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.flatExtras && item.flatExtras > 0 ? (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Opções fixas: +{item.flatExtras.toFixed(2)} €
                                                    </p>
                                                ) : null}
                                                <p className="text-sm text-gray-600 mt-0.5">{item.quantity} × {item.price.toFixed(2)} €</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <hr className="border-gray-100" />

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-900">{totalPrice.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Portes de Envio</span>
                                        <span className="font-medium text-gray-900">
                                            {isLoadingShipping ? (
                                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                                    <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin inline-block" />
                                                    A calcular...
                                                </span>
                                            ) : !isShippingCalculated ? (
                                                <span className="text-red-500 text-xs font-semibold">Informe o código postal</span>
                                            ) : (
                                                `${(dynamicShippingCost || 0).toFixed(2)} €`
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                <div className="flex justify-between items-end">
                                    <span className="text-gray-900 font-bold text-base sm:text-lg">Total</span>
                                    <span id="scalapay-checkout-price" className="text-2xl sm:text-3xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                                        {finalTotal.toFixed(2)} €
                                    </span>
                                </div>
                                <div className="w-full max-w-full overflow-hidden">
                                    <ScalapayWidget amountSelector="#scalapay-checkout-price" type="checkout" visible={finalTotal > 0} />
                                </div>

                                {/* <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                                <Truck className="w-4 h-4" />
                                <span>Portes   em compras superiores a 500€</span>
                            </div> */}
                            </div>
                        </div>

                    </div>
                </div>

            </PayPalScriptProvider>

        </div>
    );
}
