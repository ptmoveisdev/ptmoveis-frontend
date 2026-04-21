import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Package, ArrowRight, User, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrdersByEmail } from '@/services/wordpress';
import { toast } from 'sonner';

const trackingSchema = z.object({
    email: z.string().email('Email inválido') // Agora validamos apenas o Email
});

type TrackingFormValues = z.infer<typeof trackingSchema>;

interface TrackingState {
    email?: string;
}

export default function OrderTrackingPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [orders, setOrders] = useState<any[] | null>(null);
    const location = useLocation();
    const routerState = location.state as TrackingState | null;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<TrackingFormValues>({
        resolver: zodResolver(trackingSchema),
        defaultValues: {
            email: routerState?.email || '',
        }
    });

    // Auto-fetch if navigated with email
    useEffect(() => {
        if (routerState?.email) {
            setValue('email', routerState.email);
            onSubmit({ email: routerState.email });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routerState?.email, setValue]);

    const onSubmit = async (data: TrackingFormValues) => {
        setIsLoading(true);
        setOrders(null);
        try {
            const fetchedOrders = await getOrdersByEmail(data.email);

            if (!fetchedOrders || fetchedOrders.length === 0) {
                throw new Error('Nenhuma encomenda encontrada para este email.');
            }

            // Ordenar por data mais recente
            fetchedOrders.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());

            setOrders(fetchedOrders);
        } catch (error: any) {
            toast.error(error.message || 'Ocorreu um erro ao procurar as encomendas.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending': 'Pendente de Pagamento',
            'processing': 'Em Processamento',
            'on-hold': 'A Aguardar Pagamento',
            'completed': 'Concluída',
            'cancelled': 'Cancelada',
            'refunded': 'Reembolsada',
            'failed': 'Falhou',
            'trash': 'Apagada'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'on-hold': 'bg-orange-100 text-orange-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'refunded': 'bg-gray-100 text-gray-800',
            'failed': 'bg-red-100 text-red-800',
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Helmet>
                <title>Acompanhar Encomenda | PT Móveis</title>
            </Helmet>

            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#1E3A5F] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                        Acompanhar Encomendas
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Introduza o seu email para consultar o estado das encomendas.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 max-w-md mx-auto">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email de Faturação
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    {...register('email')}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                    placeholder="Email usado na compra"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="flex justify-center">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#D4AF37] hover:bg-[#B8960C] text-white px-8 py-2"
                            >
                                {isLoading ? 'A procurar...' : 'Procurar Encomendas'}
                                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                            </Button>
                        </div>
                    </form>
                </div>

                {orders && orders.length > 0 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-xl font-semibold text-[#1E3A5F] mb-6 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Foram encontradas {orders.length} encomenda(s)
                        </h2>
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-[#1E3A5F] p-5 md:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold font-montserrat">
                                            Encomenda #{order.id}
                                        </h3>
                                        <p className="text-white/80 text-sm mt-1">
                                            Data: {new Date(order.date_created).toLocaleDateString('pt-PT')}
                                        </p>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap self-start md:self-auto ${getStatusColor(order.status)} border-2 border-white/20`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>

                                <div className="p-5 md:p-6">
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm md:text-base uppercase tracking-wide">
                                        Resumo dos Artigos
                                    </h4>

                                    <div className="space-y-3 mb-6">
                                        {order.line_items?.map((item: any) => (
                                            <div key={item.id} className="flex gap-4 items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                                <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center flex-shrink-0">
                                                    <Package className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">Quant: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <span className="font-semibold text-gray-600 text-sm md:text-base">Valor Total Pago:</span>
                                        <span className="font-bold text-[#D4AF37] text-lg md:text-xl">
                                            {order.total} <span className="text-sm">{order.currency}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
