import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrderById } from '@/services/wordpress';

interface LocationState {
    orderId?: string;
    total?: number;
}

export default function OrderSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirecionar para home se acessar diretamente sem um pedido
        if (!state?.orderId) {
            navigate('/', { replace: true });
            return;
        }

        async function fetchOrder() {
            try {
                const data = await getOrderById(Number(state.orderId));
                setOrder(data);
            } catch (error) {
                console.error("Erro ao procurar encomenda:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrder();
    }, [navigate, state]);

    if (!state?.orderId) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-20 px-4">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-gray-600">A processar a sua encomenda...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 px-4">
            <Helmet>
                <title>Encomenda Recebida | PT Móveis</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg max-w-2xl w-full text-center border border-gray-100">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-[bounce_1s_ease-in-out]">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'Montserrat' }}>
                    Obrigado pela sua encomenda!
                </h1>

                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    A sua encomenda foi recebida e está a ser processada. Receberá um e-mail de confirmação em breve.
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100 grid sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Nº da Encomenda</p>
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#D4AF37]" />
                            #{state.orderId}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total</p>
                        <p className="font-bold text-gray-900 text-lg">
                            {order ? `${order.total} ${order.currency}` : (state.total ? `${state.total.toFixed(2)} €` : 'N/A')}
                        </p>
                    </div>
                    {order && order.billing?.email && (
                        <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Pode acompanhar o estado da sua encomenda usando o email:</p>
                            <p className="font-medium text-gray-900">{order.billing.email}</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={() => navigate('/produtos')}
                        variant="outline"
                        className="w-full sm:w-auto text-[#1E3A5F] border-gray-200 hover:bg-gray-50 bg-white"
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Continuar a comprar
                    </Button>
                    <Button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#B8960C] text-white"
                    >
                        Ir para a página inicial
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
