import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, LogOut, Package, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getCustomerOrders } from '@/services/auth';
import { toast } from 'sonner';

export default function AccountPage() {
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);

    useEffect(() => {
        async function loadOrders() {
            if (user?.id) {
                setIsLoadingOrders(true);
                try {
                    const data = await getCustomerOrders(user.id);
                    setOrders(data);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                    toast.error('Erro ao carregar o histórico de encomendas.');
                } finally {
                    setIsLoadingOrders(false);
                }
            }
        }

        if (isAuthenticated) {
            loadOrders();
        }
    }, [user?.id, isAuthenticated]);

    const handleLogout = () => {
        logout();
        toast.success('Sessão terminada.');
        navigate('/');
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending': 'Pendente',
            'processing': 'Em Processamento',
            'on-hold': 'A Aguardar Pagamento',
            'completed': 'Concluído',
            'cancelled': 'Cancelado',
            'refunded': 'Reembolsado',
            'failed': 'Falhou'
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
                <title>Minha Conta | PT Móveis</title>
            </Helmet>

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            <div className="bg-[#1E3A5F] p-6 text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-white font-semibold text-lg">{user?.first_name} {user?.last_name}</h2>
                                <p className="text-white/70 text-sm">{user?.email}</p>
                            </div>

                            <div className="p-4 space-y-1">
                                <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-[#1E3A5F] bg-blue-50 rounded-lg">
                                    <Package className="mr-3 h-5 w-5 text-[#D4AF37]" />
                                    Minhas Encomendas
                                </button>
                                <div className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-400 bg-white rounded-lg cursor-not-allowed" title="Em breve">
                                    <ShieldCheck className="mr-3 h-5 w-5" />
                                    Detalhes da Conta
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors mt-4"
                                >
                                    <LogOut className="mr-3 h-5 w-5" />
                                    Terminar Sessão
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h1 className="text-2xl font-bold text-[#1E3A5F] mb-6" style={{ fontFamily: 'Montserrat' }}>
                                Histórico de Encomendas
                            </h1>

                            {isLoadingOrders ? (
                                <div className="flex justify-center p-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sem encomendas</h3>
                                    <p className="text-gray-500 mb-6">Ainda não fez nenhuma compra conosco.</p>
                                    <Button
                                        onClick={() => navigate('/produtos')}
                                        className="bg-[#D4AF37] hover:bg-[#B8960C] text-white px-8"
                                    >
                                        Começar a comprar
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Encomenda</p>
                                                    <p className="font-semibold text-gray-900">#{order.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Data</p>
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(order.date_created).toLocaleDateString('pt-PT')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Estado</p>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Total</p>
                                                    <p className="font-semibold text-[#D4AF37]">
                                                        {order.total} {order.currency}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="text-[#1E3A5F] hover:bg-blue-50"
                                                    onClick={() => navigate('/acompanhar-pedido', { state: { orderId: String(order.id), email: order.billing.email } })}
                                                >
                                                    Ver Detalhes
                                                    <ArrowRight className="ml-2 w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Items Preview */}
                                            <div className="p-4 bg-white">
                                                <div className="flex flex-wrap gap-4">
                                                    {order.line_items?.map((item: any, index: number) => (
                                                        <div key={item.id} className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                                                            <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                                {item.image?.src ? (
                                                                    <img src={item.image.src} alt={item.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Package className="w-6 h-6 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 pr-4 border-r border-gray-100 last:border-0 last:pr-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{item.name}</p>
                                                                <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
