import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ChevronLeft, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { createWooCommerceOrder } from '@/services/wordpress';
import type { WooCommerceOrderPayload } from '@/types/wordpress';

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
    paymentMethod: z.enum(['ppcp'])
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, totalPrice, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            paymentMethod: 'ppcp'
        }
    });

    // Calculate totals
    const shippingCost = totalPrice > 500 ? 0 : 39.90;
    const finalTotal = totalPrice + shippingCost;

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

    const onSubmit = async (data: CheckoutFormData) => {
        if (items.length === 0) return;

        setIsSubmitting(true);
        try {
            // Mapeando dados do formulário para o formato do WooCommerce API
            const orderPayload: WooCommerceOrderPayload = {
                payment_method: 'ppcp',
                payment_method_title: 'PayPal',
                set_paid: false,
                billing: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    address_1: data.address,
                    city: data.city,
                    postcode: data.postalCode,
                    country: 'PT',
                    email: data.email,
                    phone: data.phone
                },
                shipping: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    address_1: data.address,
                    city: data.city,
                    postcode: data.postalCode,
                    country: 'PT'
                },
                line_items: items.map(item => ({
                    product_id: parseInt(item.productId),
                    variation_id: item.variationId,
                    quantity: item.quantity
                })),
                shipping_lines: [
                    {
                        method_id: 'flat_rate',
                        method_title: 'Entrega Padrão',
                        total: shippingCost.toString()
                    }
                ]
            };

            // Adicionar NIF como metadata se fornecido
            if (data.nif) {
                orderPayload.meta_data = [
                    {
                        key: '_billing_nif',
                        value: data.nif
                    }
                ];
            }

            const response = await createWooCommerceOrder(orderPayload);

            clearCart();

            // Redireciona para o gateway do PayPal do WooCommerce
            if (response.payment_url) {
                window.location.href = response.payment_url;
            } else {
                // Caso não retorne URL, cai em fallback
                navigate('/encomenda-concluida', { state: { orderId: response.id.toString(), total: parseFloat(response.total) } });
            }

        } catch (error) {
            console.error('Erro ao processar pedido', error);
            toast.error('Ocorreu um erro ao processar seu pedido. Verifique os dados e tente novamente.', {
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
                                        <label className="text-sm font-medium text-gray-700">Endereço Completo *</label>
                                        <input
                                            {...register('address')}
                                            className={`w-full p-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                            placeholder="Rua da Alegria, nº 123, 4º Esq"
                                        />
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Localidade *</label>
                                        <input
                                            {...register('city')}
                                            className={`w-full p-3 rounded-xl border ${errors.city ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                            placeholder="Porto"
                                        />
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Código Postal *</label>
                                        <Controller
                                            name="postalCode"
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    onChange={(e) => field.onChange(formatPostalCode(e.target.value))}
                                                    maxLength={8}
                                                    className={`w-full p-3 rounded-xl border ${errors.postalCode ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all`}
                                                    placeholder="4000-123"
                                                />
                                            )}
                                        />
                                        {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Método de Pagamento */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-sm">3</span>
                                    Método de Pagamento
                                </h2>

                                <div className="grid grid-cols-1 gap-4">
                                    <Controller
                                        name="paymentMethod"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <label className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all border-[#D4AF37] bg-yellow-50/50`}>
                                                    <input type="radio" value="ppcp" className="sr-only" checked={field.value === 'ppcp'} onChange={() => field.onChange('ppcp')} />
                                                    <div className="flex items-center justify-center mb-2">
                                                        <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-8" />
                                                    </div>
                                                    <span className="font-semibold text-gray-900">PayPal ou Cartão de Crédito</span>
                                                    <p className="text-xs text-gray-500 text-center mt-2">Pagamento seguro processado através do standard PayPal Checkout.</p>
                                                </label>
                                            </>
                                        )}
                                    />
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
                                        {shippingCost === 0 ? <span className="text-green-600 font-bold">Grátis</span> : `${shippingCost.toFixed(2)} €`}
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

                            <Button
                                type="submit"
                                form="checkout-form"
                                disabled={isSubmitting}
                                className="w-full bg-[#D4AF37] hover:bg-[#B8960C] text-white font-bold py-6 rounded-xl text-lg mt-2 relative"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        A processar...
                                    </span>
                                ) : (
                                    'Confirmar Pedido'
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                                <Truck className="w-4 h-4" />
                                <span>Portes grátis em compras superiores a 500€</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
