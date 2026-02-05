# Guia de Configuração do WordPress como API REST

Este guia explica como configurar o WordPress para funcionar como uma API REST headless para fornecer produtos e categorias para sua aplicação React.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do WordPress](#instalação-do-wordpress)
3. [Instalação do WooCommerce](#instalação-do-woocommerce)
4. [Configuração da API REST](#configuração-da-api-rest)
5. [Habilitando CORS](#habilitando-cors)
6. [Gerando Credenciais da API](#gerando-credenciais-da-api)
7. [Configuração do Frontend](#configuração-do-frontend)
8. [Testando a Integração](#testando-a-integração)
9. [Endpoints Disponíveis](#endpoints-disponíveis)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- WordPress 5.0 ou superior
- PHP 7.4 ou superior
- MySQL 5.6 ou superior
- WooCommerce 5.0 ou superior (para produtos)
- Acesso ao painel administrativo do WordPress
- Conhecimento básico de WordPress

---

## 📦 Instalação do WordPress

### Opção 1: Instalação Local (XAMPP, WAMP, MAMP)

1. Baixe e instale o XAMPP/WAMP/MAMP
2. Baixe o WordPress em [wordpress.org](https://wordpress.org/download/)
3. Extraia os arquivos na pasta `htdocs` (XAMPP) ou `www` (WAMP)
4. Crie um banco de dados MySQL
5. Acesse `http://localhost/wordpress` e siga o instalador

### Opção 2: Instalação em Servidor

1. Faça upload dos arquivos do WordPress via FTP
2. Crie um banco de dados MySQL no painel de controle
3. Configure o arquivo `wp-config.php`
4. Acesse seu domínio e complete a instalação

---

## 🛒 Instalação do WooCommerce

### Via Painel do WordPress

1. Acesse o painel administrativo do WordPress
2. Vá em **Plugins** → **Adicionar Novo**
3. Pesquise por "WooCommerce"
4. Clique em **Instalar Agora** e depois em **Ativar**
5. Siga o assistente de configuração do WooCommerce

### Configuração Básica do WooCommerce

1. Configure sua loja (moeda, localização, etc.)
2. Adicione alguns produtos de teste
3. Configure categorias de produtos
4. Configure métodos de pagamento (opcional para API)

---

## 🔌 Configuração da API REST

### 1. Habilitar Permalinks

A API REST do WordPress requer permalinks amigáveis:

1. Vá em **Configurações** → **Links Permanentes**
2. Selecione **Nome do post** ou **Estrutura personalizada**
3. Clique em **Salvar alterações**

### 2. Verificar se a API está Funcionando

Acesse no navegador:
```
https://seu-site.com/wp-json/wp/v2/posts
```

Se retornar JSON, a API está funcionando!

Para WooCommerce:
```
https://seu-site.com/wp-json/wc/v3/products
```

---

## 🌐 Habilitando CORS

Para permitir que sua aplicação React acesse a API do WordPress, você precisa habilitar CORS.

### Método 1: Plugin (Recomendado)

1. Instale o plugin **"WP REST API - Allow All CORS"**
2. Ative o plugin
3. Pronto! O CORS está habilitado

### Método 2: Código no functions.php

Adicione ao arquivo `functions.php` do seu tema:

```php
// Habilitar CORS para WordPress REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        return $value;
    });
}, 15);
```

### Método 3: .htaccess

Adicione ao arquivo `.htaccess` na raiz do WordPress:

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Authorization, Content-Type, X-WP-Nonce"
</IfModule>
```

---

## 🔑 Gerando Credenciais da API

### Para WooCommerce REST API

1. Vá em **WooCommerce** → **Configurações** → **Avançado** → **REST API**
2. Clique em **Adicionar chave**
3. Configure:
   - **Descrição**: "Frontend React App"
   - **Usuário**: Selecione um usuário administrador
   - **Permissões**: Somente leitura (Read)
4. Clique em **Gerar chave da API**
5. **IMPORTANTE**: Copie a **Consumer Key** e **Consumer Secret** imediatamente!
6. Guarde essas credenciais em local seguro

Exemplo de credenciais geradas:
```
Consumer Key: ck_1234567890abcdef1234567890abcdef12345678
Consumer Secret: cs_1234567890abcdef1234567890abcdef12345678
```

---

## ⚙️ Configuração do Frontend

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# WordPress REST API Configuration
VITE_WORDPRESS_API_URL=https://seu-site.com/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=https://seu-site.com

# WooCommerce REST API Configuration
VITE_WOOCOMMERCE_API_URL=https://seu-site.com/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_sua_consumer_key_aqui
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_sua_consumer_secret_aqui
```

**Para desenvolvimento local:**
```env
VITE_WORDPRESS_API_URL=http://localhost/wordpress/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=http://localhost/wordpress
VITE_WOOCOMMERCE_API_URL=http://localhost/wordpress/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_sua_consumer_key_aqui
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_sua_consumer_secret_aqui
```

### 2. Reiniciar o Servidor de Desenvolvimento

Após configurar as variáveis de ambiente:

```bash
npm run dev
```

---

## 🧪 Testando a Integração

### 1. Teste Básico com Fetch

Abra o console do navegador e execute:

```javascript
// Testar API do WordPress
fetch('https://seu-site.com/wp-json/wp/v2/posts')
  .then(res => res.json())
  .then(data => console.log('Posts:', data));

// Testar API do WooCommerce
fetch('https://seu-site.com/wp-json/wc/v3/products?consumer_key=SUA_KEY&consumer_secret=SEU_SECRET')
  .then(res => res.json())
  .then(data => console.log('Produtos:', data));
```

### 2. Usar o Componente de Exemplo

Importe e use o componente de exemplo em seu `App.tsx`:

```tsx
import WordPressExample from './components/WordPressExample';

function App() {
  return (
    <div>
      <WordPressExample />
    </div>
  );
}
```

### 3. Usar os Hooks Diretamente

```tsx
import { useProducts, useProductCategories } from './hooks/useWordPress';

function MeuComponente() {
  const { data: products, loading, error } = useProducts({ per_page: 12 });
  const { data: categories } = useProductCategories();

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

---

## 📚 Endpoints Disponíveis

### WordPress REST API (Posts e Páginas)

| Endpoint | Descrição |
|----------|-----------|
| `GET /wp-json/wp/v2/posts` | Lista todos os posts |
| `GET /wp-json/wp/v2/posts/{id}` | Busca um post específico |
| `GET /wp-json/wp/v2/posts?slug={slug}` | Busca post por slug |
| `GET /wp-json/wp/v2/categories` | Lista todas as categorias |
| `GET /wp-json/wp/v2/tags` | Lista todas as tags |
| `GET /wp-json/wp/v2/media` | Lista todas as mídias |

### WooCommerce REST API (Produtos)

| Endpoint | Descrição |
|----------|-----------|
| `GET /wp-json/wc/v3/products` | Lista todos os produtos |
| `GET /wp-json/wc/v3/products/{id}` | Busca um produto específico |
| `GET /wp-json/wc/v3/products?slug={slug}` | Busca produto por slug |
| `GET /wp-json/wc/v3/products?featured=true` | Lista produtos em destaque |
| `GET /wp-json/wc/v3/products?on_sale=true` | Lista produtos em promoção |
| `GET /wp-json/wc/v3/products/categories` | Lista categorias de produtos |
| `GET /wp-json/wc/v3/products?category={slug}` | Produtos por categoria |

### Parâmetros Comuns

- `per_page`: Número de itens por página (padrão: 10, máximo: 100)
- `page`: Número da página
- `search`: Termo de busca
- `orderby`: Ordenar por (date, title, price, etc.)
- `order`: Ordem (asc, desc)

---

## 🔍 Troubleshooting

### Problema: "404 Not Found" ao acessar a API

**Solução:**
1. Verifique se os permalinks estão configurados corretamente
2. Vá em **Configurações** → **Links Permanentes** e clique em **Salvar alterações**
3. Verifique se o arquivo `.htaccess` tem permissões corretas

### Problema: CORS Error

**Solução:**
1. Instale o plugin "WP REST API - Allow All CORS"
2. Ou adicione o código CORS ao `functions.php` (veja seção CORS)
3. Limpe o cache do navegador

### Problema: "Consumer key is invalid"

**Solução:**
1. Verifique se as credenciais estão corretas no `.env`
2. Gere novas credenciais no WooCommerce
3. Certifique-se de que está usando HTTPS em produção

### Problema: Produtos não aparecem

**Solução:**
1. Verifique se há produtos publicados no WooCommerce
2. Verifique se os produtos estão com status "Publicado"
3. Teste o endpoint diretamente no navegador

### Problema: Imagens não carregam

**Solução:**
1. Verifique se as imagens foram adicionadas aos produtos
2. Verifique as permissões da pasta `wp-content/uploads`
3. Use `_embed=true` nos parâmetros para incluir imagens

---

## 📖 Recursos Adicionais

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WooCommerce REST API Documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WordPress REST API Reference](https://developer.wordpress.org/rest-api/reference/)

---

## 🎯 Próximos Passos

1. ✅ Configure o WordPress e WooCommerce
2. ✅ Habilite CORS
3. ✅ Gere as credenciais da API
4. ✅ Configure as variáveis de ambiente
5. ✅ Teste a integração
6. 🚀 Comece a desenvolver sua aplicação!

---

## 💡 Dicas de Segurança

1. **Nunca** commite o arquivo `.env` com credenciais reais
2. Use permissões de **Somente Leitura** para as chaves da API
3. Em produção, sempre use **HTTPS**
4. Considere limitar o CORS apenas para seu domínio em produção
5. Mantenha WordPress e plugins sempre atualizados

---

## 📞 Suporte

Se encontrar problemas, verifique:
1. Os logs de erro do WordPress (`wp-content/debug.log`)
2. O console do navegador para erros JavaScript
3. A documentação oficial do WordPress e WooCommerce

---

**Desenvolvido com ❤️ para integração WordPress + React**
