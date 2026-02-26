import type { Product } from '@/data/products';
import type { WooCommerceProduct } from '@/types/wordpress';

export function convertWPProductToLocal(wpProduct: WooCommerceProduct): Product {
    const stripHtml = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    return {
        id: wpProduct.id.toString(),
        name: wpProduct.name,
        slug: wpProduct.slug,
        price: parseFloat(wpProduct.price),
        oldPrice: wpProduct.on_sale ? parseFloat(wpProduct.regular_price) : undefined,
        image: wpProduct.images[0]?.src || '/placeholder-product.jpg',
        images: wpProduct.images.map(img => img.src),
        badge: wpProduct.on_sale ? 'PROMO' : (wpProduct.featured ? 'DESTAQUE' : undefined),
        badgeColor: wpProduct.on_sale ? 'bg-red-500' : (wpProduct.featured ? 'bg-[#D4AF37]' : undefined),
        category: wpProduct.categories[0]?.name || 'Sem categoria',
        description: stripHtml(wpProduct.description),
        features: wpProduct.attributes.map(attr => `${attr.name}: ${attr.options.join(', ')}`),
        specifications: [
            { label: 'SKU', value: wpProduct.sku || 'N/A' },
            ...(wpProduct.dimensions.length && wpProduct.dimensions.width && wpProduct.dimensions.height
                ? [{ label: 'Dimensões', value: `${wpProduct.dimensions.length} × ${wpProduct.dimensions.width} × ${wpProduct.dimensions.height} cm` }]
                : []),
            ...(wpProduct.weight ? [{ label: 'Peso', value: `${wpProduct.weight} kg` }] : []),
            ...wpProduct.attributes.map(attr => ({
                label: attr.name,
                value: attr.options.join(', ')
            }))
        ],
        inStock: wpProduct.stock_status === 'instock',
        rating: parseFloat(wpProduct.average_rating) || 4.5,
        reviewCount: wpProduct.rating_count || 0,
        hasVariations: wpProduct.type === 'variable',
        variationIds: wpProduct.variations || [],
        productType: wpProduct.type,
    };
}
