# Configuração WCCO em Localhost

## Problema Resolvido ✅

O endpoint WCCO estava funcionando (`https://loja.local/wp-json/wcco/v1/options/14`), mas o frontend não estava carregando as opções porque não estava usando a variável de ambiente `VITE_WCCO_API_URL`.

## Correções Aplicadas

### 1. Adicionada variável de ambiente

**`.env.local`:**
```env
VITE_WCCO_API_URL=https://loja.local/wp-json/wcco/v1
```

### 2. Atualizado `src/services/wordpress.ts`

- ✅ Adicionada constante `WCCO_API_URL`
- ✅ Função `getProductCategoryOptions` agora usa `VITE_WCCO_API_URL` primeiro
- ✅ Fallback para outros endpoints se não configurado
- ✅ Validação para garantir que retorna sempre um array

### 3. Removida barra final

**Antes:**
```env
VITE_WORDPRESS_BASE_URL=https://loja.local/
```

**Depois:**
```env
VITE_WORDPRESS_BASE_URL=https://loja.local
```

## Como Testar

### 1. Reiniciar o servidor de desenvolvimento

**IMPORTANTE:** Após alterar variáveis de ambiente, você DEVE reiniciar o servidor:

```bash
# Parar o servidor (Ctrl+C)
# Depois iniciar novamente
npm run dev
# ou
yarn dev
```

### 2. Verificar no console do navegador

Abra o console (F12) e procure por:
```
🔍 Buscando opções de categoria WCCO para produto: 14
  Usando WCCO_API_URL: https://loja.local/wp-json/wcco/v1/options/14
  Status: 200 OK
✅ Opções WCCO recebidas: [...]
```

### 3. Testar o endpoint manualmente

```bash
# Teste simples
curl https://loja.local/wp-json/wcco/v1/health

# Teste com produto específico
curl https://loja.local/wp-json/wcco/v1/options/14

# Ou use o script
chmod +x test-wcco-localhost.sh
./test-wcco-localhost.sh
```

## Estrutura de Resposta Esperada

O endpoint deve retornar um array de campos:

```json
[
  {
    "title": "Cor",
    "type": "select",
    "required": false,
    "options": [
      {
        "label": "Azul",
        "price": 10
      },
      {
        "label": "Vermelho",
        "price": 15
      }
    ]
  }
]
```

## Tipos Suportados

O componente `ProductCustomOptions` suporta 3 tipos de campos:

1. **select** - Dropdown
2. **radio** - Botões de rádio
3. **image_swatch** - Seleção com imagens

## Configuração para Produção

Quando for para produção, adicione no `.env.production` ou configure no servidor:

```env
# Produção
VITE_WORDPRESS_API_URL=https://api.ptmoveis.pt/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=https://api.ptmoveis.pt
VITE_WOOCOMMERCE_API_URL=https://api.ptmoveis.pt/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_...
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_...
VITE_WCCO_API_URL=https://api.ptmoveis.pt/wp-json/wcco/v1
```

**IMPORTANTE:** Certifique-se de que o plugin WCCO está instalado e ativado em produção!

## Troubleshooting

### Problema: Opções não aparecem

**Checklist:**
1. ✅ Servidor de desenvolvimento foi reiniciado após alterar `.env.local`?
2. ✅ Variável `VITE_WCCO_API_URL` está definida?
3. ✅ Plugin WCCO está instalado e ativado?
4. ✅ Produto tem opções configuradas no WordPress?
5. ✅ Console do navegador mostra logs de sucesso?

### Problema: Erro 404

**Possíveis causas:**
- Plugin não está instalado
- Plugin não está ativado
- URL está incorreta
- Produto não existe

**Solução:**
```bash
# Verificar se o plugin está registrado
curl https://loja.local/wp-json/wcco/v1/health

# Se retornar 404, o plugin não está ativo
```

### Problema: Erro de CORS

**Solução:** Adicione no `wp-config.php` ou `.htaccess`:

```php
// wp-config.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
```

### Problema: Array vazio retornado

**Possíveis causas:**
- Produto não tem opções configuradas
- Categoria do produto não tem opções
- Plugin configurado incorretamente

**Solução:**
1. Acesse o WordPress admin
2. Vá para Produtos > Editar produto
3. Verifique se há opções de categoria configuradas
4. Salve o produto novamente

## Logs Úteis

O código agora fornece logs detalhados:

```javascript
// Sucesso
🔍 Buscando opções de categoria WCCO para produto: 14
  Usando WCCO_API_URL: https://loja.local/wp-json/wcco/v1/options/14
  Status: 200 OK
✅ Opções WCCO recebidas: [...]

// Erro
🔍 Buscando opções de categoria WCCO para produto: 14
  Usando WCCO_API_URL: https://loja.local/wp-json/wcco/v1/options/14
  Status: 404 Not Found
⚠️ Endpoint WCCO retornou 404
  Tentando endpoints fallback...
```

## Próximos Passos

1. ✅ Reinicie o servidor de desenvolvimento
2. ✅ Abra um produto no navegador
3. ✅ Verifique o console (F12)
4. ✅ Confirme que as opções aparecem na página

Se tudo estiver correto, você verá as opções de categoria renderizadas abaixo das informações do produto!

---

**Data:** 2026-03-07
**Status:** ✅ Configuração completa para localhost
