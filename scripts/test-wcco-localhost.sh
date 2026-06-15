#!/bin/bash

echo "🧪 Testando WCCO em localhost..."
echo ""

# Teste 1: Health check
echo "📍 Teste 1: Health check"
curl -s https://loja.local/wp-json/wcco/v1/health | jq '.' || echo "Erro ou resposta não é JSON"
echo ""
echo "---"
echo ""

# Teste 2: Opções do produto 14
echo "📍 Teste 2: Opções do produto ID 14"
curl -s https://loja.local/wp-json/wcco/v1/options/14 | jq '.' || echo "Erro ou resposta não é JSON"
echo ""
echo "---"
echo ""

# Teste 3: Com autenticação
echo "📍 Teste 3: Com autenticação Basic Auth"
AUTH=$(echo -n "ck_e875358c14da883777cef0655edf9f5d78292efc:cs_cdc302e6d4a5f21b84ec43bceee8ef897e8929fc" | base64)
curl -s -H "Authorization: Basic $AUTH" https://loja.local/wp-json/wcco/v1/options/14 | jq '.' || echo "Erro ou resposta não é JSON"
echo ""

echo "✅ Testes concluídos!"
