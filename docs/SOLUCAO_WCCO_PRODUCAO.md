# Solução: Plugin WCCO não está em Produção

## Diagnóstico Confirmado ✅

O teste confirmou que o plugin **WooCommerce Category Options (WCCO) não está instalado ou ativado** no ambiente de produção (https://api.ptmoveis.pt).

### Evidências:
- ❌ Todos os endpoints retornaram 404
- ❌ Nenhuma meta_data relacionada encontrada
- ❌ Nenhuma rota WCCO registrada na API

## Soluções Possíveis

### Solução 1: Instalar o Plugin em Produção (RECOMENDADO)

1. Acesse o WordPress em produção:
   ```
   https://api.ptmoveis.pt/wp-admin/
   ```

2. Vá para **Plugins > Adicionar Novo**

3. Procure por "WooCommerce Category Options" ou o nome exato do plugin que você usa em localhost

4. Instale e ative o plugin

5. Configure as opções de categoria para os produtos necessários

6. Teste novamente com:
   ```bash
   node tests/test-wcco-endpoint.js
   ```

### Solução 2: Usar Variações do WooCommerce (Alternativa)

Se o plugin WCCO for pago ou não estiver disponível, você pode usar o sistema nativo de variações do WooCommerce:

#### Vantagens:
- ✅ Nativo do WooCommerce
- ✅ Já está funcionando em produção
- ✅ API bem documentada
- ✅ Sem custo adicional

#### Como implementar:

1. **No WordPress**, configure produtos variáveis:
   - Tipo de produto: "Produto Variável"
   - Adicione atributos (ex: Cor, Tamanho, Material)
   - Crie variações com preços diferentes

2. **No código**, já existe suporte para variações:
   - Componente: `src/components/ProductVariations.tsx`
   - Hook: `src/hooks/useProductVariations.ts`
   - Já está integrado na página do produto

### Solução 3: Usar Product Add-ons do WooCommerce

Outra alternativa é usar o plugin oficial "WooCommerce Product Add-ons":

#### Características:
- Plugin oficial do WooCommerce
- Suporte a REST API
- Endpoint: `/wp-json/wc/v3/products/{id}/addons`

#### Implementação:

```typescript
// Adicionar em src/services/wordpress.ts
export async function getProductAddons(productId: number): Promise<any[]> {
    try {
        const { data } = await fetchWooCommerce<any[]>(
            `/products/${productId}/addons`, 
            {}
        );
        return data;
    } catch (error) {
        console.error('Erro ao buscar add-ons:', error);
        return [];
    }
}
```

### Solução 4: Usar Meta Data Customizada

Se você tem controle sobre o WordPress, pode armazenar as opções como meta_data:

```php
// No WordPress (functions.php ou plugin)
add_action('woocommerce_product_options_general_product_data', function() {
    woocommerce_wp_textarea_input([
        'id' => '_custom_options',
        'label' => 'Opções Customizadas (JSON)',
        'desc_tip' => true,
        'description' => 'Formato: [{"title":"Cor","options":[{"label":"Azul","price":10}]}]'
    ]);
});

add_action('woocommerce_process_product_meta', function($post_id) {
    update_post_meta($post_id, '_custom_options', $_POST['_custom_options']);
});
```

Depois, busque via API:
```typescript
const product = await getProductById(productId);
const customOptions = product.meta_data?.find(m => m.key === '_custom_options');
```

## Recomendação Final

### Para Curto Prazo:
1. **Instale o plugin WCCO em produção** (se você tem acesso e licença)
2. Ou **use o sistema de variações nativo** que já está implementado

### Para Longo Prazo:
- Considere usar **WooCommerce Product Add-ons** (plugin oficial)
- Ou implemente um sistema customizado com meta_data
- Documente qual solução foi escolhida para manter consistência

## Verificação Pós-Instalação

Após instalar o plugin em produção, execute:

```bash
# 1. Verificar rotas disponíveis
node tests/test-available-routes.js

# 2. Testar endpoint WCCO
node tests/test-wcco-endpoint.js

# 3. Testar no navegador
# Abra o site e verifique se as opções aparecem
```

## Código Já Preparado

O código já está preparado para funcionar assim que o plugin for instalado:

- ✅ Autenticação configurada
- ✅ Múltiplos endpoints com fallback
- ✅ Logs detalhados para debug
- ✅ Componente `ProductCustomOptions` pronto
- ✅ Integração na página do produto

## Diferenças entre Ambientes

| Aspecto | Localhost | Produção |
|---------|-----------|----------|
| Plugin WCCO | ✅ Instalado | ❌ Não instalado |
| Endpoint `/wp-json/wcco/v1/options` | ✅ Funciona | ❌ 404 |
| Variações WooCommerce | ✅ Funciona | ✅ Funciona |
| API WooCommerce | ✅ Funciona | ✅ Funciona |

## Próximos Passos

1. ✅ Decidir qual solução usar (WCCO, Variações, Add-ons, ou Meta Data)
2. ✅ Implementar a solução escolhida em produção
3. ✅ Testar com os scripts fornecidos
4. ✅ Atualizar documentação do projeto

## Suporte

Se precisar de ajuda:
1. Verifique os logs do console do navegador
2. Execute os scripts de teste
3. Consulte a documentação do plugin escolhido
4. Verifique se há erros no WordPress (wp-admin > Ferramentas > Saúde do Site)

---

**Conclusão:** O problema não é no código frontend, mas sim na ausência do plugin no ambiente de produção. O código está correto e funcionará assim que o plugin for instalado.
