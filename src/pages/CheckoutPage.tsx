import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ChevronLeft, ShoppingBag, CreditCard, Smartphone, Banknote, Search, Loader2 } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { createWooCommerceOrder, getPaymentGateways, getKlarnaHppUrl, initKlarnaSession } from '@/services/wordpress';
import { fetchAllShippingZones, matchShippingZoneWithMethod, type EnrichedShippingZone } from '@/utils/shipping';

// Dialog (Modal) Components for the Iframe Payment
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const GatewayIcon = ({ id }: { id: string }) => {
    if (id.includes('paypal')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a2.008 2.008 0 0 0-1.967 1.688l-1.385 8.784-.046.33a.64.64 0 0 0 .63.74H10.19a.636.636 0 0 0 .627-.541l.889-5.65c.081-.518.525-.9 1.05-.9h.244c4.332 0 7.625-1.742 8.604-6.756.241-1.229.074-2.731-.382-4.609z" />
            </svg>
        );
    }
    if (id.includes('card') || id.includes('stripe')) return <CreditCard size={32} />;
    if (id.includes('mbway')) return <Smartphone size={32} />;
    if (id.includes('multibanco')) return <Banknote size={32} />;

    // Default fallback
    return <CreditCard size={32} />;
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
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [showCardFields, setShowCardFields] = useState(false);
    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [shippingZones, setShippingZones] = useState<EnrichedShippingZone[]>([]);
    const [isLoadingShipping, setIsLoadingShipping] = useState(true);
    const pendingOrderRef = React.useRef<{ id: string, total: number } | null>(null);

    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

    // Fetch payment gateways once on mount
    React.useEffect(() => {
        if (import.meta.env.SSR) return;

        const fetchGateways = async () => {
            try {
                let gw = await getPaymentGateways();
                gw = gw.filter((g: any) => g.id !== 'ppcp-card-button-gateway');
                gw = [
                    ...gw,
                    { id: 'klarna-payments', title: 'Klarna', method_title: 'Pague depois ou em prestações' },
                    { id: 'whatsapp', title: 'WhatsApp', method_title: 'Pagamento manual via WhatsApp' }
                ];
                setGateways(gw);
            } catch (error) {
                console.error("Error fetching gateways:", error);
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

    // Listen for iframe payment completion
    React.useEffect(() => {
        const handleIframeMessage = (event: MessageEvent) => {
            if (event.data === 'payment_complete') {
                setPaymentModalOpen(false);
                toast.success('Pagamento concluído com sucesso!');
                clearCart();
                if (pendingOrderRef.current) {
                    navigate('/encomenda-concluida', { state: { orderId: pendingOrderRef.current.id, total: pendingOrderRef.current.total } });
                } else {
                    navigate('/encomenda-concluida', { state: { orderId: 'pending' } });
                }
            }
        };

        window.addEventListener('message', handleIframeMessage);
        return () => window.removeEventListener('message', handleIframeMessage);
    }, [navigate, clearCart]);

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
        };
        const override = titleMap[gateway.id];
        if (!override) return gateway;
        return { ...gateway, title: override.title, method_title: override.method_title };
    };

    // Mapear os métodos de pagamento do WooCommerce (ppcp-*) para funding sources do react-paypal-js
    const getPayPalFundingSource = (gatewayId: string): string | null => {
        switch (gatewayId) {
            case 'ppcp-credit-card-gateway': return "card";
            case 'ppcp-gateway':
            case 'paypal':
                return "paypal";
            default:
                // Multibanco, MBWay, etc. — fluxo padrão do WooCommerce (modal iframe)
                return null;
        }
    };
    const currentFundingSource = getPayPalFundingSource(selectedPaymentMethod);

    // Calculate dynamic shipping based on postal code
    const matchedShippingMethod = matchShippingZoneWithMethod(currentPostalCode, shippingZones);
    const dynamicShippingCost = matchedShippingMethod && matchedShippingMethod.settings.cost ? parseFloat(matchedShippingMethod.settings.cost.value) : null;
    const isShippingCalculated = dynamicShippingCost !== null;

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

        setIsLoadingCep(true);
        try {
            const response = await fetch(`https://json.geoapi.pt/cp/${cep}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar o código postal.');
            }
            const data = await response.json();

            // Check for rate limit message or errors
            if (data.msg?.includes('limit') || data.Erro || data.Error || (typeof data === 'string' && data.includes('Error')) || (Array.isArray(data) && data.length === 0)) {
                throw new Error('Limite de uso da API atingido ou CEP não encontrado.');
            }

            const street = data.arteria || (data.ruas && data.ruas.length > 0 ? data.ruas[0] : '') || data['Designação Postal'] || '';
            const city = data.Localidade || data.municipio || data.Concelho || '';

            if (!street && !city) {
                throw new Error('Detalhes do código postal não encontrados na base principal.');
            }

            if (street) {
                setValue('address', street, { shouldValidate: true, shouldDirty: true });
            }
            if (city) {
                setValue('city', city, { shouldValidate: true, shouldDirty: true });
            }

            toast.success('Morada preenchida com sucesso!');
        } catch (error) {
            console.warn('GeoAPI falhou. Tentando fallback para Zippopotam.us...', error);

            // Fallback to Zippopotam.us
            try {
                const fallbackResponse = await fetch(`https://api.zippopotam.us/PT/${cep}`);
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData.places && fallbackData.places.length > 0) {
                        const city = fallbackData.places[0]['place name'];
                        setValue('city', city, { shouldValidate: true, shouldDirty: true });
                        // We only have city, not street
                        toast.success('Localidade preenchida. Por favor, digite o restante da morada manualmente.', { duration: 5000 });
                        return; // Exit successfully from fallback
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback Zippopotamus falhou:', fallbackError);
            }

            toast.error('Não foi possível encontrar a morada automaticamente. Por favor, preencha manualmente os campos.');
        } finally {
            setIsLoadingCep(false);
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
        try {
            setIsSubmitting(true);
            const details = await actions.order.capture();

            const formData = watch();

            const orderData = {
                payment_method: selectedPaymentMethod,
                payment_method_title: selectedPaymentMethod === 'ppcp-multibanco' ? 'Multibanco' :
                    selectedPaymentMethod === 'ppcp-credit-card-gateway' ? 'Cartões Bancários' : 'PayPal',
                set_paid: true,
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
                line_items: items.map(item => {
                    const line: any = {
                        product_id: typeof item.id === 'string' ? parseInt(item.id.split('-')[0], 10) : Number(item.id),
                        quantity: item.quantity,
                    };
                    if (item.variationId) {
                        line.variation_id = item.variationId;
                    }
                    if (item.customOptions && item.customOptions.length > 0) {
                        line.meta_data = item.customOptions.map(opt => ({
                            key: opt.name,
                            value: opt.price > 0 ? `${opt.value} (+${opt.price} €)` : opt.value
                        }));
                    }
                    return line;
                }),
                shipping_lines: [
                    {
                        method_id: matchedShippingMethod ? matchedShippingMethod.id.toString() : 'flat_rate',
                        method_title: matchedShippingMethod ? matchedShippingMethod.title : 'Envio',
                        total: (dynamicShippingCost || 0).toFixed(2),
                    }
                ],
                meta_data: [
                    {
                        key: '_nif',
                        value: formData.nif || ''
                    },
                    {
                        key: '_paypal_transaction_id',
                        value: details.id
                    }
                ]
            };

            const wooOrder = await createWooCommerceOrder(orderData);

            toast.success(`Pagamento concluído com sucesso!`);
            clearCart();

            navigate('/encomenda-concluida', { state: { orderId: String(wooOrder.id), total: finalTotal } });

        } catch (error) {
            console.error('Erro ao processar pedido', error);
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
                    line_items: items.map(item => {
                        const line: any = {
                            product_id: typeof item.id === 'string' ? parseInt(item.id.split('-')[0], 10) : Number(item.id),
                            quantity: item.quantity,
                        };
                        if (item.variationId) line.variation_id = item.variationId;
                        if (item.customOptions && item.customOptions.length > 0) {
                            line.meta_data = item.customOptions.map(opt => ({
                                key: opt.name,
                                value: opt.price > 0 ? `${opt.value} (+${opt.price} €)` : opt.value,
                            }));
                        }
                        return line;
                    }),
                    shipping_lines: [{
                        method_id: matchedShippingMethod ? matchedShippingMethod.id.toString() : 'flat_rate',
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

                // 2. Criar sessão Klarna no servidor → obtém client_token + session_id
                const { client_token, session_id } = await initKlarnaSession(response.id);

                // 3. Browser inicializa o SDK Klarna com o client_token (reclama a sessão)
                await new Promise<void>((resolve, reject) => {
                    let attempts = 0;
                    const poll = setInterval(() => {
                        attempts++;
                        if (window.Klarna?.Payments) {
                            clearInterval(poll);
                            try {
                                window.Klarna!.Payments.init({ client_token });
                                resolve();
                            } catch (e) {
                                reject(e);
                            }
                        } else if (attempts > 50) {
                            clearInterval(poll);
                            reject(new Error('Klarna SDK não carregou.'));
                        }
                    }, 100);
                });

                // 4. Obter URL HPP usando a sessão já reclamada pelo browser
                const hppUrl = await getKlarnaHppUrl(response.id, session_id);

                // 5. Redirecionar para https://pay.klarna.com/eu/hpp/payments/...
                window.location.href = hppUrl;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Erro ao processar pagamento Klarna.';
                toast.error(msg);
                console.error('❌ Klarna onSubmit:', err);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // For WhatsApp, we keep the manual flow
        if (data.paymentMethod === 'whatsapp') {
            setIsSubmitting(true);
            try {
                const phoneNumber = '351910000000'; // FIXME: Replace with actual

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
                console.error('Erro ao processar pedido via WhatsApp', error);
                toast.error('Ocorreu um erro ao processar seu pedido.');
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedGateway = gateways.find(g => g.id === selectedPaymentMethod);

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
                line_items: items.map(item => {
                    const line: any = {
                        product_id: typeof item.id === 'string' ? parseInt(item.id.split('-')[0], 10) : Number(item.id),
                        quantity: item.quantity,
                    };
                    if (item.variationId) {
                        line.variation_id = item.variationId;
                    }
                    if (item.customOptions && item.customOptions.length > 0) {
                        line.meta_data = item.customOptions.map(opt => ({
                            key: opt.name,
                            value: opt.price > 0 ? `${opt.value} (+${opt.price} €)` : opt.value
                        }));
                    }
                    return line;
                }),
                shipping_lines: [
                    {
                        method_id: matchedShippingMethod ? matchedShippingMethod.id.toString() : 'flat_rate',
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
            pendingOrderRef.current = { id: String(response.id), total: parseFloat(response.total) };

            // For fallback gateways (Multibanco, etc.), load the WooCommerce payment URL in an Iframe Modal
            if (response.payment_url) {
                setPaymentUrl(response.payment_url);
                setPaymentModalOpen(true);
            } else {
                // Otherwise fallback to success routing directly
                clearCart();
                toast.success('Encomenda criada com sucesso!');
                navigate('/encomenda-concluida', { state: { orderId: String(response.id), total: parseFloat(response.total) } });
            }

        } catch (error) {
            console.error('Erro ao processar pedido', error);
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
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
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
                        className="flex items-center text-gray-500 hover:text-[#D4AF37] transition-colors mb-6"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Voltar
                    </button>

                    <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8" style={{ fontFamily: 'Montserrat' }}>Finalizar Compra</h1>

                    <div className="grid lg:grid-cols-12 gap-8 items-start">

                        {/* Formulário Principal */}
                        <div className="lg:col-span-7 xl:col-span-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

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
                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-2 flex items-start gap-3">
                                                <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-900">Verifique a taxa de entrega</p>
                                                    <p className="text-sm text-blue-700 mt-1">Busque pelo seu código postal primeiro para preencher sua morada e calcular a taxa de envio da sua região.</p>
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
                                                            className={`w-full p-3 rounded-xl border ${errors.postalCode ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                            placeholder="4000-123"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={handleCepSearch}
                                                            disabled={isLoadingCep}
                                                            className="bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white whitespace-nowrap px-6 rounded-xl shrink-0 h-[50px]"
                                                        >
                                                            {isLoadingCep ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                                                            Buscar morada
                                                        </Button>
                                                    </div>
                                                )}
                                            />
                                            {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-medium text-gray-700">Endereço Completo *</label>
                                            <input
                                                {...register('address')}
                                                className={`w-full p-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                placeholder="Rua da Alegria, nº 123, 4º Esq"
                                            />
                                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {isLoadingGateways ? (
                                            <div className="col-span-full py-8 flex justify-center text-gray-400">
                                                <span className="w-8 h-8 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            gateways.map((gateway) => (
                                                <label key={gateway.id} className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center gap-2 transition-all ${selectedPaymentMethod === gateway.id ? 'border-[#1E3A5F] bg-[#1E3A5F]/5 ring-2 ring-[#1E3A5F]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                                                    <input type="radio" value={gateway.id} {...register('paymentMethod')} className="sr-only" />
                                                    <div className="text-[#1E3A5F]">
                                                        {gateway.id === 'klarna-payments' ? (
                                                            // Klarna official pink 'K' logo
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#FFB3C7">
                                                                <path d="M20 0H4C1.8 0 0 1.8 0 4v16c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V4c0-2.2-1.8-4-4-4zm-8.4 17.5h-2.1V6.5h2.1v11zm4.3 0h-2V15c0-1.4-.6-2.7-1.7-3.6l1.4-1.5c1.5 1.2 2.3 3 2.3 4.9v2.7zm1.6-8.6c-.8-.9-1.7-1.6-2.8-2.1l1-1.8c1.4.7 2.6 1.7 3.5 2.9l-1.7 1z" />
                                                            </svg>
                                                        ) : gateway.id === 'whatsapp' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M11.944 0A12 12 0 0 0 4.5 20.66l-1.22 4.46a.5.5 0 0 0 .61.61l4.46-1.22A12 12 0 1 0 11.944 0zm0 21.9a9.92 9.92 0 0 1-5.07-1.39l-.36-.21-3.23.88.88-3.23-.21-.36a9.94 9.94 0 1 1 8-15.63 9.87 9.87 0 0 1 5.6 15.11 9.92 9.92 0 0 1-5.61 4.83zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.18.2-.35.23-.65.08a8.21 8.21 0 0 1-2.42-1.5 8.98 8.98 0 0 1-1.68-2.09c-.18-.3.02-.46.16-.61.13-.13.3-.35.45-.52.15-.18.2-.29.3-.49.1-.2.05-.38-.03-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.08-.79.35-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.09 3.2 5.07 4.48.71.3 1.26.48 1.69.62.71.22 1.36.19 1.87.11.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.08-.12-.27-.2-.57-.35z" />
                                                            </svg>
                                                        ) : (
                                                            <GatewayIcon id={gateway.id} />
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-gray-900 font-montserrat text-center">{translateGateway(gateway).title}</span>
                                                    <span className="text-xs text-gray-500 text-center">{translateGateway(gateway).method_title || 'Pagamento seguro'}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </section>
                            </form>
                        </div>

                        {/* Resumo do Pedido */}
                        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
                            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
                                <h2 className="text-xl font-bold text-gray-900 font-montserrat">Resumo do Pedido</h2>

                                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
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
                                    <span className="text-gray-900 font-bold text-lg">Total</span>
                                    <span className="text-3xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                                        {finalTotal.toFixed(2)} €
                                    </span>
                                </div>

                                {selectedPaymentMethod === 'whatsapp' ? (
                                    <Button
                                        type="submit"
                                        form="checkout-form"
                                        disabled={isSubmitting || isLoadingShipping || !isShippingCalculated}
                                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-6 rounded-xl text-lg mt-2 relative disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                                    <div className="mt-4 space-y-2">
                                        <p className="text-xs text-gray-500 text-center">
                                            Será redirecionado para a página segura da Klarna após confirmar a encomenda.
                                        </p>
                                        <Button
                                            type="submit"
                                            form="checkout-form"
                                            disabled={isSubmitting || isLoadingShipping || !isShippingCalculated || !isValid}
                                            className="w-full mt-2 font-bold py-6 rounded-xl text-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                                ) : currentFundingSource ? (
                                    <div className="mt-4">
                                        {!isValid ? (
                                            <Button
                                                type="button"
                                                onClick={() => handleSubmit(onSubmit)()}
                                                className="w-full bg-[#00457C] hover:bg-[#00335c] text-white font-bold py-6 rounded-xl text-lg mt-2 relative"
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
                                                className="w-full bg-[#1C1E21] hover:bg-[#3a3d42] text-white font-bold py-6 rounded-xl text-lg mt-2 flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <CreditCard className="w-5 h-5" />
                                                Pagar com Cartão
                                            </Button>
                                        ) : (
                                            <PayPalButtons
                                                key={currentFundingSource}
                                                fundingSource={currentFundingSource as any}
                                                style={{ layout: "vertical", shape: "rect", label: "pay" }}
                                                createOrder={createOrder}
                                                onApprove={onApprove}
                                                disabled={isSubmitting || isLoadingShipping || !isValid || !isShippingCalculated}
                                                forceReRender={[currentFundingSource, finalTotal, isValid, dynamicShippingCost]}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <Button
                                        type="submit"
                                        form="checkout-form"
                                        disabled={isSubmitting || isLoadingShipping || !selectedPaymentMethod || !isShippingCalculated}
                                        className="w-full bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white font-bold py-6 rounded-xl text-lg mt-2 relative transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
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

                                {/* <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                                <Truck className="w-4 h-4" />
                                <span>Portes   em compras superiores a 500€</span>
                            </div> */}
                            </div>
                        </div>

                    </div>
                </div>

            </PayPalScriptProvider>

            {/* Modal de Pagamento WooCommerce */}
            <Dialog open={paymentModalOpen} onOpenChange={(open) => {
                if (!open) {
                    // Se o utilizador fechar o modal, alertar que a encomenda ficou pendente
                    toast.warning("Atenção: fechou a janela de pagamento. A sua encomenda ficou pendente.");
                    clearCart();
                    if (pendingOrderRef.current) {
                        navigate('/encomenda-concluida', { state: { orderId: pendingOrderRef.current.id, total: pendingOrderRef.current.total } });
                    } else {
                        navigate('/encomenda-concluida', { state: { orderId: 'pending' } });
                    }
                }
                setPaymentModalOpen(open);
            }}>
                <DialogContent className="sm:max-w-4xl w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden bg-gray-50">
                    <DialogHeader className="p-4 bg-white border-b border-gray-100 flex-shrink-0">
                        <DialogTitle className="text-[#1E3A5F] font-montserrat flex items-center justify-between">
                            <span>Pagamento Seguro</span>
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-sm">
                            Siga as instruções para concluir o pagamento na segurança da PT Móveis.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 w-full bg-white relative">
                        {paymentUrl && (
                            <iframe
                                src={paymentUrl}
                                className="w-full h-full border-0 absolute inset-0"
                                allow="payment *"
                                title="Checkout Secure Payment"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
