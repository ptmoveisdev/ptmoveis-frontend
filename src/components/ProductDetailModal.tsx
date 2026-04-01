import { useState, useEffect } from 'react';
import { X, Heart, ShoppingCart, Star, Check, Truck, Shield, CreditCard, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { useCart } from '@/contexts/CartContext';
import { ProductVariations } from '@/components/ProductVariations';
import { useProductBySlug } from '@/hooks/useWordPress';
import type { Product } from '@/data/products';
import type { WooCommerceVariation } from '@/types/wordpress';

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [selectedVariation, setSelectedVariation] = useState<WooCommerceVariation | null>(null);
    const { addToCart } = useCart();

    // Buscar dados completos do produto WooCommerce se for produto variável
    const { data: wpProduct } = useProductBySlug(product?.slug || '');

    // Resetar variação selecionada quando o produto mudar
    useEffect(() => {
        setSelectedVariation(null);
        setSelectedImage(0);
    }, [product?.id]);

    if (!product) return null;

    // Usar imagem da variação se selecionada, senão usar imagens do produto
    const variationImage = selectedVariation?.image?.src;
    const productImages = product.images || [product.image];
    const images = variationImage ? [variationImage, ...productImages] : productImages;
    const displayImage = images[0];

    // Usar preço da variação se selecionada
    const displayPrice = selectedVariation ? parseFloat(selectedVariation.price) : product.price;
    const displayOldPrice = selectedVariation?.on_sale ? parseFloat(selectedVariation.regular_price) : product.oldPrice;

    // Verificar disponibilidade
    const isInStock = selectedVariation
        ? selectedVariation.stock_status === 'instock'
        : product.inStock;

    const handleAddToCart = () => {
        if (product.hasVariations && !selectedVariation) return;

        // Formatar atributos selecionados para exibição
        let selectedAttributesString = '';
        if (selectedVariation) {
            selectedAttributesString = selectedVariation.attributes
                .map(attr => `${attr.name}: ${attr.option}`)
                .join(', ');
        }

        // Determinar ID único para o item do carrinho
        // Se for produto simples: ID do produto
        // Se for variação: ID da variação (se disponível) ou combinação
        const cartItemId = selectedVariation ? `${product.id}-${selectedVariation.id}` : product.id;

        addToCart({
            id: cartItemId,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: displayPrice,
            oldPrice: displayOldPrice,
            image: displayImage, // Usar a imagem exibida atualmente (que pode ser a da variação)
            badge: product.badge,
            badgeColor: product.badgeColor,
            selectedAttributes: selectedAttributesString,
            variationId: selectedVariation?.id
        });

        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`fixed inset-4 sm:inset-8 md:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                            Detalhes do Produto
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
                            {/* Left Column - Images */}
                            <div className="space-y-4">
                                {/* Main Image */}
                                <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-lg group border border-gray-100 flex items-center justify-center">
                                    <InnerImageZoom
                                        src={images[selectedImage]}
                                        zoomSrc={images[selectedImage]}
                                        className="w-full h-full object-cover rounded-2xl"
                                        zoomType="hover"
                                        moveType="pan"
                                        zoomPreload={true}
                                        hideHint={true}
                                    />

                                    {/* Overlay icon for zooming affordance */}
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-full shadow-lg">
                                            <ZoomIn className="w-8 h-8 text-[#1E3A5F]" />
                                        </div>
                                    </div>

                                    {product.badge && (
                                        <Badge
                                            className={`absolute top-4 left-4 ${product.badgeColor} text-white text-sm font-bold px-4 py-2 shadow-lg`}
                                        >
                                            {product.badge}
                                        </Badge>
                                    )}

                                    <button
                                        onClick={() => setIsLiked(!isLiked)}
                                        className="absolute top-4 right-4 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <Heart
                                            className={`w-6 h-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Thumbnail Gallery */}
                                {images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-3">
                                        {images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                                    ? 'border-[#D4AF37] shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product.name} - ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Details */}
                            <div className="space-y-6">
                                {/* Category */}
                                <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider">
                                    {product.category}
                                </p>

                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Montserrat' }}>
                                    {product.name}
                                </h1>

                                {/* Rating */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                    ? 'fill-[#D4AF37] text-[#D4AF37]'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {product.rating} ({product.reviewCount} avaliações)
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="flex items-end gap-4 py-4 border-y border-gray-200">
                                    <div className="flex flex-col gap-1">
                                        {displayOldPrice && !isNaN(displayOldPrice) && (
                                            <span className="text-lg text-gray-400 line-through font-medium">
                                                {displayOldPrice.toFixed(2)} €
                                            </span>
                                        )}
                                        <span className="text-4xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                                            {!isNaN(displayPrice) ? `${displayPrice.toFixed(2)} €` : ''}
                                        </span>
                                    </div>

                                    {displayOldPrice && !isNaN(displayOldPrice) && !isNaN(displayPrice) && (
                                        <div className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg mb-2">
                                            POUPE {(displayOldPrice - displayPrice).toFixed(2)} €
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Features */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                                    <ul className="space-y-2">
                                        {product.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-600">
                                                <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Specifications */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Especificações</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.specifications.map((spec, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                                                <p className="text-sm font-semibold text-gray-900">{spec.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Product Variations */}
                                {product.hasVariations && wpProduct && wpProduct.attributes && (
                                    <ProductVariations
                                        productId={parseInt(product.id)}
                                        attributes={wpProduct.attributes}
                                        onVariationChange={setSelectedVariation}
                                    />
                                )}

                                {/* Quantity Selector */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-900 mb-2 block">
                                        Quantidade
                                    </label>
                                    <div className="flex items-center border border-gray-300 rounded-lg w-fit overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="text-xl font-semibold text-gray-600">−</span>
                                        </button>
                                        <span className="w-16 h-12 flex items-center justify-center text-lg font-semibold text-gray-900 border-x border-gray-300">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="text-xl font-semibold text-gray-600">+</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={!isInStock || (product.hasVariations && !selectedVariation)}
                                    className="btn-premium w-full bg-[#D4AF37] hover:bg-[#B8960C] text-white text-lg font-bold py-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    {!isInStock
                                        ? 'ESGOTADO'
                                        : product.hasVariations && !selectedVariation
                                            ? 'SELECIONE AS OPÇÕES'
                                            : 'ADICIONAR AO CARRINHO'
                                    }
                                </Button>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                                            <Truck className="w-6 h-6 text-[#D4AF37]" />
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">Entrega em todo Portugal Continental</p>
                                    </div>
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-[#D4AF37]" />
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">Garantia de 2 anos</p>
                                    </div>
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-[#D4AF37]" />
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">Pag. Seguro</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
