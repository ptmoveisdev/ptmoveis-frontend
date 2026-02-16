import { X, ShoppingCart, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';

interface FavoritesSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FavoritesSidebar({ isOpen, onClose }: FavoritesSidebarProps) {
    const { favorites, toggleFavorite } = useFavorites();
    const { addToCart } = useCart();

    const handleAddToCart = (product: any) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            badge: product.badge,
            badgeColor: product.badgeColor,
            productId: product.id,
        });
    };

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
                            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                            <div>
                                <h2 className="text-xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                                    Meus Favoritos
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {favorites.length} {favorites.length === 1 ? 'item' : 'itens'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Close favorites"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Favorites Items */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {favorites.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Heart className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Sua lista de desejos está vazia
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Adicione produtos aos favoritos para vê-los aqui mais tarde
                                </p>
                                <Button
                                    onClick={onClose}
                                    className="bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white"
                                >
                                    Explorar Produtos
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {favorites.map((item) => (
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

                                            <div className="flex items-center gap-2 mb-3">
                                                {item.oldPrice && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {item.oldPrice.toFixed(2)} €
                                                    </span>
                                                )}
                                                <span className="text-lg font-bold text-[#D4AF37]">
                                                    {item.price.toFixed(2)} €
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddToCart(item)}
                                                    className="bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white text-xs h-8 px-3"
                                                >
                                                    <ShoppingCart className="w-3 h-3 mr-1.5" />
                                                    Adicionar ao Carrinho
                                                </Button>

                                                <button
                                                    onClick={() => toggleFavorite(item)}
                                                    className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    aria-label="Remove from favorites"
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
                </div>
            </div>
        </>
    );
}
