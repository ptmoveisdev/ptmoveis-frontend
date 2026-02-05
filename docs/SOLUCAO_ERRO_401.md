# 🔧 SOLUÇÃO: Erro 401 - Sem permissão para listar recursos

## ❌ Problema Atual

```json
{
  "code": "woocommerce_rest_cannot_view",
  "message": "Sem permissão para listar recursos.",
  "data": {
    "status": 401
  }
}
```

Este erro significa que as credenciais da API WooCommerce não têm permissões corretas.

---

## ✅ SOLUÇÃO: Regenerar Credenciais da API

### Passo 1: Acessar WooCommerce

1. Abra: `http://localhost:10013/wp-admin`
2. Faça login com suas credenciais de administrador

### Passo 2: Navegar até REST API

```
WooCommerce → Configurações → Avançado → REST API
```

### Passo 3: Deletar Chave Antiga (se existir)

1. Procure pela chave existente
2. Clique em "Revogar" ou "Deletar"
3. Confirme a exclusão

### Passo 4: Criar Nova Chave

1. Clique em **"Adicionar chave"**

2. Preencha os campos:
   ```
   Descrição: Frontend React App
   Usuário: Selecione um usuário ADMINISTRADOR
   Permissões: Leitura/Gravação (Read/Write)  ⚠️ IMPORTANTE!
   ```

3. **ATENÇÃO**: Não selecione "Somente leitura" (Read only)
   - Mesmo que você só vá ler produtos, algumas operações internas do WooCommerce exigem permissão de gravação
   - Selecione **"Leitura/Gravação" (Read/Write)**

4. Clique em **"Gerar chave da API"**

### Passo 5: Copiar Credenciais

Você verá algo assim:

```
Consumer key:
ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

Consumer secret:
cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ IMPORTANTE**: Copie AMBAS as chaves AGORA! Você só verá isso UMA VEZ!

### Passo 6: Atualizar .env

Abra o arquivo `.env` e atualize:

```env
# WordPress REST API Configuration
VITE_WORDPRESS_API_URL=http://localhost:10013/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=http://localhost:10013/

# WooCommerce REST API Configuration
VITE_WOOCOMMERCE_API_URL=http://localhost:10013/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_NOVA_KEY_AQUI
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_NOVO_SECRET_AQUI
```

### Passo 7: Reiniciar Servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
yarn dev
```

---

## 🧪 Testar se Funcionou

### Teste 1: Via Terminal

```bash
curl -u "SUA_CONSUMER_KEY:SEU_CONSUMER_SECRET" "http://localhost:10013/wp-json/wc/v3/products"
```

**Resultado esperado**: JSON com lista de produtos

### Teste 2: Via Navegador

Abra o navegador em `http://localhost:5173` e verifique o console (F12).

Procure por:
- ✅ `"✅ Produtos em destaque carregados: X"`
- ✅ `"✅ Resposta WooCommerce: X itens"`

---

## 🔍 Verificar Permissões da Chave

### Via Terminal

```bash
curl -u "SUA_KEY:SEU_SECRET" "http://localhost:10013/wp-json/wc/v3"
```

Isso deve retornar informações sobre a API, incluindo as rotas disponíveis.

---

## ⚠️ Problemas Comuns

### 1. "Ainda dá erro 401"

**Possíveis causas:**
- Usuário selecionado não é administrador
- Permissões definidas como "Somente leitura"
- Chave copiada incorretamente (com espaços extras)

**Solução:**
- Delete a chave e crie uma nova
- Certifique-se de selecionar um usuário ADMINISTRADOR
- Selecione permissões "Leitura/Gravação"
- Copie as chaves sem espaços extras

### 2. "Erro de CORS"

**Solução:**
Instale o plugin "WP REST API - Allow All CORS" no WordPress:

```
Plugins → Adicionar Novo → Buscar "WP REST API Allow All CORS"
→ Instalar → Ativar
```

### 3. "404 Not Found"

**Solução:**
Reconfigurar permalinks:

```
WordPress → Configurações → Links Permanentes
→ Selecione "Nome do post"
→ Salvar alterações
```

---

## 📝 Checklist de Verificação

Antes de continuar, verifique:

- [ ] WordPress está rodando em `http://localhost:10013`
- [ ] WooCommerce está instalado e ativado
- [ ] Há produtos publicados no WooCommerce
- [ ] Chave API foi criada com permissões "Leitura/Gravação"
- [ ] Usuário selecionado é ADMINISTRADOR
- [ ] Consumer Key e Secret foram copiados corretamente
- [ ] Arquivo `.env` foi atualizado
- [ ] Servidor foi reiniciado após atualizar `.env`
- [ ] Permalinks estão configurados (Nome do post)

---

## 🎯 Teste Rápido

Execute este comando para testar:

```bash
# Substitua pelas suas credenciais
curl -u "ck_SUA_KEY:cs_SEU_SECRET" \
  "http://localhost:10013/wp-json/wc/v3/products?per_page=1"
```

**Se funcionar**, você verá JSON com 1 produto.

**Se não funcionar**, você verá erro 401 novamente.

---

## 💡 Dica Extra

Se você está usando XAMPP ou ambiente local, certifique-se de que:

1. Apache está rodando
2. MySQL está rodando
3. WordPress está acessível em `http://localhost:10013`
4. Você consegue fazer login no painel admin

---

## 📞 Ainda com Problemas?

Se após seguir todos os passos ainda houver erro:

1. **Verifique os logs do WordPress:**
   - `wp-content/debug.log` (se WP_DEBUG estiver ativado)

2. **Verifique se há plugins de segurança:**
   - Alguns plugins de segurança bloqueiam a API REST
   - Tente desativar temporariamente

3. **Teste com Postman:**
   - Importe a coleção WooCommerce
   - Configure Basic Auth
   - Teste manualmente

---

**Após regenerar as credenciais, tudo deve funcionar! 🚀**
