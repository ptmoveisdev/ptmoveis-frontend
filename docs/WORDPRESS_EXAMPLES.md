# Exemplos de Uso da API WordPress

Este documento contém exemplos práticos de como usar a integração com WordPress em sua aplicação.

## 📋 Índice

1. [Exemplos Básicos](#exemplos-básicos)
2. [Listagem de Produtos](#listagem-de-produtos)
3. [Filtros e Busca](#filtros-e-busca)
4. [Categorias](#categorias)
5. [Detalhes do Produto](#detalhes-do-produto)
6. [Paginação](#paginação)
7. [Loading States](#loading-states)
8. [Error Handling](#error-handling)

---

## 🎯 Exemplos Básicos

### Listar Produtos Simples

```tsx
import { useProducts } from './hooks/useWordPress';

function ProductList() {
  const { data: products, loading, error } = useProducts({ per_page: 12 });

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map(product => (
        <div key={product.id} className="border p-4 rounded">
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

function CategoryList() {
  const { data: categories, loading } = useProductCategories({ per_page: 100 });

  if (loading) return <div>Carregando categorias...</div>;

  return (
    <div className="flex gap-2">
      {categories.map(category => (
        <button key={category.id} className="px-4 py-2 bg-gray-100 rounded">
          {category.name}
        </button>
      ))}
    </div>
  );
}
```

---

## 🛍️ Listagem de Produtos

### Grid de Produtos com Imagens

```tsx
import { useProducts } from './hooks/useWordPress';

function ProductGrid() {
  const { data: products, loading, error } = useProducts({ 
    per_page: 12,
    orderby: 'date',
    order: 'desc'
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product.id} className="group">
          <div className="aspect-square overflow-hidden rounded-lg mb-4">
            <img 
              src={product.images[0]?.src || '/placeholder.jpg'} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
          </div>
          <h3 className="font-semibold mb-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            {product.on_sale && (
              <span className="text-sm line-through text-gray-500">
                R$ {parseFloat(product.regular_price).toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-orange-600">
              R$ {parseFloat(product.price).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Produtos em Destaque

```tsx
import { useFeaturedProducts } from './hooks/useWordPress';

function FeaturedProducts() {
  const { data: products, loading } = useFeaturedProducts({ per_page: 6 });

  if (loading) return <div>Carregando produtos em destaque...</div>;

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8">Produtos em Destaque</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="relative">
              <img 
                src={product.images[0]?.src} 
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <span className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                Destaque
              </span>
            </div>
            <h3 className="text-xl font-bold mt-4">{product.name}</h3>
            <p className="text-gray-600 mt-2" 
               dangerouslySetInnerHTML={{ __html: product.short_description }} />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">
                R$ {parseFloat(product.price).toFixed(2)}
              </span>
              <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
                Ver Mais
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Produtos em Promoção

```tsx
import { useOnSaleProducts } from './hooks/useWordPress';

function SaleProducts() {
  const { data: products, loading } = useOnSaleProducts({ per_page: 8 });

  if (loading || products.length === 0) return null;

  return (
    <section className="bg-red-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-red-900">
          🔥 Produtos em Promoção
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => {
            const discount = ((parseFloat(product.regular_price) - parseFloat(product.price)) / parseFloat(product.regular_price) * 100).toFixed(0);
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img 
                    src={product.images[0]?.src} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                    -{discount}%
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-gray-500">
                      R$ {parseFloat(product.regular_price).toFixed(2)}
                    </span>
                    <span className="text-xl font-bold text-red-600">
                      R$ {parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

---

## 🔍 Filtros e Busca

### Filtro por Categoria

```tsx
import { useState } from 'react';
import { useProducts, useProductCategories } from './hooks/useWordPress';

function ProductsWithFilter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const { data: categories } = useProductCategories({ per_page: 100 });
  const { data: products, loading } = useProducts({ 
    per_page: 12,
    category: selectedCategory || undefined
  });

  return (
    <div>
      {/* Filtro de Categorias */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Filtrar por Categoria:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg ${
              !selectedCategory 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Todas
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category.slug 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Produtos */}
      {loading ? (
        <div>Carregando produtos...</div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id}>
              {/* Card do produto */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Busca de Produtos

```tsx
import { useState } from 'react';
import { useProducts } from './hooks/useWordPress';

function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const { data: products, loading } = useProducts({ 
    per_page: 12,
    search: activeSearch || undefined
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  return (
    <div>
      {/* Barra de Busca */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar produtos..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button 
            type="submit"
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Resultados */}
      {activeSearch && (
        <p className="mb-4 text-gray-600">
          Resultados para: <strong>{activeSearch}</strong>
        </p>
      )}

      {loading ? (
        <div>Buscando...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id}>
              {/* Card do produto */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Filtros Avançados

```tsx
import { useState } from 'react';
import { useProducts } from './hooks/useWordPress';

function AdvancedFilters() {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    onSale: false,
    inStock: true,
    orderby: 'date' as const,
    order: 'desc' as const,
  });

  const { data: products, loading } = useProducts({
    per_page: 12,
    category: filters.category || undefined,
    min_price: filters.minPrice || undefined,
    max_price: filters.maxPrice || undefined,
    on_sale: filters.onSale || undefined,
    stock_status: filters.inStock ? 'instock' : undefined,
    orderby: filters.orderby,
    order: filters.order,
  });

  return (
    <div className="flex gap-6">
      {/* Sidebar de Filtros */}
      <aside className="w-64 bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-4">Filtros</h3>
        
        {/* Faixa de Preço */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Preço</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={(e) => setFilters({...filters, onSale: e.target.checked})}
            />
            <span>Apenas em promoção</span>
          </label>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
            />
            <span>Apenas em estoque</span>
          </label>
        </div>

        {/* Ordenação */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Ordenar por</label>
          <select
            value={filters.orderby}
            onChange={(e) => setFilters({...filters, orderby: e.target.value as any})}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="date">Mais recentes</option>
            <option value="price">Preço</option>
            <option value="popularity">Popularidade</option>
            <option value="rating">Avaliação</option>
          </select>
        </div>
      </aside>

      {/* Grid de Produtos */}
      <main className="flex-1">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id}>
                {/* Card do produto */}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## 📄 Detalhes do Produto

### Página de Detalhes Completa

```tsx
import { useParams } from 'react-router-dom';
import { useProductBySlug } from './hooks/useWordPress';
import { useState } from 'react';

function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, loading, error } = useProductBySlug(slug!);
  const [selectedImage, setSelectedImage] = useState(0);

  if (loading) return <div>Carregando produto...</div>;
  if (error || !product) return <div>Produto não encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galeria de Imagens */}
        <div>
          <div className="aspect-square mb-4 overflow-hidden rounded-lg">
            <img
              src={product.images[selectedImage]?.src || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden rounded-lg border-2 ${
                  selectedImage === index ? 'border-orange-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={image.src}
                  alt={`${product.name} - ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Informações do Produto */}
        <div>
          {/* Categorias */}
          <div className="flex gap-2 mb-4">
            {product.categories.map(category => (
              <span key={category.id} className="text-sm text-orange-600">
                {category.name}
              </span>
            ))}
          </div>

          {/* Nome */}
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          {/* Preço */}
          <div className="mb-6">
            {product.on_sale ? (
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-orange-600">
                  R$ {parseFloat(product.price).toFixed(2)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  R$ {parseFloat(product.regular_price).toFixed(2)}
                </span>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {((1 - parseFloat(product.price) / parseFloat(product.regular_price)) * 100).toFixed(0)}% OFF
                </span>
              </div>
            ) : (
              <span className="text-4xl font-bold text-gray-900">
                R$ {parseFloat(product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Status de Estoque */}
          <div className="mb-6">
            {product.stock_status === 'instock' ? (
              <span className="text-green-600 font-medium">✓ Em estoque</span>
            ) : (
              <span className="text-red-600 font-medium">✗ Fora de estoque</span>
            )}
          </div>

          {/* Descrição Curta */}
          <div 
            className="prose mb-6"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />

          {/* Botão de Ação */}
          <button className="w-full bg-orange-500 text-white py-4 px-8 rounded-lg text-lg font-bold hover:bg-orange-600 transition-colors mb-8">
            Entrar em Contato
          </button>

          {/* Descrição Completa */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Descrição</h2>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Atributos */}
          {product.attributes.length > 0 && (
            <div className="border-t pt-8 mt-8">
              <h2 className="text-2xl font-bold mb-4">Especificações</h2>
              <dl className="grid grid-cols-2 gap-4">
                {product.attributes.map(attr => (
                  <div key={attr.id}>
                    <dt className="font-semibold text-gray-700">{attr.name}</dt>
                    <dd className="text-gray-600">{attr.options.join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 📑 Paginação

### Paginação Completa

```tsx
import { useProducts } from './hooks/useWordPress';

function ProductsWithPagination() {
  const {
    data: products,
    loading,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = useProducts({ per_page: 12 });

  return (
    <div>
      {/* Grid de Produtos */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {products.map(product => (
          <div key={product.id}>
            {/* Card do produto */}
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>

          {/* Números das páginas */}
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Mostrar apenas páginas próximas
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-orange-500 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 3 || page === currentPage + 3) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## ⏳ Loading States

### Skeleton Loading

```tsx
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

function ProductGridWithSkeleton() {
  const { data: products, loading } = useProducts({ per_page: 12 });

  return (
    <div className="grid grid-cols-4 gap-6">
      {loading
        ? [...Array(12)].map((_, i) => <ProductSkeleton key={i} />)
        : products.map(product => <ProductCard key={product.id} product={product} />)
      }
    </div>
  );
}
```

---

## ❌ Error Handling

### Tratamento de Erros Completo

```tsx
import { useProducts } from './hooks/useWordPress';

function ProductsWithErrorHandling() {
  const { data: products, loading, error, refetch } = useProducts({ per_page: 12 });

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar produtos</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Nenhum produto disponível no momento</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product.id}>
          {/* Card do produto */}
        </div>
      ))}
    </div>
  );
}
```

---

**💡 Dica**: Combine esses exemplos para criar uma experiência rica e completa para seus usuários!
