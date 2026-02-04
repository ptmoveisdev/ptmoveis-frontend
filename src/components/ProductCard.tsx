import { useState } from 'react';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/data/products';

interface ProductCardProps {
    product: Product;
    index?: number;
    onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, index = 0, onViewDetails }: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            badge: product.badge,
            badgeColor: product.badgeColor,
        });

        // Visual feedback
        const button = e.currentTarget as HTMLButtonElement;
        button.classList.add('animate-price-pop');
        setTimeout(() => button.classList.remove('animate-price-pop'), 400);
    };

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(product);
        }
    };

    return (
        <div
            className="product-card asymmetric-card group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl cursor-pointer animate-reveal-up"
            style={{ animationDelay: `${index * 80}ms` }}
            onClick={handleViewDetails}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                <img
                    src={product.image}
                    alt={product.name}
                    className={`product-image w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge */}
                {product.badge && (
                    <Badge
                        className={`absolute top-4 left-4 ${product.badgeColor} text-white text-xs font-bold px-3 py-1.5 shadow-lg animate-badge-slide uppercase tracking-wider`}
                    >
                        {product.badge}
                    </Badge>
                )}

                {/* Quick Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLiked(!isLiked);
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Add to wishlist"
                    >
                        <Heart
                            className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                }`}
                        />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails();
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        aria-label="Quick view"
                    >
                        <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Rating Badge - Bottom Left */}
                {product.rating && (
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                            <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
                            <span className="text-xs text-gray-500">({product.reviewCount})</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Category */}
                <p className="text-xs font-medium text-[#D4AF37] uppercase tracking-wider mb-2">
                    {product.category}
                </p>

                {/* Product Name */}
                <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem] leading-snug" style={{ fontFamily: 'Playfair Display' }}>
                    {product.name}
                </h3>

                {/* Price Section */}
                <div className="flex items-end justify-between mb-4">
                    <div className="flex flex-col gap-1">
                        {product.oldPrice && (
                            <span className="text-sm text-gray-400 line-through font-medium">
                                {product.oldPrice.toFixed(2)} €
                            </span>
                        )}
                        <span className="floating-price text-2xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Playfair Display' }}>
                            {product.price.toFixed(2)} €
                        </span>
                    </div>

                    {product.oldPrice && (
                        <div className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded">
                            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                        </div>
                    )}
                </div>

                {/* Add to Cart Button */}
                <Button
                    onClick={handleAddToCart}
                    className="btn-premium w-full bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white text-sm font-semibold py-5 rounded-lg transition-all"
                >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    ADICIONAR AO CARRINHO
                </Button>

                {/* Stock Status */}
                {!product.inStock && (
                    <p className="text-xs text-red-500 text-center mt-2 font-medium">
                        Esgotado
                    </p>
                )}
            </div>
        </div>
    );
}
