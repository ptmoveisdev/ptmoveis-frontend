# Diagnóstico: WooCommerce Category Options não aparece em produção

## Problema Identificado

As opções de categoria do plugin WooCommerce Category Options (WCCO) aparecem em localhost mas não em produção (https://api.ptmoveis.pt).

## Correções Aplicadas

### 1. Corrigida URL com barra dupla
**Problema:** `.env.local` tinha `VITE_WORDPRESS_BASE_URL=https://api.ptmoveis.pt/` (com barra final)
**Solução:** Removida a barra final e adicionado código para remover barras extras

### 2. Adicionada autenticação
**Problema:** Endpoint WCCO não usava autenticação Basic Auth
**Solução:** Adicionado mesmo sistema de autenticação usado pelo WooCommerce

### 3. Múltiplos endpoints
**Solução:** Código agora tenta múltiplos endpoints possíveis caso o plugin use um caminho diferente

## Passos para Diagnosticar

### 1. Verificar se o plugin está instalado em produção

Acesse o WordPress em produção:
```
https://api.ptmoveis.pt/wp-admin/plugins.php
```

Verifique se o plugin "WooCommerce Category Options" está:
- ✅ Instalado
- ✅ Ativado
- ✅ Configurado

### 2. Testar o endpoint manualmente

Execute o script de teste:
```bash
node test-wcco-endpoint.js
```

Ou teste manualmente com curl:
```bash
# Substitua PRODUCT_ID por um ID válido
curl -X GET "https://api.ptmoveis.pt/wp-json/wcco/v1/options/PRODUCT_ID" \
  -H "Authorization: Basic $(echo -n 'ck_f72484e730ad6ad7858232fd6af4fddda9cfd248:cs_31973f8571e2eae301b3e93f814a316e98bf1869' | base64)" \
  -H "Content-Type: application/json"
```

### 3. Verificar logs do navegador

Abra o console do navegador (F12) e procure por:
- 🔍 "Buscando opções de categoria WCCO"
- ✅ "Opções WCCO recebidas"
- ❌ "Erro ao buscar opções WCCO"

### 4. Verificar diferenças entre localhost e produção

| Aspecto | Localhost | Produção |
|---------|-----------|----------|
| Plugin instalado? | ✅ | ❓ |
| Plugin ativado? | ✅ | ❓ |
| Endpoint registrado? | ✅ | ❓ |
| Autenticação necessária? | ❓ | ❓ |
| CORS configurado? | N/A | ❓ |

## Possíveis Causas

### 1. Plugin não instalado/ativado em produção
**Solução:** Instalar e ativar o plugin no ambiente de produção

### 2. Endpoint diferente
**Solução:** Verificar documentação do plugin ou código-fonte para encontrar o endpoint correto

### 3. Permissões da API
**Solução:** Verificar se as credenciais WooCommerce têm permissão de leitura

### 4. Plugin requer configuração adicional
**Solução:** Verificar se há configurações específicas do plugin que precisam ser feitas

### 5. Cache do WordPress/WooCommerce
**Solução:** Limpar cache do WordPress, WooCommerce e CDN (se houver)

### 6. Versão diferente do plugin
**Solução:** Verificar se as versões do plugin em localhost e produção são as mesmas

## Como Verificar o Endpoint Correto

### Opção 1: Via código do plugin
Procure no código do plugin por `register_rest_route`:
```php
register_rest_route('wcco/v1', '/options/(?P<id>\d+)', array(
    'methods' => 'GET',
    'callback' => 'wcco_get_options',
));
```

### Opção 2: Via WordPress REST API Discovery
```bash
curl https://api.ptmoveis.pt/wp-json/
```

Procure por rotas que contenham "wcco", "category-options" ou similar.

### Opção 3: Verificar meta_data do produto
As opções podem estar armazenadas como meta_data do produto:
```bash
curl -X GET "https://api.ptmoveis.pt/wp-json/wc/v3/products/PRODUCT_ID" \
  -H "Authorization: Basic $(echo -n 'KEY:SECRET' | base64)"
```

Procure no campo `meta_data` por chaves relacionadas a opções de categoria.

## Próximos Passos

1. ✅ Execute o script de teste: `node test-wcco-endpoint.js`
2. ✅ Verifique os logs do console do navegador
3. ✅ Confirme que o plugin está instalado em produção
4. ✅ Verifique se há diferenças de configuração entre ambientes
5. ✅ Se necessário, entre em contato com o suporte do plugin

## Informações Adicionais

- **Ambiente de produção:** https://api.ptmoveis.pt
- **Ambiente local:** https://loja.local
- **Plugin:** WooCommerce Category Options (WCCO)
- **Endpoint esperado:** `/wp-json/wcco/v1/options/{product_id}`

## Logs Úteis

Os logs agora mostram:
- URL sendo acessada
- Status da resposta
- Dados recebidos ou erro

Verifique o console do navegador para mais detalhes.
