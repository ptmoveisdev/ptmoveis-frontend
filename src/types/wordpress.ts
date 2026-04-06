/**
 * WordPress REST API Types
 * Tipos para integração com WordPress como headless CMS
 */

// Tipos base do WordPress
export interface WPMedia {
    id: number;
    date: string;
    date_gmt: string;
    guid: {
        rendered: string;
    };
    modified: string;
    modified_gmt: string;
    slug: string;
    status: string;
    type: string;
    link: string;
    title: {
        rendered: string;
    };
    author: number;
    comment_status: string;
    ping_status: string;
    template: string;
    meta: any[];
    description: {
        rendered: string;
    };
    caption: {
        rendered: string;
    };
    alt_text: string;
    media_type: string;
    mime_type: string;
    media_details: {
        width: number;
        height: number;
        file: string;
        sizes: {
            [key: string]: {
                file: string;
                width: number;
                height: number;
                mime_type: string;
                source_url: string;
            };
        };
        image_meta: any;
    };
    source_url: string;
}

// Categoria do WordPress
export interface WPCategory {
    id: number;
    count: number;
    description: string;
    link: string;
    name: string;
    slug: string;
    taxonomy: string;
    parent: number;
    meta: any[];
    _links: any;
}

// Tag do WordPress
export interface WPTag {
    id: number;
    count: number;
    description: string;
    link: string;
    name: string;
    slug: string;
    taxonomy: string;
    meta: any[];
    _links: any;
}

// Post do WordPress
export interface WPPost {
    id: number;
    date: string;
    date_gmt: string;
    guid: {
        rendered: string;
    };
    modified: string;
    modified_gmt: string;
    slug: string;
    status: string;
    type: string;
    link: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
        protected: boolean;
    };
    excerpt: {
        rendered: string;
        protected: boolean;
    };
    author: number;
    featured_media: number;
    comment_status: string;
    ping_status: string;
    sticky: boolean;
    template: string;
    format: string;
    meta: any[];
    categories: number[];
    tags: number[];
    _links: any;
    _embedded?: {
        'wp:featuredmedia'?: WPMedia[];
        'wp:term'?: WPCategory[][];
    };
}

// WooCommerce Product Types
export interface WooCommerceImage {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
}

export interface WooCommerceCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
    parent: number;
    image?: WooCommerceImage;
}

export interface WooCommerceTag {
    id: number;
    name: string;
    slug: string;
}

export interface WooCommerceAttribute {
    id: number;
    name: string;
    slug: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
}


export interface WooCommerceVariation {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    description: string;
    permalink: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    on_sale: boolean;
    purchasable: boolean;
    virtual: boolean;
    downloadable: boolean;
    manage_stock: boolean;
    stock_quantity: number | null;
    stock_status: 'instock' | 'outofstock' | 'onbackorder';
    backorders: 'no' | 'notify' | 'yes';
    backorders_allowed: boolean;
    backordered: boolean;
    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };
    shipping_class: string;
    shipping_class_id: number;
    image: WooCommerceImage | null;
    attributes: Array<{
        id: number;
        name: string;
        slug: string;
        option: string;
    }>;
    meta_data: Array<{
        id: number;
        key: string;
        value: any;
    }>;
    _links: any;
}

// Category Options Plugin Types
export interface WCCOOptionChoice {
    label: string;
    price?: number | string;
    /**
     * Modo de preço vindo do plugin (ex.: "add" ou "replace").
     * Mantemos flexível porque o backend pode enviar como `mode` ou `price_mode`.
     */
    mode?: 'add' | 'replace' | string;
    price_mode?: 'add' | 'replace' | string;
    image?: string;
    /** Se true, o preço desta opção é multiplicado pela quantidade de itens */
    multiply_qty?: boolean;
}

export interface WCCOOptionField {
    title: string;
    type: 'select' | 'radio' | 'image_swatch';
    required: boolean;
    options: WCCOOptionChoice[];
    mutex_group?: string;
}

export interface WooCommerceProduct {
    id: number;
    name: string;
    slug: string;
    permalink: string;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    type: 'simple' | 'grouped' | 'external' | 'variable';
    status: 'draft' | 'pending' | 'private' | 'publish';
    featured: boolean;
    catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden';
    description: string;
    short_description: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    date_on_sale_from: string | null;
    date_on_sale_from_gmt: string | null;
    date_on_sale_to: string | null;
    date_on_sale_to_gmt: string | null;
    price_html: string;
    on_sale: boolean;
    purchasable: boolean;
    total_sales: number;
    virtual: boolean;
    downloadable: boolean;
    downloads: any[];
    download_limit: number;
    download_expiry: number;
    external_url: string;
    button_text: string;
    tax_status: 'taxable' | 'shipping' | 'none';
    tax_class: string;
    manage_stock: boolean;
    stock_quantity: number | null;
    stock_status: 'instock' | 'outofstock' | 'onbackorder';
    backorders: 'no' | 'notify' | 'yes';
    backorders_allowed: boolean;
    backordered: boolean;
    sold_individually: boolean;
    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };
    shipping_required: boolean;
    shipping_taxable: boolean;
    shipping_class: string;
    shipping_class_id: number;
    reviews_allowed: boolean;
    average_rating: string;
    rating_count: number;
    related_ids: number[];
    upsell_ids: number[];
    cross_sell_ids: number[];
    parent_id: number;
    purchase_note: string;
    categories: WooCommerceCategory[];
    tags: WooCommerceTag[];
    images: WooCommerceImage[];
    attributes: WooCommerceAttribute[];
    default_attributes: any[];
    variations: number[];
    grouped_products: number[];
    menu_order: number;
    meta_data: any[];
    _links: any;
}

// WooCommerce Order Payload Types
export interface WooCommerceOrderPayload {
    payment_method: string;
    payment_method_title: string;
    set_paid: boolean;
    billing: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        postcode: string;
        country: string;
        email: string;
        phone: string;
    };
    shipping: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        postcode: string;
        country: string;
    };
    line_items: Array<{
        product_id: number;
        variation_id?: number;
        quantity: number;
    }>;
    shipping_lines: Array<{
        method_id: string;
        method_title: string;
        total: string;
    }>;
    meta_data?: Array<{
        key: string;
        value: any;
    }>;
}

export interface WooCommerceOrderResponse {
    id: number;
    parent_id: number;
    status: string;
    currency: string;
    version: string;
    prices_include_tax: boolean;
    date_created: string;
    date_modified: string;
    discount_total: string;
    discount_tax: string;
    shipping_total: string;
    shipping_tax: string;
    cart_tax: string;
    total: string;
    total_tax: string;
    order_key: string;
    payment_url?: string;
}

export interface WooCommerceShippingZone {
    id: number;
    name: string;
    order: number;
}

export interface WooCommerceShippingLocation {
    code: string;
    type: string;
}

export interface WooCommerceShippingMethod {
    id: number;
    title: string;
    enabled: boolean;
    settings: {
        cost: {
            value: string;
        };
    };
}

// Parâmetros de consulta para produtos
export interface ProductQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    after?: string;
    before?: string;
    exclude?: number[];
    include?: number[];
    offset?: number;
    order?: 'asc' | 'desc';
    orderby?: 'date' | 'id' | 'include' | 'title' | 'slug' | 'price' | 'popularity' | 'rating' | 'menu_order';
    parent?: number[];
    parent_exclude?: number[];
    slug?: string;
    status?: 'draft' | 'pending' | 'private' | 'publish' | 'any';
    type?: 'simple' | 'grouped' | 'external' | 'variable';
    sku?: string;
    featured?: boolean;
    category?: string;
    tag?: string;
    shipping_class?: string;
    attribute?: string;
    attribute_term?: string;
    tax_class?: string;
    on_sale?: boolean;
    min_price?: string;
    max_price?: string;
    stock_status?: 'instock' | 'outofstock' | 'onbackorder';
}

// Parâmetros de consulta para categorias
export interface CategoryQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    exclude?: number[];
    include?: number[];
    order?: 'asc' | 'desc';
    orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count';
    hide_empty?: boolean;
    parent?: number;
    product?: number;
    slug?: string;
}

// Resposta paginada
export interface WPPaginatedResponse<T> {
    data: T[];
    total: number;
    totalPages: number;
    currentPage: number;
}

// Tipos de erro
export interface WPError {
    code: string;
    message: string;
    data: {
        status: number;
    };
}
