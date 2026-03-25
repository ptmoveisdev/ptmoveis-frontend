import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ScalapayWidget } from './ScalapayWidget';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
    const navigate = useNavigate();

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="w-6 h-6 text-[#D4AF37]" />
                            <div>
                                <h2 className="text-xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                                    Carrinho de Compras
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Close cart"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Seu carrinho está vazio
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Adicione produtos para começar suas compras
                                </p>
                                <Button
                                    onClick={onClose}
                                    className="bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white"
                                >
                                    Continuar Comprando
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        {/* Product Image */}
                                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                                {item.name}
                                            </h4>

                                            {item.selectedAttributes && (
                                                <p className="text-xs text-gray-500 mb-2">
                                                    {item.selectedAttributes}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 mb-3">
                                                {item.oldPrice && !isNaN(item.oldPrice) && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {item.oldPrice.toFixed(2)} €
                                                    </span>
                                                )}
                                                <span className="text-lg font-bold text-[#D4AF37]">
                                                    {!isNaN(item.price) ? `${item.price.toFixed(2)} €` : ''}
                                                </span>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                    <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-300">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-gray-200 p-6 space-y-4">
                            {/* Subtotal */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold text-gray-900">
                                    {!isNaN(totalPrice) ? `${totalPrice.toFixed(2)} €` : ''}
                                </span>
                            </div>

                            {/* Shipping */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Entrega</span>
                                <span className="font-semibold text-[#D4AF37]">em todo Portugal Continental</span>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-gray-600 font-medium" style={{ fontFamily: 'Montserrat' }}>
                                    Total a pagar
                                </span>
                                <span id="scalapay-cart-price" className="text-2xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                                    {!isNaN(totalPrice) ? `${totalPrice.toFixed(2)} €` : ''}
                                </span>
                            </div>
                            <ScalapayWidget amountSelector="#scalapay-cart-price" type="cart" visible={totalPrice > 0} />

                            {/* Online Checkout Button */}
                            <Button
                                onClick={() => {
                                    onClose();
                                    navigate('/checkout');
                                }}
                                className="w-full bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white text-base font-bold py-6 rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
                            >
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                IR PARA O PAGAMENTO ONLINE
                            </Button>

                            {/* WhatsApp Checkout Button */}
                            <Button
                                onClick={() => {
                                    const message = `Olá! Gostaria de finalizar a compra dos seguintes itens:\n\n${items.map(item => `- ${item.name} (${item.quantity}x) ${item.selectedAttributes ? `[${item.selectedAttributes}]` : ''} - ${item.price.toFixed(2)}€`).join('\n')}\n\n*Total: ${totalPrice.toFixed(2)}€*`;
                                    window.open(`https://wa.me/351939076117?text=${encodeURIComponent(message)}`, '_blank');
                                }}
                                className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white text-base font-bold py-6 rounded-lg"
                            >
                                FINALIZAR COMPRA NO WHATSAPP
                            </Button>

                            {/* Continue Shopping */}
                            <button
                                onClick={onClose}
                                className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                Continuar Comprando
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
