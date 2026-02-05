# 🚀 Integração WordPress REST API - Guia Rápido

## ✅ O que foi configurado

Toda a estrutura necessária para usar WordPress como API REST headless foi criada:

### 📁 Arquivos Criados

```
ptmoveis-v2/
├── .env                              # Variáveis de ambiente (configure aqui!)
├── .env.example                      # Exemplo de configuração
├── src/
│   ├── types/
│   │   └── wordpress.ts              # Tipos TypeScript completos
│   ├── services/
│   │   └── wordpress.ts              # Serviço de API
│   ├── hooks/
│   │   └── useWordPress.ts           # React Hooks personalizados
│   ├── utils/
│   │   └── wordpress.ts              # Funções utilitárias
│   └── components/
│       └── WordPressExample.tsx      # Componente de exemplo
├── WORDPRESS_API_CONFIG.md           # Documentação completa
└── WORDPRESS_EXAMPLES.md             # Exemplos de uso
```

---

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Configure o WordPress

1. Instale WordPress + WooCommerce
2. Vá em **Configurações** → **Links Permanentes** → Selecione "Nome do post"
3. Instale o plugin **"WP REST API - Allow All CORS"**
4. Adicione alguns produtos de teste

### 2️⃣ Gere as Credenciais da API

1. Vá em **WooCommerce** → **Configurações** → **Avançado** → **REST API**
2. Clique em **Adicionar chave**
3. Configure:
   - Descrição: "Frontend App"
   - Permissões: **Somente leitura**
4. Copie a **Consumer Key** e **Consumer Secret**

### 3️⃣ Configure o Frontend

Edite o arquivo `.env`:

```env
VITE_WORDPRESS_API_URL=http://localhost/wordpress/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=http://localhost/wordpress
VITE_WOOCOMMERCE_API_URL=http://localhost/wordpress/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_sua_key_aqui
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_seu_secret_aqui
```

### 4️⃣ Teste a Integração

```bash
npm run dev
```

Use o componente de exemplo:

```tsx
import WordPressExample from './components/WordPressExample';

function App() {
  return <WordPressExample />;
}
```

---

## 📚 Uso Básico

### Listar Produtos

```tsx
import { useProducts } from './hooks/useWordPress';

function ProductList() {
  const { data: products, loading, error } = useProducts({ per_page: 12 });

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="grid grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product.id}>
          <img src={product.images[0]?.src} alt={product.name} />
          <h3>{product.name}</h3>
          <p>R$ {parseFloat(product.price).toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
```

### Listar Categorias

```tsx
import { useProductCategories } from './hooks/useWordPress';

function Categories() {
  const { data: categories } = useProductCategories({ per_page: 100 });

  return (
    <div className="flex gap-2">
      {categories.map(cat => (
        <button key={cat.id}>{cat.name}</button>
      ))}
    </div>
  );
}
```

### Produtos em Destaque

```tsx
import { useFeaturedProducts } from './hooks/useWordPress';

function Featured() {
  const { data: products } = useFeaturedProducts({ per_page: 6 });

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Produtos em Promoção

```tsx
import { useOnSaleProducts } from './hooks/useWordPress';

function Sale() {
  const { data: products } = useOnSaleProducts({ per_page: 8 });

  return (
    <div className="grid grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

---

## 🎨 Hooks Disponíveis

### Produtos
- `useProducts(params)` - Lista produtos com paginação
- `useProductBySlug(slug)` - Busca produto por slug
- `useFeaturedProducts(params)` - Produtos em destaque
- `useOnSaleProducts(params)` - Produtos em promoção
- `useProductsByCategory(categorySlug, params)` - Produtos por categoria

### Categorias
- `useProductCategories(params)` - Lista categorias
- `useProductCategoryBySlug(slug)` - Busca categoria por slug

### Posts (WordPress)
- `usePosts(params)` - Lista posts
- `usePostBySlug(slug)` - Busca post por slug
- `useCategories(params)` - Lista categorias de posts

---

## 🛠️ Funções Utilitárias

```tsx
import {
  formatPrice,
  calculateDiscount,
  getProductMainImage,
  isInStock,
  getStockStatus,
  formatDate,
  truncateText,
} from './utils/wordpress';

// Formatar preço
formatPrice(99.90); // "R$ 99,90"

// Calcular desconto
calculateDiscount("100", "80"); // 20

// Obter imagem principal
getProductMainImage(product); // URL da imagem

// Verificar estoque
isInStock(product); // true/false

// Status de estoque
getStockStatus(product); 
// { text: "Em estoque", color: "green", available: true }
```

---

## 📖 Parâmetros Comuns

### Produtos

```tsx
useProducts({
  per_page: 12,           // Itens por página
  page: 1,                // Página atual
  search: "termo",        // Busca
  category: "slug",       // Filtrar por categoria
  featured: true,         // Apenas em destaque
  on_sale: true,          // Apenas em promoção
  orderby: "price",       // Ordenar por (date, price, popularity)
  order: "asc",           // Ordem (asc, desc)
  min_price: "10",        // Preço mínimo
  max_price: "100",       // Preço máximo
  stock_status: "instock" // Status de estoque
})
```

### Categorias

```tsx
useProductCategories({
  per_page: 100,          // Itens por página
  hide_empty: true,       // Ocultar vazias
  parent: 0,              // Apenas principais
  orderby: "name",        // Ordenar por
  order: "asc"            // Ordem
})
```

---

## 🔧 Paginação

Todos os hooks retornam funções de paginação:

```tsx
const {
  data,
  loading,
  error,
  currentPage,
  totalPages,
  total,
  nextPage,      // Ir para próxima página
  prevPage,      // Ir para página anterior
  goToPage,      // Ir para página específica
  refetch        // Recarregar dados
} = useProducts({ per_page: 12 });

// Usar paginação
<button onClick={prevPage}>Anterior</button>
<span>Página {currentPage} de {totalPages}</span>
<button onClick={nextPage}>Próxima</button>
```

---

## 🐛 Troubleshooting

### Erro 404 na API
- Vá em **Configurações** → **Links Permanentes** e salve novamente

### CORS Error
- Instale o plugin "WP REST API - Allow All CORS"

### Consumer key is invalid
- Verifique se as credenciais no `.env` estão corretas
- Gere novas credenciais no WooCommerce

### Produtos não aparecem
- Verifique se há produtos publicados no WooCommerce
- Teste o endpoint diretamente: `http://seu-site/wp-json/wc/v3/products?consumer_key=XXX&consumer_secret=YYY`

---

## 📚 Documentação Completa

- **WORDPRESS_API_CONFIG.md** - Guia completo de configuração
- **WORDPRESS_EXAMPLES.md** - Exemplos práticos de uso

---

## 🎯 Próximos Passos

1. ✅ Configure o WordPress
2. ✅ Configure as variáveis de ambiente
3. ✅ Teste com o componente de exemplo
4. 🚀 Comece a desenvolver!

---

## 💡 Dicas

- Use `_embed=true` para incluir imagens e categorias
- Limite `per_page` a no máximo 100
- Em produção, use HTTPS
- Mantenha WordPress e plugins atualizados
- Use permissões de **Somente Leitura** nas chaves da API

---

**Desenvolvido com ❤️ para facilitar a integração WordPress + React**
