import { useState } from 'react';
import { Heart, Eye, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { Product } from '@/data/products';

interface ProductCardProps {
    product: Product;
    index?: number;
    onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, index = 0, onViewDetails }: ProductCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();
    const navigate = useNavigate();
    const isLiked = isFavorite(product.id);

    const handleViewProduct = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        navigate(`/produto/${product.slug}`);
        window.scrollTo(0, 0);
    };

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(product);
        }
    };

    return (
        <div
            className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-[#D4AF37]/30 transition-all duration-300 cursor-pointer animate-fade-in-up"
            style={{
                animationDelay: `${index * 60}ms`,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
            onClick={() => handleViewProduct()}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            }}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-white">
                <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-contain p-2 transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                        } group-hover:scale-105`}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge */}
                {product.badge && (
                    <Badge
                        className={`absolute top-3 left-3 ${product.badgeColor} text-white text-xs font-bold px-2.5 py-1 shadow-sm uppercase tracking-wide`}
                    >
                        {product.badge}
                    </Badge>
                )}

                {/* Variations Badge */}
                {product.hasVariations && (
                    <Badge
                        className="absolute top-3 right-3 bg-[#D4AF37] text-white text-xs font-bold px-2.5 py-1 shadow-sm uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        Várias opções
                    </Badge>
                )}


                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product);
                        }}
                        className="w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart
                            className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                }`}
                        />
                    </button>
                    <button
                        onClick={(e) => handleViewProduct(e)}
                        className="w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        aria-label="Ver produto"
                    >
                        <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                {/* Rating Badge */}
                {product.rating && (
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                            <span className="text-xs font-semibold text-gray-900">{product.rating}</span>
                            <span className="text-xs text-gray-500">({product.reviewCount})</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4">
                {/* Category */}
                <p className="text-[10px] sm:text-xs font-medium text-[#D4AF37] uppercase tracking-wider mb-1 sm:mb-2">
                    {product.category}
                </p>

                {/* Product Name */}
                <h3 className="text-sm sm:text-md font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] leading-tight uppercase" style={{ fontFamily: 'Montserrat' }}>
                    {product.name}
                </h3>

                {/* Price Section */}
                <div className="flex items-end justify-between mb-2 sm:mb-3">
                    <div className="flex flex-col gap-0.5">
                        {product.oldPrice && !isNaN(product.oldPrice) && (
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">
                                {product.oldPrice.toFixed(2)} €
                            </span>
                        )}
                        <span className="text-lg sm:text-2xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                            {!isNaN(product.price) ? `${product.price.toFixed(2)} €` : ''}
                        </span>
                    </div>

                    {product.oldPrice && !isNaN(product.oldPrice) && !isNaN(product.price) && (
                        <div className="bg-red-50 text-red-600 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                        </div>
                    )}
                </div>

                {/* View Product Button */}
                <Button
                    onClick={(e) => handleViewProduct(e)}
                    className="w-full bg-[#1E3A5F] hover:bg-[#2E5A8F] text-white text-xs sm:text-sm font-bold py-2 sm:py-2.5 rounded-lg transition-all group-hover:shadow-md h-8 sm:h-auto"
                >
                    VER PRODUTO
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                </Button>

                {/* Stock Status */}
                {!product.inStock && (
                    <p className="text-[10px] sm:text-xs text-red-500 text-center mt-2 font-medium">
                        Esgotado
                    </p>
                )}
            </div>
        </div>
    );
}
