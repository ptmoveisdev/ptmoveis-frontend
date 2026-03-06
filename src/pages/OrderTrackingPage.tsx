import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Package, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrderById } from '@/services/wordpress';
import { toast } from 'sonner';

const trackingSchema = z.object({
    orderId: z.string().min(1, 'Coloque o ID da encomenda'),
    email: z.string().email('Email inválido')
});

type TrackingFormValues = z.infer<typeof trackingSchema>;

export default function OrderTrackingPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [order, setOrder] = useState<any | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TrackingFormValues>({
        resolver: zodResolver(trackingSchema)
    });

    const onSubmit = async (data: TrackingFormValues) => {
        setIsLoading(true);
        setOrder(null);
        try {
            const orderId = parseInt(data.orderId.replace('#', '').trim(), 10);
            if (isNaN(orderId)) {
                throw new Error('ID da encomenda inválido.');
            }

            const fetchedOrder = await getOrderById(orderId);

            if (!fetchedOrder || fetchedOrder.billing?.email !== data.email) {
                throw new Error('Encomenda não encontrada ou email incorreto.');
            }

            setOrder(fetchedOrder);
        } catch (error: any) {
            toast.error(error.message || 'Ocorreu um erro ao procurar a encomenda.');
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
                        Acompanhar Encomenda
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Introduza o ID da encomenda que recebeu no email de confirmação.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ID da Encomenda
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Package className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        {...register('orderId')}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                        placeholder="Ex: 12345"
                                    />
                                </div>
                                {errors.orderId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.orderId.message}</p>
                                )}
                            </div>

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
                        </div>

                        <div className="flex justify-center">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full md:w-auto bg-[#D4AF37] hover:bg-[#B8960C] text-white px-8 py-2"
                            >
                                {isLoading ? 'A procurar...' : 'Procurar Encomenda'}
                                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                            </Button>
                        </div>
                    </form>
                </div>

                {order && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                        <div className="bg-[#1E3A5F] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold font-montserrat">
                                    Encomenda #{order.id}
                                </h3>
                                <p className="text-white/80 text-sm mt-1">
                                    Feita a {new Date(order.date_created).toLocaleDateString('pt-PT')}
                                </p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(order.status)} border-2 border-white/20`}>
                                {getStatusText(order.status)}
                            </span>
                        </div>

                        <div className="p-6 md:p-8">
                            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Detalhes da Encomenda</h4>

                            <div className="space-y-4 mb-8">
                                {order.line_items?.map((item: any) => (
                                    <div key={item.id} className="flex gap-4 items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">Quant: {item.quantity}</p>
                                        </div>
                                        <div className="font-medium text-gray-900">
                                            {item.total} {order.currency}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{order.total} {order.currency}</span>
                                </div>
                                {order.shipping_total && parseFloat(order.shipping_total) > 0 && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Portes:</span>
                                        <span className="font-medium">{order.shipping_total} {order.currency}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                    <span className="font-bold text-gray-900 text-lg">Total:</span>
                                    <span className="font-bold text-[#D4AF37] text-xl">
                                        {order.total} {order.currency}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
