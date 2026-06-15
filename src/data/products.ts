export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    oldPrice?: number;
    image: string;
    images?: string[];
    badge?: string;
    badgeColor?: string;
    category: string;
    description: string;
    descriptionHtml?: string;
    features: string[];
    specifications: {
        label: string;
        value: string;
    }[];
    inStock: boolean;
    rating: number;
    reviewCount: number;
    // Campos para suporte a variações
    hasVariations?: boolean;
    variationIds?: number[];
    productType?: 'simple' | 'grouped' | 'external' | 'variable';
}



export const products: Product[] = [
    {
        id: '1',
        name: 'Sofá Chaiselong Reversível Saturno',
        slug: 'sofa-chaiselong-reversivel-saturno',
        price: 339.00,
        oldPrice: 399.00,
        image: '/prod-sofa-1.jpg',
        images: ['/prod-sofa-1.jpg', '/prod-sofa-1-alt1.jpg', '/prod-sofa-1-alt2.jpg'],
        badge: 'PROMO',
        badgeColor: 'bg-red-500',
        category: 'Sofás',
        description: 'O Sofá Chaiselong Reversível Saturno combina elegância e funcionalidade. Com design moderno e confortável, é perfeito para salas de estar contemporâneas. A chaiselong reversível permite adaptar o sofá ao seu espaço.',
        features: [
            'Chaiselong reversível para maior versatilidade',
            'Estrutura em madeira maciça de alta qualidade',
            'Espuma de alta densidade para conforto superior',
            'Tecido resistente e fácil de limpar',
            'Pés em madeira com acabamento premium',
            'Garantia de 2 anos'
        ],
        specifications: [
            { label: 'Dimensões', value: '280 x 160 x 85 cm' },
            { label: 'Material', value: 'Tecido premium' },
            { label: 'Cor', value: 'Cinza escuro' },
            { label: 'Lugares', value: '4 lugares' },
            { label: 'Peso', value: '85 kg' },
            { label: 'Montagem', value: 'Incluída no serviço' }
        ],
        inStock: true,
        rating: 4.8,
        reviewCount: 127
    },
    {
        id: '2',
        name: 'Cama Estofada Orlando',
        slug: 'cama-estofada-orlando',
        price: 199.00,
        oldPrice: 249.00,
        image: '/prod-cama-1.jpg',
        images: ['/prod-cama-1.jpg', '/prod-cama-1-alt1.jpg'],
        badge: 'PROMO',
        badgeColor: 'bg-red-500',
        category: 'Camas',
        description: 'A Cama Estofada Orlando oferece conforto e estilo ao seu quarto. Com cabeceira estofada elegante e estrutura robusta, garante noites de sono tranquilas.',
        features: [
            'Cabeceira estofada com design moderno',
            'Estrutura reforçada em madeira',
            'Base com ripas de madeira para melhor ventilação',
            'Estofado em tecido de alta qualidade',
            'Fácil montagem',
            'Garantia de 2 anos'
        ],
        specifications: [
            { label: 'Dimensões', value: '160 x 200 cm (Casal)' },
            { label: 'Material', value: 'Tecido premium' },
            { label: 'Cor', value: 'Bege' },
            { label: 'Altura cabeceira', value: '110 cm' },
            { label: 'Peso', value: '45 kg' },
            { label: 'Colchão', value: 'Não incluído' }
        ],
        inStock: true,
        rating: 4.7,
        reviewCount: 89
    },
    {
        id: '3',
        name: 'Cama Estofada Luxuria',
        slug: 'cama-estofada-luxuria',
        price: 249.00,
        oldPrice: 299.00,
        image: '/prod-cama-2.jpg',
        images: ['/prod-cama-2.jpg'],
        badge: 'PROMO',
        badgeColor: 'bg-red-500',
        category: 'Camas',
        description: 'A Cama Estofada Luxuria é sinónimo de elegância e sofisticação. Com acabamentos premium e design luxuoso, transforma qualquer quarto num santuário de descanso.',
        features: [
            'Design luxuoso com detalhes capitonê',
            'Cabeceira alta estofada',
            'Estrutura extra reforçada',
            'Tecido premium de alta durabilidade',
            'Pés cromados elegantes',
            'Garantia de 2 anos'
        ],
        specifications: [
            { label: 'Dimensões', value: '160 x 200 cm (Casal)' },
            { label: 'Material', value: 'Veludo premium' },
            { label: 'Cor', value: 'Cinza pérola' },
            { label: 'Altura cabeceira', value: '120 cm' },
            { label: 'Peso', value: '52 kg' },
            { label: 'Colchão', value: 'Não incluído' }
        ],
        inStock: true,
        rating: 4.9,
        reviewCount: 156
    },
    {
        id: '4',
        name: 'Cómoda Malva M8 139cm',
        slug: 'comoda-malva-m8-139cm',
        price: 259.90,
        image: '/prod-comoda-1.jpg',
        images: ['/prod-comoda-1.jpg'],
        badge: 'PROMO',
        badgeColor: 'bg-red-500',
        category: 'Quartos',
        description: 'A Cómoda Malva M8 oferece amplo espaço de arrumação com estilo. Design moderno e funcional, perfeita para organizar o seu quarto.',
        features: [
            '8 gavetas espaçosas',
            'Corrediças metálicas de alta qualidade',
            'Acabamento em melamina resistente',
            'Puxadores modernos',
            'Base reforçada',
            'Garantia de 2 anos'
        ],
        specifications: [
            { label: 'Dimensões', value: '139 x 80 x 40 cm' },
            { label: 'Material', value: 'MDF com melamina' },
            { label: 'Cor', value: 'Branco/Carvalho' },
            { label: 'Gavetas', value: '8 gavetas' },
            { label: 'Peso', value: '38 kg' },
            { label: 'Montagem', value: 'Incluída no serviço' }
        ],
        inStock: true,
        rating: 4.6,
        reviewCount: 73
    },
    {
        id: '5',
        name: 'Cama Estofada Romântica',
        slug: 'cama-estofada-romantica',
        price: 199.00,
        oldPrice: 279.00,
        image: '/prod-cama-3.jpg',
        images: ['/prod-cama-3.jpg'],
        badge: 'PROMO',
        badgeColor: 'bg-red-500',
        category: 'Camas',
        description: 'A Cama Estofada Romântica traz delicadeza e charme ao seu quarto. Design clássico com toques modernos para um ambiente acolhedor.',
        features: [
            'Design romântico e elegante',
            'Cabeceira estofada macia',
            'Estrutura em madeira de qualidade',
            'Tecido suave ao toque',
            'Montagem simples',
            'Garantia de 2 anos'
        ],
        specifications: [
            { label: 'Dimensões', value: '160 x 200 cm (Casal)' },
            { label: 'Material', value: 'Tecido premium' },
            { label: 'Cor', value: 'Rosa claro' },
            { label: 'Altura cabeceira', value: '105 cm' },
            { label: 'Peso', value: '42 kg' },
            { label: 'Colchão', value: 'Não incluído' }
        ],
        inStock: true,
        rating: 4.8,
        reviewCount: 94
    },
    {
        id: '6',
        name: 'Sofá Celeste 190cm',
        slug: 'sofa-celeste-190cm',
        price: 219.00,
        oldPrice: 259.00,
        image: '/prod-sofa-3.jpg',
        images: ['/prod-sofa-3.jpg'],
        badge: 'NOVO',
        badgeColor: 'bg-[#D4AF37]',
        category: 'Sofás',
        description: 'O Sofá Celeste é compacto mas extremamente confortável. Ideal para apartamentos e espaços menores sem comprometer o estilo.',
        features: [
            'Design compacto e moderno',
            'Espuma de alta densidade',
            'Estrutura robusta',
            'Tecido de fácil manutenção',
            'Pés em madeira maciça',
            'Garantia de 2 anos'
        ],
        specifications: [
            { label: 'Dimensões', value: '190 x 85 x 85 cm' },
            { label: 'Material', value: 'Tecido premium' },
            { label: 'Cor', value: 'Azul celeste' },
            { label: 'Lugares', value: '3 lugares' },
            { label: 'Peso', value: '55 kg' },
            { label: 'Montagem', value: 'Incluída no serviço' }
        ],
        inStock: true,
        rating: 4.7,
        reviewCount: 62
    },
    {
        id: '7',
        name: 'Sofá Chaiselong Reversível Star 4 L',
        slug: 'sofa-chaiselong-reversivel-star-4-l',
        price: 289.00,
        oldPrice: 349.00,
        image: '/prod-sofa-2.jpg',
        images: ['/prod-sofa-2.jpg'],
        badge: 'PROMO',
        badgeColor: 'bg-red-500',
        category: 'Sofás',
        description: 'O Sofá Star 4 L oferece máximo conforto e versatilidade. Com chaiselong reversível e design contemporâneo, é perfeito para momentos de relaxamento.',
        features: [
            'Chaiselong reversível',
            'Assentos extra profundos',
            'Espuma de alta qualidade',
            'Tecido resistente',
            'Estrutura reforçada',
            'Garantia de 2 anos'
        ],
        specifications: [
            { label: 'Dimensões', value: '270 x 155 x 85 cm' },
            { label: 'Material', value: 'Tecido premium' },
            { label: 'Cor', value: 'Cinza' },
            { label: 'Lugares', value: '4 lugares' },
            { label: 'Peso', value: '80 kg' },
            { label: 'Montagem', value: 'Incluída no serviço' }
        ],
        inStock: true,
        rating: 4.8,
        reviewCount: 118
    },
    {
        id: '8',
        name: 'Cama Estofada Versace Alongada',
        slug: 'cama-estofada-versace-alongada',
        price: 399.00,
        image: '/prod-cama-4.jpg',
        images: ['/prod-cama-4.jpg'],
        badge: 'NOVO',
        badgeColor: 'bg-[#D4AF37]',
        category: 'Camas',
        description: 'A Cama Versace Alongada é o epítome do luxo. Design exclusivo com acabamentos premium para quem não aceita menos que perfeição.',
        features: [
            'Design exclusivo alongado',
            'Cabeceira alta com capitonê',
            'Estrutura premium reforçada',
            'Tecido de luxo importado',
            'Detalhes dourados',
            'Garantia de 5 anos'
        ],
        specifications: [
            { label: 'Dimensões', value: '180 x 220 cm (King alongada)' },
            { label: 'Material', value: 'Veludo premium' },
            { label: 'Cor', value: 'Dourado/Creme' },
            { label: 'Altura cabeceira', value: '140 cm' },
            { label: 'Peso', value: '68 kg' },
            { label: 'Colchão', value: 'Não incluído' }
        ],
        inStock: true,
        rating: 5.0,
        reviewCount: 45
    },
    {
        id: '9',
        name: 'Cama Estofada Prisma Alongada',
        slug: 'cama-estofada-prisma-alongada',
        price: 479.00,
        image: '/prod-cama-5.jpg',
        images: ['/prod-cama-5.jpg'],
        badge: 'NOVO',
        badgeColor: 'bg-[#D4AF37]',
        category: 'Camas',
        description: 'A Cama Prisma Alongada representa o topo da nossa linha. Design arquitetônico único com conforto incomparável.',
        features: [
            'Design arquitetônico exclusivo',
            'Cabeceira geométrica premium',
            'Estrutura de luxo',
            'Acabamento impecável',
            'Iluminação LED integrada (opcional)',
            'Garantia de 5 anos'
        ],
        specifications: [
            { label: 'Dimensões', value: '180 x 220 cm (King alongada)' },
            { label: 'Material', value: 'Couro sintético premium' },
            { label: 'Cor', value: 'Preto/Branco' },
            { label: 'Altura cabeceira', value: '150 cm' },
            { label: 'Peso', value: '75 kg' },
            { label: 'Colchão', value: 'Não incluído' }
        ],
        inStock: true,
        rating: 4.9,
        reviewCount: 38
    }
];

export function getProductBySlug(slug: string): Product | undefined {
    return products.find(p => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
    return products.filter(p => p.category === category);
}

export function getFeaturedProducts(): Product[] {
    return products.slice(0, 6);
}
