# ✅ Integração WordPress REST API - Configuração Completa

## 🎉 Resumo

A integração completa do WordPress como API REST headless foi configurada com sucesso! Agora você pode usar WordPress e WooCommerce como backend para fornecer produtos e categorias para sua aplicação React.

---

## 📦 O que foi criado

### 1. **Tipos TypeScript** (`src/types/wordpress.ts`)
- ✅ Tipos completos para WordPress REST API
- ✅ Tipos completos para WooCommerce REST API
- ✅ Interfaces para Posts, Categorias, Produtos, Imagens
- ✅ Tipos para parâmetros de consulta e paginação

### 2. **Serviço de API** (`src/services/wordpress.ts`)
- ✅ Funções para buscar posts do WordPress
- ✅ Funções para buscar categorias do WordPress
- ✅ Funções para buscar produtos do WooCommerce
- ✅ Funções para buscar categorias de produtos
- ✅ Suporte completo a paginação
- ✅ Tratamento de erros personalizado
- ✅ Validação de conexão

### 3. **React Hooks** (`src/hooks/useWordPress.ts`)
- ✅ `useProducts()` - Lista produtos com paginação
- ✅ `useProductBySlug()` - Busca produto por slug
- ✅ `useFeaturedProducts()` - Produtos em destaque
- ✅ `useOnSaleProducts()` - Produtos em promoção
- ✅ `useProductsByCategory()` - Produtos por categoria
- ✅ `useProductCategories()` - Lista categorias
- ✅ `usePosts()` - Lista posts do WordPress
- ✅ `useCategories()` - Lista categorias do WordPress
- ✅ Gerenciamento automático de loading e erros

### 4. **Utilitários** (`src/utils/wordpress.ts`)
- ✅ Formatação de preços (R$ 99,90)
- ✅ Cálculo de descontos
- ✅ Formatação de datas
- ✅ Remoção de HTML
- ✅ Truncamento de texto
- ✅ Filtros e ordenação
- ✅ Validação de imagens
- ✅ Estatísticas de produtos
- ✅ E muito mais!

### 5. **Componentes de Exemplo**
- ✅ `WordPressExample.tsx` - Exemplo completo de uso
- ✅ `WordPressTest.tsx` - Ferramenta de teste e validação

### 6. **Documentação**
- ✅ `WORDPRESS_README.md` - Guia rápido de início
- ✅ `WORDPRESS_API_CONFIG.md` - Configuração completa do WordPress
- ✅ `WORDPRESS_EXAMPLES.md` - Exemplos práticos de uso
- ✅ Este arquivo - Resumo da configuração

### 7. **Configuração**
- ✅ `.env` - Variáveis de ambiente (configure suas credenciais aqui!)
- ✅ `.env.example` - Exemplo de configuração
- ✅ `.gitignore` - Já configurado para não commitar .env

---

## 🚀 Próximos Passos

### Passo 1: Configure o WordPress

1. **Instale WordPress + WooCommerce**
   - Baixe em [wordpress.org](https://wordpress.org)
   - Instale o plugin WooCommerce

2. **Configure Permalinks**
   - Vá em **Configurações** → **Links Permanentes**
   - Selecione **"Nome do post"**
   - Clique em **Salvar alterações**

3. **Habilite CORS**
   - Instale o plugin **"WP REST API - Allow All CORS"**
   - Ou adicione código ao `functions.php` (veja WORDPRESS_API_CONFIG.md)

4. **Adicione Conteúdo de Teste**
   - Crie algumas categorias de produtos
   - Adicione alguns produtos com imagens
   - Publique alguns posts

### Passo 2: Gere Credenciais da API

1. Vá em **WooCommerce** → **Configurações** → **Avançado** → **REST API**
2. Clique em **Adicionar chave**
3. Configure:
   - **Descrição**: "Frontend React App"
   - **Usuário**: Administrador
   - **Permissões**: **Somente leitura** (Read)
4. Clique em **Gerar chave da API**
5. **COPIE** a Consumer Key e Consumer Secret

### Passo 3: Configure as Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# WordPress REST API Configuration
VITE_WORDPRESS_API_URL=http://localhost/wordpress/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=http://localhost/wordpress

# WooCommerce REST API Configuration
VITE_WOOCOMMERCE_API_URL=http://localhost/wordpress/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_sua_consumer_key_aqui
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_sua_consumer_secret_aqui
```

**Para produção**, substitua por suas URLs reais:
```env
VITE_WORDPRESS_API_URL=https://seu-site.com.br/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=https://seu-site.com.br
VITE_WOOCOMMERCE_API_URL=https://seu-site.com.br/wp-json/wc/v3
```

### Passo 4: Teste a Integração

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Use o componente de teste:**
   ```tsx
   import WordPressTest from './components/WordPressTest';
   
   function App() {
     return <WordPressTest />;
   }
   ```

3. **Clique em "Executar Testes"** e verifique se tudo está funcionando

4. **Abra o console do navegador** para ver logs detalhados

### Passo 5: Comece a Desenvolver!

Use os hooks em seus componentes:

```tsx
import { useProducts, useProductCategories } from './hooks/useWordPress';

function MeuComponente() {
  const { data: products, loading } = useProducts({ per_page: 12 });
  const { data: categories } = useProductCategories();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {/* Seu código aqui */}
    </div>
  );
}
```

---

## 📚 Recursos Disponíveis

### Hooks Principais

```tsx
// PRODUTOS
useProducts({ per_page: 12, category: 'slug' })
useProductBySlug('produto-exemplo')
useFeaturedProducts({ per_page: 6 })
useOnSaleProducts({ per_page: 8 })
useProductsByCategory('categoria-slug')

// CATEGORIAS
useProductCategories({ per_page: 100 })
useProductCategoryBySlug('categoria-slug')

// POSTS
usePosts({ per_page: 10, categories: [1, 2] })
usePostBySlug('post-exemplo')

// CATEGORIAS WP
useCategories({ per_page: 100 })
```

### Funções Utilitárias

```tsx
import {
  formatPrice,           // R$ 99,90
  calculateDiscount,     // 20%
  getProductMainImage,   // URL da imagem
  isInStock,            // true/false
  getStockStatus,       // { text, color, available }
  formatDate,           // 04 de fevereiro de 2026
  truncateText,         // Trunca com...
  searchProducts,       // Busca local
  filterProductsByPrice,// Filtro de preço
  sortProductsByPrice,  // Ordenação
} from './utils/wordpress';
```

### Serviços Diretos (sem hooks)

```tsx
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductCategories,
  getPosts,
  getCategories,
} from './services/wordpress';

// Uso assíncrono
const products = await getProducts({ per_page: 12 });
const product = await getProductBySlug('produto-exemplo');
```

---

## 🎯 Exemplos Rápidos

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
        <div key={product.id} className="border rounded-lg p-4">
          <img src={product.images[0]?.src} alt={product.name} />
          <h3 className="font-bold mt-2">{product.name}</h3>
          <p className="text-orange-600 font-bold">
            R$ {parseFloat(product.price).toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### Filtrar por Categoria

```tsx
import { useState } from 'react';
import { useProducts, useProductCategories } from './hooks/useWordPress';

function FilteredProducts() {
  const [category, setCategory] = useState('');
  const { data: categories } = useProductCategories();
  const { data: products } = useProducts({ category });

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.slug)}
            className="px-4 py-2 border rounded"
          >
            {cat.name}
          </button>
        ))}
      </div>
      {/* Exibir produtos */}
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### ❌ Erro 404 ao acessar a API
**Solução:**
1. Vá em **Configurações** → **Links Permanentes**
2. Clique em **Salvar alterações**
3. Limpe o cache do navegador

### ❌ CORS Error
**Solução:**
1. Instale o plugin "WP REST API - Allow All CORS"
2. Ou adicione código CORS ao `functions.php`
3. Verifique se o plugin está ativado

### ❌ Consumer key is invalid
**Solução:**
1. Verifique se as credenciais no `.env` estão corretas
2. Gere novas credenciais no WooCommerce
3. Certifique-se de copiar Consumer Key E Consumer Secret
4. Reinicie o servidor de desenvolvimento (`npm run dev`)

### ❌ Produtos não aparecem
**Solução:**
1. Verifique se há produtos publicados no WooCommerce
2. Verifique se os produtos têm status "Publicado"
3. Teste o endpoint diretamente no navegador
4. Use o componente WordPressTest para diagnóstico

### ❌ Imagens não carregam
**Solução:**
1. Verifique se as imagens foram adicionadas aos produtos
2. Verifique permissões da pasta `wp-content/uploads`
3. Use `_embed=true` nos parâmetros

---

## 📖 Documentação Adicional

- **WORDPRESS_README.md** - Guia rápido de início (5 minutos)
- **WORDPRESS_API_CONFIG.md** - Configuração detalhada do WordPress
- **WORDPRESS_EXAMPLES.md** - Exemplos práticos completos

---

## 🔒 Segurança

### ⚠️ IMPORTANTE

1. **NUNCA** commite o arquivo `.env` com credenciais reais
2. Use permissões de **Somente Leitura** nas chaves da API
3. Em produção, sempre use **HTTPS**
4. Limite o CORS apenas para seu domínio em produção
5. Mantenha WordPress e plugins sempre atualizados
6. Use senhas fortes para usuários do WordPress

### Configuração de Produção

No `.env` de produção:
```env
VITE_WORDPRESS_API_URL=https://seu-site.com.br/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=https://seu-site.com.br
VITE_WOOCOMMERCE_API_URL=https://seu-site.com.br/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_producao_key
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_producao_secret
```

---

## 💡 Dicas de Performance

1. **Use paginação** - Limite `per_page` a no máximo 100
2. **Cache de dados** - Considere usar React Query ou SWR
3. **Lazy loading** - Carregue imagens sob demanda
4. **Otimize imagens** - Use tamanhos apropriados do WordPress
5. **CDN** - Configure um CDN para imagens do WordPress

---

## 🎨 Personalização

### Adicionar Novos Endpoints

Edite `src/services/wordpress.ts`:

```tsx
export async function getCustomEndpoint() {
  return fetchWordPress('/custom-endpoint');
}
```

### Criar Novos Hooks

Edite `src/hooks/useWordPress.ts`:

```tsx
export function useCustomHook() {
  // Seu código aqui
}
```

---

## 📞 Suporte

Se encontrar problemas:

1. ✅ Verifique a documentação em `WORDPRESS_API_CONFIG.md`
2. ✅ Use o componente `WordPressTest` para diagnóstico
3. ✅ Verifique os logs no console do navegador
4. ✅ Teste os endpoints diretamente no navegador
5. ✅ Verifique os logs de erro do WordPress (`wp-content/debug.log`)

---

## ✨ Recursos Extras

### Endpoints Úteis para Teste

```
# Posts
http://localhost/wordpress/wp-json/wp/v2/posts

# Categorias
http://localhost/wordpress/wp-json/wp/v2/categories

# Produtos (precisa de credenciais)
http://localhost/wordpress/wp-json/wc/v3/products?consumer_key=XXX&consumer_secret=YYY

# Categorias de Produtos
http://localhost/wordpress/wp-json/wc/v3/products/categories?consumer_key=XXX&consumer_secret=YYY
```

### Ferramentas Recomendadas

- **Postman** - Testar endpoints da API
- **WP REST API Controller** - Plugin WordPress para gerenciar API
- **Advanced Custom Fields** - Adicionar campos personalizados
- **Yoast SEO** - Melhorar SEO dos produtos

---

## 🎉 Conclusão

Tudo está pronto para você começar a desenvolver! A integração WordPress está completa e funcional.

### Checklist Final

- [ ] WordPress instalado e rodando
- [ ] WooCommerce instalado e configurado
- [ ] Permalinks configurados
- [ ] CORS habilitado
- [ ] Credenciais da API geradas
- [ ] Arquivo `.env` configurado
- [ ] Testes executados com sucesso
- [ ] Componente de exemplo funcionando

**Boa sorte com seu projeto! 🚀**

---

**Desenvolvido com ❤️ para facilitar a integração WordPress + React**
