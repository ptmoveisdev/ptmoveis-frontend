import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingCart, Check, Truck, Shield, CreditCard, ChevronLeft, Maximize, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { useCart } from '@/contexts/CartContext';
import { ProductVariations } from '@/components/ProductVariations';
import { ProductCustomOptions } from '@/components/ProductCustomOptions';
import { WccoDynamicPrice } from '@/components/WccoDynamicPrice';
import { useProductBySlug } from '@/hooks/useWordPress';
import { convertWPProductToLocal } from '@/utils/productUtils';
import type { WooCommerceVariation } from '@/types/wordpress';
import { toast } from 'sonner';
import { ProductShippingCalculator } from '@/components/ProductShippingCalculator';
import { ScalapayWidget } from '@/components/ScalapayWidget';

export default function ProductPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedVariation, setSelectedVariation] = useState<WooCommerceVariation | null>(null);
    const [customOptionsSelection, setCustomOptionsSelection] = useState<{ name: string; value: string; price: number; mode?: 'add' | 'replace'; multiply_qty?: boolean }[]>([]);
    const [customOptionsExtraPerUnit, setCustomOptionsExtraPerUnit] = useState(0);
    const [customOptionsExtraFlat, setCustomOptionsExtraFlat] = useState(0);
    const [customOptionsBaseOverride, setCustomOptionsBaseOverride] = useState<number | null>(null);
    const [customOptionsValid, setCustomOptionsValid] = useState(true);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const { addToCart } = useCart();

    // Fetch from WordPress
    const { data: wpProduct, loading, error } = useProductBySlug(slug || '');

    // Reset state on slug change
    useEffect(() => {
        setSelectedVariation(null);
        setCustomOptionsSelection([]);
        setCustomOptionsExtraPerUnit(0);
        setCustomOptionsExtraFlat(0);
        setCustomOptionsBaseOverride(null);
        setSelectedImage(0);
        setQuantity(1);
        setIsLiked(false);
        setIsFullscreen(false);
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
                <div className="animate-pulse space-y-4">
                    <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500">Carregando produto...</p>
                </div>
            </div>
        );
    }

    if (error || !wpProduct) {
        return (
            <div className="min-h-screen bg-white pt-20 flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h2>
                <p className="text-gray-500 mb-6">Não foi possível carregar as informações deste produto.</p>
                <Button onClick={() => navigate('/produtos')} className="bg-[#1E3A5F] hover:bg-[#2E5A8F]">
                    Ver todos os produtos
                </Button>
            </div>
        );
    }

    const product = convertWPProductToLocal(wpProduct);

    // Image resolving logic
    const variationImage = selectedVariation?.image?.src;
    const productImages = product.images || [product.image];
    const images = variationImage ? [variationImage, ...productImages] : productImages;
    const displayImage = images[0];

    // Price resolving logic
    const basePrice = selectedVariation ? parseFloat(selectedVariation.price) : product.price;
    const effectiveBase = customOptionsBaseOverride && customOptionsBaseOverride > 0 ? customOptionsBaseOverride : basePrice;
    // Preço unitário = base + extras por unidade; preço total = unitário × qtd + taxa fixa
    const unitPrice = effectiveBase + customOptionsExtraPerUnit;
    const displayPrice = unitPrice * quantity + customOptionsExtraFlat;
    const baseOldPrice = selectedVariation?.on_sale ? parseFloat(selectedVariation.regular_price) : product.oldPrice;
    // Se houve "replace", o preço antigo pode não fazer sentido; mantemos apenas quando não há override.
    const displayOldPrice =
        baseOldPrice && !(customOptionsBaseOverride && customOptionsBaseOverride > 0)
            ? baseOldPrice * quantity
            : undefined;

    // Stock availability
    const isInStock = selectedVariation
        ? selectedVariation.stock_status === 'instock'
        : product.inStock;

    const handleAddToCart = (): boolean => {
        if (product.hasVariations && !selectedVariation) return false;
        if (!customOptionsValid) {
            setAttemptedSubmit(true);
            return false;
        }

        let selectedAttributesString = '';
        if (selectedVariation) {
            selectedAttributesString = selectedVariation.attributes
                .map(attr => `${attr.name}: ${attr.option}`)
                .join(', ');
        }

        if (customOptionsSelection.length > 0) {
            const extraStr = customOptionsSelection.map(opt => `${opt.name}: ${opt.value}`).join(', ');
            selectedAttributesString = selectedAttributesString ? `${selectedAttributesString} | ${extraStr}` : extraStr;
        }

        const cartItemId = selectedVariation ? `${product.id}-${selectedVariation.id}` : product.id;

        addToCart({
            id: cartItemId,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: unitPrice,
            flatExtras: customOptionsExtraFlat,
            oldPrice: displayOldPrice,
            image: displayImage,
            badge: product.badge,
            badgeColor: product.badgeColor,
            selectedAttributes: selectedAttributesString,
            variationId: selectedVariation?.id,
            quantity: quantity,
            customOptions: customOptionsSelection.length > 0 ? customOptionsSelection : undefined,
        });

        // Feedback in UI
        if (selectedVariation) {
            toast.success('Adicionado ao carrinho!', {
                description: `${quantity}x ${product.name} - ${selectedAttributesString}`,
            });
        } else {
            toast.success('Adicionado ao carrinho!', {
                description: `${quantity}x ${product.name}`,
            });
        }
        return true;
    };

    const handleBuyNow = () => {
        const added = handleAddToCart();
        if (!added) return;
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-16 overflow-x-clip">
            <Helmet>
                <title>{`${product.name} | PT Móveis`}</title>
                <meta name="description" content={product.description.substring(0, 160)} />
                <meta property="og:title" content={`${product.name} | PT Móveis`} />
                <meta property="og:description" content={product.description.substring(0, 160)} />
                <meta property="og:image" content={displayImage} />
                <meta property="product:price:amount" content={displayPrice.toString()} />
                <meta property="product:price:currency" content="EUR" />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-[#D4AF37] transition-colors mb-6"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Voltar
                </button>

                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 md:p-12 overflow-visible">
                    <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
                        {/* Left Column - Images */}
                        <div className="space-y-4 md:sticky md:top-28 self-start">
                            {/* Main Image */}
                            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-md group border border-gray-100 flex items-center justify-center">
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
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    className="absolute top-4 right-4 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                >
                                    <Heart
                                        className={`w-6 h-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                            }`}
                                    />
                                </button>

                                <button
                                    onClick={() => setIsFullscreen(true)}
                                    className="absolute bottom-4 right-4 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Tela Cheia"
                                >
                                    <Maximize className="w-5 h-5 text-gray-700" />
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
                        <div className="space-y-8 min-w-0 overflow-hidden">
                            <div>
                                <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
                                    {product.category}
                                </p>
                                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4" style={{ fontFamily: 'Montserrat' }}>
                                    {product.name}
                                </h1>
                            </div>

                            {/* Price */}
                            <div className="py-6 border-y border-gray-100">
                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                    {displayOldPrice && !isNaN(displayOldPrice) && (
                                        <span className="text-lg text-gray-400 line-through font-medium">
                                            {displayOldPrice.toFixed(2)} €
                                        </span>
                                    )}
                                    <span id="scalapay-product-price" className="text-3xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                                        {!isNaN(displayPrice) ? `${displayPrice.toFixed(2)} €` : ''}
                                    </span>
                                    {displayOldPrice && !isNaN(displayOldPrice) && !isNaN(displayPrice) && (
                                        <div className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
                                            POUPE {(displayOldPrice - displayPrice).toFixed(2)} €
                                        </div>
                                    )}
                                </div>
                                <div className="overflow-x-hidden max-w-full">
                                    <ScalapayWidget amountSelector="#scalapay-product-price" type="product" />
                                </div>
                            </div>

                            {/* Plugin WCCO - preço dinâmico baseado em data-* */}
                            <WccoDynamicPrice className="mt-4" />

                            {/* Features */}
                            {product.features && product.features.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>
                                    <ul className="space-y-3">
                                        {product.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3 text-gray-600">
                                                <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                                                <span className="text-base">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Product Variations */}
                            {product.hasVariations && wpProduct && wpProduct.attributes && (
                                <ProductVariations
                                    productId={parseInt(product.id)}
                                    attributes={wpProduct.attributes}
                                    onVariationChange={setSelectedVariation}
                                />
                            )}

                            {/* Custom Category Options plugin */}
                            {wpProduct && (
                                <ProductCustomOptions
                                    productId={wpProduct.id}
                                    attemptedSubmit={attemptedSubmit}
                                    onSelectionChange={(selections, pricing, isValid) => {
                                        setCustomOptionsSelection(selections);
                                        setCustomOptionsExtraPerUnit(pricing.extraPerUnit);
                                        setCustomOptionsExtraFlat(pricing.extraFlat);
                                        setCustomOptionsBaseOverride(pricing.effectiveBaseOverride ?? null);
                                        setCustomOptionsValid(isValid);
                                        if (isValid) setAttemptedSubmit(false);
                                    }}
                                />
                            )}

                            {/* Quantity Selector */}
                            <div>
                                <label className="text-sm font-semibold text-gray-900 mb-3 block">
                                    Quantidade
                                </label>
                                <div className="flex items-center border border-gray-300 rounded-xl w-fit overflow-hidden bg-white mb-6">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-14 h-14 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-2xl font-semibold text-gray-400 hover:text-gray-600">−</span>
                                    </button>
                                    <span className="w-16 h-14 flex items-center justify-center text-xl font-bold text-gray-900 border-x border-gray-200">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-14 h-14 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-2xl font-semibold text-gray-400 hover:text-gray-600">+</span>
                                    </button>
                                </div>
                            </div>

                            {/* Shipping Calculator */}
                            <ProductShippingCalculator />

                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Add to Cart Button */}
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={!isInStock || (product.hasVariations && !selectedVariation)}
                                    className="flex-1 bg-white hover:bg-gray-50 text-[#1E3A5F] border-2 border-[#1E3A5F] text-base lg:text-lg font-bold py-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    CARRINHO
                                </Button>

                                {/* Buy Now Button */}
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={!isInStock || (product.hasVariations && !selectedVariation)}
                                    className="flex-1 bg-[#D4AF37] hover:bg-[#B8960C] text-white text-base lg:text-lg font-bold py-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                                >
                                    {!isInStock
                                        ? 'ESGOTADO'
                                        : product.hasVariations && !selectedVariation
                                            ? 'SELECIONE OPÇÕES'
                                            : 'COMPRAR AGORA'
                                    }
                                </Button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center">
                                        <Truck className="w-7 h-7 text-[#D4AF37]" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Entrega em todo Portugal</p>
                                </div>
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center">
                                        <Shield className="w-7 h-7 text-[#D4AF37]" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Garantia de 2 anos</p>
                                </div>
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center">
                                        <CreditCard className="w-7 h-7 text-[#D4AF37]" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Pagamento Seguro</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Info Section */}
                    <div className="mt-16 pt-16 border-t border-gray-100">
                        {product.specifications && product.specifications.length > 0 ? (
                            <Tabs defaultValue="description" className="w-full">
                                <TabsList className="flex border-b border-gray-200 bg-transparent rounded-none p-0 h-auto gap-8 mb-8">
                                    <TabsTrigger
                                        value="description"
                                        className="pb-4 pt-2 px-6 rounded-none border-b-2 border-transparent bg-transparent shadow-none hover:text-[#1E3A5F] hover:bg-transparent data-[state=active]:border-b-[#D4AF37] data-[state=active]:bg-transparent data-[state=active]:text-[#1E3A5F] data-[state=active]:shadow-none text-lg font-bold text-gray-500 transition-all cursor-pointer"
                                        style={{ fontFamily: 'Montserrat' }}
                                    >
                                        Descrição
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="specifications"
                                        className="pb-4 pt-2 px-6 rounded-none border-b-2 border-transparent bg-transparent shadow-none hover:text-[#1E3A5F] hover:bg-transparent data-[state=active]:border-b-[#D4AF37] data-[state=active]:bg-transparent data-[state=active]:text-[#1E3A5F] data-[state=active]:shadow-none text-lg font-bold text-gray-500 transition-all cursor-pointer"
                                        style={{ fontFamily: 'Montserrat' }}
                                    >
                                        Especificações Técnicas
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="description" className="focus-visible:outline-none">
                                    <div className="max-w-4xl wp-description-content text-gray-600 leading-relaxed text-base">
                                        {product.descriptionHtml ? (
                                            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                                        ) : (
                                            <div className="space-y-4">
                                                {product.description.split('\n').filter(p => p.trim() !== '').map((para, i) => (
                                                    <p key={i}>{para}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="specifications" className="focus-visible:outline-none">
                                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn">
                                        {product.specifications.map((spec, index) => (
                                            <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-[#D4AF37]/30 transition-colors">
                                                <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide font-medium">{spec.label}</p>
                                                <p className="text-base font-bold text-gray-900">{spec.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="max-w-4xl">
                                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6" style={{ fontFamily: 'Montserrat' }}>
                                    Descrição do Produto
                                </h3>
                                <div className="wp-description-content text-gray-600 leading-relaxed text-base">
                                    {product.descriptionHtml ? (
                                        <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                                    ) : (
                                        <div className="space-y-4">
                                            {product.description.split('\n').filter(p => p.trim() !== '').map((para, i) => (
                                                <p key={i}>{para}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fullscreen Dialog */}
            <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogContent className="max-w-5xl w-[95vw] p-2 bg-white border-none shadow-2xl rounded-2xl flex flex-col items-center justify-center focus-visible:outline-none">
                    <DialogTitle className="sr-only">Visualização Completa</DialogTitle>
                    <DialogDescription className="sr-only">Veja detalhes da imagem do produto com a lupa.</DialogDescription>

                    <div className="relative w-full aspect-square md:aspect-[4/3] bg-gray-50 rounded-xl flex items-center justify-center mt-6">
                        <InnerImageZoom
                            src={images[selectedImage]}
                            zoomSrc={images[selectedImage]}
                            className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
                            zoomType="click"
                            moveType="pan"
                            zoomScale={1.5}
                            hideHint={false}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
