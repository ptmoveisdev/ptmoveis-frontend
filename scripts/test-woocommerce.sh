#!/bin/bash

# Script de teste rápido para verificar credenciais WooCommerce
# Execute: bash scripts/test-woocommerce.sh

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          🧪 TESTE DE CREDENCIAIS WOOCOMMERCE                ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Ler credenciais do .env ou .env.local (no diretório atual ou pai)
ENV_FILE=""
if [ -f .env ]; then
    ENV_FILE=".env"
elif [ -f .env.local ]; then
    ENV_FILE=".env.local"
elif [ -f ../.env ]; then
    ENV_FILE="../.env"
elif [ -f ../.env.local ]; then
    ENV_FILE="../.env.local"
fi

if [ ! -z "$ENV_FILE" ]; then
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
else
    echo "❌ Arquivo .env ou .env.local não encontrado!"
    exit 1
fi

echo "🔍 Testando conexão com WooCommerce..."
echo ""
echo "URL: $VITE_WOOCOMMERCE_API_URL/products"
echo "Consumer Key: ${VITE_WOOCOMMERCE_CONSUMER_KEY:0:10}..."
echo "Consumer Secret: ${VITE_WOOCOMMERCE_CONSUMER_SECRET:0:10}..."
echo ""

# Fazer requisição
RESPONSE=$(curl -s -u "$VITE_WOOCOMMERCE_CONSUMER_KEY:$VITE_WOOCOMMERCE_CONSUMER_SECRET" \
  "$VITE_WOOCOMMERCE_API_URL/products?per_page=1")

# Verificar se há erro
if echo "$RESPONSE" | grep -q "woocommerce_rest_cannot_view"; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "❌ ERRO 401 - Credenciais sem permissão!"
    echo ""
    echo "Mensagem: $(echo $RESPONSE | grep -o '"message":"[^"]*"' | cut -d'"' -f4)"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔧 SOLUÇÃO:"
    echo ""
    echo "1. Acesse: http://localhost:10013/wp-admin"
    echo "2. Vá em: WooCommerce → Configurações → Avançado → REST API"
    echo "3. Delete a chave antiga"
    echo "4. Crie nova chave com permissões 'Leitura/Gravação'"
    echo "5. Atualize o arquivo .env"
    echo "6. Execute este script novamente"
    echo ""
    exit 1
fi

# Verificar se retornou produtos
if echo "$RESPONSE" | grep -q '"id"'; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ SUCESSO! Credenciais funcionando corretamente!"
    echo ""
    
    # Contar produtos
    PRODUCT_COUNT=$(echo "$RESPONSE" | grep -o '"id":' | wc -l)
    echo "📦 Produtos encontrados: $PRODUCT_COUNT"
    
    # Mostrar primeiro produto
    PRODUCT_NAME=$(echo "$RESPONSE" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ ! -z "$PRODUCT_NAME" ]; then
        echo "📝 Exemplo: $PRODUCT_NAME"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🎉 Tudo pronto! Sua integração WordPress está funcionando!"
    echo ""
    echo "Próximos passos:"
    echo "1. Reinicie o servidor: yarn dev"
    echo "2. Recarregue a página no navegador"
    echo "3. Produtos devem aparecer automaticamente"
    echo ""
    exit 0
fi

# Outro erro
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  ERRO DESCONHECIDO"
echo ""
echo "Resposta da API:"
echo "$RESPONSE" | head -20
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
exit 1
