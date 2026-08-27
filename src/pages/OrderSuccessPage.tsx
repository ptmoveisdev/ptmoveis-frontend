import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    CheckCircle2, Package, ArrowRight, ShoppingBag, Loader2,
    Truck, Clock, MapPin, Mail, Search, RotateCcw, CreditCard, Banknote, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrderById, captureScalapayPayment } from '@/services/wordpress';
import { useCart } from '@/contexts/CartContext';
import { trackPurchase } from '@/utils/tracking';

interface OrderState {
    orderId?: string;
    total?: number;
}

const STATUS_STEPS = [
    { key: 'received',    label: 'Recebida',          icon: Package },
    { key: 'processing',  label: 'Em Processamento',  icon: RotateCcw },
    { key: 'shipped',     label: 'Enviada',            icon: Truck },
    { key: 'completed',   label: 'Entregue',           icon: CheckCircle2 },
];

function getStepIndex(status: string): number {
    switch (status) {
        case 'pending':
        case 'on-hold':
            return 0;
        case 'processing':
            return 1;
        case 'completed':
            return 3;
        default:
            return 0;
    }
}

function getStatusLabel(status: string): string {
    const map: Record<string, string> = {
        pending: 'Pendente de Pagamento',
        processing: 'Em Processamento',
        'on-hold': 'A Aguardar Pagamento',
        completed: 'Concluída',
        cancelled: 'Cancelada',
        refunded: 'Reembolsada',
        failed: 'Falhada',
    };
    return map[status] || status;
}

function getStatusColors(status: string) {
    switch (status) {
        case 'completed':
            return { badge: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500' };
        case 'processing':
            return { badge: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' };
        case 'on-hold':
        case 'pending':
            return { badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' };
        case 'cancelled':
        case 'failed':
            return { badge: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' };
        default:
            return { badge: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };
    }
}

export default function OrderSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const routerState = location.state as OrderState | null;
    const { clearCart } = useCart();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [resolvedState, setResolvedState] = useState<OrderState | null>(null);

    useEffect(() => {
        if (routerState?.orderId) {
            setResolvedState(routerState);
            return;
        }

        // Scalapay redirect: ?orderToken=XXX&status=APPROVED
        const scalapayToken = searchParams.get('orderToken');
        const scalapayStatus = searchParams.get('status');
        if (scalapayToken) {
            const stored = localStorage.getItem('scalapay_pending_order');
            const parsed: OrderState & { orderId: string; orderData?: any } = stored ? JSON.parse(stored) : {};
            if (parsed.orderId && scalapayStatus === 'APPROVED') {
                captureScalapayPayment(Number(parsed.orderId), scalapayToken, parsed.orderData).catch(err =>
                    console.error('❌ Scalapay capture:', err)
                );
            }
            setResolvedState({ orderId: parsed.orderId, total: parsed.total });
            localStorage.removeItem('scalapay_pending_order');
            clearCart();
            return;
        }

        const qOrderId =
            searchParams.get('order_id') ||
            new URLSearchParams(window.location.search).get('order_id');

        if (qOrderId) {
            const stored = localStorage.getItem('klarna_pending_order');
            const parsed: OrderState = stored ? JSON.parse(stored) : {};
            setResolvedState({ orderId: qOrderId, total: parsed.total });
            localStorage.removeItem('klarna_pending_order');
            clearCart();
            return;
        }

        const stored = localStorage.getItem('klarna_pending_order');
        if (stored) {
            const parsed: OrderState = JSON.parse(stored);
            if (parsed.orderId) {
                setResolvedState(parsed);
                localStorage.removeItem('klarna_pending_order');
                return;
            }
        }

        navigate('/', { replace: true });
    }, [routerState, searchParams, navigate, clearCart]);

    useEffect(() => {
        if (!resolvedState?.orderId || resolvedState.orderId === 'whatsapp' || resolvedState.orderId === 'pending') {
            setIsLoading(false);
            return;
        }

        async function fetchOrder() {
            try {
                const data = await getOrderById(Number(resolvedState!.orderId));
                setOrder(data);
            } catch (error) {
                console.error('Erro ao procurar encomenda:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrder();
    }, [resolvedState]);

    // Dispara o evento de compra assim que a encomenda real é confirmada pelo backend.
    useEffect(() => {
        if (!order || !resolvedState?.orderId) return;
        if (resolvedState.orderId === 'whatsapp' || resolvedState.orderId === 'pending') return;

        const items = (order.line_items || []).map((item: any) => ({
            item_id: String(item.product_id ?? item.id),
            item_name: item.name,
            price: parseFloat(item.price ?? item.total ?? '0') || 0,
            quantity: item.quantity,
        }));

        trackPurchase({
            transactionId: String(resolvedState.orderId),
            value: parseFloat(order.total),
            currency: order.currency,
            shipping: order.shipping_total ? parseFloat(order.shipping_total) : undefined,
            items,
        });
    }, [order, resolvedState]);

    if (!resolvedState?.orderId) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-20 px-4">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-gray-600">A processar a sua encomenda...</p>
            </div>
        );
    }

    const isWhatsApp = resolvedState.orderId === 'whatsapp';
    const isPending = resolvedState.orderId === 'pending';
    const isRealOrder = !isWhatsApp && !isPending;

    // Detectar pagamento Multibanco / MBWay e extrair referência dos meta_data
    const isMultibanco = order?.payment_method?.includes('multibanco');
    const isMbway = order?.payment_method?.includes('mbway');
    const getMeta = (keys: string[]) => {
        if (!order?.meta_data) return null;
        for (const key of keys) {
            const found = order.meta_data.find((m: any) => m.key === key);
            if (found?.value) return String(found.value);
        }
        return null;
    };
    const mbEntity    = getMeta(['_multibanco_entity', '_ppcp_multibanco_entity', 'multibanco_entity', '_ifthen_multibanco_entity']);
    const mbReference = getMeta(['_multibanco_reference', '_ppcp_multibanco_reference', 'multibanco_reference', '_ifthen_multibanco_reference', '_eupago_multibanco_referencia']);
    const mbDeadline  = getMeta(['_multibanco_deadline', '_ppcp_multibanco_deadline', 'multibanco_deadline', '_ifthen_multibanco_expiry']);
    const stepIndex = order ? getStepIndex(order.status) : 0;
    const statusColors = order ? getStatusColors(order.status) : getStatusColors('pending');

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
            <Helmet>
                <title>Encomenda Recebida | PT Móveis</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-3" style={{ fontFamily: 'Montserrat' }}>
                        {isWhatsApp ? 'Pedido enviado via WhatsApp!' : 'Obrigado pela sua encomenda!'}
                    </h1>

                    <p className="text-gray-500 text-base">
                        {isWhatsApp
                            ? 'A nossa equipa irá entrar em contacto para confirmar o pagamento e o envio.'
                            : isPending
                                ? 'A sua encomenda foi criada e está a aguardar confirmação de pagamento.'
                                : 'A sua encomenda foi recebida. Receberá um e-mail de confirmação em breve.'
                        }
                    </p>
                </div>

                {/* Order Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-[#1E3A5F] px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-[#D4AF37]" />
                            <span className="font-bold text-white text-lg">
                                {isWhatsApp
                                    ? 'Pedido via WhatsApp'
                                    : isPending
                                        ? 'Encomenda Pendente'
                                        : `Encomenda #${resolvedState.orderId}`}
                            </span>
                        </div>
                        {order?.status && (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors.badge}`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${statusColors.dot}`} />
                                {getStatusLabel(order.status)}
                            </span>
                        )}
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {order?.date_created && (
                                <div className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-500">Data</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(order.date_created).toLocaleDateString('pt-PT', {
                                                day: '2-digit', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-2">
                                <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-500">Total</p>
                                    <p className="font-bold text-[#1E3A5F] text-base">
                                        {order
                                            ? `${parseFloat(order.total).toFixed(2)} ${order.currency}`
                                            : resolvedState.total
                                                ? `${resolvedState.total.toFixed(2)} €`
                                                : '—'}
                                    </p>
                                </div>
                            </div>
                            {order?.payment_method_title && (
                                <div className="flex items-start gap-2">
                                    <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-500">Pagamento</p>
                                        <p className="font-medium text-gray-900">{order.payment_method_title}</p>
                                    </div>
                                </div>
                            )}
                            {order?.billing?.email && (
                                <div className="flex items-start gap-2">
                                    <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900 truncate max-w-[140px]">{order.billing.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shipping address */}
                        {order?.shipping && (order.shipping.address_1 || order.shipping.city) && (
                            <div className="pt-4 border-t border-gray-100 flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-500 mb-0.5">Morada de Entrega</p>
                                    <p className="font-medium text-gray-900">
                                        {[order.shipping.address_1, order.shipping.postcode, order.shipping.city]
                                            .filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instruções Multibanco */}
                {isMultibanco && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/30 overflow-hidden">
                        <div className="bg-[#D4AF37]/10 px-6 py-4 flex items-center gap-3 border-b border-[#D4AF37]/20">
                            <Banknote className="w-5 h-5 text-[#D4AF37]" />
                            <h2 className="font-bold text-[#1E3A5F]">Instruções de Pagamento — Multibanco</h2>
                        </div>
                        <div className="p-6">
                            {mbReference ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {mbEntity && (
                                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Entidade</p>
                                            <p className="text-2xl font-bold text-[#1E3A5F] tracking-widest">{mbEntity}</p>
                                        </div>
                                    )}
                                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Referência</p>
                                        <p className="text-2xl font-bold text-[#1E3A5F] tracking-widest">{mbReference}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Montante</p>
                                        <p className="text-2xl font-bold text-[#D4AF37]">
                                            {order?.total ? `${parseFloat(order.total).toFixed(2)} €` : `${resolvedState.total?.toFixed(2)} €`}
                                        </p>
                                    </div>
                                    {mbDeadline && (
                                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Válido até</p>
                                            <p className="text-lg font-semibold text-gray-900">{mbDeadline}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <AlertCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">Referência Multibanco a ser gerada</p>
                                        <p>As instruções de pagamento serão enviadas para o seu email em breve. Pode também consultar a referência na área <strong>A minha conta</strong> ou em <strong>Acompanhar encomenda</strong>.</p>
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-gray-400 mt-4 text-center">
                                Pode efetuar o pagamento em qualquer caixa multibanco ou homebanking.
                            </p>
                        </div>
                    </div>
                )}

                {/* Instruções MBWay */}
                {isMbway && (
                    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                        <div className="bg-blue-50 px-6 py-4 flex items-center gap-3 border-b border-blue-100">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <h2 className="font-bold text-[#1E3A5F]">Instruções de Pagamento — MBWay</h2>
                        </div>
                        <div className="p-6 flex items-start gap-3 text-sm text-gray-600">
                            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900 mb-1">Confirme o pagamento na app MBWay</p>
                                <p>Deverá receber uma notificação no seu telemóvel para confirmar o pagamento de <strong>{order?.total ? `${parseFloat(order.total).toFixed(2)} €` : `${resolvedState.total?.toFixed(2)} €`}</strong>. Verifique a app MBWay.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Timeline — only for real orders */}
                {isRealOrder && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-900 mb-6 text-sm uppercase tracking-wide">
                            Estado da Encomenda
                        </h2>
                        <div className="flex items-start justify-between relative">
                            {/* Progress line */}
                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
                                <div
                                    className="h-full bg-[#D4AF37] transition-all duration-500"
                                    style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                                />
                            </div>

                            {STATUS_STEPS.map((step, i) => {
                                const Icon = step.icon;
                                const isDone = i < stepIndex;
                                const isCurrent = i === stepIndex;
                                return (
                                    <div key={step.key} className="flex flex-col items-center z-10 flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                                            ${isDone ? 'bg-[#D4AF37] border-[#D4AF37]' : ''}
                                            ${isCurrent ? 'bg-white border-[#D4AF37] shadow-md shadow-yellow-100' : ''}
                                            ${!isDone && !isCurrent ? 'bg-white border-gray-200' : ''}`
                                        }>
                                            <Icon className={`w-4 h-4 ${isDone ? 'text-white' : isCurrent ? 'text-[#D4AF37]' : 'text-gray-300'}`} />
                                        </div>
                                        <p className={`text-xs mt-2 text-center leading-tight max-w-[60px]
                                            ${isCurrent ? 'font-semibold text-[#1E3A5F]' : isDone ? 'text-gray-500' : 'text-gray-300'}`
                                        }>
                                            {step.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Items */}
                {order?.line_items?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-900">Artigos Encomendados</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.line_items.map((item: any) => (
                                <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                                        {item.meta_data?.filter((m: any) => !m.key.startsWith('_')).map((m: any) => (
                                            <p key={m.key} className="text-xs text-gray-400">{m.key}: {m.value}</p>
                                        ))}
                                    </div>
                                    <p className="font-semibold text-gray-900 whitespace-nowrap">
                                        {parseFloat(item.total).toFixed(2)} {order.currency}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {order.shipping_total && parseFloat(order.shipping_total) > 0 && (
                            <div className="px-6 py-3 bg-gray-50 flex justify-between text-sm text-gray-600 border-t border-gray-100">
                                <span>Portes de Envio</span>
                                <span>{parseFloat(order.shipping_total).toFixed(2)} {order.currency}</span>
                            </div>
                        )}
                        <div className="px-6 py-4 bg-gray-50 flex justify-between font-bold border-t border-gray-200">
                            <span className="text-gray-900">Total</span>
                            <span className="text-[#D4AF37] text-lg">
                                {parseFloat(order.total).toFixed(2)} {order.currency}
                            </span>
                        </div>
                    </div>
                )}

                {/* Tracking CTA */}
                {isRealOrder && (
                    <div className="bg-[#1E3A5F]/5 border border-[#1E3A5F]/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-10 h-10 bg-[#1E3A5F] rounded-xl flex items-center justify-center flex-shrink-0">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-[#1E3A5F] text-sm">Acompanhe a sua encomenda</p>
                            <p className="text-gray-500 text-xs mt-0.5">
                                Use o número <strong>#{resolvedState.orderId}</strong> e o seu email para ver o estado em tempo real.
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate('/acompanhar-pedido', {
                                state: { orderId: resolvedState.orderId, email: order?.billing?.email }
                            })}
                            className="w-full sm:w-auto bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white text-sm whitespace-nowrap"
                        >
                            Acompanhar
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={() => navigate('/produtos')}
                        variant="outline"
                        className="flex-1 text-[#1E3A5F] border-gray-200 hover:bg-gray-50 bg-white"
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Continuar a comprar
                    </Button>
                    <Button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-[#D4AF37] hover:bg-[#B8960C] text-white"
                    >
                        Página Inicial
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

            </div>
        </div>
    );
}
